"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

type FilterType = "discount" | "beginner" | "intermediate" | "advanced";

export default function CourseFilterButtons() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeFilters = new Set<FilterType>();
  if (searchParams.get("discount") === "true") activeFilters.add("discount");
  if (searchParams.get("beginner") === "true") activeFilters.add("beginner");
  if (searchParams.get("intermediate") === "true") activeFilters.add("intermediate");
  if (searchParams.get("advanced") === "true") activeFilters.add("advanced");

  const toggleFilter = (filterType: FilterType) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      // 난이도 필터들 (하나만 선택 가능)
      const levelFilters = ["beginner", "intermediate", "advanced"];
      
      if (levelFilters.includes(filterType)) {
        // 난이도 필터인 경우: 다른 난이도 필터들을 모두 제거하고 현재 것만 토글
        levelFilters.forEach(level => {
          params.delete(level);
        });
        
        if (!activeFilters.has(filterType)) {
          // 현재 선택되지 않았다면 선택
          params.set(filterType, "true");
        }
        // 이미 선택되어 있다면 제거 (아무것도 선택 안 함)
      } else {
        // 할인 필터는 독립적으로 토글
        if (activeFilters.has(filterType)) {
          params.delete(filterType);
        } else {
          params.set(filterType, "true");
        }
      }
      
      // 페이지는 1로 리셋
      params.set("page_number", "1");
      
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant={activeFilters.has("discount") ? "default" : "outline"}
        size="sm"
        onClick={() => toggleFilter("discount")}
        disabled={isPending}
        className={`text-sm font-medium transition-all ${
          activeFilters.has("discount")
            ? "bg-[#1dc078] hover:bg-[#1dc078]/90 text-white border-[#1dc078]"
            : "border-gray-300 hover:border-[#1dc078] hover:text-[#1dc078]"
        }`}
      >
        할인
      </Button>
      <Button
        variant={activeFilters.has("beginner") ? "default" : "outline"}
        size="sm"
        onClick={() => toggleFilter("beginner")}
        disabled={isPending}
        className={`text-sm font-medium transition-all ${
          activeFilters.has("beginner")
            ? "bg-[#1dc078] hover:bg-[#1dc078]/90 text-white border-[#1dc078]"
            : "border-gray-300 hover:border-[#1dc078] hover:text-[#1dc078]"
        }`}
      >
        왕초보(입문)
      </Button>
      <Button
        variant={activeFilters.has("intermediate") ? "default" : "outline"}
        size="sm"
        onClick={() => toggleFilter("intermediate")}
        disabled={isPending}
        className={`text-sm font-medium transition-all ${
          activeFilters.has("intermediate")
            ? "bg-[#1dc078] hover:bg-[#1dc078]/90 text-white border-[#1dc078]"
            : "border-gray-300 hover:border-[#1dc078] hover:text-[#1dc078]"
        }`}
      >
        초급
      </Button>
      <Button
        variant={activeFilters.has("advanced") ? "default" : "outline"}
        size="sm"
        onClick={() => toggleFilter("advanced")}
        disabled={isPending}
        className={`text-sm font-medium transition-all ${
          activeFilters.has("advanced")
            ? "bg-[#1dc078] hover:bg-[#1dc078]/90 text-white border-[#1dc078]"
            : "border-gray-300 hover:border-[#1dc078] hover:text-[#1dc078]"
        }`}
      >
        중급
      </Button>
    </div>
  );
}

