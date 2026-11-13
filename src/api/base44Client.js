import {
  getAllRecords,
  getRecord,
  putRecord,
  deleteRecord,
  getChatHistory,
  saveChatHistory,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_LIVESTREAMS,
} from "@/lib/localDb";
import { auth, db, storage, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  signOut,
  deleteUser,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  addDoc,
  query as fsQuery,
  orderBy,
  limit as fsLimit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const TOKEN_KEY = "base44_access_token";
const listeners = new Map();
const broadcast = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("bajaverse_sync") : null;

function notifyEntity(entityName, event) {
  const set = listeners.get(entityName);
  if (set) {
    for (const cb of set) {
      try {
        cb(event);
      } catch {
        /* ignore subscriber error */
      }
    }
  }
  broadcast?.postMessage({ kind: "entity", entityName, event });
}

if (broadcast) {
  broadcast.onmessage = (e) => {
    if (e.data?.kind === "entity") {
      const set = listeners.get(e.data.entityName);
      if (set) {
        for (const cb of set) {
          try {
            cb(e.data.event);
          } catch {
            /* ignore */
          }
        }
      }
    }
  };
}

function matchesQuery(item, queryObj = {}) {
  for (const [key, expected] of Object.entries(queryObj)) {
    if (expected === undefined) continue;
    const actual = item?.[key];
    if (expected && typeof expected === "object" && !Array.isArray(expected) && "$regex" in expected) {
      const flags = expected.$options || "";
      const re = new RegExp(expected.$regex, flags);
      if (!re.test(String(actual ?? ""))) return false;
    } else if (actual !== expected) {
      return false;
    }
  }
  return true;
}

function sortItems(items, sort) {
  if (!sort) return items;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  return [...items].sort((a, b) => {
    const va = a?.[field];
    const vb = b?.[field];
    if (va === vb) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "number" && typeof vb === "number") {
      return desc ? vb - va : va - vb;
    }
    const cmp = String(va).localeCompare(String(vb));
    return desc ? -cmp : cmp;
  });
}

function computeAggregate(matched, { groupBy, sum = [], avg = [] } = {}) {
  const sumFields = Array.isArray(sum) ? sum : sum ? [sum] : [];
  const avgFields = Array.isArray(avg) ? avg : avg ? [avg] : [];
  const groups = new Map();

  for (const item of matched) {
    const key = groupBy ? String(item?.[groupBy] ?? "unknown") : "__all__";
    if (!groups.has(key)) {
      const base = { count: 0 };
      if (groupBy) base[groupBy] = item?.[groupBy];
      for (const f of sumFields) base[`sum_${f}`] = 0;
      for (const f of avgFields) base[`_sum_${f}`] = 0;
      groups.set(key, base);
    }
    const g = groups.get(key);
    g.count += 1;
    for (const f of sumFields) g[`sum_${f}`] += Number(item?.[f]) || 0;
    for (const f of avgFields) g[`_sum_${f}`] += Number(item?.[f]) || 0;
  }

  const rows = Array.from(groups.values()).map((g) => {
    for (const f of avgFields) {
      g[`avg_${f}`] = g.count ? g[`_sum_${f}`] / g.count : 0;
      delete g[`_sum_${f}`];
    }
    return g;
  });
  return { rows };
}

// One-time Firestore seed for initial categories, products, and livestreams
let firestoreSeedPromise = null;
async function ensureFirestoreSeeded() {
  if (!isFirebaseConfigured || !db) return;
  if (firestoreSeedPromise) return firestoreSeedPromise;

  firestoreSeedPromise = (async () => {
    try {
      const catSnap = await getDocs(fsQuery(collection(db, "Category"), fsLimit(1)));
      if (catSnap.empty) {
        await Promise.all([
          ...SEED_CATEGORIES.map((c) => setDoc(doc(db, "Category", c.id), c)),
          ...SEED_PRODUCTS.map((p) => setDoc(doc(db, "Product", p.id), p)),
          ...SEED_LIVESTREAMS.map((s) => setDoc(doc(db, "Livestream", s.id), s)),
        ]);
      }
    } catch {
      /* Ignore seed errors if Firestore rules restrict unauthenticated writes */
    }
  })();

  return firestoreSeedPromise;
}

