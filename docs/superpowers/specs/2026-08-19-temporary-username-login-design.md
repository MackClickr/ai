# Temporary username login

Date: 2026-08-19

## Goal

Ship the first slice of an AI chat web app: a **simple, temporary login** (username only) plus a **local chat shell**. No accounts, no database, no real model.

## Scope

In:

- Username form and session cookie
- Protected chat page with in-memory messages and a placeholder assistant reply
- Leave (clear session)

Out:

- Passwords, email, OAuth, user table
- Persisted chat history
- Real AI / model API
- Rate limits, lockout, analytics

## Architecture

Next.js App Router, TypeScript, single app.

| Route | Behavior |
| --- | --- |
| `/` | Username form. Valid submit sets a signed session cookie and redirects to `/chat`. If a valid cookie already exists, redirect to `/chat`. |
| `/chat` | Chat shell. Middleware requires a valid session; otherwise redirect to `/`. |

Identity is the `session` cookie (signed payload: username). There is no user store. Messages live in React state only and disappear on refresh. The username cookie lasts for the browser session (no `Max-Age`); it is gone when the browser session ends.

`SESSION_SECRET` (env) signs the cookie so the client cannot forge a name. Provide `.env.example` with a placeholder; never commit a real secret.

## Components

- **Login form** (`/`): one username field and submit. Trim whitespace. After trim, length must be 1–32 characters (any characters allowed). Reject empty and too-long names with inline errors. No password or email.
- **Session helpers**: `createSession(username)`, `readSession()`, `clearSession()`. Routes and middleware never parse the cookie by hand.
- **Middleware**: `/chat` requires a valid session; otherwise redirect to `/`.
- **Chat page**: header shows the current username and a **Leave** control that clears the cookie and returns to `/`.
- **Chat thread**: user and assistant bubbles. Send appends the user message locally, then appends a placeholder assistant reply that **echoes** the user text. No API, no persistence.
- **Composer**: text box + send. Enter sends; Shift+Enter inserts a newline.

## Data flow

1. User submits a name on `/`. A server action validates it, signs a session cookie, sets it (`httpOnly`, `Secure` in production, `SameSite=Lax`, no `Max-Age`), and redirects to `/chat`.
2. Middleware on `/chat` verifies the signature. Invalid or missing session redirects to `/`.
3. The chat page reads the username from the session for the header. Send → append user bubble → append echo assistant bubble. Refresh clears the thread; the cookie remains until the browser session ends.
4. Leave deletes the cookie and redirects to `/`.

Anyone may pick any name. Names are not unique across users; uniqueness is only “this browser session remembers this name.”

## Error handling

- Empty or too-long username: stay on `/` with a short inline message (“Enter a name” / “Name is too long”). No toast library.
- Invalid or tampered cookie: treat as logged out — clear it and show the login form.
- Leave always succeeds: cookie gone, back to `/`.
- Empty chat send: ignore, no error UI.

No account lockout, rate limits, or email errors.

## Testing

Focus on login, not the fake chat.

- Username validation: empty, whitespace-only, too long, and a normal name.
- Session cookie: valid name produces a signed cookie; tampered cookie is rejected.
- Routes: `/chat` without a cookie redirects to `/`; with a valid cookie it renders; Leave clears the cookie and returns to `/`.

No E2E suite in this slice. No message-persistence tests.

## Success criteria

- A visitor can type a name, reach `/chat`, see that name, send a message, and get an echo reply.
- Refresh keeps the name and drops the thread.
- Leave returns to the login form; `/chat` is blocked until they enter a name again.
- Closing the browser session drops the cookie.
