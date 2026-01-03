"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 에러 확인
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      if (error === "Configuration") {
        setErrorMessage("OAuth 설정 오류가 발생했습니다. 관리자에게 문의하세요.");
      } else if (error === "AccessDenied") {
        setErrorMessage("로그인 접근이 거부되었습니다.");
      } else if (error === "Verification") {
        setErrorMessage("인증 오류가 발생했습니다.");
      } else {
        setErrorMessage(`로그인 오류: ${error}`);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(""); // 이전 에러 초기화
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Login error:", result.error);
        // NextAuth 에러 코드에 따라 다른 메시지 표시
        if (result.error === "CredentialsSignin") {
          setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setErrorMessage(`로그인 오류: ${result.error}`);
        }
        setIsLoading(false);
      } else if (result?.ok) {
        // 로그인 성공 시 루트 페이지로 이동
        router.push("/");
        router.refresh();
      } else {
        setErrorMessage("로그인에 실패했습니다. 다시 시도해주세요.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login exception:", err);
      setErrorMessage(`로그인 중 오류가 발생했습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-20 md:pt-24 pb-8 px-4 gap-3 md:gap-4">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">로그인</h1>
      <p className="text-xs md:text-sm lg:text-base text-gray-700">인프런 계정으로 로그인할 수 있어요.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-[300px] md:max-w-[400px]">
        <label htmlFor="email" className="text-xs md:text-sm font-medium">이메일</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-2 md:left-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          </div>
          <input
            id="email"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            placeholder="example@inflab.com"
            className="w-full border rounded-md p-2 md:p-3 pl-8 md:pl-10 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>
        {email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
          <p className="text-xs md:text-sm mt-1 text-red-600">❌ 올바른 이메일 형식이 아닙니다.</p>
        )}

        <label htmlFor="password" className="text-xs md:text-sm font-medium">비밀번호</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-2 md:left-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          </div>
          <input
            id="password"
            value={password}
            type={showPassword ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            placeholder="비밀번호를 입력하세요."
            className="w-full border rounded-md p-2 md:p-3 pl-8 md:pl-10 pr-8 md:pr-10 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} className="md:w-5 md:h-5" /> : <Eye size={16} className="md:w-5 md:h-5" />}
          </button>
        </div>

        {/* 에러 메시지 표시 */}
        {errorMessage && <p className="text-red-600 text-xs md:text-sm">{errorMessage}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-500 text-white font-bold cursor-pointer rounded-sm p-2 md:p-2.5 flex items-center justify-center gap-2 text-xs md:text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn size={16} className="md:w-5 md:h-5" />
          {isLoading ? "로그인 중..." : "로그인"}
        </button>

        <Link href="/signup" className="text-center text-xs md:text-sm text-gray-600 hover:text-gray-800">
          아직 회원이 아니신가요? 회원가입
        </Link>
      </form>

      {/* 소셜 로그인 구분선 */}
      <div className="flex items-center gap-4 w-full max-w-[300px] md:max-w-[400px] my-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-xs md:text-sm text-gray-500">또는</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* 소셜 로그인 버튼 */}
      <div className="flex flex-col gap-3 w-full max-w-[300px] md:max-w-[400px]">
        <button
          type="button"
          onClick={() => signIn("kakao", { callbackUrl: "/" })}
          className="w-full bg-[#FEE500] text-black font-medium rounded-md py-2.5 md:py-3 px-3 md:px-4 flex items-center justify-center gap-3 text-xs md:text-sm hover:bg-[#FDD835] transition-colors min-h-[42px]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path
              d="M12 3C6.477 3 2 6.58 2 11c0 3.57 2.4 6.72 6 8.38v2.36L10.24 19.5c.53.05 1.07.08 1.76.08 5.523 0 10-3.58 10-8s-4.477-8-10-8z"
              fill="#000000"
            />
          </svg>
          <span className="whitespace-nowrap">카카오로 시작하기</span>
        </button>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-white border border-gray-300 text-gray-700 font-medium rounded-md p-2.5 md:p-3 flex items-center justify-center gap-3 text-xs md:text-sm hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          <span className="whitespace-nowrap">Google로 시작하기</span>
        </button>

        <button
          type="button"
          onClick={() => signIn("naver", { callbackUrl: "/" })}
          className="w-full bg-[#03C75A] text-white font-medium rounded-md py-2.5 md:py-3 px-3 md:px-4 flex items-center justify-center gap-3 text-xs md:text-sm hover:bg-[#02B350] transition-colors min-h-[42px]"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path
              d="M0 0v18h4.05V8.1L13.5 18h4.5V0h-4.05v9.9L4.05 0H0z"
              fill="#FFFFFF"
            />
          </svg>
          <span className="whitespace-nowrap">네이버로 시작하기</span>
        </button>
      </div>
    </div>
  );
}