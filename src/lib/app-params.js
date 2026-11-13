const isNode = typeof window === "undefined";

const isClearAccessTokenRequested = () =>
  !isNode && new URLSearchParams(window.location.search).get("clear_access_token") === "true";

const clearStoredAccessToken = () => {
  window.localStorage.removeItem("base44_access_token");
  window.localStorage.removeItem("token");
};

const getAppParams = () => {
  if (!isNode && isClearAccessTokenRequested()) {
    clearStoredAccessToken();
  }
  return {
    appId: import.meta.env.VITE_BASE44_APP_ID || "bajaverse-local",
    token: !isNode ? window.localStorage.getItem("base44_access_token") : null,
    functionsVersion: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || "local",
    appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL || "",
  };
};

export const appParams = {
  ...getAppParams(),
};
