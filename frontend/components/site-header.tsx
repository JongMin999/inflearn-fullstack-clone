"use client";

import { CourseCategory, User } from "@/generated/openapi-client";
import { Layers, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CATEGORY_ICONS } from "@/app/constants/category-icons";
import React from "react";

export default function SiteHeader({
  profile,
  categories,
}: {
  profile?: User;
  categories: CourseCategory[];
}) {
  const pathname = usePathname();
  const isSiteHeaderNeeded = !pathname.includes("/course/");
  const isCategoryNeeded = pathname == "/" || pathname.includes("/courses");

  if (!isSiteHeaderNeeded) return null;
  
  return (
    <header className="site-header w-full border-b bg-white">
      {/* 상단 헤더 */}
      <div className="header-top flex items-center justify-between px-4 md:px-8 py-3 gap-2 md:gap-4 flex-nowrap overflow-hidden">
        {/* 로고 */}
        <div className="logo flex-shrink-0 min-w-[80px] md:min-w-[120px]">
          <Link href="/">
            <Image
              src="/images/inflearn_public_logo.png"
              className="w-20 md:w-28 h-auto"
              width={120}
              height={32}
              alt="inflearn"
            />
          </Link>
        </div>
        {/* 네비게이션 */}
        <nav className="main-nav flex gap-2 md:gap-4 lg:gap-6 text-xs md:text-sm lg:text-base font-bold text-gray-700 flex-shrink-0 flex-nowrap">
          <Link href="#" className="hover:text-[#1dc078] transition-colors whitespace-nowrap">
            강의
          </Link>
          <Link href="#" className="hover:text-[#1dc078] transition-colors whitespace-nowrap">
            로드맵
          </Link>
          <Link href="#" className="hover:text-[#1dc078] transition-colors whitespace-nowrap">
            멘토링
          </Link>
          <Link href="#" className="hover:text-[#1dc078] transition-colors whitespace-nowrap">
            커뮤니티
          </Link>
        </nav>
        {/* 검색창 + 아이콘 */}
        <div className="flex-1 flex justify-center min-w-0">
          <div className="relative flex w-full max-w-xl items-center">
            <Input
              type="text"
              placeholder="나의 진짜 성장을 도와줄 실무 강의를 찾아보세요"
              className="w-full bg-gray-50 border-gray-200 focus-visible:ring-[#1dc078] pr-8 md:pr-10 text-xs md:text-sm"
            />
            <button
              type="button"
              className="absolute right-2 p-1 text-gray-400 hover:text-[#1dc078] transition-colors"
              tabIndex={-1}
            >
              <Search size={16} className="md:w-5 md:h-5" />
            </button>
          </div>
        </div>
        {/* 지식공유자 버튼 */}
        <Link href="/instructor" className="flex-shrink-0">
          <Button
            variant="outline"
            className="font-semibold border-gray-200 hover:border-[#1dc078] hover:text-[#1dc078] text-xs md:text-sm lg:text-base px-2 md:px-3 lg:px-4 py-1.5 md:py-2 whitespace-nowrap"
          >
            지식공유자
          </Button>
        </Link>
        {/* Avatar */}
         {/* Avatar + Popover */}
         <Popover>
          <PopoverTrigger asChild>
            <div className="ml-2 cursor-pointer">
              <Avatar>
                {profile?.image ? (
                  <img
                    src={profile.image}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback>
                    <span role="img" aria-label="user">
                      👤
                    </span>
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-0">
            <button
              className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:outline-none"
              onClick={() => (window.location.href = "/my/settings/account")}
            >
              <div className="font-semibold text-gray-800">
                {profile?.name || profile?.email || "내 계정"}
              </div>
            </button>
          </PopoverContent>
        </Popover>
      </div>
      {/* 하단 카테고리 */}
      <div className="header-bottom bg-white px-8">
        {isCategoryNeeded && (
          <nav className="category-nav flex gap-6 py-4 overflow-x-auto scrollbar-none">
            {categories.map((category) => (
              <Link key={category.id} href={`/courses/${category.slug}`}>
                <div className="category-item flex flex-col items-center min-w-[72px] text-gray-700 hover:text-[#1dc078] cursor-pointer transition-colors">
                   {/* <Layers size={28} className="mb-1" /> */}
                   {React.createElement(
                    CATEGORY_ICONS[category.slug] || CATEGORY_ICONS["default"],
                    {
                      size: 28,
                      className: "mb-1",
                    }
                  )}
                  <span className="text-xs font-medium whitespace-nowrap">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}