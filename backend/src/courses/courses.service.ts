import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Course, Prisma } from '@prisma/client';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import slugify from 'slugify';
import { SearchCourseDto } from './dto/search-course.dto';
import { SearchCourseResponseDto } from './dto/search-response.dto';
import { CourseDetailDto } from './dto/course-detail.dto';
import { GetFavoriteResponseDto } from './dto/favorite.dto';
import { CourseFavorite as CourseFavoriteEntity } from 'src/_gen/prisma-class/course_favorite';
import { CreateReviewDto } from './dto/create-review.dto';
import { CourseReview as CourseReviewEntity } from 'src/_gen/prisma-class/course_review';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InstructorReplyDto } from './dto/instructor-reply.dto';
import { CourseReviewsResponseDto } from './dto/course-reviews-response.dto';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    userId: string,
    createCourseDto: CreateCourseDto,
  ): Promise<Course> {
    const baseSlug = slugify(createCourseDto.title, {
      lower: true,
      strict: true,
    });

    // 중복된 slug가 있는지 확인하고 고유한 slug 생성
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingCourse = await this.prisma.course.findUnique({
        where: { slug },
      });

      if (!existingCourse) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const { categoryIds, slug: _, isPublished, ...courseData } = createCourseDto;

    const data: Prisma.CourseCreateInput = {
      title: createCourseDto.title,
      slug,
      instructor: {
        connect: { id: userId },
      },
      status: 'DRAFT',
      ...courseData,
    };

    // 카테고리 연결
    if (categoryIds && categoryIds.length > 0) {
      data.categories = {
        connect: categoryIds.map((id) => ({ id })),
      };
    }

    return this.prisma.course.create({
      data,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CourseWhereUniqueInput;
    where?: Prisma.CourseWhereInput;
    orderBy?: Prisma.CourseOrderByWithRelationInput | Prisma.CourseOrderByWithRelationInput[];
  }): Promise<Course[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const courses = await this.prisma.course.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    // averageRating과 totalReviews 계산
    return courses.map((course) => {
      const averageRating =
        course.reviews.length > 0
          ? Math.round(
              (course.reviews.reduce((sum, review) => sum + review.rating, 0) /
                course.reviews.length) *
                10
            ) / 10
          : 0;
      const totalReviews = course._count.reviews;

      return {
        ...course,
        averageRating,
        totalReviews,
      } as any;
    });
  }

  async findAllMyCourses(userId: string): Promise<Course[]> {
    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: {
        userId,
      },
    });

    const courseIds = enrollments.map((enrollment) => enrollment.courseId);

    const courses = await this.prisma.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
        // 자신이 강사인 강의는 제외
        instructorId: {
          not: userId,
        },
      },
      include: {
        sections: {
          include: {
            lectures: {
              select: {
                id: true,
                duration: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 각 강의별 lectureActivities 가져오기
    const lectureActivities = await this.prisma.lectureActivity.findMany({
      where: {
        userId,
        courseId: {
          in: courseIds,
        },
      },
    });

    // 각 강의별 수강평 존재 여부 한 번에 조회
    const courseReviews = await this.prisma.courseReview.findMany({
      where: {
        userId,
        courseId: {
          in: courseIds,
        },
      },
      select: {
        courseId: true,
      },
    });

    // 강의별로 lectureActivities 그룹화
    const activitiesByCourse = lectureActivities.reduce((acc, activity) => {
      if (!acc[activity.courseId]) {
        acc[activity.courseId] = [];
      }
      acc[activity.courseId].push(activity);
      return acc;
    }, {} as Record<string, typeof lectureActivities>);

    // 강의별 수강평 존재 여부 맵 생성
    const reviewExistsMap = new Set(courseReviews.map((review) => review.courseId));

    // 강의에 진행률 정보 추가
    return courses.map((course) => {
      const activities = activitiesByCourse[course.id] || [];
      
      // 모든 강의를 평탄화 (섹션 구분 없이)
      const allLectures = course.sections.flatMap((section) => section.lectures);

      // 전체 강의 수 계산 (표시용)
      const totalLectures = allLectures.length;

      // 완료한 강의 수 계산 (isCompleted === true)
      const completedLectures = activities.filter(
        (activity) => activity.isCompleted,
      ).length;

      // 전체 영상 길이 합 (초 단위) - 모든 강의의 duration 합산
      const totalDuration = allLectures.reduce(
        (sum, lecture) => sum + (lecture.duration || 0),
        0,
      );

      // 들은 영상 길이 합 (초 단위) - 영상 길이 기준으로만 계산
      // activity.duration은 누적 최대 시청 시간(초)
      const watchedDuration = activities.reduce((sum, activity) => {
        const lecture = allLectures.find((l) => l.id === activity.lectureId);
        
        if (!lecture || !lecture.duration) return sum;
        
        if (activity.isCompleted) {
          // 완료한 강의는 전체 duration 사용
          return sum + lecture.duration;
        }
        // 완료하지 않은 강의는 실제 시청한 시간(duration) 사용
        // activity.duration은 누적 최대 시청 시간(초)이므로 그대로 사용
        const watchedTime = activity.duration;
        
        // 강의 전체 길이를 넘지 않도록 제한
        const clampedWatchedTime = Math.min(watchedTime, lecture.duration || 0);
        return sum + clampedWatchedTime;
      }, 0);

      // 진행률 계산 (0-100) - 완료한 강의 수 / 전체 강의 수
      // 소수점 2자리까지 정확하게 계산 (예: 1/3 = 33.33%)
      const progressPercentage =
        totalLectures > 0
          ? Math.min(100, Math.round((completedLectures / totalLectures) * 10000) / 100) // 소수점 2자리까지
          : 0;

      // Prisma 객체를 일반 객체로 변환하여 progress 필드 추가
      const courseWithProgress = {
        ...JSON.parse(JSON.stringify(course)),
        progress: {
          completedLectures,
          totalLectures,
          watchedDuration,
          totalDuration,
          progressPercentage,
        },
        myReviewExists: reviewExistsMap.has(course.id),
      };
      
      return courseWithProgress as any;
    });
  }

  async findOne(id: string, userId?: string): Promise<CourseDetailDto | null> {
    type CourseWithRelations = Prisma.CourseGetPayload<{
      include: {
        instructor: {
          include: {
            _count: {
              select: {
                courses: true;
              };
            };
          };
        };
        categories: true;
        reviews: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
                image: true;
              };
            };
          };
        };
        enrollments: true;
        sections: {
          include: {
            lectures: {
              select: {
                id: true;
                title: true;
                isPreview: true;
                isEditable: true;
                duration: true;
                order: true;
                videoStorageInfo: true;
              };
            };
          };
        };
        _count: {
          select: {
            lectures: true;
            enrollments: true;
            reviews: true;
          };
        };
      };
    }>;

    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          include: {
            _count: {
              select: {
                courses: true,
              },
            },
          },
        },
        categories: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        enrollments: true,
        sections: {
          include: {
            lectures: {
              select: {
                id: true,
                title: true,
                isPreview: true,
                isEditable: true,
                duration: true,
                order: true,
                videoStorageInfo: true,
              } as any,
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            lectures: true,
            enrollments: true,
            reviews: true,
          },
        },
      },
    }) as CourseWithRelations | null;

    if (!course) {
      return null;
    }

    const isInstructor = course.instructorId === userId;
    
    // 강사가 아닌 경우 PUBLISHED 상태인 강의만 조회 가능
    if (!isInstructor && course.status !== 'PUBLISHED') {
      return null;
    }
    const isEnrolled = userId
      ? !!(await this.prisma.courseEnrollment.findFirst({
          where: {
            userId,
            courseId: id,
          },
        }))
      : false;

    const averageRating =
      course.reviews.length > 0
        ? course.reviews.reduce((sum, review) => sum + review.rating, 0) /
          course.reviews.length
        : 0;
    const totalDuration = course.sections.reduce(
      (sum, section) =>
        sum +
        section.lectures.reduce(
          (lecSum, lecture) => lecSum + (lecture.duration || 0),
          0,
        ),
      0,
    );

    const sectionsWithFilteredVideoStorageInfo = course.sections.map(
      (section) => ({
        ...section,
        lectures: section.lectures.map((lecture) => ({
          ...lecture,
          videoStorageInfo:
            isInstructor || isEnrolled || lecture.isPreview
              ? lecture.videoStorageInfo
              : null,
        })),
      }),
    );

    // 지식공유자 통계 계산 (캐싱 적용)
    const instructorId = course.instructorId;
    const instructorStatsCacheKey = `instructor:stats:${instructorId}`;

    let instructorStats = await this.cacheManager.get<{
      totalStudents: number;
      totalReviews: number;
      totalAnswers: number;
    }>(instructorStatsCacheKey);

    if (!instructorStats) {
      // 해당 강사의 모든 강의에 등록된 총 수강생 수 (중복 제거)
      const uniqueStudents = await this.prisma.courseEnrollment.findMany({
        where: {
          course: {
            instructorId,
          },
        },
        select: {
          userId: true,
        },
      });
      const totalStudents = new Set(uniqueStudents.map((e) => e.userId)).size;

      // 해당 강사의 모든 강의에 대한 총 수강평 수
      const totalInstructorReviews = await this.prisma.courseReview.count({
        where: {
          course: {
            instructorId,
          },
        },
      });

      // 해당 강사가 작성한 답변 수
      const totalInstructorAnswers = await this.prisma.courseReview.count({
        where: {
          course: {
            instructorId,
          },
          instructorReply: {
            not: null,
          },
        },
      });

      instructorStats = {
        totalStudents,
        totalReviews: totalInstructorReviews,
        totalAnswers: totalInstructorAnswers,
      };

      // 강사 통계 캐싱 (5분)
      await this.cacheManager.set(
        instructorStatsCacheKey,
        instructorStats,
        5 * 60 * 1000,
      );
    }

    const { totalStudents, totalReviews: totalInstructorReviews, totalAnswers: totalInstructorAnswers } =
      instructorStats;

    const result = {
      ...course,
      sections: sectionsWithFilteredVideoStorageInfo,
      isEnrolled,
      totalEnrollments: course._count.enrollments,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: course._count.reviews,
      totalLectures: course._count.lectures,
      totalDuration,
      instructorCourseCount: course.instructor._count.courses,
      instructorStats: {
        totalStudents,
        totalReviews: totalInstructorReviews,
        totalAnswers: totalInstructorAnswers,
        totalCourses: course.instructor._count.courses,
      },
    };

    return result as unknown as CourseDetailDto;
  }

  async update(
    id: string,
    userId: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`ID: ${id} 코스를 찾을 수 없습니다.`);
    }

    const { categoryIds, ...otherData } = updateCourseDto;

    // 가격/할인 가격 유효성 검사 (PostgreSQL INT4 한계 값 보호)
    const MAX_INT_32 = 2_147_483_647;

    if (
      typeof otherData.price === 'number' &&
      otherData.price > MAX_INT_32
    ) {
      throw new BadRequestException(
        `가격은 ${MAX_INT_32.toLocaleString()} 이하의 값만 입력할 수 있습니다.`,
      );
    }

    if (
      typeof otherData.discountPrice === 'number' &&
      otherData.discountPrice > MAX_INT_32
    ) {
      throw new BadRequestException(
        `할인 가격은 ${MAX_INT_32.toLocaleString()} 이하의 값만 입력할 수 있습니다.`,
      );
    }

    // createdAt은 절대 변경되지 않도록 명시적으로 제외
    let data: Prisma.CourseUpdateInput = {
      ...otherData,
    };

    if (course.instructorId !== userId) {
      throw new UnauthorizedException('강의의 소유자만 수정할 수 있습니다.');
    }

    // 카테고리 업데이트: 기존 카테고리를 제거하고 새로운 카테고리로 교체
    if (categoryIds !== undefined) {
      data.categories = {
        set: categoryIds.map((id) => ({ id })),
      };
    }

    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`ID: ${id} 코스를 찾을 수 없습니다.`);
    }

    if (course.instructorId !== userId) {
      throw new UnauthorizedException('강의의 소유자만 삭제할 수 있습니다.');
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return course;
  }

  async searchCourses(
    searchCourseDto: SearchCourseDto,
  ): Promise<SearchCourseResponseDto> {
    const { q, category, priceRange, sortBy = 'latest', page, pageSize } =
      searchCourseDto;

    // 인기순/추천순은 메모리 정렬이 필요하므로 캐싱 적용
    const shouldCache = sortBy === 'popular' || sortBy === 'recommended';
    const cacheKey = shouldCache
      ? `courses:search:${sortBy}:${category || 'all'}:${page}:${pageSize}`
      : null;

    if (shouldCache && cacheKey) {
      const cachedResult = await this.cacheManager.get<SearchCourseResponseDto>(
        cacheKey,
      );
      if (cachedResult) {
        return cachedResult;
      }
    }

    const where: Prisma.CourseWhereInput = {
      // PUBLISHED 상태인 강의만 표시
      status: 'PUBLISHED',
    };

    // 키워드 검색 (강의명, 강사명에서 부분 일치)
    // 공백만 있거나 비어있으면 검색 조건을 추가하지 않음 (전체 강의 표시)
    if (q && q.trim()) {
      // 공백을 제거한 검색어 (예: "앱 개발" -> "앱개발")
      const normalized = q.replace(/\s+/g, '');

      // "앱개발" -> ["앱 개발", ...] 처럼, 문자 사이에 공백을 하나 넣은 변형들을 생성
      const spacedVariants: string[] = [];
      if (normalized.length > 1) {
        for (let i = 1; i < normalized.length; i++) {
          spacedVariants.push(
            normalized.slice(0, i) + ' ' + normalized.slice(i),
          );
        }
      }

      // title 조건들 (공백 포함/미포함, 변형 포함)
      const titleConditions: Prisma.CourseWhereInput[] = [
        {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
      ];

      if (normalized !== q) {
        titleConditions.push({
          title: {
            contains: normalized,
            mode: 'insensitive',
          },
        });
      }

      spacedVariants.forEach((variant) => {
        titleConditions.push({
          title: {
            contains: variant,
            mode: 'insensitive',
          },
        });
      });

      // instructor.name 조건들 (동일한 패턴 적용)
      const instructorConditions: Prisma.CourseWhereInput[] = [
        {
          instructor: {
            name: {
              contains: q,
              mode: 'insensitive',
            },
          },
        },
      ];

      if (normalized !== q) {
        instructorConditions.push({
          instructor: {
            name: {
              contains: normalized,
              mode: 'insensitive',
            },
          },
        });
      }

      spacedVariants.forEach((variant) => {
        instructorConditions.push({
          instructor: {
            name: {
              contains: variant,
              mode: 'insensitive',
            },
          },
        });
      });

      where.OR = [...titleConditions, ...instructorConditions];
    }

    // 카테고리 필터
    if (category) {
      where.categories = {
        some: {
          slug: category,
        },
      };
    }

    // 가격 범위 필터
    if (priceRange) {
      const priceConditions: any = {};
      if (priceRange.min !== undefined) {
        priceConditions.gte = priceRange.min;
      }
      if (priceRange.max !== undefined) {
        priceConditions.lte = priceRange.max;
      }
      if (Object.keys(priceConditions).length > 0) {
        where.price = priceConditions;
      }
    }

    // 정렬 조건
    let orderBy: Prisma.CourseOrderByWithRelationInput | Prisma.CourseOrderByWithRelationInput[] = {};
    let needInMemorySort = false;

    if (sortBy === 'latest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'price_high') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'price_low') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'popular' || sortBy === 'recommended') {
      // 인기순과 추천순은 count 기반 정렬이므로 메모리에서 정렬 필요
      needInMemorySort = true;
      // 먼저 최신순으로 가져온 후 메모리에서 정렬
      orderBy = { createdAt: 'desc' };
    }

    // 페이지네이션 계산
    const totalItems = await this.prisma.course.count({ where });
    
    // 강의 목록 조회
    // 인기순/추천순의 경우 더 많은 데이터를 가져와서 정렬 후 페이지네이션
    const take = needInMemorySort ? totalItems : pageSize;
    const skip = needInMemorySort ? 0 : (page - 1) * pageSize;

    const courses = await this.prisma.course.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    // averageRating과 totalReviews 계산 및 정렬
    let coursesWithStats = courses.map((course) => {
      const averageRating =
        course.reviews.length > 0
          ? Math.round(
              (course.reviews.reduce((sum, review) => sum + review.rating, 0) /
                course.reviews.length) *
                10
            ) / 10
          : 0;
      const totalReviews = course._count.reviews;
      const totalEnrollments = course._count.enrollments;

      return {
        ...course,
        averageRating,
        totalReviews,
        totalEnrollments,
      } as any;
    });

    // 메모리에서 정렬 (인기순, 추천순)
    if (needInMemorySort) {
      if (sortBy === 'popular') {
        coursesWithStats.sort((a, b) => {
          return b._count.enrollments - a._count.enrollments;
        });
      } else if (sortBy === 'recommended') {
        coursesWithStats.sort((a, b) => {
          return b._count.favorites - a._count.favorites;
        });
      }

      // 정렬 후 페이지네이션 적용
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      coursesWithStats = coursesWithStats.slice(startIndex, endIndex);
    }

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const result = {
      courses: coursesWithStats,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNext,
        hasPrev,
      },
    };

    // 인기순/추천순 결과 캐싱 (2분)
    if (shouldCache && cacheKey) {
      await this.cacheManager.set(cacheKey, result, 2 * 60 * 1000);
    }

    return result;
  }

  async addFavorite(courseId: string, userId: string): Promise<boolean> {
    try {
      const existingFavorite = await this.prisma.courseFavorite.findFirst({
        where: {
          userId,
          courseId,
        },
      });
      if (existingFavorite) {
        return true;
      }

      await this.prisma.courseFavorite.create({
        data: {
          userId,
          courseId,
        },
      });

      // 인기순/추천순 캐시 무효화
      await this.invalidateCourseListCache();

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async removeFavorite(courseId: string, userId: string): Promise<boolean> {
    try {
      const existingFavorite = await this.prisma.courseFavorite.findFirst({
        where: {
          userId,
          courseId,
        },
      });
      if (existingFavorite) {
        await this.prisma.courseFavorite.delete({
          where: {
            id: existingFavorite.id,
          },
        });
        // 인기순/추천순 캐시 무효화
        await this.invalidateCourseListCache();
        return true;
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async getFavorite(
    courseId: string,
    userId?: string,
  ): Promise<GetFavoriteResponseDto> {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`${courseId} 코스를 찾지 못했습니다.`);
    }

    if (userId) {
      const existingFavorite = await this.prisma.courseFavorite.findFirst({
        where: {
          userId,
          courseId,
        },
      });
      return {
        isFavorite: !!existingFavorite,
        favoriteCount: course._count.favorites,
      };
    } else {
      return {
        isFavorite: false,
        favoriteCount: course._count.favorites,
      };
    }
  }

  async getMyFavorites(userId: string): Promise<CourseFavoriteEntity[]> {
    const existingFavorites = await this.prisma.courseFavorite.findMany({
      where: {
        userId,
      },
    });

    return existingFavorites as unknown as CourseFavoriteEntity[];
  }

  async enrollCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      const existingEnrollment = await this.prisma.courseEnrollment.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (existingEnrollment) {
        throw new ConflictException('이미 수강신청한 강의입니다.');
      }

      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        select: {
          instructorId: true,
          price: true,
          discountPrice: true,
        },
      });

      if (!course) {
        throw new NotFoundException('강의를 찾을 수 없습니다.');
      }

      // 강의 가격 확인
      const finalPrice = course.discountPrice || course.price;

      // 0원이 아닌 경우 결제가 필요함을 알림
      if (finalPrice > 0) {
        throw new BadRequestException(
          '유료 강의는 결제가 필요합니다. 결제 페이지로 이동해주세요.',
        );
      }

      // 0원 강의는 바로 수강신청 처리
      await this.prisma.courseEnrollment.create({
        data: {
          userId,
          courseId,
          enrolledAt: new Date(),
        },
      });

      // 인기순 캐시 무효화 (수강생 수 변경)
      await this.invalidateCourseListCache();
      // 강사 통계 캐시 무효화
      await this.invalidateInstructorStatsCache(course.instructorId);

      return true;
    } catch (err) {
      if (
        err instanceof ConflictException ||
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new Error('수강신청 중 오류가 발생했습니다.');
    }
  }

  async unenrollCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      const existingEnrollment = await this.prisma.courseEnrollment.findFirst({
        where: {
          userId,
          courseId,
        },
        include: {
          course: {
            select: {
              instructorId: true,
            },
          },
        },
      });

      if (!existingEnrollment) {
        throw new NotFoundException('수강신청 내역을 찾을 수 없습니다.');
      }

      // 수강신청 삭제
      await this.prisma.courseEnrollment.delete({
        where: {
          id: existingEnrollment.id,
        },
      });

      // 인기순 캐시 무효화 (수강생 수 변경)
      await this.invalidateCourseListCache();
      // 강사 통계 캐시 무효화
      await this.invalidateInstructorStatsCache(existingEnrollment.course.instructorId);

      return true;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new Error('수강취소 중 오류가 발생했습니다.');
    }
  }

  async getAllLectureActivities(courseId: string, userId: string) {
    const courseActivities = await this.prisma.lectureActivity.findMany({
      where: {
        userId,
        courseId,
      },
    });

    return courseActivities;
  }

  async getCourseReviews(
    courseId: string,
    page: number,
    pageSize: number,
    sort: 'latest' | 'oldest' | 'rating_high' | 'rating_low',
    userId?: string,
  ): Promise<CourseReviewsResponseDto> {
    // 리뷰 목록 캐싱 (로그인한 사용자의 myReview는 제외하고 캐싱)
    const cacheKey = `course:reviews:${courseId}:${sort}:${page}:${pageSize}`;
    const cachedResult = await this.cacheManager.get<Omit<
      CourseReviewsResponseDto,
      'myReviewExists'
    >>(cacheKey);

    if (cachedResult) {
      // myReview는 사용자별로 다르므로 별도 조회
      const myReview =
        userId &&
        (await this.prisma.courseReview.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
        }));

      return {
        ...cachedResult,
        myReviewExists: !!myReview,
      };
    }

    const where: Prisma.CourseReviewWhereInput = {
      courseId,
    };
    const orderBy: Prisma.CourseReviewOrderByWithRelationInput = {};

    if (sort === 'latest') {
      orderBy.createdAt = 'desc';
    } else if (sort === 'oldest') {
      orderBy.createdAt = 'asc';
    } else if (sort === 'rating_high') {
      orderBy.rating = 'desc';
    } else if (sort === 'rating_low') {
      orderBy.rating = 'asc';
    }

    const skip = (page - 1) * pageSize;
    const totalItems = await this.prisma.courseReview.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const myReview =
      userId &&
      (await this.prisma.courseReview.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      }));

    const reviews = await this.prisma.courseReview.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const result = {
      myReviewExists: !!myReview,
      totalReviewCount: totalItems,
      currentPage: page,
      pageSize,
      totalPages,
      hasNext,
      hasPrev,
      reviews: reviews as unknown as CourseReviewEntity[],
    };

    // myReviewExists를 제외하고 캐싱 (1분)
    const { myReviewExists, ...cacheableResult } = result;
    await this.cacheManager.set(cacheKey, cacheableResult, 60 * 1000);

    return result;
  }

  async createReview(
    courseId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<CourseReviewEntity> {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('코스를 찾을 수 없습니다.');
    }

    // 자신이 강사인 강의에는 리뷰를 작성할 수 없음
    if (course.instructorId === userId) {
      throw new UnauthorizedException(
        '자신이 만든 강의에는 수강평을 작성할 수 없습니다.',
      );
    }

    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new UnauthorizedException(
        '수강신청을 한 사람만 강의평을 작성할 수 있습니다.',
      );
    }

    const existingReview = await this.prisma.courseReview.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existingReview) {
      throw new ConflictException('이미 작성하신 리뷰가 있습니다.');
    }

    const review = await this.prisma.courseReview.create({
      data: {
        content: createReviewDto.content,
        rating: createReviewDto.rating,
        user: {
          connect: {
            id: userId,
          },
        },
        course: {
          connect: {
            id: courseId,
          },
        },
      },
    });

    // 리뷰 관련 캐시 무효화
    await this.invalidateCourseReviewCache(courseId);
    await this.invalidateInstructorStatsCache(course.instructorId);

    return review as unknown as CourseReviewEntity;
  }

  async updateReview(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<CourseReviewEntity> {
    const existingReview = await this.prisma.courseReview.findFirst({
      where: {
        id: reviewId,
      },
    });

    if (!existingReview) {
      throw new NotFoundException('작성하신 리뷰가 존재하지 않습니다.');
    }

    if (existingReview.userId !== userId) {
      throw new UnauthorizedException('리뷰의 작성자만 수정할 수 있습니다.');
    }

    const response = await this.prisma.courseReview.update({
      where: {
        id: reviewId,
      },
      data: {
        content: updateReviewDto.content,
        rating: updateReviewDto.rating,
      },
      include: {
        course: {
          select: {
            id: true,
            instructorId: true,
          },
        },
      },
    });

    // 리뷰 관련 캐시 무효화
    await this.invalidateCourseReviewCache(response.course.id);
    await this.invalidateInstructorStatsCache(response.course.instructorId);

    return response as unknown as CourseReviewEntity;
  }

  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const existingReview = await this.prisma.courseReview.findFirst({
      where: {
        id: reviewId,
      },
    });

    if (!existingReview) {
      throw new NotFoundException('작성하신 리뷰가 존재하지 않습니다.');
    }

    if (existingReview.userId !== userId) {
      throw new UnauthorizedException('리뷰의 작성자만 삭제할 수 있습니다.');
    }

    const course = await this.prisma.course.findUnique({
      where: {
        id: existingReview.courseId,
      },
      select: {
        id: true,
        instructorId: true,
      },
    });

    await this.prisma.courseReview.delete({
      where: {
        id: reviewId,
      },
    });

    // 리뷰 관련 캐시 무효화
    if (course) {
      await this.invalidateCourseReviewCache(course.id);
      await this.invalidateInstructorStatsCache(course.instructorId);
    }

    return true;
  }

  async createInstructorReply(
    reviewId: string,
    userId: string,
    instructorReplyDto: InstructorReplyDto,
  ): Promise<CourseReviewEntity> {
    const review = await this.prisma.courseReview.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.course.instructorId !== userId) {
      throw new UnauthorizedException('강사만 답변을 작성할 수 있습니다.');
    }

    const updatedReview = await this.prisma.courseReview.update({
      where: {
        id: reviewId,
      },
      data: {
        instructorReply: instructorReplyDto.instructorReply,
      },
    });

    // 강사 통계 캐시 무효화 (답변 수 변경)
    await this.invalidateInstructorStatsCache(review.course.instructorId);
    // 리뷰 목록 캐시 무효화
    await this.invalidateCourseReviewCache(review.courseId);

    return updatedReview as unknown as CourseReviewEntity;
  }

  // 캐시 무효화 헬퍼 메서드들
  // Note: NestJS cache-manager는 키 패턴 매칭을 지원하지 않으므로,
  // 주요 정렬 옵션과 카테고리 조합에 대해 직접 무효화
  private async invalidateCourseListCache() {
    // 인기순/추천순 캐시 무효화 (주요 조합만)
    const sortOptions = ['popular', 'recommended'];
    const categories = ['all', null]; // null은 전체 카테고리
    const pages = [1, 2]; // 첫 페이지들만 무효화

    for (const sort of sortOptions) {
      for (const category of categories) {
        for (const page of pages) {
          const key = `courses:search:${sort}:${category || 'all'}:${page}:20`;
          await this.cacheManager.del(key);
        }
      }
    }
  }

  private async invalidateCourseReviewCache(courseId: string) {
    // 리뷰 목록 캐시 무효화 (주요 정렬 옵션과 페이지)
    const sortOptions = ['latest', 'oldest', 'rating_high', 'rating_low'];
    const pages = [1, 2];

    for (const sort of sortOptions) {
      for (const page of pages) {
        const key = `course:reviews:${courseId}:${sort}:${page}:10`;
        await this.cacheManager.del(key);
      }
    }
  }

  private async invalidateInstructorStatsCache(instructorId: string) {
    await this.cacheManager.del(`instructor:stats:${instructorId}`);
  }

  async getInstructorReviews(userId: string): Promise<CourseReviewEntity[]> {
    const reviews = await this.prisma.courseReview.findMany({
      where: {
        course: {
          instructorId: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // 답글이 없는 리뷰를 먼저 보여주고, 그 다음 답글이 있는 리뷰를 보여줌
    // 각 그룹 내에서는 최신순으로 정렬
    const sortedReviews = reviews.sort((a, b) => {
      const aHasReply = !!a.instructorReply;
      const bHasReply = !!b.instructorReply;

      // 답글이 없는 리뷰가 먼저 오도록
      if (aHasReply !== bHasReply) {
        return aHasReply ? 1 : -1;
      }

      // 같은 그룹 내에서는 최신순으로 정렬
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (dateA !== dateB) {
        return dateB - dateA;
      }

      // createdAt이 같으면 id로 정렬
      return b.id.localeCompare(a.id);
    });

    return sortedReviews as unknown as CourseReviewEntity[];
  }
}
