import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { readSession } from "@/lib/session";

export default async function HomePage() {
  const session = await readSession();
  if (session) {
    redirect("/chat");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
