"use client";

import {
  Course as CourseEntity,
  CourseFavorite as CourseFavoriteEntity,
} from "@/generated/openapi-client";
import { HeartIcon, ShoppingCart, Star, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getLevelText } from "@/lib/level";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { User } from "next-auth";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface CourseCardProps {
  user?: User;
  course: CourseEntity;
}

export default function CourseCard({ user, course }: CourseCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);
  
  const getMyFavoritesQuery = useQuery({
    queryKey: ["my-favorites", user?.id],
    queryFn: async () => {
      if (user) {
        return api.getMyFavorites();
      }

      return null;
    },
  });
  const isFavorite = getMyFavoritesQuery.data?.data?.find(
    (fav) => fav.courseId === course.id
  );

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      if (isFavorite) {
        removeFavoriteMutation.mutate();
      } else {
        addFavoriteMutation.mutate();
      }
    } else {
      alert("로그인 후 이용하세요.");
    }
  };

  const addFavoriteMutation = useMutation({
    mutationFn: () => api.addFavorite(course.id),
    onSuccess: () => {
      getMyFavoritesQuery.refetch();
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: () => {
      return api.removeFavorite(course.id);
    },
    onSuccess: () => {
      getMyFavoritesQuery.refetch();
    },
  });

  const isFavoriteDisabled =
    addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  const addToCartMutation = useMutation({
      mutationFn: () => api.addToCart(course.id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart-items"] });
        toast.success(`"${course.title}"이(가) 장바구니에 담겼습니다.`);
      },
    });

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    addToCartMutation.mutate();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const calculateDiscountPercentage = (
    originalPrice: number,
    discountPrice: number
  ): number => {
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  return (
    <div
      className="group relative cursor-pointer bg-white transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-video overflow-hidden bg-gray-200 rounded-md w-full">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="rounded-md object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <span className="text-gray-400 text-sm font-medium">이미지 없음</span>
          </div>
        )}
      </div>

      {/* 기본 강의 정보 */}
      <div className="py-2 space-y-2">
        {/* 제목과 지식공유자 */}
        <div className="space-y-1">
          <h3
            className="text-sm font-semibold text-gray-900 overflow-hidden leading-tight"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {course.title}
          </h3>
          <p className="text-xs text-gray-600">
            {course.instructor?.name || "강사명"}
          </p>
        </div>

        {/* 가격 정보 */}
        <div className="space-y-1">
          {course.discountPrice && course.discountPrice < course.price ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">
                ₩{formatPrice(course.discountPrice)}
              </span>
              <span className="text-xs text-red-500 font-semibold">
                {calculateDiscountPercentage(course.price, course.discountPrice)}%
              </span>
              <span className="text-xs text-gray-400 line-through">
                ₩{formatPrice(course.price)}
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-gray-900">
              ₩{formatPrice(course.price)}
            </span>
          )}
        </div>

        {/* 난이도 / 카테고리 */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <span>{getLevelText(course.level)}</span>
          {course.categories && course.categories.length > 0 && (
            <>
              <span> / </span>
              <span className="truncate">
                {course.categories.map((cat) => cat.name).join(", ")}
              </span>
            </>
          )}
        </div>

        {/* 별점, 리뷰 수, 수강생 수 */}
        <div className="flex items-center gap-3 text-xs text-gray-600">
          {/* 별점과 리뷰 수 */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-900">
              {(course as any).averageRating
                ? (course as any).averageRating.toFixed(1)
                : "0.0"}
            </span>
            <span className="text-gray-500">
              ({(course as any).totalReviews || 0})
            </span>
          </div>
          {/* 수강생 수 */}
          {(course as any).totalEnrollments !== undefined && (
            <div className="flex items-center gap-1">
              <UserIcon className="w-3 h-3 text-gray-500" />
              <span>
                {((course as any).totalEnrollments || 0).toLocaleString()}+
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 호버 시 표시되는 상세 정보 오버레이 */}
      <div
        className={cn(
          "absolute inset-0 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-50 flex flex-col transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/course/${course.id}`);
        }}
      >
          {/* 제목 */}
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>

          {/* 상세 설명 */}
          {course.shortDescription && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {course.shortDescription}
            </p>
          )}

          {/* 난이도 / 카테고리 */}
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
            <span>{getLevelText(course.level)}</span>
            {course.categories && course.categories.length > 0 && (
              <>
                <span> / </span>
                <span className="truncate">
                  {course.categories.map((cat) => cat.name).join(", ")}
                </span>
              </>
            )}
          </div>

          {/* 별점, 리뷰 수, 수강생 수 */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-4">
            {/* 별점과 리뷰 수 */}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900">
                {(course as any).averageRating
                  ? (course as any).averageRating.toFixed(1)
                  : "0.0"}
              </span>
              <span className="text-gray-500">
                ({(course as any).totalReviews || 0})
              </span>
            </div>
            {/* 수강생 수 */}
            {(course as any).totalEnrollments !== undefined && (
              <div className="flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-gray-500" />
                <span>
                  {((course as any).totalEnrollments || 0).toLocaleString()}+
                </span>
              </div>
            )}
          </div>

          {/* 좋아요와 장바구니 담기 버튼 - 하단 고정 */}
          <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-200 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleFavoriteClick(e);
              }}
              disabled={isFavoriteDisabled}
            >
              <HeartIcon
                className={cn(
                  "size-4 mr-1 transition-colors",
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-500",
                  isFavoriteDisabled && "cursor-not-allowed"
                )}
              />
              <span className="text-xs">
                {(course as any)._count?.favorites ?? 0}
              </span>
            </Button>
            <Button
              size="sm"
              variant="default"
              className="flex-1 h-8 text-xs bg-[#1dc078] hover:bg-[#1ab06a] text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleCartClick(e);
              }}
            >
              장바구니 담기
            </Button>
          </div>
        </div>
    </div>
  );
}
