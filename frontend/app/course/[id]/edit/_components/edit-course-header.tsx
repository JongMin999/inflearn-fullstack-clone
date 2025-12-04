"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditCourseHeader({ title }: { title: string }) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleCancel = () => setIsConfirmOpen(true);
  const handleConfirm = () => {
    setIsConfirmOpen(false);
    router.push("/instructor/courses");
  };
  const handleDismiss = () => setIsConfirmOpen(false);

  return (
    <header className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 bg-white flex-nowrap gap-2 md:gap-4">
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold truncate min-w-0">{title}</h2>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button size={"lg"} className="text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 md:py-3 whitespace-nowrap">제출</Button>
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
              <Button className="flex-1" onClick={handleConfirm}>
                확인
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleDismiss}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}