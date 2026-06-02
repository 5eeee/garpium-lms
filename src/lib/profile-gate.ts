import { createHash, randomBytes } from "crypto";

export function profileGateCookie() {
  return "profile_change_ok";
}

export function passwordResetCookie() {
  return "pwd_reset_ok";
}

export function gateToken() {
  return randomBytes(24).toString("hex");
}

export function hashGateToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
