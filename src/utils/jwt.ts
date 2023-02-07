import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";
import type { Secret } from "jsonwebtoken";
import { createHash } from "crypto";

const accessSecret = process.env.JWT_ACCESS_SECRET as Secret;
const refreshSecret = process.env.JWT_REFRESH_SECRET as Secret;

export const generateAccessToken = (user: User) =>
  jwt.sign({ userId: user.id }, accessSecret, {
    expiresIn: "5m",
  });

export const generateRefreshToken = (user: User, jti: string) =>
  jwt.sign({ userId: user.id, jti }, refreshSecret, { expiresIn: "8h" });

export const generateTokens = (user: User, jti: string) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
};

export const hashToken = (token: string) => {
  return createHash("sha512").update(token).digest("hex");
};
