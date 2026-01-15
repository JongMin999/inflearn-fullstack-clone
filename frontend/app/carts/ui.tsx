"use client";

import { Course } from "@/generated/openapi-client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import PortOne from "@portone/browser-sdk/v2";
import { toast } from "sonner";

// 임시 장바구니 데이터 타입
interface CartItem {
  id: string;
  course: Course;
  addedAt: string;
}

export default function CartUI() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [customerInfo, setCustomerInfo] = useState({
    customerEmail: "",
    customerName: "",
    customerPhone: "",
  });

  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const calculateDiscountPercentage = (
    originalPrice: number,
    discountPrice: number
  ): number => {
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  const generatePaymentId = () =>
    `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const cartItemsQuery = useQuery({
    queryFn: () => api.getCartItems(),
    queryKey: ["cart-items"],
    select: (data) => data.data,
  });

  // 장바구니 아이템이 로드되면 모든 아이템을 기본 선택
  useEffect(() => {
    if (cartItemsQuery.data?.items) {
      setSelectedItems(cartItemsQuery.data.items.map((item) => item.id));
    }
  }, [cartItemsQuery.data?.items]);

  // 전체 선택/해제 핸들러
  const handleSelectAll = (checked: boolean) => {
    if (checked && cartItemsQuery.data?.items) {
      setSelectedItems(cartItemsQuery.data.items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // 개별 아이템 선택/해제 핸들러
  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // 전체 선택 여부 확인
  const isAllSelected =
    cartItemsQuery.data?.items &&
    cartItemsQuery.data.items.length > 0 &&
    selectedItems.length === cartItemsQuery.data.items.length;

  // 선택된 아이템들의 데이터
  const selectedCartItems = cartItemsQuery.data?.items.filter((item) =>
    selectedItems.includes(item.id)
  ) ?? [];

  // 선택된 아이템들의 가격 계산
  const selectedTotalOriginalPrice = selectedCartItems.reduce(
    (sum, item) => sum + item.course.price,
    0
  );

  const selectedTotalDiscountPrice = selectedCartItems.reduce(
    (sum, item) =>
      sum + (item.course.discountPrice || item.course.price),
    0
  );

  const selectedTotalDiscount = selectedTotalOriginalPrice - selectedTotalDiscountPrice;

  const removeFromCartMutation = useMutation({
    mutationFn: (courseId: string) => api.removeFromCart(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
    },
  });

  // 이메일 형식 검증
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 전화번호 형식 검증 (숫자만 허용)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]+$/;
    return phoneRegex.test(phone);
  };

  const showErrorDialog = (title: string, message: string) => {
    setErrorDialog({
      open: true,
      title,
      message,
    });
  };

  const handlePayment = async () => {
    if (selectedItems.length === 0) {
      showErrorDialog("오류", "결제할 강의를 선택해주세요");
      return;
    }
    if (
      !customerInfo.customerEmail ||
      !customerInfo.customerName ||
      !customerInfo.customerPhone
    ) {
      showErrorDialog("오류", "구매자 정보를 모두 입력해주세요.");
      return;
    }

    // 이메일 형식 검증
    if (!validateEmail(customerInfo.customerEmail)) {
      showErrorDialog("오류", "이메일 형식이 다릅니다.");
      return;
    }

    // 전화번호 형식 검증
    if (!validatePhone(customerInfo.customerPhone)) {
      showErrorDialog("오류", "전화번호 형식이 다릅니다.");
      return;
    }

    setIsPaymentProcessing(true);

    try {
      const paymentId = generatePaymentId();
      const orderName =
        selectedCartItems.length === 1
          ? selectedCartItems[0].course.title
          : `${selectedCartItems[0].course.title} 외 ${
              selectedCartItems.length - 1
            }개`;

      // 0원 결제는 PortOne 결제 창을 띄우지 않고 바로 수강신청 처리
      if (selectedTotalDiscountPrice === 0) {
        try {
          // 선택된 모든 강의를 수강신청
          await Promise.all(
            selectedCartItems.map((item) => api.enrollCourse(item.courseId))
          );

          // 장바구니에서 선택된 아이템 제거
          await Promise.all(
            selectedCartItems.map((item) =>
              api.removeFromCart(item.courseId)
            )
          );

          toast.success("수강신청이 완료되었습니다!");
          queryClient.invalidateQueries({ queryKey: ["cart-items"] });
          router.push("/my/courses");
        } catch (error: any) {
          console.error("0원 결제 처리 오류", error);
          toast.error(
            error?.message || "수강신청 중 오류가 발생했습니다. 다시 시도해주세요."
          );
        } finally {
          setIsPaymentProcessing(false);
        }
        return;
      }

      const portoneStoreId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const portoneChannelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
      if (!portoneStoreId || !portoneChannelKey) {
        showErrorDialog(
          "결제 설정 오류",
          "결제 설정 값이 누락되었습니다. 관리자에게 문의해주세요."
        );
        setIsPaymentProcessing(false);
        return;
      }
      const payment = await PortOne.requestPayment({
        storeId: portoneStoreId,
        channelKey: portoneChannelKey,
        paymentId,
        orderName,
        totalAmount: selectedTotalDiscountPrice,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
        customer: {
          fullName: customerInfo.customerName,
          email: customerInfo.customerEmail,
          phoneNumber: customerInfo.customerPhone,
        },
        customData: {
          items: selectedCartItems.map((item) => ({
            courseId: item.course.id,
            price: item.course.discountPrice || item.course.price,
          })),
          customerInfo,
        },
      });

      if (!payment || payment.code !== undefined) {
        showErrorDialog(
          "결제 실패",
          payment?.message || "알 수 없는 오류가 발생했습니다."
        );
        setIsPaymentProcessing(false);
        return;
      }

      const result = await api.verifyPayment({ paymentId });

      console.log("Payment 결과", result);

      if ((result.data as any)["success"]) {
        toast.success("결제가 완료되었습니다!");
        queryClient.invalidateQueries({ queryKey: ["cart-items"] });
        router.push("/my/courses");
      } else {
        showErrorDialog(
          "결제 검증 실패",
          (result.data as any)["message"] || "결제 검증에 실패했습니다."
        );
      }
    } catch (error) {
      console.error("결제 오류", error);
      showErrorDialog(
        "오류",
        "결제 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  if (cartItemsQuery.isLoading) {
    return <div>로딩중...</div>;
  }

  if (cartItemsQuery?.data?.totalCount === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">수강바구니</h1>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">장바구니가 비어있습니다.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            강의 둘러보기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">수강바구니</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* 좌측: 장바구니 아이템들 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <h2 className="text-lg font-semibold">
                전체선택{" "}
                <span className="text-green-600">
                  {selectedItems.length}/{cartItemsQuery?.data?.totalCount || 0}
                </span>
              </h2>
            </div>
          </div>

          {cartItemsQuery?.data?.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-white"
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleSelectItem(item.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />

              <div 
                className="relative w-24 h-16 flex-shrink-0 cursor-pointer"
                onClick={() => router.push(`/course/${item.course.id}`)}
              >
                <Image
                  src={item.course.thumbnailUrl || "/placeholder-course.jpg"}
                  alt={item.course.title}
                  fill
                  className="rounded object-cover"
                />
              </div>

              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => router.push(`/course/${item.course.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 hover:text-primary">
                      {item.course.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      로드맵 · 무제한 수강
                    </p>
                    <p className="text-xs text-gray-500 hover:text-primary">
                      {item.course.instructor.name}
                    </p>
                  </div>

                  <div className="text-right ml-4">
                    <div className="flex items-center gap-2 mb-1">
                      {item.course.discountPrice &&
                        item.course.discountPrice < item.course.price && (
                          <span className="text-xs text-red-500 bg-red-50 px-1 py-0.5 rounded">
                            {calculateDiscountPercentage(
                              item.course.price,
                              item.course.discountPrice
                            )}
                            % 할인
                          </span>
                        )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCartMutation.mutate(item.courseId);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>

                    <div 
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.course.discountPrice &&
                      item.course.discountPrice < item.course.price ? (
                        <>
                          <div className="text-xs text-gray-400 line-through">
                            ₩{formatPrice(item.course.price)}
                          </div>
                          <div className="text-sm font-bold">
                            ₩{formatPrice(item.course.discountPrice)}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm font-bold">
                          ₩{formatPrice(item.course.price)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 우측: 구매자 정보 및 결제 */}
        <div className="space-y-6">
          {/* 구매자 정보 */}
          <div className="border rounded-lg p-6 bg-white">
            <h3 className="font-semibold mb-4 flex items-center">
              구매자정보 <span className="text-red-500 ml-1">*</span>
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">이름 *</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={customerInfo.customerName}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      customerName: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">이메일 *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={customerInfo.customerEmail}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      customerEmail: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">휴대폰 번호 *</Label>
                <div className="flex gap-2 mt-1">
                  <select className="border rounded-md px-3 py-2 text-sm">
                    <option>🇰🇷 대한민국 +82</option>
                  </select>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="휴대폰 번호 입력 (숫자만)"
                    value={customerInfo.customerPhone}
                    onChange={(e) => {
                      // 숫자만 입력 허용
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setCustomerInfo({
                        ...customerInfo,
                        customerPhone: value,
                      });
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 쿠폰 (구현 예정이므로 주석처리)
          <div className="border rounded-lg p-6 bg-white">
            <h3 className="font-semibold mb-4">쿠폰</h3>
            <div className="flex gap-2">
              <Input placeholder="쿠폰명을 입력해 주세요" className="flex-1" />
              <Button variant="outline">쿠폰선택</Button>
            </div>
          </div>
          */}

          {/* 포인트 (구현 예정이므로 주석처리)
          <div className="border rounded-lg p-6 bg-white">
            <h3 className="font-semibold mb-4">포인트</h3>
            <div className="flex gap-2">
              <Input placeholder="1,000원 이상 사용" className="flex-1" />
              <Button variant="outline">전액사용</Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">보유 0</p>
          </div>
          */}

          {/* 총 결제 금액 */}
          <div className="border rounded-lg p-6 bg-white">
            <h3 className="font-semibold mb-4">총 결제 금액</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>상품 금액</span>
                <span>₩{formatPrice(selectedTotalOriginalPrice)}</span>
              </div>
              {selectedTotalDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>할인 금액</span>
                  <span>-₩{formatPrice(selectedTotalDiscount)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>총 결제 금액</span>
                <span>₩{formatPrice(selectedTotalDiscountPrice)}</span>
              </div>
            </div>

            {/* 결제 버튼 */}
            <Button
              onClick={handlePayment}
              disabled={isPaymentProcessing}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            >
              {isPaymentProcessing ? "결제 진행 중..." : "결제하기"}
            </Button>
          </div>
        </div>
      </div>

      {/* 오류 다이얼로그 */}
      <Dialog open={errorDialog.open} onOpenChange={(open) => 
        setErrorDialog({ ...errorDialog, open })
      } modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorDialog.title}</DialogTitle>
            <DialogDescription>
              {errorDialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorDialog({ ...errorDialog, open: false })}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}