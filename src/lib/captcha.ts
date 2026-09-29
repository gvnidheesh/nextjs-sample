import { createHmac, timingSafeEqual } from "node:crypto";

// Self-contained login captcha: a small arithmetic question whose answer is
// carried in a signed, expiring token. No third-party service, no server-side
// store — the token is opaque to the client and can't be forged or replayed
// past its expiry without the SESSION_SECRET.

const TTL_MS = 10 * 60 * 1000; // 10 minutes to solve

export interface Captcha {
  /** Human-readable prompt, e.g. "What is 3 + 8?" */
  question: string;
  /** Signed token to submit alongside the typed answer. */
  token: string;
}

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Set it in .env.local (see .env.example).",
    );
  }
  return value;
}

// Domain-separated from the session cookie's HMAC so the two token kinds are
// never interchangeable.
function sign(payload: string): string {
  return createHmac("sha256", secret()).update(`captcha.${payload}`).digest("hex");
}

export function issueCaptcha(): Captcha {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  const answer = a + b;

  const payload = Buffer.from(`${answer}.${Date.now() + TTL_MS}`).toString(
    "base64url",
  );
  return { question: `What is ${a} + ${b}?`, token: `${payload}.${sign(payload)}` };
}

export function verifyCaptcha(
  token: string | undefined | null,
  guess: string | undefined | null,
): boolean {
  if (!token || !guess) return false;

  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;

  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const [answer, expiresAt] = decoded.split(".");
  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  return guess.trim() === answer;
}
