"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Course } from "@/generated/openapi-client";
import * as api from "@/lib/api";
import { toast } from "sonner";

interface EditCourseHeaderProps {
  initialCourse: Course;
}

export default function EditCourseHeader({ initialCourse }: EditCourseHeaderProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [submitHasUnsavedChanges, setSubmitHasUnsavedChanges] =
    useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null
  );

  const handleCancel = () => setIsConfirmOpen(true);

  const handleConfirm = async () => {
    try {
      setIsReverting(true);

      const { error } = await api.updateCourse(initialCourse.id, {
        title: initialCourse.title,
        shortDescription: initialCourse.shortDescription ?? "",
        price: initialCourse.price,
        discountPrice: initialCourse.discountPrice ?? 0,
        level: initialCourse.level,
      });

      if (error) {
        toast.error(
          typeof error === "string"
            ? error
            : "원본 데이터로 되돌리는 중 오류가 발생했습니다."
        );
        return;
      }

      toast.success("강의 정보가 원본 상태로 되돌아갔습니다.");
      setIsConfirmOpen(false);
      router.push("/instructor/courses");
    } catch (e) {
      console.error(e);
      toast.error("원본 데이터로 되돌리는 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsReverting(false);
    }
  };

  const handleDismiss = () => setIsConfirmOpen(false);

  const handleClickSubmit = () => {
    if (typeof window !== "undefined") {
      const dirtyKey = `course-edit-dirty-${initialCourse.id}`;
      const errorKey = `course-edit-error-${initialCourse.id}`;

      const error = window.sessionStorage.getItem(errorKey);
      const flag = window.sessionStorage.getItem(dirtyKey);

      if (error) {
        setSubmitErrorMessage(error);
        setSubmitHasUnsavedChanges(false);
      } else {
        setSubmitErrorMessage(null);
        setSubmitHasUnsavedChanges(flag === "1");
      }
    } else {
      setSubmitHasUnsavedChanges(false);
      setSubmitErrorMessage(null);
    }
    setIsSubmitDialogOpen(true);
  };

  const handleSubmitConfirm = () => {
    setIsSubmitDialogOpen(false);
    router.push("/instructor/courses");
  };

  const handleSubmitDismiss = () => {
    setIsSubmitDialogOpen(false);
    setSubmitErrorMessage(null);
  };

  return (
    <header className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 bg-white flex-nowrap gap-2 md:gap-4">
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold truncate min-w-0">
        {initialCourse.title}
      </h2>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size={"lg"}
          className="text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 md:py-3 whitespace-nowrap"
          onClick={handleClickSubmit}
        >
          제출
        </Button>
        <Button
          size="lg"
          variant={"outline"}
          className="p-2 md:p-3 flex-shrink-0"
          onClick={handleCancel}
        >
          <X size={16} className="md:w-5 md:h-5" />
        </Button>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-sm p-6 space-y-4 text-center">
            <p className="text-base font-semibold">강의 수정을 취소하시겠습니까?</p>
            <div className="flex items-center justify-center gap-3">
              <Button className="flex-1" onClick={handleConfirm} disabled={isReverting}>
                {isReverting ? "되돌리는 중..." : "확인"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleDismiss}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSubmitDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-sm p-6 space-y-4 text-center">
            {submitErrorMessage ? (
              <>
                <p className="text-base font-semibold text-red-600 break-words">
                  {submitErrorMessage}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button className="flex-1" onClick={handleSubmitDismiss}>
                    확인
                  </Button>
                </div>
              </>
            ) : submitHasUnsavedChanges ? (
              <>
                <p className="text-base font-semibold">
                  변경사항이 저장되지 않았습니다. 그래도 제출하시겠습니까?
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
              </>
            ) : (
              <>
                <p className="text-base font-semibold">제출되었습니다.</p>
                <div className="flex items-center justify-center gap-3">
                  <Button className="flex-1" onClick={handleSubmitConfirm}>
                    확인
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}