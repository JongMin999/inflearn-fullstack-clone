"use client";

import { useCallback, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Course } from "@/generated/openapi-client";
import * as api from "@/lib/api";
import { toast } from "sonner";

export default function UI({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteDialog = useCallback((course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setCourseToDelete(null);
    setIsDeleteDialogOpen(false);
  }, []);

  const handleDeleteCourse = useCallback(async () => {
    if (!courseToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await api.deleteCourse(courseToDelete.id);

      if (error) {
        toast.error(
          typeof error === "string" ? error : "강의 삭제 중 오류가 발생했습니다."
        );
        return;
      }

      toast.success("강의가 삭제되었습니다.");
      closeDeleteDialog();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("강의 삭제 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }, [courseToDelete, closeDeleteDialog, router]);

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-6">강의 관리</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이미지</TableHead>
            <TableHead>강의명</TableHead>
            <TableHead>평점</TableHead>
            <TableHead>총 수강생</TableHead>
            <TableHead>질문</TableHead>
            <TableHead>가격 (할인가)</TableHead>
            <TableHead>총 수입</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses && courses.length > 0 ? (
            courses.map((course: Course) => {
              const avgRating = 0;
              const totalStudents = 0;
              const totalQuestions = 0;
              const price = course.price;
              const discountPrice = course.discountPrice;
              const totalRevenue = 0;
              const status =
                course.status === "PUBLISHED" ? "게시중" : "임시저장";
              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => router.push(`/course/${course.id}`)}
                    >
                      <Image
                        src={course.thumbnailUrl || "/logo/inflearn.png"}
                        alt={course.title}
                        width={80}
                        height={80}
                        className="rounded bg-white border object-contain"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className="cursor-pointer hover:text-primary"
                      onClick={() => router.push(`/course/${course.id}`)}
                    >
                      {course.title}
                    </span>
                  </TableCell>
                  <TableCell>{avgRating}</TableCell>
                  <TableCell>{totalStudents}</TableCell>
                  <TableCell>{totalQuestions}</TableCell>
                  <TableCell>
                    {discountPrice ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">
                          ₩{price.toLocaleString()}
                        </span>
                        <span className="text-green-700 font-bold">
                          ₩{discountPrice.toLocaleString()}
                        </span>
                      </>
                    ) : price ? (
                      `₩${price.toLocaleString()}`
                    ) : (
                      "미설정"
                    )}
                  </TableCell>
                  <TableCell>₩{totalRevenue.toLocaleString()}</TableCell>
                  <TableCell>{status}</TableCell>
                  <TableCell className="flex flex-col gap-2 justify-center h-full">
                    <Button
                      onClick={() => openDeleteDialog(course)}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-1" /> 강의 삭제
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(`/course/${course.id}/edit/course_info`)
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Pencil className="w-4 h-4 mr-1" /> 강의 수정
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-gray-400">
                강의가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-sm p-6 space-y-4 text-center">
            <p className="text-base font-semibold">강의를 삭제하시겠습니까?</p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
              >
                취소
              </Button>
              <Button
                className="flex-1"
                onClick={handleDeleteCourse}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}