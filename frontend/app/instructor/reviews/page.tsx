import { auth } from "@/auth";
import * as api from "@/lib/api";
import UI from "./ui";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "수강평 관리 - 인프런 | 지식공유자",
  description: "인프런 지식공유자 수강평관리 페이지입니다.",
};
export default async function InstructorReviewsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/signin");
  }

  const { data: reviews, error } = await api.getInstructorReviews();

  if (error) {
    console.error("Failed to load reviews:", error);
    return (
      <div className="w-full p-6">
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-900">
            수강평을 불러오는데 실패했습니다
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {typeof error === "string" ? error : "잠시 후 다시 시도해주세요."}
          </p>
        </div>
      </div>
    );
  }

  return <UI user={session.user} reviews={reviews ?? []} />;
}