function waitForFirebaseUser() {
  if (!auth) return Promise.resolve(null);
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

async function ensureUserProfile(fbUser, extra = {}) {
  if (!fbUser) return null;
  const baseProfile = {
    id: fbUser.uid,
    email: fbUser.email || extra.email || "",
    full_name:
      extra.full_name ||
      fbUser.displayName ||
      (fbUser.email ? fbUser.email.split("@")[0] : "BAJAVERSE User"),
    role: "user",
    created_date: new Date().toISOString(),
  };

  if (db) {
    try {
      const userRef = doc(db, "User", fbUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      await setDoc(userRef, baseProfile);
    } catch {
      /* Fallback to auth profile if Firestore rules block read/write */
    }
  }
  return baseProfile;
}

function createFirestoreEntityClient(entityName) {
  const colRef = () => collection(db, entityName);

  const fetchAll = async () => {
    await ensureFirestoreSeeded();
    const snap = await getDocs(colRef());
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  return {
    async filter(queryObj = {}, options = {}) {
      const { sort, limit = 50, cursor } = options;
      const all = await fetchAll();
      const matched = sortItems(all.filter((item) => matchesQuery(item, queryObj)), sort);
      const offset = cursor ? Number(cursor) || 0 : 0;
      const items = matched.slice(offset, offset + limit);
      const nextOffset = offset + items.length;
      const has_more = nextOffset < matched.length;
      return {
        items,
        next_cursor: has_more ? String(nextOffset) : null,
        has_more,
      };
    },

    async count(queryObj = {}) {
      const all = await fetchAll();
      return all.filter((item) => matchesQuery(item, queryObj)).length;
    },

    async get(id) {
      await ensureFirestoreSeeded();
      const snap = await getDoc(doc(db, entityName, id));
      if (!snap.exists()) {
        const err = new Error(`${entityName} not found`);
        err.status = 404;
        throw err;
      }
      return { id: snap.id, ...snap.data() };
    },

    async create(data) {
      const currentUser = auth?.currentUser;
      const id = data.id || crypto.randomUUID();
      const record = {
        ...data,
        id,
        created_date: data.created_date || new Date().toISOString(),
        created_by_id: data.created_by_id || currentUser?.uid || "user-demo",
      };
      await setDoc(doc(db, entityName, id), record);
      return record;
    },

    async bulkCreate(items = []) {
      const created = [];
      for (const item of items) {
        created.push(await this.create(item));
      }
      return created;
    },

    async update(id, patch) {
      const docRef = doc(db, entityName, id);
      await updateDoc(docRef, { ...patch });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() };
    },

    async delete(id) {
      await deleteDoc(doc(db, entityName, id));
      return { ok: true };
    },

    async deleteMany(queryObj = {}) {
      const all = await fetchAll();
      const targets = all.filter((item) => matchesQuery(item, queryObj));
      await Promise.all(targets.map((item) => deleteDoc(doc(db, entityName, item.id))));
      return { deleted: targets.length };
    },

    async aggregate({ query: queryObj = {}, groupBy, sum = [], avg = [] } = {}) {
      const all = await fetchAll();
      const matched = all.filter((item) => matchesQuery(item, queryObj));
      return computeAggregate(matched, { groupBy, sum, avg });
    },

    subscribe(callback) {
      return onSnapshot(colRef(), (snapshot) => {
        for (const change of snapshot.docChanges()) {
          callback({
            type: change.type === "added" ? "create" : change.type === "modified" ? "update" : "delete",
            id: change.doc.id,
            data: { id: change.doc.id, ...change.doc.data() },
          });
        }
      });
    },
  };
}

function createLocalEntityClient(entityName) {
  return {
    async filter(queryObj = {}, options = {}) {
      const { sort, limit = 50, cursor } = options;
      const all = await getAllRecords(entityName);
      const matched = sortItems(all.filter((item) => matchesQuery(item, queryObj)), sort);
      const offset = cursor ? Number(cursor) || 0 : 0;
      const items = matched.slice(offset, offset + limit);
      const nextOffset = offset + items.length;
      const has_more = nextOffset < matched.length;
      return {
        items,
        next_cursor: has_more ? String(nextOffset) : null,
        has_more,
      };
    },

    async count(queryObj = {}) {
      const all = await getAllRecords(entityName);
      return all.filter((item) => matchesQuery(item, queryObj)).length;
    },

    async get(id) {
      const item = await getRecord(entityName, id);
      if (!item) {
        const err = new Error(`${entityName} not found`);
        err.status = 404;
        throw err;
      }
      return item;
    },

    async create(data) {
      const currentUser = await getCurrentUserSilent();
      const record = {
        ...data,
        id: data.id || crypto.randomUUID(),
        created_date: data.created_date || new Date().toISOString(),
        created_by_id: data.created_by_id || currentUser?.id || "user-demo",
      };
      await putRecord(entityName, record);
      notifyEntity(entityName, { type: "create", id: record.id, data: record });
      return record;
    },

    async bulkCreate(items = []) {
      const created = [];
      for (const item of items) {
        created.push(await this.create(item));
      }
      return created;
    },

    async update(id, patch) {
      const existing = await this.get(id);
      const updated = { ...existing, ...patch, id };
      await putRecord(entityName, updated);
      notifyEntity(entityName, { type: "update", id, data: updated });
      return updated;
    },

    async delete(id) {
      await deleteRecord(entityName, id);
      notifyEntity(entityName, { type: "delete", id });
      return { ok: true };
    },

    async deleteMany(queryObj = {}) {
      const all = await getAllRecords(entityName);
      const targets = all.filter((item) => matchesQuery(item, queryObj));
      await Promise.all(targets.map((item) => deleteRecord(entityName, item.id)));
      notifyEntity(entityName, { type: "deleteMany" });
      return { deleted: targets.length };
    },

    async aggregate({ query: queryObj = {}, groupBy, sum = [], avg = [] } = {}) {
      const all = await getAllRecords(entityName);
      const matched = all.filter((item) => matchesQuery(item, queryObj));
      return computeAggregate(matched, { groupBy, sum, avg });
    },

    subscribe(callback) {
      if (!listeners.has(entityName)) listeners.set(entityName, new Set());
      const set = listeners.get(entityName);
      set.add(callback);
      return () => set.delete(callback);
    },
  };
}

function createEntityClient(entityName) {
  return isFirebaseConfigured && db
    ? createFirestoreEntityClient(entityName)
    : createLocalEntityClient(entityName);
}

async function getCurrentUserSilent() {
  if (isFirebaseConfigured && auth) {
    const fbUser = await waitForFirebaseUser();
    if (!fbUser) return null;
    return ensureUserProfile(fbUser);
  }
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    return await getRecord("User", token);
  } catch {
    return null;
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function connectFirestoreLiveChatRoom(streamId) {
  const subs = new Set();
  let userName = "Viewer";
  const chatCol = collection(db, "Livestream", streamId, "chat_messages");
  const q = fsQuery(chatCol, orderBy("ts", "asc"), fsLimit(100));

  let initialized = false;
  const unsub = onSnapshot(q, (snapshot) => {
    if (!initialized) {
      initialized = true;
      const messages = snapshot.docs.map((d) => d.data());
      for (const cb of subs) {
        cb({ type: "history", messages });
        cb({ type: "presence", count: 1 });
      }
      return;
    }
    for (const change of snapshot.docChanges()) {
      if (change.type === "added") {
        const event = { type: "chat", message: change.doc.data() };
        for (const cb of subs) cb(event);
      }
    }
  });

  return {
    subscribe(cb) {
      subs.add(cb);
      return { unsubscribe: () => subs.delete(cb) };
    },
    async send(payload) {
      if (!payload || typeof payload !== "object") return;
      if (payload.type === "join") {
        userName = String(payload.name || "Viewer").slice(0, 40);
        for (const cb of subs) cb({ type: "presence", count: 1 });
      } else if (payload.type === "chat") {
        const text = String(payload.text || "").trim().slice(0, 500);
        if (!text) return;
        await addDoc(chatCol, { name: userName, text, ts: Date.now() });
      }
    },
    close() {
      subs.clear();
      unsub();
    },
  };
}

function connectLocalLiveChatRoom(streamId) {
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(`live_chat_${streamId}`) : null;
  const subs = new Set();
  let userName = "Viewer";

  const emit = (msg) => {
    for (const cb of subs) {
      try {
        cb(msg);
      } catch {
        /* ignore */
      }
    }
  };

  if (channel) {
    channel.onmessage = (e) => emit(e.data);
  }

  return {
    subscribe(cb) {
      subs.add(cb);
      getChatHistory(streamId).then((messages) => {
        cb({ type: "history", messages });
        cb({ type: "presence", count: 1 });
      });
      return {
        unsubscribe: () => subs.delete(cb),
      };
    },
    send(payload) {
      if (!payload || typeof payload !== "object") return;
      if (payload.type === "join") {
        userName = String(payload.name || "Viewer").slice(0, 40);
        emit({ type: "presence", count: 1 });
      } else if (payload.type === "chat") {
        const text = String(payload.text || "").trim().slice(0, 500);
        if (!text) return;
        const message = { name: userName, text, ts: Date.now() };
        getChatHistory(streamId).then((history) => saveChatHistory(streamId, [...history, message]));
        const event = { type: "chat", message };
        emit(event);
        channel?.postMessage(event);
      }
    },
    close() {
      subs.clear();
      channel?.close();
    },
  };
}

export const base44 = {
  app: {
    async getPublicSettings() {
      return {
        id: isFirebaseConfigured ? "bajaverse-firebase" : "bajaverse-local",
        public_settings: { name: "BAJAVERSE" },
      };
    },
  },

  auth: {
    hasActiveSession() {
      return Boolean(auth?.currentUser || window.localStorage.getItem(TOKEN_KEY));
    },

    async me() {
      if (isFirebaseConfigured && auth) {
        const fbUser = await waitForFirebaseUser();
        if (!fbUser) {
          window.localStorage.removeItem(TOKEN_KEY);
          const err = new Error("Not authenticated");
          err.status = 401;
          throw err;
        }
        window.localStorage.setItem(TOKEN_KEY, fbUser.uid);
        return ensureUserProfile(fbUser);
      }

      const token = window.localStorage.getItem(TOKEN_KEY);
      if (!token) {
        const err = new Error("Not authenticated");
        err.status = 401;
        throw err;
      }
      const user = await getRecord("User", token);
      if (!user) {
        window.localStorage.removeItem(TOKEN_KEY);
        const err = new Error("Session expired");
        err.status = 401;
        throw err;
      }
      const { password: _pw, ...safeUser } = user;
      return safeUser;
    },

    setToken(token) {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      else window.localStorage.removeItem(TOKEN_KEY);
    },

    async loginViaEmailPassword(email, password) {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, String(email || "").trim(), password);
        const profile = await ensureUserProfile(cred.user);
        this.setToken(cred.user.uid);
        return { access_token: cred.user.uid, user: profile };
      }

      const users = await getAllRecords("User");
      const normalized = String(email || "").trim().toLowerCase();
      const found = users.find((u) => u.email.toLowerCase() === normalized);
      if (!found || (found.password && found.password !== password)) {
        throw new Error("Invalid email or password");
      }
      this.setToken(found.id);
      return { access_token: found.id, user: found };
    },

    async register({ email, password, full_name }) {
      const normalized = String(email || "").trim().toLowerCase();
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, normalized, password);
        await ensureUserProfile(cred.user, { email: normalized, full_name });
        this.setToken(cred.user.uid);
        return { ok: true, email: normalized };
      }

      const users = await getAllRecords("User");
      if (users.some((u) => u.email.toLowerCase() === normalized)) {
        throw new Error("An account with this email already exists");
      }
      const user = {
        id: `user-${crypto.randomUUID()}`,
        email: normalized,
        password,
        full_name: full_name || normalized.split("@")[0],
        role: "user",
        created_date: new Date().toISOString(),
      };
      await putRecord("User", user);
      return { ok: true, email: normalized };
    },

    async verifyOtp({ email, otpCode }) {
      if (!otpCode || String(otpCode).length < 6) {
        throw new Error("Enter a 6-digit verification code");
      }
      if (isFirebaseConfigured && auth) {
        const fbUser = await waitForFirebaseUser();
        if (!fbUser) throw new Error("Account session not found");
        this.setToken(fbUser.uid);
        return { access_token: fbUser.uid };
      }

      const users = await getAllRecords("User");
      const normalized = String(email || "").trim().toLowerCase();
      const found = users.find((u) => u.email.toLowerCase() === normalized);
      if (!found) throw new Error("Account not found");
      this.setToken(found.id);
      return { access_token: found.id };
    },

    async resendOtp() {
      return { ok: true };
    },

    async loginWithProvider(_provider, returnTo = "/") {
      if (isFirebaseConfigured && auth && googleProvider) {
        const cred = await signInWithPopup(auth, googleProvider);
        await ensureUserProfile(cred.user);
        this.setToken(cred.user.uid);
        window.location.href = returnTo || "/";
        return;
      }

      this.setToken("user-demo");
      window.location.href = returnTo || "/";
    },

    async resetPasswordRequest(email) {
      if (isFirebaseConfigured && auth && email) {
        await sendPasswordResetEmail(auth, String(email).trim());
      }
      return { ok: true };
    },

    async resetPassword({ newPassword }) {
      if (!newPassword) throw new Error("Password is required");
      if (isFirebaseConfigured && auth?.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      }
      return { ok: true };
    },

    async logout(redirectUrl) {
      window.localStorage.removeItem(TOKEN_KEY);
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
      if (redirectUrl) window.location.href = redirectUrl;
    },

    redirectToLogin(returnTo) {
      const target = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";
      window.location.href = target;
    },
  },

  entities: {
    Product: createEntityClient("Product"),
    Category: createEntityClient("Category"),
    WalletTransaction: createEntityClient("WalletTransaction"),
    ProductVideo: createEntityClient("ProductVideo"),
    Livestream: createEntityClient("Livestream"),
    User: createEntityClient("User"),
  },

  integrations: {
    Core: {
      async UploadPublicFile({ file }) {
        if (!file) throw new Error("No file provided");
        if (isFirebaseConfigured && storage) {
          try {
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const storageRef = ref(storage, `uploads/${Date.now()}_${safeName}`);
            await uploadBytes(storageRef, file);
            const file_url = await getDownloadURL(storageRef);
            return { file_url };
          } catch {
            /* Fallback to Data URL if Storage is not enabled or rules block upload */
          }
        }
        const dataUrl = await readFileAsDataUrl(file);
        return { file_url: dataUrl };
      },
    },
  },

  functions: {
    async invoke(name, payload = {}) {
      if (name === "deleteAccount") {
        if (isFirebaseConfigured && auth?.currentUser) {
          const fbUser = auth.currentUser;
          await base44.entities.Product.deleteMany({ created_by_id: fbUser.uid });
          if (db) await deleteDoc(doc(db, "User", fbUser.uid)).catch(() => {});
          await deleteUser(fbUser);
          window.localStorage.removeItem(TOKEN_KEY);
          return { data: { ok: true, accountRemoved: true } };
        }

        const user = await getCurrentUserSilent();
        if (user) {
          await base44.entities.Product.deleteMany({ created_by_id: user.id });
          await deleteRecord("User", user.id);
        }
        window.localStorage.removeItem(TOKEN_KEY);
        return { data: { ok: true, accountRemoved: true } };
      }

      if (name === "createLiveToken") {
        return {
          data: {
            token: "local-demo-token",
            url: "local",
            role: payload.role || "subscriber",
          },
        };
      }
      return { data: {} };
    },
  },

  actors: {
    LiveChatRoom(streamId) {
      return {
        connect: () =>
          isFirebaseConfigured && db
            ? connectFirestoreLiveChatRoom(streamId)
            : connectLocalLiveChatRoom(streamId),
      };
    },
  },
};
