import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SESSION_COOKIE, serializeSession } from "./lib/session";
import { middleware } from "./middleware";

function requestToChat(cookie?: string): NextRequest {
  const headers = new Headers();
  if (cookie !== undefined) {
    headers.set("cookie", `${SESSION_COOKIE}=${cookie}`);
  }
  return new NextRequest("http://localhost:3000/chat", { headers });
}

describe("middleware", () => {
  it("redirects /chat to / without a cookie", async () => {
    const response = await middleware(requestToChat());
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("allows /chat with a valid cookie", async () => {
    const response = await middleware(
      requestToChat(await serializeSession("Ada")),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects and clears a tampered cookie", async () => {
    const token = await serializeSession("Ada");
    const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
    const response = await middleware(requestToChat(tampered));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/session=/i);
    expect(setCookie).toMatch(/max-age=0|expires=/i);
  });
});
