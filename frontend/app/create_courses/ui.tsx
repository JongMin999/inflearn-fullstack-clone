"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import * as api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UI() {
  const router = useRouter();
  const [title, setTitle] = useState("");

  const createCourseMutation = useMutation({
    mutationFn: () => api.createCourse(title),
    onSuccess: (res) => {
      if (res.data && !res.error) {
        router.push(`/course/${res.data.id}/edit/course_info`);
      }
      if (res.error) {
        // 에러가 객체인 경우 message를 추출, 문자열인 경우 그대로 사용
        const errorMessage = 
          typeof res.error === 'object' && res.error !== null && 'message' in res.error
            ? (res.error as { message: string }).message
            : typeof res.error === 'string'
            ? res.error
            : '강의 생성에 실패했습니다.';
        toast.error(errorMessage);
      }
    },
    onError: (error: unknown) => {
      // 예상치 못한 에러 처리
      const errorMessage = 
        error instanceof Error 
          ? error.message 
          : typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : '강의 생성 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    },
  });

  return (
    <div className="w-full max-w-xl mx-auto min-h-screen pt-20 md:pt-24 pb-8 px-4 flex flex-col items-center justify-center gap-3 md:gap-4">
      <h2 className="text-base md:text-lg lg:text-xl text-center font-bold whitespace-normal break-words">
        제목을 입력해주세요!
        <br />
        너무 고민하지마세요. 제목은 언제든 수정 가능해요 :)
      </h2>
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력해주세요."
        className="bg-[#F6F6F6] py-4 md:py-5 lg:py-6 rounded-xs text-xs md:text-sm lg:text-base w-full"
      />
      <div className="flex gap-2 md:gap-3 w-full justify-center flex-wrap">
        <Button 
          variant={"outline"} 
          className="px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6 text-xs md:text-sm lg:text-base font-bold whitespace-nowrap"
        >
          이전
        </Button>
        <Button
          onClick={() => createCourseMutation.mutate()}
          disabled={createCourseMutation.isPending || !title.trim()}
          variant={"default"}
          className="px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6 text-xs md:text-sm lg:text-base font-bold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createCourseMutation.isPending ? "생성 중..." : "만들기"}
        </Button>
      </div>
    </div>
  );
}