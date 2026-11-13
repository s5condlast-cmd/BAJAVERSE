import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LiveChat({ streamId, userName }) {
  const [messages, setMessages] = useState([]);
  const [viewers, setViewers] = useState(0);
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const roomRef = useRef(null);

  useEffect(() => {
    let connId = sessionStorage.getItem("live_conn");
    if (!connId) {
      connId = crypto.randomUUID();
      sessionStorage.setItem("live_conn", connId);
    }
    const room = base44.actors.LiveChatRoom(streamId).connect({ id: connId });
    roomRef.current = room;
    const sub = room.subscribe((msg) => {
      if (msg.type === "history") setMessages(msg.messages || []);
      else if (msg.type === "chat") setMessages((prev) => [...prev, msg.message]);
      else if (msg.type === "presence") setViewers(msg.count);
    });
    room.send({ type: "join", name: userName || "Viewer" });
    return () => {
      sub.unsubscribe();
      room.close();
    };
  }, [streamId, userName]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || !roomRef.current) return;
    roomRef.current.send({ type: "chat", text: value });
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Live chat</p>
        <span className="num text-xs text-muted-foreground">{viewers} here</span>
      </div>
      <div ref={listRef} className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
        {messages.length === 0 && <p className="py-8 text-center text-xs text-muted-foreground">Say hi to the seller 👋</p>}
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <span className="font-medium text-primary">{m.name}</span>
            <span className="ml-2 text-foreground/90">{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            placeholder="Add a comment"
            className="h-11 flex-1 rounded-full border border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <button type="submit" aria-label="Send" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
