import CartUI from "./ui";
import {Metadata} from "next";
export const metadata: Metadata = {
    title: "장바구니 - 인프런",
    description: "인프런 장바구니 페이지입니다.",
};
export default function CartsPage() {
  return <CartUI />;
}