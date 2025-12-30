"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Course,
  CourseReview as CourseReviewEntity,
} from "@/generated/openapi-client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BookOpen, StarIcon, XIcon, Loader2, ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CourseWithProgress extends Course {
  progress?: {
    completedLectures: number;
    totalLectures: number;
    watchedDuration: number;
    totalDuration: number;
    progressPercentage: number;
  };
  myReviewExists?: boolean;
}

interface MyCoursesUIProps {
  courses: CourseWithProgress[];
  userId?: string;
}

function InteractiveStarRating({
  rating,
  onRatingChange,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= (hoverRating || rating);

        return (
          <button
            key={i}
            type="button"
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-colors"
          >
            <StarIcon
              className={cn(
                "size-8 transition-colors",
                isActive
                  ? "fill-yellow-400 stroke-yellow-400"
                  : "stroke-gray-300 hover:stroke-yellow-400"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function ReviewModal({
  courseId,
  isOpen,
  onClose,
  setShowReviewModal,
  editingReview,
}: {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  setShowReviewModal: (show: boolean) => void;
  editingReview?: CourseReviewEntity;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (editingReview) {
      setRating(editingReview.rating);
      setContent(editingReview.content);
    } else {
      setRating(0);
      setContent("");
    }
  }, [isOpen, editingReview]);

  const createReviewMutation = useMutation({
    mutationFn: () => api.createReview(courseId, { content, rating }),
    onSuccess: () => {
      toast.success("수강평이 등록되었습니다.");
      setShowReviewModal(false);
      // 페이지 새로고침으로 서버에서 최신 데이터 가져오기
      router.refresh();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "수강평 작성 중 오류가 발생했습니다.";
      toast.error(errorMessage);
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: () => api.updateReview(editingReview!.id, { content, rating }),
    onSuccess: () => {
      toast.success("수강평이 수정되었습니다.");
      setShowReviewModal(false);
      // 페이지 새로고침으로 서버에서 최신 데이터 가져오기
      router.refresh();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "수강평 수정 중 오류가 발생했습니다.";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) return alert("별점을 선택해주세요.");
    if (!content.trim()) return alert("수강평을 작성해주세요.");

    if (editingReview) updateReviewMutation.mutate();
    else createReviewMutation.mutate();
  };

  const isLoading =
    createReviewMutation.isPending || updateReviewMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in-0"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-md mx-4 bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95">
        <div className="mb-6">
          <h2 className="text-center text-lg font-semibold">
            {editingReview ? "수강평 수정하기" : "힘이 되는 수강평을 남겨주세요!"}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <InteractiveStarRating rating={rating} onRatingChange={setRating} />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="수강평을 작성해보세요!"
            className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <span>{editingReview ? "수정하기" : "저장하기"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyCoursesUI({ courses, userId }: MyCoursesUIProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "title">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [reviewModalCourseId, setReviewModalCourseId] = useState<string | null>(
    null
  );

  const COURSES_PER_PAGE = 12;

  // 검색어 debounce 처리 (300ms 지연)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 서버에서 이미 myReviewExists를 포함해서 내려주므로 추가 API 호출 불필요
  // courses 배열을 객체로 변환하여 빠른 조회 가능
  const courseReviews = useMemo(() => {
    const map: Record<string, { myReviewExists: boolean }> = {};
    courses.forEach((course) => {
      map[course.id] = { myReviewExists: course.myReviewExists ?? false };
    });
    return map;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((course) => course.title.toLowerCase().includes(q));
  }, [courses, debouncedSearchQuery]);

  const sortedCourses = useMemo(() => {
    const arr = [...filteredCourses];
    arr.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      switch (sortBy) {
        case "latest":
          return bTime - aTime;
        case "oldest":
          return aTime - bTime;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    return arr;
  }, [filteredCourses, sortBy]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(sortedCourses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const paginatedCourses = sortedCourses.slice(startIndex, endIndex);

  // 정렬 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, debouncedSearchQuery]);

  const handleThumbnailClick = (courseId: string) => {
    router.push(`/courses/lecture?courseId=${courseId}`);
  };

  const handleCardClick = (course: CourseWithProgress, e: React.MouseEvent) => {
    // 썸네일 클릭은 제외 (이미 handleThumbnailClick에서 처리)
    if ((e.target as HTMLElement).closest('.relative.aspect-video')) {
      return;
    }
    // 버튼 클릭도 제외
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/course/${course.id}`);
  };

  const handleReviewClick = (
    courseId: string,
    e: React.MouseEvent,
    hasReview: boolean
  ) => {
    e.stopPropagation();
    if (hasReview) {
      toast.error("이미 수강평을 작성하셨습니다.");
      return;
    }
    setReviewModalCourseId(courseId);
  };

  const handleUnenroll = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("정말 수강을 취소하시겠습니까?")) return;

    try {
      const { error } = await api.unenrollCourse(courseId);
      if (error) return toast.error(error);
      toast.success("수강이 취소되었습니다.");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("수강취소 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">내 학습</h1>
        <p className="text-gray-600">
          수강중인 강의를 확인하고 학습을 이어가세요.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="강의 제목 검색"
          className="sm:max-w-sm"
        />
        <DropdownMenu open={sortDropdownOpen} onOpenChange={setSortDropdownOpen} modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-40 justify-between font-normal"
            >
              <span className="truncate text-left flex-1">
                {sortBy === "latest" ? "최신순" : sortBy === "oldest" ? "오래된순" : "제목순"}
              </span>
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-40 p-1"
            sideOffset={4}
          >
            <DropdownMenuRadioGroup
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value as "latest" | "oldest" | "title");
                setSortDropdownOpen(false);
              }}
            >
              <DropdownMenuRadioItem 
                value="latest"
                className="cursor-pointer whitespace-nowrap"
              >
                최신순
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem 
                value="oldest"
                className="cursor-pointer whitespace-nowrap"
              >
                오래된순
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem 
                value="title"
                className="cursor-pointer whitespace-nowrap"
              >
                제목순
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {paginatedCourses.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              수강중인 강의가 없습니다
            </h3>
            <p className="text-gray-500">새로운 강의를 찾아보세요!</p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="bg-green-600 hover:bg-green-700"
          >
            강의 둘러보기
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedCourses.map((course, index) => {
            const reviewInfo = courseReviews[course.id] || {
              myReviewExists: false,
            };

            const totalLectures =
              (course.progress?.totalLectures ??
                course.sections?.reduce(
                  (total, section) => total + (section.lectures?.length || 0),
                  0
                )) || 0;

            const completedLectures = course.progress?.completedLectures ?? 0;
            const progressPercentage = course.progress?.progressPercentage ?? 0;

            return (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={(e) => handleCardClick(course, e)}
              >
                <div
                  className="relative aspect-video cursor-pointer"
                  onClick={() => handleThumbnailClick(course.id)}
                >
                  <Image
                    src={course.thumbnailUrl || "/placeholder-course.jpg"}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="rounded-t-lg object-cover"
                    priority={index < 4 && currentPage === 1}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      진도율 {progressPercentage.toFixed(2)}%
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  <h3
                    className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary"
                  >
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {course.level}
                    </span>
                    <span>무제한</span>
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    {course.instructor?.name}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>
                        {completedLectures} / {totalLectures}강 (
                        {progressPercentage.toFixed(2)}%)
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  <div className="flex gap-2 mt-4">
                    {course.instructor?.id === userId ? (
                      <button
                        disabled
                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-400 bg-gray-50 rounded-md cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <StarIcon className="size-3" />
                        수강평 작성 불가
                      </button>
                    ) : reviewInfo.myReviewExists ? (
                      <button
                        disabled
                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-400 bg-gray-50 rounded-md cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <StarIcon className="size-3" />
                        수강평 작성 완료
                      </button>
                    ) : (
                      <button
                        onClick={(e) =>
                          handleReviewClick(course.id, e, reviewInfo.myReviewExists)
                        }
                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center justify-center gap-1"
                      >
                        <StarIcon className="size-3" />
                        수강평 작성
                      </button>
                    )}

                    <button
                      onClick={(e) => handleUnenroll(course.id, e)}
                      className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      수강취소
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    </PaginationItem>
                  )}

                  {(() => {
                    const items = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    // 첫 페이지
                    if (startPage > 1) {
                      items.push(
                        <PaginationItem key={1}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(1);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      );
                      if (startPage > 2) {
                        items.push(
                          <PaginationItem key="ellipsis-start">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                    }

                    // 현재 페이지 근처 페이지들
                    for (let i = startPage; i <= endPage; i++) {
                      items.push(
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={i === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(i);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            {i}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // 마지막 페이지
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        items.push(
                          <PaginationItem key="ellipsis-end">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      items.push(
                        <PaginationItem key={totalPages}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(totalPages);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    return items;
                  })()}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage + 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {reviewModalCourseId && (
        <ReviewModal
          courseId={reviewModalCourseId}
          isOpen={!!reviewModalCourseId}
          onClose={() => setReviewModalCourseId(null)}
          setShowReviewModal={(show: boolean) =>
            !show && setReviewModalCourseId(null)
          }
          editingReview={undefined}
        />
      )}
    </div>
  );
}