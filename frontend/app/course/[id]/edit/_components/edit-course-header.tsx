"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function EditCourseHeader({ title }: { title: string }) {
  return (
    <header className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 bg-white flex-nowrap gap-2 md:gap-4">
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold truncate min-w-0">{title}</h2>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button size={"lg"} className="text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 md:py-3 whitespace-nowrap">제출</Button>
        <Button size="lg" variant={"outline"} className="p-2 md:p-3 flex-shrink-0">
          <X size={16} className="md:w-5 md:h-5" />
        </Button>
      </div>
    </header>
  );
}