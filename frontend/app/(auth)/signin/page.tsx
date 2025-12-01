"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react"; // 아이콘 import 추가

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(""); // 이전 에러 초기화

    const result = await signIn("credentials", {
      redirect: false, //  redirect false로 실패 시 처리 가능
      email,
      password,
    });

    if (result?.error) {
      // 서버에서 반환한 에러 메시지
      setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
    } else if (result?.ok) {
      // 로그인 성공 시 루트 페이지로 이동
      window.location.href = "/";
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
          className="bg-green-500 text-white font-bold cursor-pointer rounded-sm p-2 md:p-2.5 flex items-center justify-center gap-2 text-xs md:text-sm lg:text-base"
        >
          <LogIn size={16} className="md:w-5 md:h-5" />
          로그인
        </button>

        <Link href="/signup" className="text-center text-xs md:text-sm text-gray-600 hover:text-gray-800">
          아직 회원이 아니신가요? 회원가입
        </Link>
      </form>
    </div>
  );
}