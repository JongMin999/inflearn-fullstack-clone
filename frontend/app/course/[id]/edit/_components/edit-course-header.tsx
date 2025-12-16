"use client";

import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Course } from "@/generated/openapi-client";
import * as api from "@/lib/api";
import { toast } from "sonner";

interface EditCourseHeaderProps {
  course: Course;
}

export default function EditCourseHeader({ course }: EditCourseHeaderProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // sessionStorage에서 수정 여부 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dirtyKey = `course-edit-dirty-${course.id}`;
      const flag = window.sessionStorage.getItem(dirtyKey);
      setHasUnsavedChanges(flag === "1");
    }
  }, [course.id]);

  const publishCourseMutation = useMutation({
    mutationFn: () =>
      api.updateCourse(course.id, {
        status: "PUBLISHED",
      }),
    onSuccess: (res) => {
      // sessionStorage 초기화
      if (typeof window !== "undefined") {
        const dirtyKey = `course-edit-dirty-${course.id}`;
        window.sessionStorage.setItem(dirtyKey, "0");
      }
      setIsSubmitDialogOpen(false);
      setIsSubmitted(true);
      setIsSuccessDialogOpen(true);
      router.refresh();
      queryClient.invalidateQueries({
        queryKey: ["course", course.id],
      });
    },
    onError: () => {
      toast.error("강의 게시에 실패했습니다.");
    },
  });

  const handleClickSubmit = () => {
    if (isSubmitted) return;
    setIsSubmitDialogOpen(true);
  };

  const handleSubmitConfirm = () => {
    publishCourseMutation.mutate();
  };

  const handleSubmitDismiss = () => {
    setIsSubmitDialogOpen(false);
  };

  const handleSuccessConfirm = () => {
    setIsSuccessDialogOpen(false);
    router.push("/instructor/courses");
  };

  return (
    <header className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 bg-white flex-nowrap gap-2 md:gap-4">
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold truncate min-w-0">
        {course.title}
      </h2>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          disabled={publishCourseMutation.isPending || isSubmitted}
          onClick={handleClickSubmit}
          size={"lg"}
          className="text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 md:py-3 whitespace-nowrap"
        >
          {publishCourseMutation.isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isSubmitted ? (
            <span>제출완료</span>
          ) : (
            <span>제출하기</span>
          )}
        </Button>
        <Button
          onClick={() => router.push("/instructor/courses")}
          size="lg"
          variant={"outline"}
          className="p-2 md:p-3 flex-shrink-0"
        >
          <X size={16} className="md:w-5 md:h-5" />
        </Button>
      </div>

      {isSubmitDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-sm p-6 space-y-4 text-center">
            <p className="text-base font-semibold">
              {hasUnsavedChanges
                ? "변경사항이 저장되지 않았습니다. 그래도 제출하시겠습니까?"
                : "제출하시겠습니까?"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button className="flex-1" onClick={handleSubmitConfirm}>
                확인
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSubmitDismiss}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSuccessDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-sm p-6 space-y-4 text-center">
            <p className="text-base font-semibold">제출되었습니다.</p>
            <div className="flex items-center justify-center gap-3">
              <Button className="flex-1" onClick={handleSuccessConfirm}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}