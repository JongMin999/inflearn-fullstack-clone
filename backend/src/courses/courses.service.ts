import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Course, Prisma } from '@prisma/client';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import { SearchCourseResponseDto } from './dto/search-response.dto';
import { CourseDetailDto } from './dto/course-detail.dto';
import { GetFavoriteResponseDto } from './dto/favorite.dto';
import { CourseFavorite as CourseFavoriteEntity } from 'src/_gen/prisma-class/course_favorite';
import slugify from 'slugify';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

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
      status: 'DRAGT',
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

    return this.prisma.course.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
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
    const { q, category, priceRange, sortBy, order, page, pageSize } =
      searchCourseDto;

    const where: Prisma.CourseWhereInput = {};

    // 키워드 검색 (강의명, 강사명에서 부분 일치)
    if (q) {
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
    const orderBy: Prisma.CourseOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy.price = order as 'asc' | 'desc';
    }

    // 페이지네이션 계산
    const skip = (page - 1) * pageSize;
    const totalItems = await this.prisma.course.count({ where });

    // 강의 목록 조회
    const courses = await this.prisma.course.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      courses: courses as any[],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNext,
        hasPrev,
      },
    };
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
      throw new NotFoundException(`${course.id} 코스를 찾지 못했습니다.`);
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

      await this.prisma.courseEnrollment.create({
        data: {
          userId,
          courseId,
          enrolledAt: new Date(),
        },
      });

      return true;
    } catch (err) {
      throw new Error(err);
    }
  }
}