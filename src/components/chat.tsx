"use client";

import { useState } from "react";
import { leaveAction } from "@/app/actions/leave";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export function Chat({ username }: { username: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  function send() {
    const text = draft.trim();
    if (!text) {
      return;
    }
    setDraft("");
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: "user", text },
      { id: prev.length + 1, role: "assistant", text },
    ]);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <p className="font-medium">{username}</p>
        <form action={leaveAction}>
          <button type="submit" className="text-sm underline">
            Leave
          </button>
        </form>
      </header>
      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.map((message) => (
          <li
            key={message.id}
            data-role={message.role}
            className={
              message.role === "user"
                ? "self-end rounded-lg bg-zinc-900 px-3 py-2 text-white"
                : "self-start rounded-lg bg-zinc-200 px-3 py-2"
            }
          >
            {message.text}
          </li>
        ))}
      </ul>
      <div className="flex gap-2 border-t p-4">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          rows={2}
          className="flex-1 rounded border border-zinc-300 px-3 py-2"
          aria-label="Message"
        />
        <button
          type="button"
          onClick={send}
          className="rounded bg-zinc-900 px-3 py-2 text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}
