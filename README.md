<div align="center">

# 🎓 Inflearn Clone - 온라인 강의 플랫폼

**프로덕션 레벨의 풀스택 웹 애플리케이션**

온라인 강의 플랫폼의 핵심 기능을 구현한 TypeScript 기반 풀스택 프로젝트

[![Live Demo](https://img.shields.io/badge/Live%20Demo-배포%20사이트-blue?style=for-the-badge)](https://inflearn-clone.malrang.space)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/your-username/inflearn-fullstack-clone)
[![API Docs](https://img.shields.io/badge/API-Swagger-green?style=for-the-badge)](http://localhost:8000/api)

![GitHub Actions](https://img.shields.io/github/actions/workflow/status/your-username/inflearn-fullstack-clone/deploy.yml?branch=master&label=CI/CD&logo=github-actions&style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/inflearn-fullstack-clone?style=for-the-badge)
![GitHub repo size](https://img.shields.io/github/repo-size/your-username/inflearn-fullstack-clone?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/your-username/inflearn-fullstack-clone?style=for-the-badge)
![GitHub top language](https://img.shields.io/github/languages/top/your-username/inflearn-fullstack-clone?style=for-the-badge)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-S3-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📌 프로젝트 개요

### 🎯 프로젝트 목적
실제 서비스 가능한 수준의 온라인 강의 플랫폼을 구현하여, 현대적인 풀스택 개발 기술과 모범 사례를 학습하고 적용한 프로젝트입니다.

### 💡 핵심 가치
- **프로덕션 레벨 코드**: 실제 서비스에 적용 가능한 코드 품질과 아키텍처
- **타입 안정성**: TypeScript strict mode로 런타임 에러 최소화
- **확장 가능한 구조**: 모듈형 아키텍처로 유지보수성 극대화
- **최신 기술 스택**: Next.js 15, NestJS 10, React 19 등 최신 기술 활용

### ⏱️ 개발 기간
**2024.12 ~ 2025.01** (약 1개월)

### 👥 개발 인원
**1명** (풀스택 개발)

### 🌐 배포 환경
- **프론트엔드**: Next.js (Docker 컨테이너)
- **백엔드**: NestJS (Docker 컨테이너)
- **데이터베이스**: PostgreSQL
- **파일 저장소**: AWS S3
- **CI/CD**: GitHub Actions → AWS EC2
- **도메인**: inflearn-clone.malrang.space

---

## 🖼️ 스크린샷

> **참고**: 실제 프로젝트 스크린샷 이미지를 추가하세요.

### 메인 페이지
```
[스크린샷 이미지: 강의 목록 페이지]
```

### 강의 상세 페이지
```
[스크린샷 이미지: 강의 상세 정보 및 리뷰]
```

### 강사 대시보드
```
[스크린샷 이미지: 강의 생성 및 관리 화면]
```

---

## ✨ 주요 기능

### 👤 사용자 기능
| 기능 | 설명 | 상태 |
|------|------|:----:|
| 회원가입/로그인 | 이메일 기반 인증, OAuth 소셜 로그인 (Google, Kakao, Naver) | ✅ |
| 프로필 관리 | 사용자 정보 수정 및 관리 | ✅ |
| 강의 검색 | 키워드, 카테고리, 가격대별 필터링 및 정렬 | ✅ |
| 강의 수강 | 수강 신청 및 학습 진행률 추적 | ✅ |
| 리뷰 시스템 | 강의 리뷰 작성, 수정, 삭제 및 강사 답글 | ✅ |
| 좋아요 기능 | 강의 즐겨찾기 및 좋아요한 강의 우선 표시 | ✅ |
| 영상 시청 | 진행률 저장 및 이어보기 기능 | ✅ |

### 👨‍🏫 강사 기능
| 기능 | 설명 | 상태 |
|------|------|:----:|
| 강의 생성 | 강의 정보, 섹션, 영상 업로드 및 관리 | ✅ |
| 강의 수정/삭제 | 강의 내용 수정 및 삭제 | ✅ |
| 수강생 관리 | 수강생 목록 조회 및 통계 | ✅ |
| 리뷰 답글 | 수강생 리뷰에 답글 작성 | ✅ |

---

## 🛠 기술 스택

### Backend
<div align="center">

| 분류 | 기술 | 버전 | 용도 |
|:----:|:----:|:----:|:----|
| **Framework** | NestJS | 10 | RESTful API 서버 |
| **Language** | TypeScript | 5 | 타입 안전성 |
| **ORM** | Prisma | 6 | 데이터베이스 접근 |
| **Database** | PostgreSQL | 14+ | 관계형 데이터베이스 |
| **Auth** | Passport.js | - | JWT 인증 |
| **Validation** | class-validator | - | DTO 검증 |
| **API Docs** | Swagger/OpenAPI | - | API 문서화 |
| **Storage** | AWS S3 | - | 미디어 파일 저장 |

</div>

### Frontend
<div align="center">

| 분류 | 기술 | 버전 | 용도 |
|:----:|:----:|:----:|:----|
| **Framework** | Next.js | 15 | SSR 웹 애플리케이션 |
| **Language** | TypeScript | 5 | 타입 안전성 |
| **UI Library** | React | 19 | 사용자 인터페이스 |
| **Styling** | Tailwind CSS | 4 | 스타일링 |
| **UI Components** | Radix UI | - | 접근성 컴포넌트 |
| **State** | TanStack Query | - | 서버 상태 관리 |
| **State** | Jotai | - | 클라이언트 상태 관리 |
| **Auth** | NextAuth.js | 5 | 인증 관리 |
| **Form** | React Hook Form + Zod | - | 폼 관리 및 검증 |
| **Editor** | CKEditor 5 | - | 리치 텍스트 에디터 |

</div>

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud**: AWS (EC2, S3)
- **Version Control**: Git & GitHub

---

## 🏗 프로젝트 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   App Router │  │  Components  │  │   API Client │  │
│  │   (SSR/SSG)  │  │  (Radix UI)  │  │  (OpenAPI)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────┐
│               Backend API (NestJS)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Controllers│  │   Services   │  │    Guards    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌───────────────┐ ┌──────────────┐ ┌──────────────┐
│  PostgreSQL   │ │    AWS S3    │ │   OAuth API  │
│   (Database)  │ │  (Media)     │ │  (Social)    │
└───────────────┘ └──────────────┘ └──────────────┘
```

---

## 💡 기술적 하이라이트

### 1. 아키텍처 설계
- **모듈형 구조**: NestJS 모듈 시스템을 활용한 관심사 분리
- **의존성 주입**: 생성자 주입을 통한 느슨한 결합 및 테스트 용이성
- **DTO 패턴**: 타입 안전한 데이터 전송 객체로 API 계약 명확화
- **Global Module**: PrismaModule을 전역 모듈로 설정하여 코드 재사용성 향상

### 2. 인증 및 보안
- **JWT 기반 인증**: Passport.js를 활용한 stateless 인증
- **소셜 로그인**: Google, Kakao, Naver OAuth 2.0 구현
- **Optional Guard**: 로그인하지 않은 사용자도 일부 기능 접근 가능
- **비밀번호 해싱**: bcrypt로 안전한 비밀번호 저장
- **UUID 사용**: 순차적 ID 대신 UUID 사용으로 보안 강화

### 3. 데이터베이스 최적화
- **Prisma ORM**: 타입 안전한 데이터베이스 쿼리
- **관계 로딩 최적화**: `include`와 `select`를 활용한 효율적인 데이터 조회
- **N+1 문제 해결**: `_count`를 활용한 집계 쿼리 최적화
- **트랜잭션**: 데이터 일관성 보장
- **인덱싱**: 검색 성능 향상을 위한 적절한 인덱스 설계

### 4. 프론트엔드 최적화
- **서버 사이드 렌더링**: Next.js App Router를 활용한 SSR로 초기 로딩 속도 개선
- **동적 메타데이터**: 강의 제목을 동적으로 페이지 타이틀에 반영하여 SEO 최적화
- **Optimistic Updates**: 좋아요 등 즉각적인 UI 피드백으로 사용자 경험 향상
- **React Query**: 서버 상태 관리 및 자동 캐싱으로 불필요한 API 호출 감소
- **OpenAPI 자동 생성**: 백엔드 API 변경 시 자동으로 타입 생성하여 타입 동기화

### 5. 검색 기능
- **유연한 검색**: 공백 제거 및 변형된 검색어로도 검색 가능
- **대소문자 무시**: `mode: 'insensitive'`를 활용한 대소문자 구분 없는 검색
- **복합 조건**: OR 조건을 활용한 다중 키워드 검색
- **실시간 검색**: 디바운싱을 통한 최적화된 검색 경험

### 6. 배포 및 DevOps
- **Docker 컨테이너화**: 개발/프로덕션 환경 일관성 보장
- **CI/CD 파이프라인**: GitHub Actions를 활용한 자동 배포
- **데이터베이스 마이그레이션**: Prisma Migrate를 통한 안전한 스키마 변경
- **환경 변수 관리**: 민감한 정보의 안전한 관리

---

## 🚀 주요 기능 상세

### 1. 강의 검색 및 필터링
```typescript
// 공백 무시 검색 구현 예시
const normalizedQuery = query.replace(/\s+/g, '');
const courses = await prisma.course.findMany({
  where: {
    OR: [
      { title: { contains: normalizedQuery, mode: 'insensitive' } },
      { instructor: { name: { contains: normalizedQuery, mode: 'insensitive' } } }
    ]
  }
});
```

**구현 특징:**
- 키워드 검색: 강의명, 강사명에서 부분 일치 검색
- 공백 무시: "앱 개발"과 "앱개발" 모두 검색 가능
- 카테고리 필터: 다중 카테고리 선택 가능
- 가격대 필터: 최소/최대 가격 범위 설정
- 정렬: 가격순, 최신순, 인기순 정렬
- 페이지네이션: 커서 기반 페이지네이션으로 효율적인 데이터 로딩

### 2. 인증 시스템
- **JWT 기반 인증**: Access Token을 사용한 stateless 인증
- **소셜 로그인**: Google, Kakao, Naver OAuth 2.0 구현
- **계정 연결**: 이메일 기반 자동 계정 연결
- **세션 관리**: NextAuth.js를 활용한 안전한 세션 관리

### 3. 강의 관리
- **계층적 구조**: Course → Section → Lecture 구조로 강의 구성
- **미리보기 강의**: 무료로 제공할 강의 설정
- **강의 상태**: DRAFT, PUBLISHED 등 상태 관리
- **파일 업로드**: AWS S3를 활용한 안전한 미디어 파일 관리

### 4. 학습 진행률 추적
- **시청 시간 기록**: 실시간으로 영상 시청 시간 추적
- **완료 여부 저장**: 강의 완료 상태 저장
- **마지막 시청 위치**: 이어보기 기능을 위한 시청 위치 저장

### 5. 리뷰 시스템
- **리뷰 작성**: 강의당 1개의 리뷰만 작성 가능 (중복 방지)
- **리뷰 수정/삭제**: 작성자만 수정/삭제 가능
- **강사 답글**: 강사가 리뷰에 답글 작성 가능
- **리뷰 정렬**: 최신순, 오래된순, 평점순 정렬
- **리뷰 필터링**: 답글이 없는 리뷰 우선 표시

---

## 📁 프로젝트 구조

```
inflearn-fullstack-clone/
├── backend/                      # NestJS 백엔드
│   ├── src/
│   │   ├── auth/                 # 인증 모듈 (JWT, Guards, Strategies)
│   │   ├── courses/              # 강의 관리 모듈
│   │   ├── lectures/             # 강의 영상 모듈
│   │   ├── sections/             # 섹션 관리 모듈
│   │   ├── categories/           # 카테고리 모듈
│   │   ├── users/                # 사용자 모듈
│   │   ├── media/                # 미디어 업로드 모듈 (S3)
│   │   ├── carts/                # 장바구니 모듈
│   │   ├── payments/             # 결제 모듈
│   │   ├── comments/             # 댓글 모듈
│   │   ├── questions/            # 질문 모듈
│   │   └── prisma/               # Prisma 설정
│   ├── prisma/
│   │   ├── schema.prisma         # 데이터베이스 스키마
│   │   └── seed.ts               # 시드 데이터
│   └── package.json
│
├── frontend/                     # Next.js 프론트엔드
│   ├── app/                      # App Router 페이지
│   │   ├── (auth)/               # 인증 페이지
│   │   ├── course/               # 강의 상세 페이지
│   │   ├── courses/              # 강의 목록 및 영상 시청
│   │   ├── instructor/           # 강사 대시보드
│   │   ├── search/               # 검색 페이지
│   │   └── my/                   # 마이페이지
│   ├── components/               # 재사용 가능한 컴포넌트
│   ├── lib/                      # 유틸리티 함수
│   ├── config/                   # 설정 파일
│   └── generated/                # OpenAPI 자동 생성 클라이언트
│
├── docker-compose.yml            # Docker Compose 설정
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD 파이프라인
└── README.md
```

---

## 🚀 시작하기

### 사전 요구사항
- Node.js 20 이상
- pnpm 8 이상
- PostgreSQL 14 이상
- AWS 계정 (S3 사용 시)
- Docker & Docker Compose (선택사항)

### 로컬 개발 환경 설정

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

### Docker로 실행
```bash
# 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

---

## 📚 API 문서

백엔드 서버 실행 후 다음 URL에서 Swagger API 문서를 확인할 수 있습니다:

**로컬**: `http://localhost:8000/api`  
**프로덕션**: `https://inflearn-clone.malrang.space/api`

### 주요 API 엔드포인트

| Method | Endpoint | 설명 | 인증 |
|:------:|:---------|:-----|:----:|
| GET | `/courses` | 강의 목록 조회 | - |
| POST | `/courses/search` | 강의 검색 | - |
| GET | `/courses/:id` | 강의 상세 조회 | - |
| POST | `/courses` | 강의 생성 | ✅ |
| PATCH | `/courses/:id` | 강의 수정 | ✅ |
| POST | `/courses/:id/enroll` | 강의 수강 신청 | ✅ |
| POST | `/courses/:id/favorite` | 강의 좋아요 | ✅ |
| GET | `/courses/:courseId/reviews` | 강의 리뷰 조회 | - |
| POST | `/courses/:courseId/reviews` | 리뷰 작성 | ✅ |

---

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 지원
- **다크모드**: 시스템 설정에 따른 자동 다크모드
- **접근성**: Radix UI를 활용한 키보드 네비게이션 및 스크린 리더 지원
- **로딩 상태**: Skeleton UI를 활용한 자연스러운 로딩 상태 표시
- **에러 처리**: Toast 알림을 통한 사용자 친화적인 에러 메시지
- **애니메이션**: 부드러운 페이지 전환 및 인터랙션

---

## 🔧 개발 도구

- **TypeScript**: 타입 안정성 보장
- **ESLint + Prettier**: 코드 품질 및 일관성 유지
- **Prisma Studio**: 데이터베이스 시각화 및 관리
- **Swagger**: API 문서 자동 생성
- **Docker**: 컨테이너 기반 개발 환경
- **GitHub Actions**: 자동화된 CI/CD 파이프라인

---

## 🎓 학습한 내용

이 프로젝트를 통해 다음을 학습하고 구현했습니다:

### Backend
- ✅ NestJS의 모듈, 컨트롤러, 서비스 패턴
- ✅ Prisma ORM을 활용한 데이터베이스 설계 및 쿼리 최적화
- ✅ JWT 기반 인증 및 권한 관리
- ✅ RESTful API 설계 원칙
- ✅ DTO 패턴 및 데이터 검증
- ✅ 에러 핸들링 및 예외 처리
- ✅ AWS S3를 활용한 파일 업로드

### Frontend
- ✅ Next.js App Router의 서버 컴포넌트 및 클라이언트 컴포넌트
- ✅ React Query를 활용한 서버 상태 관리
- ✅ NextAuth.js를 활용한 인증 구현
- ✅ 타입 안전한 API 클라이언트 생성
- ✅ 반응형 디자인 구현
- ✅ 페이지네이션 및 검색 기능 구현
- ✅ Optimistic Updates를 통한 사용자 경험 향상

### DevOps
- ✅ Docker 컨테이너화
- ✅ CI/CD 파이프라인 구축
- ✅ AWS EC2를 활용한 배포
- ✅ 환경 변수 관리 및 보안

---

## 🔍 기술적 도전과 해결

### 도전 1: OAuth 소셜 로그인 구현
**문제**: Kakao OAuth에서 `client_secret_post` 인증 방식이 NextAuth.js에서 기본 지원되지 않음

**해결**: 
- 커스텀 Provider를 구현하여 토큰 요청 시 `client_id`와 `client_secret`을 body에 포함
- 클로저를 활용하여 환경 변수를 안전하게 캡처
- `OAuthAccountNotLinked` 에러 처리 및 계정 자동 연결

### 도전 2: N+1 쿼리 문제
**문제**: 강의 목록 조회 시 관련 데이터를 가져오는 과정에서 N+1 쿼리 발생

**해결**:
- Prisma의 `include`와 `select`를 활용한 조인 쿼리
- `_count`를 활용한 집계 쿼리로 불필요한 데이터 로딩 방지
- 적절한 인덱싱으로 쿼리 성능 향상

### 도전 3: 검색 기능 최적화
**문제**: 공백이 포함된 검색어로도 검색이 가능해야 함 ("앱 개발" vs "앱개발")

**해결**:
- 검색어에서 공백을 제거하여 정규화
- 대소문자 무시 검색 (`mode: 'insensitive'`)
- OR 조건을 활용한 다중 필드 검색

### 도전 4: CI/CD 파이프라인 구축
**문제**: EC2 서버에 pnpm이 설치되어 있지 않아 마이그레이션 실행 실패

**해결**:
- Docker 컨테이너 내에서 마이그레이션 실행
- `docker-compose run --rm`을 활용한 임시 컨테이너 실행
- 실행 순서 최적화 (컨테이너 중지 → 빌드 → 마이그레이션 → 시작)

---

## 📊 프로젝트 통계

- **코드 라인 수**: 약 15,000+ 줄
- **API 엔드포인트**: 30+ 개
- **컴포넌트 수**: 50+ 개
- **데이터베이스 테이블**: 15+ 개
- **개발 기간**: 약 1개월

---

## 🚧 향후 개선 사항

- [ ] 실시간 알림 기능 (WebSocket)
- [ ] 결제 시스템 연동 (PG사 연동)
- [ ] 강의 영상 스트리밍 최적화 (HLS/DASH)
- [ ] 관리자 대시보드
- [ ] 이메일 인증 및 알림
- [ ] 강의 추천 시스템 (ML 기반)
- [ ] 성능 모니터링 (Sentry, Datadog)
- [ ] 단위 테스트 및 통합 테스트 추가
- [ ] E2E 테스트 (Playwright)
- [ ] 문서화 개선 (Storybook)

---

## 📄 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.

---

## 👤 연락처

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

- **GitHub**: [your-username](https://github.com/your-username)
- **이메일**: your-email@example.com
- **블로그**: [your-blog-url]

---

<div align="center">

**Made with ❤️ by [Your Name]**

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!

</div>
