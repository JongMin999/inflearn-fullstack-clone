"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signUp } from "@/app/actions/auth-actions";
import { redirect } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus } from "lucide-react"; // 아이콘 import 추가

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [index, setIndex] = useState(0);

  const messages = [
    "인프런에서 다양한 학습의 기회를 얻으세요.",
    "최고의 강사들과 함께 성장하세요.",
    "나만의 커리어를 만들어 보세요.",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

      if (!email) {
        alert("이메일을 입력해주세요.");
        return;
      }
      
      // 이메일 형식 체크
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("올바른 이메일 형식이 아닙니다.");
        return;
      }

      if (password !== passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }

      const result = await signUp({
        email,
        password,
      });

      if (result?.status === "ok") {
        redirect("/signin");
      }
  
      if (result?.message) {
        alert(result.message);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">회원가입</h1>

      {/* 안내 문구 */}
      <div className="h-6 mb-6 text-center overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 1 }}
            className="text-gray-500"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* 회원가입 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 min-w-[300px]">
        <label htmlFor="email">이메일</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            name="email"
            placeholder="example@inflab.com"
            className="w-full border rounded-md p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>
        {email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
          <p className="text-sm mt-1 text-red-600">❌ 올바른 이메일 형식이 아닙니다.</p>
        )}

        {/* 비밀번호 */}
        <label htmlFor="password">비밀번호</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="비밀번호를 입력하세요."
            className="w-full border rounded-md p-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* 비밀번호 확인 */}
        <label htmlFor="passwordConfirm">비밀번호 확인</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            type={showPasswordConfirm ? "text" : "password"}
            name="passwordConfirm"
            placeholder="비밀번호를 다시 입력하세요."
            className="w-full border rounded-md p-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* 비밀번호 일치 여부 */}
        {passwordConfirm.length > 0 && (
          <p
            className={`text-sm mt-1 ${
              password === passwordConfirm ? "text-green-600" : "text-red-600"
            }`}
          >
            {password === passwordConfirm
              ? "비밀번호가 일치합니다."
              : "비밀번호가 일치하지 않습니다."}
          </p>
        )}

        {/* 회원가입 버튼 */}
        <button
          type="submit"
          className="bg-green-500 text-white font-bold cursor-pointer rounded-sm p-2 flex items-center justify-center gap-2"
        >
          <UserPlus size={20} />
          회원가입
        </button>

        <Link href="/signin" className="text-center text-sm text-gray-600 hover:text-gray-800">
          이미 계정이 있으신가요? 로그인
        </Link>
      </form>
    </div>
  );
}