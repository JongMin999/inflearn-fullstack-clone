import * as api from "@/lib/api";
import UI from "./ui";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "강좌 관리 - 인프런",
  description: "인프런 강좌 관리 페이지입니다.",
};

export default async function InstructorCoursesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/signin");
  }

  const { data: courses, error } = await api.getAllInstructorCourses();

  if (error) {
    console.error("Failed to load courses:", error);
    return (
      <div className="w-full p-6">
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-900">
            강의를 불러오는데 실패했습니다
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {typeof error === "string" ? error : "잠시 후 다시 시도해주세요."}
          </p>
        </div>
      </div>
    );
  }

  return <UI courses={courses ?? []} />;
}