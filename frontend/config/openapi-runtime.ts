import { CreateClientConfig } from "@/generated/openapi-client/client.gen";

import { getCookie } from "cookies-next/server";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME =
  process.env.USE_HTTPS === "true"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

const API_URL = process.env.API_URL || "http://localhost:8000";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: API_URL,
  async auth() {
    // NextAuth 세션에서 JWT 토큰 생성
    const { auth } = await import("@/auth");
    const session = await auth();
    
    if (!session?.user?.id) {
      return undefined;
    }

    // NextAuth 세션 정보로 JWT 토큰 생성
    const jwt = await import("jsonwebtoken");
    const token = jwt.sign(
      {
        sub: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      process.env.AUTH_SECRET!,
      { expiresIn: "1h" }
    );

    return token;
  },
});