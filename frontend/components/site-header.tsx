"use client";

import { CourseCategory, User } from "@/generated/openapi-client";
import { Layers, Search, Grid, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CATEGORY_ICONS } from "@/app/constants/category-icons";
import React, { useState } from "react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";

export default function SiteHeader({
  profile,
  categories,
  session,
}: {
  session: Session | null;
  profile?: User;
  categories: CourseCategory[];
}) {
  const pathname = usePathname();
  const isSiteHeaderNeeded =
    !pathname.match(/^\/course\/[0-9a-f-]+(\/edit|\/edit\/.*)$/) &&
    !pathname.match(/^\/courses\/lecture/);
  const isCategoryNeeded = pathname == "/" || pathname.includes("/courses");
  const [search, setSearch] = useState("");
  const [isCartPopoverOpen, setIsCartPopoverOpen] = useState(false);
  const router = useRouter();
  const cartItemsQuery = useQuery({
    queryFn: () => api.getCartItems(),
    queryKey: ["cart-items"],
  });

  // 최신 3개 아이템만 표시
  const recentCartItems =
    cartItemsQuery?.data?.data?.items
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3) ?? [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  if (!isSiteHeaderNeeded) return null;

  if (cartItemsQuery.isLoading) {
    return <div>로딩중...</div>;
  }
  
  return (
    <header className="relative site-header w-full bg-white">
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
          <div className="relative flex w-full items-center">
            <Input
              type="text"
              placeholder="나의 진짜 성장을 도와줄 실무 강의를 찾아보세요"
              className="w-full bg-gray-50 border-gray-200 focus-visible:ring-[#1dc078] pr-8 md:pr-10 text-xs md:text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (search.trim()) {
                    router.push(`/search?q=${search}`);
                  } else {
                    router.push("/");
                  }
                } else if (e.key === " ") {
                  e.preventDefault();
                  router.push("/");
                }
              }}
            />
            <button
              type="button"
              className="absolute right-2 p-1 text-gray-400 hover:text-[#1dc078] transition-colors"
              tabIndex={-1}
              onClick={() => {
                if (search.trim()) {
                  router.push(`/search?q=${search}`);
                } else {
                  router.push("/");
                }
              }}
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

         {/* 장바구니 아이콘 + Popover */}
         <div 
           className="relative"
           onMouseEnter={() => setIsCartPopoverOpen(true)}
           onMouseLeave={() => setIsCartPopoverOpen(false)}
         >
          <Popover open={isCartPopoverOpen} onOpenChange={setIsCartPopoverOpen}>
            <PopoverTrigger asChild>
              <button 
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => router.push("/carts")}
              >
                <ShoppingCart className="size-5 text-gray-700" />
                {(cartItemsQuery?.data?.data?.totalCount ?? 0) > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-red-500 text-white"
                  >
                    {cartItemsQuery?.data?.data?.totalCount}
                  </Badge>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent 
              align="end" 
              sideOffset={0}
              className="w-80 p-0"
            >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">수강바구니</h3>
            </div>

            {cartItemsQuery?.data?.data?.totalCount === 0 ? (
              <div className="p-4 text-center text-gray-500">
                장바구니가 비어있습니다.
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto">
                  {recentCartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className="relative w-12 h-8 flex-shrink-0">
                        {item.course.thumbnailUrl && (
                          <Image
                            src={item.course.thumbnailUrl}
                            alt={item.course.title}
                            fill
                            className="rounded object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.course.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.course.instructor.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.course.discountPrice &&
                          item.course.discountPrice < item.course.price ? (
                            <>
                              <span className="text-xs font-semibold text-gray-900">
                                ₩{formatPrice(item.course.discountPrice)}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                ₩{formatPrice(item.course.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-semibold text-gray-900">
                              ₩{formatPrice(item.course.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-gray-50">
                  <Button
                    onClick={() => router.push("/carts")}
                    className="w-full bg-[#1dc078] hover:bg-[#1dc078]/90 text-white font-medium"
                  >
                    수강바구니에서 전체보기
                  </Button>
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>
        </div>
        
          {/* Avatar + Popover or 로그인 버튼 */}
        {session ? (
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
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-semibold text-gray-800">
                  {profile?.name || profile?.email || "내 계정"}
                </div>
                {profile?.email && (
                  <div className="text-xs text-gray-500 mt-1">
                    {profile.email}
                  </div>
                )}
              </div>
              <button
                className="group w-full text-left px-4 py-3 hover:bg-[#1dc078]/10 transition-colors focus:outline-none"
                onClick={() => (window.location.href = "/my/settings/account")}
              >
                <div className="font-semibold text-gray-800 group-hover:text-[#1dc078] transition-colors">프로필 수정</div>
              </button>
              <button
                className="group w-full text-left px-4 py-3 hover:bg-[#1dc078]/10 transition-colors focus:outline-none border-t border-gray-100"
                onClick={() => signOut()}
              >
                <div className="font-semibold text-gray-800 group-hover:text-[#1dc078] transition-colors">로그아웃</div>
              </button>
            </PopoverContent>
          </Popover>
        ) : (
          <Link href="/signin">
            <Button
              variant="outline"
              className="font-semibold border-gray-200 hover:border-[#1dc078] hover:text-[#1dc078] ml-2"
            >
              로그인
            </Button>
          </Link>
        )}
      </div>
      {/* 하단 카테고리 */}
      <div className="header-bottom bg-white px-8">
        {isCategoryNeeded && (
           <nav className="category-nav flex justify-start gap-6 py-4 overflow-x-auto xl:overflow-x-visible scrollbar-none">
            {/* 전체 카테고리 */}
            <Link href="/courses">
              <div className="category-item flex flex-col items-center min-w-[72px] text-gray-700 hover:text-[#1dc078] cursor-pointer transition-colors">
                <Grid size={28} className="mb-1" />
                <span className="text-xs font-medium whitespace-nowrap">전체</span>
              </div>
            </Link>
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
      <div className="border-b absolute bottom-0 w-screen left-1/2 -translate-x-1/2"></div>
    </header>
  );
}