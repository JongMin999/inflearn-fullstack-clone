import { ApiProperty } from '@nestjs/swagger';
import { Course as CourseEntity } from 'src/_gen/prisma-class/course';

export class InstructorStatsDto {
  @ApiProperty({ type: Number, description: '총 수강생 수' })
  totalStudents: number;

  @ApiProperty({ type: Number, description: '총 수강평 수' })
  totalReviews: number;

  @ApiProperty({ type: Number, description: '총 답변 수' })
  totalAnswers: number;

  @ApiProperty({ type: Number, description: '총 강의 수' })
  totalCourses: number;
}

export class CourseDetailDto extends CourseEntity {
  @ApiProperty({ type: Boolean, description: '수강등록 여부' })
  isEnrolled: boolean;
  
  @ApiProperty({ type: Number, description: '총 수강생 수' })
  totalEnrollments: number;

  @ApiProperty({ type: Number, description: '평균 평점' })
  averageRating: number;

  @ApiProperty({ type: Number, description: '총 리뷰 수' })
  totalReviews: number;

  @ApiProperty({ type: Number, description: '총 강의 수' })
  totalLectures: number;

  @ApiProperty({ type: Number, description: '총 강의 시간(초)' })
  totalDuration: number;

  @ApiProperty({ type: InstructorStatsDto, description: '지식공유자 통계' })
  instructorStats: InstructorStatsDto;
}