"use client";

import { CourseCategory, User } from "@/generated/openapi-client";
import { Layers, Search, Grid, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
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
import React, { useState, useRef, useEffect } from "react";
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
  const categoryNavRef = useRef<HTMLElement>(null);
  const headerBottomRef = useRef<HTMLDivElement>(null);
  const selectedCategoryRef = useRef<HTMLDivElement>(null);
  const [selectedBarStyle, setSelectedBarStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 현재 선택된 카테고리 확인
  const getCurrentCategory = () => {
    if (pathname === "/" || pathname === "/courses") {
      return null; // 전체 선택
    }
    const match = pathname.match(/^\/courses\/([^/]+)/);
    return match ? match[1] : null;
  };

  const currentCategorySlug = getCurrentCategory();

  // 스크롤 가능 여부 확인
  const checkScrollability = () => {
    if (!categoryNavRef.current) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const container = categoryNavRef.current;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    // 전체 화면(XL 이상)에서는 오른쪽 버튼 숨김
    const isXLScreen = window.innerWidth >= 1280;
    
    // 실제로 스크롤이 필요한지 확인 (5px 여유)
    const canScroll = scrollWidth > clientWidth + 5;
    
    if (!canScroll) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    
    // 왼쪽 버튼: 스크롤 위치가 0보다 크면 표시
    setCanScrollLeft(scrollLeft > 5);
    
    // 오른쪽 버튼: XL 화면에서는 숨김, 그 외에는 오른쪽 끝에 도달하지 않았으면 표시
    if (isXLScreen) {
      setCanScrollRight(false);
    } else {
      const isAtRightEnd = scrollLeft >= scrollWidth - clientWidth - 5;
      setCanScrollRight(!isAtRightEnd);
    }
  };

  // 좌우 스크롤 함수 (한 개씩 이동)
  const scroll = (direction: "left" | "right") => {
    if (!categoryNavRef.current) return;
    const container = categoryNavRef.current;
    
    // 첫 번째 카테고리 아이템의 너비를 기준으로 한 개씩 이동
    const firstItem = container.querySelector('.category-item') as HTMLElement;
    if (!firstItem) return;
    
    const itemWidth = firstItem.offsetWidth;
    const gap = parseFloat(getComputedStyle(container).gap) || 16;
    const scrollAmount = itemWidth + gap;
    
    const startScrollLeft = container.scrollLeft;
    const targetScrollLeft =
      direction === "left"
        ? startScrollLeft - scrollAmount
        : startScrollLeft + scrollAmount;

    // 부드러운 커스텀 애니메이션 (더 느리고 부드럽게)
    const duration = 500; // 500ms로 더 느리게
    const startTime = performance.now();
    
    // easing 함수 (ease-out)
    const easeOut = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      
      const currentScrollLeft = startScrollLeft + (targetScrollLeft - startScrollLeft) * easedProgress;
      container.scrollLeft = currentScrollLeft;
      
      // 스크롤 중 위치 업데이트
      updateSelectedBarPosition();
      checkScrollability();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 스크롤 완료 후 최종 업데이트
        container.scrollLeft = targetScrollLeft;
        setTimeout(() => {
          updateSelectedBarPosition();
          checkScrollability();
        }, 50);
      }
    };
    
    // 애니메이션 시작
    requestAnimationFrame(animate);
  };

  // 선택된 바 위치 업데이트 함수
  const updateSelectedBarPosition = () => {
    if (selectedCategoryRef.current && headerBottomRef.current && categoryNavRef.current) {
      const headerBottom = headerBottomRef.current;
      const item = selectedCategoryRef.current;
      const nav = categoryNavRef.current;
      
      const headerBottomRect = headerBottom.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      
      // 카테고리 아이템이 네비게이션의 보이는 영역 안에 있는지 확인
      const itemLeft = itemRect.left;
      const itemRight = itemRect.right;
      const navLeft = navRect.left;
      const navRight = navRect.right;
      
      // 아이템이 보이는 영역 안에 있는지 확인 (약간의 여유값 포함)
      const isVisible = itemLeft >= navLeft - 10 && itemRight <= navRight + 10;
      
      if (!isVisible) {
        // 보이지 않으면 연두색 바를 표시하지 않음
        setSelectedBarStyle(null);
        checkScrollability();
        return;
      }
      
      // header-bottom 컨테이너 기준으로 정확한 위치 계산
      const left = itemRect.left - headerBottomRect.left;
      const width = itemRect.width;
      
      setSelectedBarStyle({
        left,
        width,
      });
    } else {
      setSelectedBarStyle(null);
    }
    checkScrollability();
  };

  useEffect(() => {
    // 초기 스크롤 위치를 0으로 설정
    const container = categoryNavRef.current;
    if (container) {
      container.scrollLeft = 0;
    }

    // DOM 업데이트 후 위치 계산
    const timers = [
      setTimeout(() => {
        updateSelectedBarPosition();
      }, 0),
      setTimeout(() => {
        updateSelectedBarPosition();
      }, 100),
      setTimeout(() => {
        updateSelectedBarPosition();
      }, 300),
    ];

    const handleResize = () => {
      setTimeout(() => {
        updateSelectedBarPosition();
      }, 50);
    };

    const handleScroll = () => {
      updateSelectedBarPosition();
    };

    window.addEventListener("resize", handleResize);
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [currentCategorySlug, pathname, categories]);
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
    <header className="relative site-header w-full bg-white z-50">
      {/* 상단 헤더 */}
      <div className="header-top flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 md:py-3 gap-1 sm:gap-2 md:gap-4 flex-nowrap overflow-hidden">
        {/* 로고 */}
        <div className="logo flex-shrink-0 min-w-[60px] sm:min-w-[80px] md:min-w-[120px]">
          <Link href="/">
            <Image
              src="/images/inflearn_public_logo.png"
              className="w-16 sm:w-20 md:w-28 h-auto"
              width={120}
              height={32}
              alt="inflearn"
            />
          </Link>
        </div>
        {/* 네비게이션 - 모바일에서 숨김 */}
        <nav className="main-nav hidden md:flex gap-2 md:gap-4 lg:gap-6 text-xs md:text-sm lg:text-base font-bold text-gray-700 flex-shrink-0 flex-nowrap">
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
        <div className="flex-1 flex justify-center min-w-0 max-w-[200px] sm:max-w-none">
          <div className="relative flex w-full items-center">
            <Input
              type="text"
              placeholder="나의 진짜 성장을 도와줄 실무 강의를 찾아보세요"
              className="w-full bg-gray-50 border-gray-200 focus-visible:ring-[#1dc078] pr-6 sm:pr-8 md:pr-10 text-xs md:text-sm placeholder:text-[10px] sm:placeholder:text-xs"
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
              className="absolute right-1 sm:right-2 p-1 text-gray-400 hover:text-[#1dc078] transition-colors"
              tabIndex={-1}
              onClick={() => {
                if (search.trim()) {
                  router.push(`/search?q=${search}`);
                } else {
                  router.push("/");
                }
              }}
            >
              <Search size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
        {/* 지식공유자 버튼 - 모바일에서 숨김 */}
        <Link href="/instructor" className="hidden sm:flex flex-shrink-0">
          <Button
            variant="outline"
            className="font-semibold border-gray-200 hover:border-[#1dc078] hover:text-[#1dc078] text-xs md:text-sm lg:text-base px-2 md:px-3 lg:px-4 py-1.5 md:py-2 whitespace-nowrap"
          >
            지식공유자
          </Button>
        </Link>

         {/* 장바구니 아이콘 + Popover */}
         <div 
           className="relative flex-shrink-0"
           onMouseEnter={() => setIsCartPopoverOpen(true)}
           onMouseLeave={() => setIsCartPopoverOpen(false)}
         >
          <Popover open={isCartPopoverOpen} onOpenChange={setIsCartPopoverOpen}>
            <PopoverTrigger asChild>
              <button 
                className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => router.push("/carts")}
              >
                <ShoppingCart className="w-4 h-4 sm:size-5 text-gray-700" />
                {(cartItemsQuery?.data?.data?.totalCount ?? 0) > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs p-0 bg-red-500 text-white"
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
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 cursor-pointer"
                      onClick={() => {
                        router.push(`/course/${item.course.id}`);
                        setIsCartPopoverOpen(false);
                      }}
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
              <div className="ml-1 sm:ml-2 cursor-pointer flex-shrink-0">
                <Avatar className="w-7 h-7 sm:w-10 sm:h-10">
                  {profile?.image ? (
                    <img
                      src={profile.image}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="text-xs sm:text-sm">
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
                onClick={() => router.push("/my/courses")}
              >
                <div className="font-semibold text-gray-800 group-hover:text-[#1dc078] transition-colors">내 학습</div>
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
          <Link href="/signin" className="flex-shrink-0">
            <Button
              variant="outline"
              className="font-semibold border-gray-200 hover:border-[#1dc078] hover:text-[#1dc078] ml-1 sm:ml-2 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
            >
              로그인
            </Button>
          </Link>
        )}
      </div>
      {/* 하단 카테고리 */}
      <div ref={headerBottomRef} className="header-bottom bg-white px-2 sm:px-4 md:px-8 relative">
        {isCategoryNeeded && (
          <>
            {/* 좌측 화살표 버튼 */}
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white shadow-lg hover:bg-gray-50 border border-gray-200 rounded-full hover:shadow-xl transition-all"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </Button>
            )}

            <nav 
              ref={categoryNavRef}
              className="category-nav flex justify-start gap-3 sm:gap-4 md:gap-6 py-3 sm:py-4 overflow-x-auto xl:overflow-x-visible scrollbar-hide"
              onScroll={checkScrollability}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
            {/* 전체 카테고리 */}
            <Link href="/courses">
              <div
                ref={currentCategorySlug === null ? selectedCategoryRef : null}
                className={`category-item flex flex-col items-center min-w-[72px] cursor-pointer transition-all relative ${
                  currentCategorySlug === null
                    ? "text-[#1dc078]"
                    : "text-gray-700 hover:text-[#1dc078]"
                }`}
              >
                <div
                  className={`mb-1 p-2 rounded-lg transition-all ${
                    currentCategorySlug === null
                      ? "bg-[#1dc078]/10"
                      : "bg-transparent hover:bg-gray-50"
                  }`}
                >
                  <Grid 
                    size={28} 
                    className={
                      currentCategorySlug === null ? "text-[#1dc078]" : ""
                    }
                  />
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  전체
                </span>
              </div>
            </Link>
            {categories.map((category) => {
              const isSelected = currentCategorySlug === category.slug;
              return (
                <Link key={category.id} href={`/courses/${category.slug}`}>
                  <div
                    ref={isSelected ? selectedCategoryRef : null}
                    className={`category-item flex flex-col items-center min-w-[72px] cursor-pointer transition-all relative ${
                      isSelected
                        ? "text-[#1dc078]"
                        : "text-gray-700 hover:text-[#1dc078]"
                    }`}
                  >
                    <div
                      className={`mb-1 p-2 rounded-lg transition-all ${
                        isSelected
                          ? "bg-[#1dc078]/10"
                          : "bg-transparent hover:bg-gray-50"
                      }`}
                    >
                      {React.createElement(
                        CATEGORY_ICONS[category.slug] ||
                          CATEGORY_ICONS["default"],
                        {
                          size: 28,
                          className: isSelected ? "text-[#1dc078]" : "",
                        }
                      )}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {category.name}
                    </span>
                  </div>
                </Link>
              );
            })}
            </nav>

            {/* 우측 화살표 버튼 */}
            {canScrollRight && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white shadow-lg hover:bg-gray-50 border border-gray-200 rounded-full hover:shadow-xl transition-all"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </Button>
            )}
          </>
        )}
        {/* 선택된 카테고리 아래 녹색 바 */}
        {selectedBarStyle && (
          <div
            className="absolute bottom-0 h-1.5 bg-[#1dc078] transition-all duration-300"
            style={{
              left: `${selectedBarStyle.left}px`,
              width: `${selectedBarStyle.width}px`,
            }}
          ></div>
        )}
      </div>
      <div className="border-b absolute bottom-0 w-screen left-1/2 -translate-x-1/2"></div>
    </header>
  );
}