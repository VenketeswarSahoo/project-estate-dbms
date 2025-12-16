import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_estate";
const JWT_EXPIRES_IN = "7d";

export interface DecodedToken extends JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    return null;
  }
}
