import { notFound } from "next/navigation";
import EditCourseHeader from "./_components/edit-course-header";
import * as api from "@/lib/api";
import EditCourseSidebar from "./_components/edit-course-sidebar";

export default async function EditCourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await api.getCourseById(id);

  if (course.error || !course.data) {
    notFound();
  }

  return (
    <div className="w-full h-full bg-[#F1F3F5]">
      <EditCourseHeader course={course.data} />
      <div className="p-4 md:p-8 lg:p-12 xl:p-16 2xl:p-20 flex gap-4 md:gap-8 lg:gap-12 xl:gap-16 2xl:gap-20 min-h-screen max-w-5xl overflow-hidden">
        <EditCourseSidebar />
        <div className="flex-1 min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}