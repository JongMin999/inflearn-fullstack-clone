"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Course, CourseCategory } from "@/generated/openapi-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { toast } from "sonner";

type FormValues = {
  title: string;
  shortDescription: string;
  price: string;
  discountPrice: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: "PUBLISHED" | "DRAFT";
  categoryIds: string[];
};

export default function EditCourseInfoUI({ course }: { course: Course }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    course.categories?.map((cat) => cat.id) ?? []
  );

  // 카테고리 목록 가져오기
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.getAllCategories();
      return data ?? [];
    },
  });

  const form = useForm<FormValues>({
    defaultValues: {
      title: course.title,
      shortDescription: course.shortDescription ?? "",
      price: course.price.toString() ?? "0",
      discountPrice: course.discountPrice?.toString() ?? "0",
      level:
        (course.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED") ??
        "BEGINNER",
      status: (course.status as "PUBLISHED" | "DRAFT") ?? "DRAFT",
      categoryIds: course.categories?.map((cat) => cat.id) ?? [],
    },
  });

  const { handleSubmit, register, control, setValue, watch, formState } = form;

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 세션 스토리지 키
  const dirtyKey =
    typeof window !== "undefined"
      ? `course-edit-dirty-${course.id}`
      : `course-edit-dirty`;

  // 마운트 시 초기값: 변경 없음
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(dirtyKey, "0");
  }, [dirtyKey]);

  // 폼 값 변경 감지
  const watchedValues = watch();
  useEffect(() => {
    if (!formState.isDirty && selectedCategories.length === (course.categories?.length ?? 0) && 
        selectedCategories.every(id => course.categories?.some(cat => cat.id === id))) {
      return;
    }
    setHasUnsavedChanges(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(dirtyKey, "1");
    }
  }, [watchedValues, formState.isDirty, selectedCategories, course.categories, dirtyKey]);

  const updateCourseMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const sanitizedData: FormValues = {
        ...data,
        title: data.title.slice(0, 200),
      };

      const { data: updated, error } = await api.updateCourse(course.id, {
        ...sanitizedData,
        price: parseInt(sanitizedData.price),
        discountPrice: parseInt(sanitizedData.discountPrice),
        categoryIds: selectedCategories,
      });

      if (error) {
        let message: string;
        if (typeof error === "string") {
          message = error;
        } else if (error && typeof error === "object") {
          const anyError: any = error;
          const rawMessage =
            anyError.message ||
            anyError.body?.message ||
            anyError.response?.data?.message;

          if (Array.isArray(rawMessage)) {
            message = rawMessage.join("\n");
          } else if (typeof rawMessage === "string") {
            message = rawMessage;
          } else {
            message =
              "강의 정보를 저장하는 중 오류가 발생했습니다. 값을 다시 확인해주세요.";
          }
        } else {
          message =
            "강의 정보를 저장하는 중 오류가 발생했습니다. 값을 다시 확인해주세요.";
        }

        throw new Error(message);
      }

      return { updated, variables: sanitizedData };
    },
    onSuccess: (result) => {
      const { variables } = result;
      // 저장 성공 시 dirty 상태 초기화
      setHasUnsavedChanges(false);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(dirtyKey, "0");
      }
      // 폼 기준값을 최신 값으로 재설정
      form.reset(variables);
      toast.success("강의 정보가 성공적으로 업데이트 되었습니다!");
    },
    onError: (error: any) => {
      const message =
        error?.message ?? "강의 정보를 저장하는 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit((data: FormValues) =>
          updateCourseMutation.mutate(data)
        )}
        className="space-y-6 md:space-y-8 bg-white p-6 md:p-8 rounded-lg shadow w-full min-w-0 max-w-full overflow-hidden"
      >
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel className="text-sm md:text-base whitespace-nowrap">
                강의 제목 <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value.slice(0, 200))}
                  placeholder="강의 제목을 입력하세요"
                  required
                  maxLength={200}
                  className="text-sm md:text-base py-2 md:py-3 w-full max-w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel className="text-sm md:text-base whitespace-nowrap">
                강의 두줄 요약 <span className="text-red-500">*</span>
              </FormLabel>
              <div className="text-xs md:text-sm text-red-500 mb-1 break-words whitespace-normal min-w-0">
                강의소개 상단에 보여집니다. 잠재 수강생들이 매력을 느낄만한 글을 짧게 남겨주세요.
              </div>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="ex) 이 강의를 통해 수강생은 컴퓨터 공학의 기초를 다질 수 있을 것으로 예상합니다."
                  required
                  rows={3}
                  className="text-sm md:text-base placeholder:text-xs md:placeholder:text-sm py-2 md:py-3 w-full max-w-full resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel className="text-sm md:text-base whitespace-nowrap">
                강의 가격 <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  placeholder="0"
                  required
                  className="text-sm md:text-base py-2 md:py-3 w-full max-w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="discountPrice"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel className="text-sm md:text-base whitespace-nowrap">강의 할인 가격</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  placeholder="할인 가격이 있다면 입력하세요"
                  className="text-sm md:text-base py-2 md:py-3 w-full max-w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="level"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel className="text-sm md:text-base whitespace-nowrap">
                난이도 <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex justify-center gap-4 md:gap-6 flex-nowrap min-w-0"
                >
                  <div className="flex items-center justify-center gap-2 md:gap-3 flex-1">
                    <RadioGroupItem value="BEGINNER" id="level-beginner" className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <FormLabel htmlFor="level-beginner" className="whitespace-nowrap text-sm md:text-base cursor-pointer">
                      입문
                    </FormLabel>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3 flex-1">
                    <RadioGroupItem
                      value="INTERMEDIATE"
                      id="level-intermediate"
                      className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                    />
                    <FormLabel htmlFor="level-intermediate" className="whitespace-nowrap text-sm md:text-base cursor-pointer">
                      초급
                    </FormLabel>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3 flex-1">
                    <RadioGroupItem value="ADVANCED" id="level-advanced" className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <FormLabel htmlFor="level-advanced" className="whitespace-nowrap text-sm md:text-base cursor-pointer">중급</FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel className="text-sm md:text-base whitespace-nowrap">
                상태 <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex justify-center gap-4 md:gap-6 flex-nowrap min-w-0"
                >
                  <div className="flex items-center justify-center gap-2 md:gap-3 flex-1">
                    <RadioGroupItem value="PUBLISHED" id="status-published" className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <FormLabel htmlFor="status-published" className="whitespace-nowrap text-sm md:text-base cursor-pointer">
                      공개
                    </FormLabel>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3 flex-1">
                    <RadioGroupItem value="DRAFT" id="status-draft" className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <FormLabel htmlFor="status-draft" className="whitespace-nowrap text-sm md:text-base cursor-pointer">임시저장</FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem className="min-w-0">
          <FormLabel className="text-sm md:text-base whitespace-nowrap">
            카테고리 <span className="text-red-500">*</span>
          </FormLabel>
          <div className="text-xs md:text-sm text-gray-500 mb-2 break-words whitespace-normal min-w-0">
            강의가 속할 카테고리를 선택해주세요. (최소 1개 이상 선택)
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
            {categoriesData && categoriesData.length > 0 ? (
              categoriesData.map((category: CourseCategory) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([...selectedCategories, category.id]);
                      } else {
                        setSelectedCategories(
                          selectedCategories.filter((id) => id !== category.id)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm md:text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">카테고리를 불러오는 중...</div>
            )}
          </div>
          {selectedCategories.length === 0 && (
            <p className="text-xs text-red-500 mt-1">최소 1개 이상의 카테고리를 선택해주세요.</p>
          )}
        </FormItem>

        <Button 
          type="submit" 
          className="w-full mt-4 md:mt-6 text-sm md:text-base py-2 md:py-3"
          disabled={selectedCategories.length === 0}
        >
          저장하기
        </Button>
      </form>
    </Form>
  );
}