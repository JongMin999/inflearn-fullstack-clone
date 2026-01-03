import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"
import CredentialsProvider from 'next-auth/providers/credentials'
import Google from "next-auth/providers/google"
import type { OAuthConfig, OAuthUserConfig, Provider } from "next-auth/providers"
import { comparePassword } from "./lib/password-utils";
import * as jwt from 'jsonwebtoken';
import { JWT } from 'next-auth/jwt'

// Kakao OAuth Provider (커스텀 구현)
function Kakao(options: OAuthUserConfig<any>) {
  if (!options.clientId || !options.clientSecret) {
    throw new Error("Kakao OAuth requires clientId and clientSecret");
  }
  
  // 클로저로 값을 확실하게 캡처
  const clientId = options.clientId.trim();
  const clientSecret = options.clientSecret.trim();
  
  console.log("Kakao provider initialized:", {
    hasClientId: !!clientId,
    clientIdPrefix: clientId ? `${clientId.substring(0, 10)}...` : "null",
    hasClientSecret: !!clientSecret,
  });
  
  const providerConfig: OAuthConfig<any> = {
    id: "kakao",
    name: "Kakao",
    type: "oauth" as const,
    clientId: clientId,
    clientSecret: clientSecret,
    authorization: {
      url: "https://kauth.kakao.com/oauth/authorize",
      params: {
        response_type: "code",
        scope: "profile_nickname profile_image account_email",
        prompt: "select_account", // 계정 선택 화면 표시
      },
    },
    token: {
      url: "https://kauth.kakao.com/oauth/token",
      async request(context: any) {
        console.log("=== Kakao token.request called ===");
        console.log("Context params:", {
          hasCode: !!context.params?.code,
          hasRedirectUri: !!context.params?.redirect_uri,
        });
        console.log("Context provider:", {
          hasProvider: !!context.provider,
          providerClientId: context.provider?.clientId ? `${context.provider.clientId.substring(0, 10)}...` : "null",
        });
        console.log("Closure clientId:", clientId ? `${clientId.substring(0, 10)}...` : "null");
        
        // 클로저 변수 직접 사용
        const { params } = context;
        
        // 최종적으로 사용할 clientId와 clientSecret 결정
        const finalClientId = clientId || context.provider?.clientId;
        const finalClientSecret = clientSecret || context.provider?.clientSecret;
        
        if (!finalClientId || !finalClientSecret) {
          console.error("Kakao OAuth: Missing credentials", {
            closureClientId: !!clientId,
            contextProviderClientId: !!context.provider?.clientId,
            closureClientSecret: !!clientSecret,
            contextProviderClientSecret: !!context.provider?.clientSecret,
          });
          throw new Error("Kakao OAuth: clientId or clientSecret is missing in token request");
        }
        
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: finalClientId,
          client_secret: finalClientSecret,
          code: params.code!,
          redirect_uri: params.redirect_uri!,
        });

        console.log("Kakao token request body:", {
          grant_type: "authorization_code",
          client_id: finalClientId ? `${finalClientId.substring(0, 10)}...` : "null",
          has_client_secret: !!finalClientSecret,
          has_code: !!params.code,
          redirect_uri: params.redirect_uri,
        });

        const response = await fetch("https://kauth.kakao.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Kakao token error:", response.status, errorText);
          throw new Error(`Failed to fetch token: ${response.status} - ${errorText}`);
        }

        const tokenData = await response.json();
        console.log("Kakao token received successfully");
        return tokenData;
      },
    },
    userinfo: {
      url: "https://kapi.kakao.com/v2/user/me",
      async request(context: any) {
        console.log("Kakao userinfo request");
        const response = await fetch("https://kapi.kakao.com/v2/user/me", {
          headers: {
            Authorization: `Bearer ${context.tokens.access_token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Kakao userinfo error:", response.status, errorText);
          throw new Error(`Failed to fetch user info: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Kakao userinfo received:", {
          hasId: !!data.id,
          hasKakaoAccount: !!data.kakao_account,
          hasProperties: !!data.properties,
        });
        return data;
      },
    },
    profile(profile: any) {
      console.log("Kakao profile mapping:", {
        hasId: !!profile.id,
        hasKakaoAccount: !!profile.kakao_account,
        hasProperties: !!profile.properties,
      });
      
      const kakaoAccount = profile.kakao_account || {};
      const properties = profile.properties || {};

      return {
        id: profile.id?.toString() || "",
        name: properties.nickname || kakaoAccount.profile?.nickname || `Kakao User ${profile.id}`,
        email: kakaoAccount.email || null,
        image: properties.profile_image || kakaoAccount.profile?.profile_image_url || null,
      };
    },
    style: {
      logo: "https://developers.kakao.com/favicon.ico",
      bg: "#FEE500",
      text: "#000000",
    },
  };
  
  // client_secret_post 방식 명시 (NextAuth v5)
  if (typeof (providerConfig as any).client === "undefined") {
    (providerConfig as any).client = {
      token_endpoint_auth_method: "client_secret_post",
    };
  }
  
  return providerConfig;
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

