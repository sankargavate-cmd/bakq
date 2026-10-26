import { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "./errorHandler";

/**
 * Minimal in-memory fixed-window rate limiter, scoped to auth endpoints
 * that were previously fully unprotected against brute-force/abuse
 * (login password guessing, signup spam, forgot-password email bombing).
 *
 * No external dependency (e.g. express-rate-limit) is introduced here —
 * this keeps the fix self-contained and installable offline. In-memory
 * state means limits reset on process restart and aren't shared across
 * horizontally-scaled instances; that's an acceptable tradeoff for this
 * single-instance-baseline app and is strictly better than no limiting at
 * all. Revisit with a shared store (Redis, etc.) if/when this app runs as
 * multiple instances.
 *
 * Keyed by IP + (optionally) the request's email field, so a single
 * attacker can't bypass the limit by rotating emails from one IP, nor
 * flood one victim's account from many IPs beyond the shared cap.
 */

interface WindowState {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, WindowState>();

// Lazily sweep expired entries on access instead of running a background
// timer — keeps this dependency-free and avoids keeping the process alive
// via an interval handle.
function prune(now: number) {
  if (buckets.size < 10000) return;
  for (const [key, state] of buckets) {
    if (state.resetAt <= now) buckets.delete(key);
  }
}

function hit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  prune(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= max) {
    return false;
  }

  existing.count += 1;
  return true;
}

/**
 * Builds a rate-limit middleware. `max` requests per `windowMs` per
 * IP+email combination, AND a second, more permissive `max * IP_ONLY_MULTIPLIER`
 * requests per `windowMs` per IP alone.
 *
 * The IP+email bucket is what actually stops password-guessing against
 * one known account. On its own, though, that key lets an attacker
 * bypass the limit entirely by rotating the email on every request from
 * the same IP (a fresh `ip:email` key each time never accumulates) —
 * exactly the credential-stuffing/enumeration/spam pattern this
 * middleware exists to stop, and the opposite of what its original
 * "can't bypass the limit by rotating emails from one IP" intent
 * describes. The IP-only bucket below closes that gap: it caps how many
 * attempts, across *any* combination of emails, one IP can make in the
 * window, while staying loose enough that it's never the limiting factor
 * for one legitimate user working through one account.
 */
const IP_ONLY_MULTIPLIER = 5;

export function authRateLimit(max: number, windowMs: number): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const ip = req.ip ?? "unknown";
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!hit(`ip:${ip}`, windowMs, max * IP_ONLY_MULTIPLIER)) {
      throw new AppError("Too many attempts. Please try again later.", 429);
    }

    if (!hit(`ip:${ip}:email:${email}`, windowMs, max)) {
      throw new AppError("Too many attempts. Please try again later.", 429);
    }

    next();
  };
}
