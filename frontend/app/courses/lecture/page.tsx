import * as api from "@/lib/api";
import UI from "./ui";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    courseId: string;
    lectureId?: string;
  }>;
}): Promise<Metadata> {
  const { courseId, lectureId } = await searchParams;
  const course = await api.getCourseById(courseId);

  if (!course.data || course.error) {
    return {
      title: "강의 영상",
    };
  }

  // 현재 수업 찾기
  const allLectures = course.data.sections.flatMap((section) => section.lectures);
  const currentLectureId = lectureId ?? course.data.sections[0]?.lectures[0]?.id;
  const currentLecture = allLectures.find((l) => l.id === currentLectureId);

  const lectureTitle = currentLecture?.title || "강의 영상";
  const courseTitle = course.data.title;

  return {
    title: `${lectureTitle} - ${courseTitle}`,
  };
}

export default async function LecturePage({
  searchParams,
}: {
  searchParams: Promise<{
    courseId: string;
    lectureId?: string;
  }>;
}) {
  const session = await auth();
  const { courseId, lectureId } = await searchParams;
  const course = await api.getCourseById(courseId);
  const lectureActivities = await api.getAllLectureActivities(courseId);
  
  // 수강평 작성 여부 확인
  let myReviewExists = false;
  if (session?.user) {
    const reviews = await api.getCourseReviews(courseId, 1, 1, "latest");
    myReviewExists = reviews.data?.myReviewExists ?? false;
  }

  if (!course.data || course.error) {
    notFound();
  }

  return (
    <UI
      course={course.data}
      lectureId={lectureId}
      lectureActivities={lectureActivities.data ?? []}
      user={session?.user}
      myReviewExists={myReviewExists}
    />
  );
}