# 🎓 인프런 클론 프로젝트 (Inflearn Clone)

온라인 강의 플랫폼 인프런을 클론한 풀스택 웹 애플리케이션입니다. 강의 생성, 수강, 리뷰, 좋아요 등 핵심 기능을 구현했습니다.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white)

## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [주요 기능 상세](#주요-기능-상세)
- [기술적 하이라이트](#기술적-하이라이트)
- [API 문서](#api-문서)

## 🎯 프로젝트 소개

이 프로젝트는 온라인 강의 플랫폼의 핵심 기능을 구현한 풀스택 애플리케이션입니다. 

- **백엔드**: NestJS 기반의 RESTful API 서버
- **프론트엔드**: Next.js 15 (App Router) 기반의 서버 사이드 렌더링 웹 애플리케이션
- **데이터베이스**: PostgreSQL + Prisma ORM
- **인증**: NextAuth.js 기반 JWT 인증
- **파일 저장**: AWS S3를 활용한 미디어 파일 관리

## ✨ 주요 기능

### 👤 사용자 기능
- ✅ 회원가입 및 로그인 (이메일/비밀번호)
- ✅ 프로필 관리
- ✅ 강의 검색 및 필터링 (카테고리, 가격대, 키워드)
- ✅ 강의 상세 정보 조회
- ✅ 강의 수강 신청
- ✅ 강의 좋아요 (즐겨찾기)
- ✅ 강의 리뷰 작성 및 수정
- ✅ 강의 영상 시청 (진행률 추적)

### 👨‍🏫 강사 기능
- ✅ 강의 생성 및 관리
- ✅ 강의 섹션 및 강의 영상 관리
- ✅ 수강생 리뷰 관리 및 답글 작성
- ✅ 강의 통계 조회

### 🔍 기타 기능
- ✅ 실시간 검색 (공백 무시, 부분 일치)
- ✅ 페이지네이션
- ✅ 반응형 디자인
- ✅ 다크모드 지원

## 🛠 기술 스택

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **ORM**: Prisma 6
- **Database**: PostgreSQL
- **Authentication**: Passport.js (JWT Strategy)
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **File Storage**: AWS S3
- **Package Manager**: pnpm

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **State Management**: 
  - TanStack Query (서버 상태)
  - Jotai (클라이언트 상태)
- **Authentication**: NextAuth.js 5
- **Form Handling**: React Hook Form + Zod
- **Video Player**: react-player
- **Rich Text Editor**: CKEditor 5
- **API Client**: OpenAPI TypeScript Client (자동 생성)

### DevOps & Tools
- **Database Migration**: Prisma Migrate
- **Code Quality**: ESLint, Prettier
- **Type Safety**: TypeScript strict mode

## 📁 프로젝트 구조

```
inflearn-fullstack-clone/
├── backend/                 # NestJS 백엔드
│   ├── src/
│   │   ├── auth/           # 인증 모듈 (JWT, Guards, Strategies)
│   │   ├── courses/        # 강의 관리 모듈
│   │   ├── lectures/       # 강의 영상 모듈
│   │   ├── sections/       # 섹션 관리 모듈
│   │   ├── categories/     # 카테고리 모듈
│   │   ├── users/          # 사용자 모듈
│   │   ├── media/          # 미디어 업로드 모듈 (S3)
│   │   └── prisma/         # Prisma 설정
│   ├── prisma/
│   │   ├── schema.prisma   # 데이터베이스 스키마
│   │   └── seed.ts         # 시드 데이터
│   └── package.json
│
├── frontend/                # Next.js 프론트엔드
│   ├── app/                # App Router 페이지
│   │   ├── (auth)/         # 인증 페이지
│   │   ├── course/         # 강의 상세 페이지
│   │   ├── courses/        # 강의 목록 및 영상 시청
│   │   ├── instructor/     # 강사 대시보드
│   │   └── search/         # 검색 페이지
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── lib/                # 유틸리티 함수
│   ├── config/             # 설정 파일
│   └── generated/          # OpenAPI 자동 생성 클라이언트
│
└── README.md
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 20 이상
- pnpm 8 이상
- PostgreSQL 14 이상
- AWS 계정 (S3 사용 시)

### 설치 및 실행

#### 1. 저장소 클론

```bash
git clone https://github.com/your-username/inflearn-fullstack-clone.git
cd inflearn-fullstack-clone
```

#### 2. Backend 설정

```bash
cd backend

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 URL 등 설정

# 데이터베이스 마이그레이션
pnpm prisma migrate dev

# 시드 데이터 생성 (선택사항)
pnpm prisma:seed

# 개발 서버 실행
pnpm start:dev
```

Backend는 `http://localhost:8000`에서 실행됩니다.

#### 3. Frontend 설정

```bash
cd frontend

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 API URL 등 설정

# 개발 서버 실행
pnpm dev
```

Frontend는 `http://localhost:3000`에서 실행됩니다.

### 환경 변수 예시

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/inflearn"
AUTH_SECRET="your-secret-key"
AWS_REGION="ap-northeast-2"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_MEDIA_S3_BUCKET_NAME="your-bucket-name"
CLOUD_FRONT_DOMAIN="your-cloudfront-domain"
API_URL="http://localhost:8000"
```

#### Frontend (.env.local)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/inflearn"
AUTH_SECRET="your-secret-key"
API_URL="http://localhost:8000"
NEXTAUTH_URL="http://localhost:3000"
```

## 📖 주요 기능 상세

### 1. 강의 검색 및 필터링

- **키워드 검색**: 강의명, 강사명에서 부분 일치 검색
- **공백 무시 검색**: "앱 개발"과 "앱개발" 모두 검색 가능
- **카테고리 필터**: 카테고리별 강의 필터링
- **가격대 필터**: 최소/최대 가격 설정
- **정렬**: 가격순 정렬
- **페이지네이션**: 효율적인 데이터 로딩

### 2. 인증 및 권한 관리

- **JWT 기반 인증**: Access Token을 사용한 인증
- **Optional Authentication**: 로그인하지 않은 사용자도 일부 기능 사용 가능
- **역할 기반 접근 제어**: 강사만 강의 생성/수정 가능

### 3. 강의 관리

- **강의 CRUD**: 생성, 조회, 수정, 삭제
- **섹션 및 강의 영상 관리**: 계층적 구조로 강의 구성
- **미리보기 강의**: 무료로 제공할 강의 설정
- **강의 상태 관리**: DRAFT, PUBLISHED 등 상태 관리

### 4. 수강 및 학습 진행률

- **수강 신청**: 중복 신청 방지
- **학습 진행률 추적**: 영상 시청 시간 및 완료 여부 기록
- **마지막 시청 위치 저장**: 이어보기 기능

### 5. 리뷰 시스템

- **리뷰 작성**: 강의당 1개의 리뷰만 작성 가능
- **리뷰 수정 및 삭제**: 작성자만 수정/삭제 가능
- **강사 답글**: 강사가 리뷰에 답글 작성 가능
- **리뷰 정렬**: 최신순, 오래된순, 평점순 정렬
- **리뷰 필터링**: 답글이 없는 리뷰 우선 표시

### 6. 좋아요 기능

- **좋아요 추가/삭제**: 강의에 좋아요 표시
- **좋아요한 강의 우선 표시**: 목록에서 좋아요한 강의가 먼저 표시
- **좋아요 개수 표시**: 실시간 좋아요 개수 업데이트

## 💡 기술적 하이라이트

### 1. 아키텍처

- **모듈형 구조**: NestJS의 모듈 시스템을 활용한 관심사 분리
- **의존성 주입**: 생성자 주입을 통한 느슨한 결합
- **DTO 패턴**: 데이터 전송 객체를 통한 타입 안정성
- **Global Module**: PrismaModule을 전역 모듈로 설정하여 재사용성 향상

### 2. 인증 및 보안

- **JWT 전략**: Passport.js를 활용한 JWT 인증
- **Optional Guard**: 로그인하지 않은 사용자도 접근 가능한 엔드포인트
- **비밀번호 해싱**: bcrypt를 사용한 안전한 비밀번호 저장
- **UUID 사용**: 순차적 ID 대신 UUID를 사용하여 보안 강화

### 3. 데이터베이스 최적화

- **Prisma ORM**: 타입 안전한 데이터베이스 쿼리
- **관계 로딩**: `include`와 `select`를 활용한 효율적인 데이터 조회
- **N+1 문제 해결**: `_count`를 활용한 집계 쿼리 최적화
- **트랜잭션**: 데이터 일관성 보장

### 4. 프론트엔드 최적화

- **서버 사이드 렌더링**: Next.js App Router를 활용한 SSR
- **동적 메타데이터**: 강의 제목을 동적으로 페이지 타이틀에 반영
- **Optimistic Updates**: 좋아요 등 즉각적인 UI 피드백
- **React Query**: 서버 상태 관리 및 캐싱
- **OpenAPI 자동 생성**: 백엔드 API 변경 시 자동으로 타입 생성

### 5. 검색 기능

- **유연한 검색**: 공백을 제거하고 변형된 검색어로도 검색 가능
- **대소문자 무시**: `mode: 'insensitive'`를 활용한 대소문자 구분 없는 검색
- **복합 조건**: OR 조건을 활용한 다중 키워드 검색

### 6. 페이지네이션

- **효율적인 데이터 로딩**: `skip`과 `take`를 활용한 페이지네이션
- **메타데이터 제공**: 전체 페이지 수, 다음/이전 페이지 존재 여부 제공

### 7. 에러 처리

- **표준화된 예외**: NestJS의 Exception을 활용한 일관된 에러 응답
- **적절한 HTTP 상태 코드**: 400, 401, 404, 409 등 상황에 맞는 상태 코드
- **에러 메시지**: 사용자 친화적인 한국어 에러 메시지

## 📚 API 문서

백엔드 서버 실행 후 다음 URL에서 Swagger API 문서를 확인할 수 있습니다:

```
http://localhost:8000/api
```

주요 API 엔드포인트:

- `GET /courses` - 강의 목록 조회
- `POST /courses/search` - 강의 검색
- `GET /courses/:id` - 강의 상세 조회
- `POST /courses` - 강의 생성 (인증 필요)
- `PATCH /courses/:id` - 강의 수정 (인증 필요)
- `POST /courses/:id/enroll` - 강의 수강 신청 (인증 필요)
- `POST /courses/:id/favorite` - 강의 좋아요 (인증 필요)
- `GET /courses/:courseId/reviews` - 강의 리뷰 조회
- `POST /courses/:courseId/reviews` - 리뷰 작성 (인증 필요)

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **다크모드**: 시스템 설정에 따른 자동 다크모드
- **접근성**: Radix UI를 활용한 키보드 네비게이션 및 스크린 리더 지원
- **로딩 상태**: Skeleton UI를 활용한 로딩 상태 표시
- **에러 처리**: Toast 알림을 통한 사용자 피드백

## 🔧 개발 도구

- **TypeScript**: 타입 안정성 보장
- **ESLint + Prettier**: 코드 품질 및 일관성 유지
- **Prisma Studio**: 데이터베이스 시각화 및 관리
- **Swagger**: API 문서 자동 생성

## 📝 학습한 내용

이 프로젝트를 통해 다음을 학습하고 구현했습니다:

- ✅ NestJS의 모듈, 컨트롤러, 서비스 패턴
- ✅ Prisma ORM을 활용한 데이터베이스 설계 및 쿼리 최적화
- ✅ JWT 기반 인증 및 권한 관리
- ✅ Next.js App Router의 서버 컴포넌트 및 클라이언트 컴포넌트
- ✅ React Query를 활용한 서버 상태 관리
- ✅ AWS S3를 활용한 파일 업로드
- ✅ 페이지네이션 및 검색 기능 구현
- ✅ TypeScript를 활용한 타입 안전성
- ✅ RESTful API 설계 원칙

## 🚧 향후 개선 사항

- [ ] 실시간 알림 기능 (WebSocket)
- [ ] 결제 시스템 연동
- [ ] 강의 영상 스트리밍 최적화
- [ ] 관리자 대시보드
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 이메일 인증
- [ ] 강의 추천 시스템
- [ ] 댓글 시스템 개선
- [ ] 단위 테스트 및 통합 테스트 추가

## 📄 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.

## 👤 작성자

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

**참고**: 이 프로젝트는 인프런의 UI/UX를 참고하여 학습 목적으로 제작되었습니다.

