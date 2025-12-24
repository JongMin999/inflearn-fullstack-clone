import * as api from "@/lib/api";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import UI from "./ui";
import { auth } from "@/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await api.getCourseById(id);

  if (!course.data || course.error) {
    return {
      title: "강의를 찾을 수 없습니다",
    };
  }

  return {
    title: `${course.data.title} - 인프런`,
    description: course.data.shortDescription || course.data.title,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const course = await api.getCourseById(id);

  if (!course.data || course.error) {
    notFound();
  }

  return <UI user={session?.user} course={course.data} />;
}