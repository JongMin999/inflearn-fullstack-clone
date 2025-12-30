import { Metadata } from "next";
import UI from "./ui";
import * as api from "@/lib/api";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "내 학습 - 인프런",
  description: "내가 수강하는 강의 목록을 확인하세요.",
};

export default async function MyCoursesPage() {
  const session = await auth();
  const myCoursesResponse = await api.getAllMyCourses();

  return <UI courses={myCoursesResponse.data || []} userId={session?.user?.id} />;
}