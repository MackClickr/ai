import { redirect } from "next/navigation";
import { Chat } from "@/components/chat";
import { readSession } from "@/lib/session";

export default async function ChatPage() {
  const session = await readSession();
  if (!session) {
    redirect("/");
  }

  return <Chat username={session.username} />;
}
