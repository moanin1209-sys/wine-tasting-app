@AGENTS.md

# Wine Note - 와인 테이스팅 & 셀러 앱

## 프로젝트 개요
개인용 와인 다이어리 웹앱. 마신 와인을 기록하고, 보유 와인을 관리하고, 취향/소비 통계를 확인한다.
배포 URL: https://wine-tasting-app-hazel.vercel.app

## 기술 스택
- **프론트엔드**: Next.js 16 + React 19 + TypeScript
- **스타일링**: Tailwind CSS v4 + 커스텀 CSS 디자인 시스템 (globals.css)
- **백엔드**: Supabase (PostgreSQL + Storage)
- **배포**: Vercel (GitHub 연동 자동 배포)
- **이미지**: browser-image-compression (클라이언트 압축), html-to-image (공유 카드)

## DB 테이블 구조

### wines (테이스팅 노트)
- id, name, type, vintage, grape, region, price, rating(1-5), tasting_date, memo, image_url, cellar_wine_id(FK), created_at, updated_at
- type: '레드', '화이트', '로제', '스파클링', '기타'

### cellar_wines (셀러 재고)
- id, name, type, vintage, grape, region, price, quantity, purchase_date, purchase_from, image_url, memo, created_at, updated_at
- quantity CHECK >= 0

## 핵심 규칙
- `.env.local`은 절대 Git에 커밋하지 않는다 (Supabase 시크릿 키 포함)
- 다크 테마 유지: 배경 #0c0a0e, 와인색 팔레트 (버건디/골드/로제)
- Radiant 디자인 시스템: 글래스모피즘, 회전 conic gradient, backdrop-blur
- 모바일 퍼스트: max-w-2xl 기준, 터치 친화적 UI
- API 라우트는 `/api/wines`, `/api/cellar` 패턴
- 이미지 업로드는 Supabase Storage `wine-images` 버킷 사용

## 주요 기능 흐름
1. 셀러에 와인 등록 → 수량 관리
2. "마시기" 버튼 → 수량 -1 + 테이스팅 노트 자동채움
3. 테이스팅 노트 저장 → 통계 대시보드 반영
4. 공유 카드 → 테이스팅 노트를 이미지로 생성/다운로드

## 파일 구조
- `src/app/page.tsx` - 테이스팅 목록 (메인)
- `src/app/cellar/` - 셀러 관련 페이지
- `src/app/stats/` - 통계 대시보드
- `src/app/api/` - API 라우트
- `src/components/` - 공용 컴포넌트
- `src/lib/supabase.ts` - Supabase 클라이언트
- `src/types/` - TypeScript 타입 정의
