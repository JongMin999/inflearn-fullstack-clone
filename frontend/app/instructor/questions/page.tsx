import { Metadata } from "next";
import QuestionsManagementUI from "./ui";

export const metadata: Metadata = {
    title: "강의 질문 관리 - 인프런 | 지식공유자",
    description: "인프런 지식공유자 질문관리 페이지입니다.",
  };

export default function QuestionsManagementPage() {
  return <QuestionsManagementUI />;
}