import CourseList from "@/components/course-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "인프런 - 전체 강의",
  description: "인프런의 모든 강의를 찾아보세요.",
};

export default async function AllCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ page_number?: string; sortBy?: string }>;
}) {
  const { page_number, sortBy } = await searchParams;

  return (
    <div className="p-6">
      <CourseList
        category={undefined}
        page={page_number ? parseInt(page_number) : 1}
        sortBy={(sortBy as "latest" | "popular" | "recommended" | "price_low" | "price_high") || "latest"}
        baseUrl="/courses"
      />
    </div>
  );
}

