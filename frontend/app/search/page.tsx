import CourseList from "@/components/course-list";

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page_number?: string }>;
}) => {
  const { q, page_number } = await searchParams;

  return {
    title: `인프런 - ${q} 검색 결과`,
    description: `인프런에서 ${q} 검색 결과를 찾아보세요.`,
  };
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    q?: string; 
    page_number?: string; 
    sortBy?: string;
    discount?: string;
    beginner?: string;
    intermediate?: string;
    advanced?: string;
  }>;
}) {
  const { q, page_number, sortBy, discount, beginner, intermediate, advanced } = await searchParams;
  
  // 공백만 있거나 비어있으면 undefined로 전달 (전체 강의 표시)
  const searchQuery = q?.trim() || undefined;

  return (
    <div className="p-6">
      <CourseList
        q={searchQuery}
        page={page_number ? parseInt(page_number) : 1}
        sortBy={(sortBy as "latest" | "popular" | "recommended" | "price_low" | "price_high") || "latest"}
        discount={discount === "true"}
        beginner={beginner === "true"}
        intermediate={intermediate === "true"}
        advanced={advanced === "true"}
        baseUrl="/search"
      />
    </div>
  );
}