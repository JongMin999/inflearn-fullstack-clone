import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"
import CredentialsProvider from 'next-auth/providers/credentials'
import Google from "next-auth/providers/google"
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers"
import { comparePassword } from "./lib/password-utils";
import * as jwt from 'jsonwebtoken';
import { JWT } from 'next-auth/jwt'

// Kakao OAuth Provider
function Kakao(options: OAuthUserConfig<any>) {
  if (!options.clientId || !options.clientSecret) {
    throw new Error("Kakao OAuth requires clientId and clientSecret");
  }
  
  const clientId = options.clientId;
  const clientSecret = options.clientSecret;
  
  return {
    id: "kakao",
    name: "Kakao",
    type: "oauth" as const,
    clientId: clientId,
    clientSecret: clientSecret,
    authorization: {
      url: "https://kauth.kakao.com/oauth/authorize",
      params: {
        scope: "profile_nickname profile_image account_email",
        response_type: "code",
        prompt: "select_account",
      },
    },
    token: {
      url: "https://kauth.kakao.com/oauth/token",
      async request(context: any) {
        const { params } = context;
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code: params.code!,
          redirect_uri: params.redirect_uri!,
        });

        const response = await fetch("https://kauth.kakao.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch token: ${response.status}`);
        }

        return await response.json();
      },
    },
    userinfo: {
      url: "https://kapi.kakao.com/v2/user/me",
      async request(context: any) {
        const response = await fetch("https://kapi.kakao.com/v2/user/me", {
          headers: {
            Authorization: `Bearer ${context.tokens.access_token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.status}`);
        }
        
        return await response.json();
      },
    },
    profile(profile: any) {
      const nickname = profile.kakao_account?.profile?.nickname;
      const email = profile.kakao_account?.email;
      const image = profile.kakao_account?.profile?.profile_image_url;
      
      const userId = String(profile.id);
      const userName = nickname || email || `Kakao User ${userId}`;
      
      return {
        id: userId,
        name: userName,
        email: email || null,
        image: image || null,
      };
    },
    style: {
      logo: "https://developers.kakao.com/static/images/kakao.png",
      bg: "#FEE500",
      text: "#000000",
    },
  } as OAuthConfig<any>
}

// Naver OAuth Provider
function Naver(options: OAuthUserConfig<any>) {
  if (!options.clientId || !options.clientSecret) {
    throw new Error("Naver OAuth requires clientId and clientSecret");
  }
  
  return {
    id: "naver",
    name: "Naver",
    type: "oauth" as const,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorization: {
      url: "https://nid.naver.com/oauth2.0/authorize",
      params: {
        response_type: "code",
        auth_type: "reauthenticate",
      },
    },
    token: "https://nid.naver.com/oauth2.0/token",
    userinfo: {
      url: "https://openapi.naver.com/v1/nid/me",
      async request(context: any) {
        const response = await fetch("https://openapi.naver.com/v1/nid/me", {
          headers: {
            Authorization: `Bearer ${context.tokens.access_token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.status}`);
        }
        
        return await response.json();
      },
    },
    profile(profile: any) {
      const naverProfile = profile.response;
      const displayName = naverProfile.nickname || naverProfile.name;
      
      return {
        id: naverProfile.id,
        name: displayName || `Naver User ${naverProfile.id}`,
        email: naverProfile.email || null,
        image: naverProfile.profile_image || null,
      };
    },
    style: {
      logo: "https://developers.naver.com/favicon.ico",
      bg: "#03C75A",
      text: "#FFFFFF",
    },
  } as OAuthConfig<any>
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  useSecureCookies: process.env.USE_HTTPS === "true",
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: "이메일",
          type: "email",
          placeholder: "이메일 입력",
        },
        password: {
          label: "비밀번호",
          type: "password",
        },
      },
      async authorize(credentials){
        //1. 모든 값들이 정상적으로 들어왔는가?
        if(!credentials || !credentials.email || !credentials.password){
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        //2. DB에서 유저를 찾기
        const user = await prisma.user.findUnique({
          where:{
            email: credentials.email as string,
          },
        })

        if(!user){
          throw new Error("존재하지 않는 이메일입니다.");
        }

        //3. 비밀번호 일치 여부 확인
        const passwordMatch = comparePassword(
          credentials.password as string,
          user.hashedPassword as string);

          if(!passwordMatch){
            throw new Error("비밀번호가 일치하지 않습니다.");
          }
          return user;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET
      ? [
          Kakao({
            clientId: process.env.KAKAO_CLIENT_ID!,
            clientSecret: process.env.KAKAO_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET
      ? [
          Naver({
            clientId: process.env.NAVER_CLIENT_ID!,
            clientSecret: process.env.NAVER_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  jwt:{
    encode: async({token, secret}) => {
      return jwt.sign(token as jwt.JwtPayload, secret as string);
    },
    decode: async({token, secret}) => {
      return jwt.verify(token as string, secret as string) as JWT;
    },
  },
  pages: {},
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        if (token.email) {
          session.user.email = token.email;
        }
        if (token.name) {
          session.user.name = token.name;
        }
      }
      return session;
    },
  },
});