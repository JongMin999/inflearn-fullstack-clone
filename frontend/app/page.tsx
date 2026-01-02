import CourseList from "@/components/course-list";
import { Metadata } from "next";



export const metadata: Metadata = {
  title: "인프런 - 라이프타임 커리어 플랫폼",
  description: "인프런은 라이프타임 커리어 플랫폼입니다.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ 
    page_number?: string; 
    sortBy?: string;
    discount?: string;
    beginner?: string;
    intermediate?: string;
    advanced?: string;
  }>;
}) {
  const { page_number, sortBy, discount, beginner, intermediate, advanced } = await searchParams;

  return (
    <div className="p-6">
      <CourseList
        q={""}
        page={page_number ? parseInt(page_number) : 1}
        sortBy={(sortBy as "latest" | "popular" | "recommended" | "price_low" | "price_high") || "latest"}
        discount={discount === "true"}
        beginner={beginner === "true"}
        intermediate={intermediate === "true"}
        advanced={advanced === "true"}
        baseUrl="/"
      />
    </div>
  );
}