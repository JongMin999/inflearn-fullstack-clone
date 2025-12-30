"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";

type SortOption = "latest" | "popular" | "recommended" | "price_low" | "price_high";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "recommended", label: "추천순" },
  { value: "popular", label: "인기순" },
  { value: "price_low", label: "낮은 가격 순" },
  { value: "price_high", label: "높은 가격 순" },
];

interface CourseSortSelectorProps {
  currentSort?: string;
}

export default function CourseSortSelector({
  currentSort = "latest",
}: CourseSortSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const currentLabel =
    sortOptions.find((opt) => opt.value === currentSort)?.label || "최신순";

  const handleSortChange = (value: string) => {
    setOpen(false); // 드롭다운 닫기
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sortBy", value);
      params.set("page_number", "1"); // 정렬 변경 시 페이지를 1로 리셋

      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl);
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[140px] justify-between font-normal"
          disabled={isPending}
        >
          <span className="truncate text-left flex-1">{currentLabel}</span>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[140px] p-1"
        sideOffset={4}
      >
        <DropdownMenuRadioGroup
          value={currentSort}
          onValueChange={handleSortChange}
        >
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem 
              key={option.value} 
              value={option.value}
              className="cursor-pointer whitespace-nowrap"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
