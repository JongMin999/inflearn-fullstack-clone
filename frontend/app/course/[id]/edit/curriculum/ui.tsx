"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Trash2, Lock, LockOpen, Plus, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Course,
  Section,
  Lecture,
  CourseCategory,
  LectureActivity,
} from "@/generated/openapi-client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { EditLectureDialog } from "@/app/course/[id]/edit/curriculum/_componnents/edit-lecture-dialog";

export default function UI({ initialCourse }: { initialCourse: Course }) {
  const queryClient = useQueryClient();

  // 강의 추가 Dialog 상태
  const [addLectureSectionId, setAddLectureSectionId] = useState<string | null>(
    null
  );
  const [addLectureTitle, setAddLectureTitle] = useState("");
  const [lectureDialogOpen, setLectureDialogOpen] = useState(false);
  // 섹션 추가 상태
  const [addSectionTitle, setAddSectionTitle] = useState("");
  // 섹션별 임시 제목 상태
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>(
    {}
  );
  const [editLecture, setEditLecture] = useState<Lecture | null>(null);
  const [isEditLectureDialogOpen, setIsEditLectureDialogOpen] = useState(false);
  // 강의별 임시 제목 상태
  const [lectureTitles, setLectureTitles] = useState<Record<string, string>>(
    {}
  );
  // 강의별 수정 가능 상태 (자물쇠 상태)
  const [lectureEditable, setLectureEditable] = useState<Record<string, boolean>>(
    {}
  );
  // 강의별 제목 수정 모드 상태
  const [lectureEditMode, setLectureEditMode] = useState<Record<string, boolean>>(
    {}
  );
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [isSectionDeleteDialogOpen, setIsSectionDeleteDialogOpen] =
    useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 코스 데이터 조회
  const { data: course } = useQuery<Course>({
    queryKey: ["course", initialCourse.id],
    queryFn: async () => {
      // TODO: 실제 API 호출로 대체
      const { data } = await api.getCourseById(initialCourse.id);
      if (!data) {
        notFound();
      }

      return data;
    },
  });

  // 섹션 추가
  const addSectionMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await api.createSection(initialCourse.id, title);

      if (error) {
        toast.error(error as string);
        return null;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("섹션이 생성되었습니다.");
    },
  });

  // 섹션 삭제
  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      const { data, error } = await api.deleteSection(sectionId);

      if (error) {
        toast.error(error as string);
        return null;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("섹션이 삭제되었습니다.");
    },
  });

  // 강의 추가
  const addLectureMutation = useMutation({
    mutationFn: async ({
      sectionId,
      title,
    }: {
      sectionId: string;
      title: string;
    }) => {
      const { data, error } = await api.createLecture(sectionId, title);

      if (error) {
        toast.error(error as string);
        return null;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("강의가 생성되었습니다.");
    },
  });

  // 강의 삭제
  const deleteLectureMutation = useMutation({
    mutationFn: async ({ lectureId }: { lectureId: string }) => {
      const { data, error } = await api.deleteLecture(lectureId);

      if (error) {
        toast.error(error as string);
        return null;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("강의가 삭제되었습니다.");
    },
  });

  // 섹션 제목 수정 mutation
  const updateSectionTitleMutation = useMutation({
    mutationFn: async ({
      sectionId,
      title,
    }: {
      sectionId: string;
      title: string;
    }) => {
      const { data, error } = await api.updateSectionTitle(sectionId, title);

      if (error) {
        toast.error(error as string);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("섹션 제목이 수정되었습니다.");
    },
  });

  // 강의 제목 수정 mutation
  const updateLectureTitleMutation = useMutation({
    mutationFn: async ({
      lectureId,
      title,
    }: {
      lectureId: string;
      title: string;
    }) => {
      const { data, error } = await api.updateLectureTitle(lectureId, title);

      if (error) {
        toast.error(error as string);
        return null;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("강의 제목이 수정되었습니다.");
    },
  });

  // UI 핸들러
  const handleAddSection = () => {
    const title = (addSectionTitle.trim() || "섹션 제목을 작성해주세요").slice(
      0,
      200
    );

    addSectionMutation.mutate(title);
    setAddSectionTitle("");
  };

  const requestDeleteSection = (section: Section) => {
    setSectionToDelete(section);
    setIsSectionDeleteDialogOpen(true);
  };

  const handleDeleteSection = () => {
    if (!sectionToDelete) return;
    deleteSectionMutation.mutate(sectionToDelete.id);
    setIsSectionDeleteDialogOpen(false);
    setSectionToDelete(null);
  };

  const handleDismissSectionDeleteDialog = () => {
    setIsSectionDeleteDialogOpen(false);
    setSectionToDelete(null);
  };

  const openLectureDialog = (sectionId: string) => {
    setAddLectureSectionId(sectionId);
    setAddLectureTitle("");
    setLectureDialogOpen(true);
  };

  const handleAddLecture = () => {
    const title = addLectureTitle.trim().slice(0, 200);
    if (!title || !addLectureSectionId) return;

    addLectureMutation.mutate({
      sectionId: addLectureSectionId,
      title,
    });
    setLectureDialogOpen(false);
    setAddLectureTitle("");
    setAddLectureSectionId(null);
  };

  // 자물쇠 토글 (수정 가능/불가능)
  const handleToggleLock = (lectureId: string) => {
    setLectureEditable((prev) => ({
      ...prev,
      [lectureId]: !prev[lectureId],
    }));
    // 자물쇠가 잠기면 수정 모드도 해제
    if (lectureEditable[lectureId]) {
      setLectureEditMode((prev) => ({
        ...prev,
        [lectureId]: false,
      }));
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEditLecture = (lecture: Lecture) => {
    const isEditable = lectureEditable[lecture.id] ?? true; // 기본값은 수정 가능
    
    if (!isEditable) {
      toast.error("강의가 잠겨있어 수정할 수 없습니다.");
      return;
    }
    
    setEditLecture(lecture);
    setIsEditLectureDialogOpen(true);
  };

  const handleCloseEditLectureDialog = () => {
    setIsEditLectureDialogOpen(false);
    setEditLecture(null);
  };

  // 공개 토글 mutation
  const toggleLecturePreviewMutation = useMutation({
    mutationFn: async (lecture: Lecture) => {
      const { data, error } = await api.updateLecturePreview(
        lecture.id,
        !lecture.isPreview
      );
      if (error) {
        toast.error(error as string);
        return null;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course", initialCourse.id],
      });
    },
  });

  // 공개 토글 핸들러
  const handleTogglePublic = (lecture: Lecture) => {
    toggleLecturePreviewMutation.mutate(lecture);
  };

  const requestDeleteLecture = (lecture: Lecture) => {
    setLectureToDelete(lecture);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteLecture = () => {
    if (!lectureToDelete) return;
    deleteLectureMutation.mutate({ lectureId: lectureToDelete.id });
    setIsDeleteDialogOpen(false);
    setLectureToDelete(null);
  };

  const handleDismissDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setLectureToDelete(null);
  };

  // 강의 미리보기 토글, 섹션 공개/비공개 토글 등은 TODO: mutation 추가 필요

  // (섹션/수업 제목 200자 검사는 각 인풋의 maxLength로만 처리)

  if (!course) return <div>코스 정보를 불러올 수 없습니다.</div>;

// 렌더링 로직
return (
    <div className="space-y-8 min-w-0 max-w-full overflow-hidden">
      <Card className="min-w-0 max-w-full">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">커리큘럼</h1>
          </CardTitle>
        </CardHeader>
      </Card>

      {course.sections?.map((section: Section, sectionIdx: number) => (
        <div key={section.id} className="border rounded-lg p-3 md:p-4 bg-white min-w-0 max-w-full overflow-hidden">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-green-600 font-semibold text-sm md:text-base whitespace-nowrap flex-shrink-0">
                섹션 {sectionIdx + 1}
              </span>
              <Input
                className="w-32 md:w-48 lg:w-64 text-xs md:text-sm flex-1 min-w-0 max-w-full"
                value={sectionTitles[section.id] ?? section.title}
                maxLength={200}
                onChange={(e) => {
                  setSectionTitles((prev) => ({
                    ...prev,
                    [section.id]: e.target.value.slice(0, 200),
                  }));
                }}
                onBlur={(e) => {
                  const newTitle = e.target.value.trim();

                  if (newTitle && newTitle !== section.title) {
                    updateSectionTitleMutation.mutate({
                      sectionId: section.id,
                      title: newTitle,
                    });
                  }
                }}
                placeholder="섹션 제목을 입력하세요."
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => requestDeleteSection(section)}
                className="text-red-500 hover:bg-red-100"
                aria-label="섹션 삭제"
              >
                <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
              </Button>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {section.lectures?.map((lecture: Lecture, lectureIdx: number) => (
              <div
                key={lecture.id}
                className={`flex items-center justify-between px-2 py-2 border rounded-md bg-white min-w-0 max-w-full overflow-hidden ${
                  lecture.isPreview
                    ? "border-l-4 border-l-[#1dc078]"
                    : "border-l-4 border-l-white"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                  <span className="text-gray-700 w-5 text-center font-bold flex-shrink-0">
                    {lectureIdx + 1}
                  </span>
                  {lectureEditMode[lecture.id] ? (
                    <Input
                      className="flex-1 min-w-0 max-w-full border-0 shadow-none focus-visible:ring-0 px-0 font-medium text-xs md:text-sm"
                      value={lectureTitles[lecture.id] ?? lecture.title}
                      maxLength={200}
                      onChange={(e) => {
                        setLectureTitles((prev) => ({
                          ...prev,
                          [lecture.id]: e.target.value.slice(0, 200),
                        }));
                      }}
                      onBlur={(e) => {
                        const newTitle = e.target.value.trim().slice(0, 200);

                        if (newTitle && newTitle !== lecture.title) {
                          updateLectureTitleMutation.mutate({
                            lectureId: lecture.id,
                            title: newTitle,
                          });
                        } else {
                          setLectureTitles((prev) => {
                            const updated = { ...prev };
                            delete updated[lecture.id];
                            return updated;
                          });
                        }

                        setLectureEditMode((prev) => ({
                          ...prev,
                          [lecture.id]: false,
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") {
                          e.currentTarget.blur();
                        }
                      }}
                      placeholder="강의 제목을 입력하세요."
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium flex-1 min-w-0 break-words text-xs md:text-sm">
                      {lectureTitles[lecture.id] ?? lecture.title}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  {/* 자물쇠: 수정 가능/불가능 토글 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleLock(lecture.id)}
                    aria-label="수정 잠금/해제"
                    className="h-8 w-8 md:h-10 md:w-10"
                  >
                    {lectureEditable[lecture.id] ?? true ? (
                      <LockOpen className="text-green-600 w-4 h-4 md:w-[18px] md:h-[18px]" />
                    ) : (
                      <Lock className="text-gray-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                    )}
                  </Button>
                  {/* 수정 버튼 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditLecture(lecture)}
                    aria-label="강의 제목 수정"
                    className="h-8 w-8 md:h-10 md:w-10"
                  >
                    <Edit 
                      className={`w-4 h-4 md:w-[18px] md:h-[18px] ${
                        lectureEditable[lecture.id] ?? true
                          ? "text-gray-500"
                          : "text-gray-300"
                      }`}
                    />
                  </Button>
                  {/* 공개/비공개 토글 스위치 */}
                  <div className="flex items-center gap-1 md:gap-2">
                    <Switch
                      checked={lecture.isPreview}
                      onCheckedChange={() => {
                        handleTogglePublic(lecture);
                      }}
                      aria-label="공개/비공개"
                      className="scale-75 md:scale-100"
                    />
                    <span className="text-xs text-gray-600 whitespace-nowrap hidden sm:inline">
                      공개
                    </span>
                  </div>
                  {/* 삭제 버튼 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => requestDeleteLecture(lecture)}
                    className="text-red-500 hover:bg-red-100 h-8 w-8 md:h-10 md:w-10"
                    aria-label="수업 삭제"
                  >
                    <Trash2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openLectureDialog(section.id)}
              className="text-xs md:text-sm px-3 md:px-4 py-2 whitespace-nowrap"
            >
              <Plus size={14} className="md:w-4 md:h-4 mr-1" /> 수업 추가
            </Button>
          </div>
        </div>
      ))}
      {/* 섹션 추가 */}
      <div className="border rounded-lg p-3 md:p-4 bg-gray-50 min-w-0 max-w-full overflow-hidden">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-green-600 font-semibold text-sm md:text-base whitespace-nowrap flex-shrink-0">섹션 추가</span>
          <Input
            className="w-32 md:w-48 lg:w-64 text-xs md:text-sm flex-1 min-w-0 max-w-full"
            value={addSectionTitle}
            onChange={(e) => setAddSectionTitle(e.target.value.slice(0, 200))}
            placeholder="섹션 제목을 작성해주세요. (최대 200자)"
            maxLength={200}
          />
          <Button onClick={handleAddSection} variant="default" size="sm" className="text-xs md:text-sm px-3 md:px-4 py-2 whitespace-nowrap flex-shrink-0">
            추가
          </Button>
        </div>
      </div>

      {/* 강의 추가 Dialog */}
      <Dialog open={lectureDialogOpen} onOpenChange={setLectureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수업 추가</DialogTitle>
          </DialogHeader>
          <Input
            value={addLectureTitle}
            onChange={(e) => setAddLectureTitle(e.target.value.slice(0, 200))}
            placeholder="제목을 입력해주세요. (최대 200자)"
            maxLength={200}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLectureDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleAddLecture} variant="default">
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editLecture && (
        <EditLectureDialog
          isOpen={isEditLectureDialogOpen}
          onClose={handleCloseEditLectureDialog}
          lecture={editLecture}
        />
      )}

      {isSectionDeleteDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-sm p-6 space-y-4 text-center">
            <p className="text-base font-semibold">섹션을 삭제하시겠습니까?</p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDismissSectionDeleteDialog}
              >
                취소
              </Button>
              <Button
                className="flex-1"
                onClick={handleDeleteSection}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-sm p-6 space-y-4 text-center">
            <p className="text-base font-semibold">수업을 삭제하시겠습니까?</p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" className="flex-1" onClick={handleDismissDeleteDialog}>
                취소
              </Button>
              <Button className="flex-1" onClick={handleDeleteLecture} disabled={deleteLectureMutation.isPending}>
                {deleteLectureMutation.isPending ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}