// providers를 런타임에 동적으로 생성하는 함수
function getProviders(): Provider[] {
  const providers: Provider[] = [
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
  ];

  // 런타임에 환경 변수를 확인하여 OAuth providers 추가
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
    providers.push(
      Kakao({
        clientId: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
      })
    );
  }

  if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
    providers.push(
      Naver({
        clientId: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
      })
    );
  }

  return providers;
}

// 환경 변수 검증
if (!process.env.AUTH_SECRET) {
  console.error("AUTH_SECRET is not set!");
}

console.log("NextAuth configuration:", {
  useSecureCookies: process.env.USE_HTTPS === "true",
  trustHost: true,
  hasAuthSecret: !!process.env.AUTH_SECRET,
  hasKakaoConfig: !!(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET),
  hasGoogleConfig: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  hasNaverConfig: !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
  nextAuthUrl: process.env.NEXTAUTH_URL,
  kakaoClientId: process.env.KAKAO_CLIENT_ID ? `${process.env.KAKAO_CLIENT_ID.substring(0, 10)}...` : "missing",
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  useSecureCookies: process.env.USE_HTTPS === "true",
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: getProviders(),
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
  pages: {
    signIn: "/signin",
    error: "/signin", // 에러 발생 시에도 signin 페이지로 리다이렉트
  },
  events: {
    async linkAccount({ account, user }) {
      console.log("Account linked:", {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        userId: user.id,
      });
    },
    async createUser({ user }) {
      console.log("User created:", {
        id: user.id,
        email: user.email,
        name: user.name,
      });
    },
    async signIn({ user, account, profile }) {
      console.log("Sign in event:", {
        provider: account?.provider,
        userId: user?.id,
        email: user?.email,
      });
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("Sign in callback:", {
        provider: account?.provider,
        hasAccount: !!account,
        hasUser: !!user,
        userEmail: user?.email,
        accountId: account?.providerAccountId,
      });

      // OAuth 로그인인 경우 계정 연결 처리
      if (account && account.provider !== "credentials") {
        try {
          // 이미 존재하는 OAuth 계정 찾기
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            include: {
              user: true,
            },
          });

          if (existingAccount) {
            console.log("Existing OAuth account found, allowing sign in");
            // 기존 계정이 있으면 로그인 허용
            return true;
          }

          // OAuth 계정이 없고, 이메일이 있는 경우
          if (user.email) {
            // 같은 이메일로 가입한 사용자 찾기
            const existingUser = await prisma.user.findUnique({
              where: {
                email: user.email,
              },
              include: {
                accounts: true,
              },
            });

            if (existingUser) {
              // 같은 이메일 사용자가 있지만 해당 OAuth 계정이 없는 경우
              const hasThisProvider = existingUser.accounts.some(
                (acc) => acc.provider === account.provider
              );

              if (!hasThisProvider) {
                console.log("Linking OAuth account to existing user:", existingUser.id);
                // OAuth 계정을 기존 사용자에 연결
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    refresh_token: typeof account.refresh_token === "string" ? account.refresh_token : null,
                    access_token: typeof account.access_token === "string" ? account.access_token : null,
                    expires_at: typeof account.expires_at === "number" ? account.expires_at : null,
                    token_type: typeof account.token_type === "string" ? account.token_type : null,
                    scope: typeof account.scope === "string" ? account.scope : null,
                    id_token: typeof account.id_token === "string" ? account.id_token : null,
                    session_state: typeof account.session_state === "string" ? account.session_state : null,
                  },
                });
                console.log("OAuth account linked successfully");
                return true;
              }
            }
          }

          // 새로운 사용자 - PrismaAdapter가 자동으로 생성할 것임
          console.log("New OAuth user, will be created by PrismaAdapter");
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          // 에러가 발생해도 로그인 시도는 허용 (PrismaAdapter가 처리할 수 있음)
          return true;
        }
      }

      // Credentials 로그인 허용
      return true;
    },
    async redirect({ url, baseUrl }) {
      // 콜백 후 리다이렉트 처리
      // url이 callbackUrl 파라미터로 전달된 경우 그대로 사용
      if (url) {
        // 상대 경로인 경우 baseUrl 추가
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        // 같은 도메인인 경우 허용
        try {
          const urlObj = new URL(url);
          if (urlObj.origin === baseUrl) return url;
        } catch {
          // URL 파싱 실패 시 무시
        }
      }
      // 기본적으로 홈으로 리다이렉트
      return baseUrl;
    },
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