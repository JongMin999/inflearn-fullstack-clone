import CourseList from "@/components/course-list";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  return {
    title: `인프런 - ${slug} 검색 결과`,
    description: `인프런에서 ${slug} 검색 결과를 찾아보세요.`,
  };
};

export default async function CoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ 
    page_number?: string; 
    sortBy?: string;
    discount?: string;
    beginner?: string;
    intermediate?: string;
    advanced?: string;
  }>;
}) {
  const { slug } = await params;
  const { page_number, sortBy, discount, beginner, intermediate, advanced } = await searchParams;

  return (
    <div className="p-6">
      <CourseList
        category={slug || undefined}
        page={page_number ? parseInt(page_number) : 1}
        sortBy={(sortBy as "latest" | "popular" | "recommended" | "price_low" | "price_high") || "latest"}
        discount={discount === "true"}
        beginner={beginner === "true"}
        intermediate={intermediate === "true"}
        advanced={advanced === "true"}
        baseUrl={`/courses/${slug}`}
      />
    </div>
  );
}