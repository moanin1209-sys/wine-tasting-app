# Wine Cellar Feature — Design Spec

## Overview

기존 와인 테이스팅 노트 앱에 와인 셀러(재고 관리) 기능을 추가한다. 사용자가 보유한 와인을 등록/관리하고, "마시기" 버튼을 통해 셀러 와인에서 테이스팅 노트로 자연스럽게 전환할 수 있다.

**핵심 컨셉:**
- 셀러 = "가지고 있는 와인" (재고)
- 테이스팅 노트 = "마신 와인" (경험)
- "마시기" 버튼으로 셀러 → 테이스팅 노트 전환 (와인 정보 자동 채움 + 수량 감소)

## Data Model

### 새 테이블: `cellar_wines`

| 컬럼 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() | 고유 ID |
| `name` | text | NOT NULL | 와인명 |
| `type` | text | CHECK (type IN ('레드', '화이트', '로제', '스파클링', '기타')) | 와인 타입 |
| `vintage` | integer | nullable | 빈티지 연도 |
| `grape` | text | nullable | 품종 |
| `region` | text | nullable | 산지 |
| `price` | integer | nullable | 구매 가격 (원, KRW) |
| `quantity` | integer | NOT NULL, default 1, CHECK (quantity >= 0) | 보유 수량 |
| `purchase_date` | date | nullable | 구매일 |
| `purchase_from` | text | nullable | 구매처 |
| `image_url` | text | nullable | 사진 URL |
| `memo` | text | nullable | 메모 |
| `created_at` | timestamptz | default now() | 등록일 |
| `updated_at` | timestamptz | default now() | 수정일 |

`updated_at` 트리거: 기존 `update_updated_at()` 함수를 `cellar_wines`에도 연결.

### 기존 `wines` 테이블 변경

```sql
ALTER TABLE wines ADD COLUMN cellar_wine_id uuid REFERENCES cellar_wines(id) ON DELETE SET NULL;
```

`wine.ts` 타입에 `cellar_wine_id: string | null` 추가 (`Wine`, `WineInsert` 모두).

### Database Migration

Supabase SQL Editor에서 실행할 SQL (`supabase-cellar-setup.sql`로 프로젝트 루트에 저장):

```sql
-- 1. cellar_wines 테이블 생성
CREATE TABLE cellar_wines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('레드', '화이트', '로제', '스파클링', '기타')),
  vintage integer,
  grape text,
  region text,
  price integer,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  purchase_date date,
  purchase_from text,
  image_url text,
  memo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. updated_at 트리거 연결 (기존 함수 재사용)
CREATE TRIGGER cellar_wines_updated_at BEFORE UPDATE ON cellar_wines
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. wines 테이블에 cellar_wine_id 추가
ALTER TABLE wines ADD COLUMN cellar_wine_id uuid REFERENCES cellar_wines(id) ON DELETE SET NULL;
```

## "마시기" 흐름

수량 감소와 테이스팅 노트 생성을 하나의 트랜잭션으로 처리하여 race condition을 방지한다.

1. 셀러 상세 → "마시기" 버튼 클릭 → **확인 다이얼로그** ("이 와인을 마시겠습니까? 수량이 1 감소합니다")
2. 확인 시 `/wines/new?from_cellar={cellar_wine_id}` 로 이동
3. `/wines/new` 페이지에서 `from_cellar` 쿼리 파라미터 감지 → `GET /api/cellar/{id}`로 셀러 와인 정보 조회
4. WineForm에 와인명/타입/빈티지/품종/산지/가격을 자동 채움 (수정 가능)
5. 사용자가 별점/메모/사진/시음날짜를 추가하고 저장
6. `POST /api/wines` — body에 `cellar_wine_id` 포함. **서버에서 테이스팅 노트 생성 + 해당 cellar_wine의 quantity를 1 감소를 함께 처리**
7. 저장 완료 후 `/cellar/{id}` (셀러 상세)로 리다이렉트

자동 채움 구현:
- `/wines/new/page.tsx`에서 `useSearchParams()`로 `from_cellar` 읽기
- 있으면 셀러 와인 데이터를 fetch해서 `WineForm`에 초기값으로 전달
- `WineForm`에 `defaultCellarWineId` prop 추가 → 저장 시 body에 포함

## Navigation

### 하단 네비게이션 바 (BottomNav)

모든 페이지에 표시되는 고정 하단 바 (높이 64px):
- **🍷 테이스팅** — `/` (테이스팅 노트 목록)
- **📦 셀러** — `/cellar` (셀러 와인 목록)
- 현재 탭 강조 (보라색), 비활성 탭은 회색

FAB(+) 버튼: `bottom-20` (하단 네비 위로 위치).
페이지 하단 패딩: `pb-24` (BottomNav와 겹치지 않도록).

## Screens

### 셀러 메인 (`/cellar`)

- 카드 그리드 (기존 테이스팅 노트 목록과 동일 패턴)
- 각 카드: 사진 썸네일 + 와인명 + 타입 배지 + **수량 배지** (예: "×3")
- 수량 0인 와인: 카드 흐리게 처리 (opacity-50) + "소진" 표시
- 검색/필터: 기존 SearchBar + FilterPanel 재사용 (타입 필터 + 텍스트 검색)
- 정렬: 최신순 / 이름순 / 수량순
- FAB(+) 버튼: `/cellar/new`로 이동
- 빈 상태: "셀러에 등록된 와인이 없습니다" + 등록 시작 링크

### 셀러 와인 추가 (`/cellar/new`)

폼 필드:
- 와인명 (text, **필수**)
- 타입 (select: 레드/화이트/로제/스파클링/기타)
- 빈티지 (number)
- 품종 (text)
- 산지 (text)
- 가격 (number, 원)
- 수량 (number, **필수**, 기본값 1)
- 구매일 (date)
- 구매처 (text)
- 사진 (파일 업로드 — ImageUpload 재사용)
- 메모 (textarea)

하단: 저장 / 취소

### 셀러 상세 (`/cellar/[id]`)

- 와인 정보 전체 표시
- 수량 크게 표시 (예: "보유 3병")
- **"마시기" 버튼** (보라색, 주요 액션) — 확인 다이얼로그 후 테이스팅 노트 작성으로 이동
- 수량 0이면 마시기 버튼 비활성화
- 수정 / 삭제 버튼
- 하단: "테이스팅 기록" 섹션 — `GET /api/wines?cellar_wine_id={id}`로 조회

### 셀러 수정 (`/cellar/[id]/edit`)

- 추가 폼과 동일, 기존 데이터 pre-fill

## API Endpoints

### 셀러 API

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/cellar` | 셀러 와인 전체 목록 (최신순) |
| POST | `/api/cellar` | 새 셀러 와인 추가 |
| GET | `/api/cellar/[id]` | 셀러 와인 상세 |
| PUT | `/api/cellar/[id]` | 셀러 와인 수정 |
| DELETE | `/api/cellar/[id]` | 셀러 와인 삭제 |

### 기존 API 수정

| Method | Path | 변경 |
|---|---|---|
| GET | `/api/wines?cellar_wine_id=xxx` | 쿼리 파라미터로 cellar_wine_id 필터 지원 |
| POST | `/api/wines` | body에 cellar_wine_id 포함 시, 해당 cellar_wine의 quantity를 1 감소 |

## Project Structure (변경/추가 파일)

```
src/
├── app/
│   ├── layout.tsx                    # [수정] BottomNav 추가, pb-24
│   ├── page.tsx                      # [수정] FAB bottom-20으로 조정
│   ├── api/
│   │   ├── cellar/
│   │   │   ├── route.ts              # [신규] GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts          # [신규] GET, PUT, DELETE
│   │   └── wines/
│   │       └── route.ts              # [수정] cellar_wine_id 필터 + 수량 감소 로직
│   ├── cellar/
│   │   ├── page.tsx                  # [신규] 셀러 메인
│   │   ├── new/page.tsx              # [신규] 셀러 추가
│   │   └── [id]/
│   │       ├── page.tsx              # [신규] 셀러 상세
│   │       └── edit/page.tsx         # [신규] 셀러 수정
│   └── wines/
│       └── new/page.tsx              # [수정] from_cellar 쿼리 파라미터 지원
├── components/
│   ├── BottomNav.tsx                 # [신규] 하단 네비게이션 바 (64px)
│   ├── CellarCard.tsx               # [신규] 셀러 목록 카드 (수량 배지 포함)
│   └── CellarForm.tsx               # [신규] 셀러 입력/수정 폼
└── types/
    ├── cellar.ts                     # [신규] CellarWine 타입
    └── wine.ts                       # [수정] cellar_wine_id: string | null 추가
```

## Reusable Components

기존 컴포넌트를 최대한 재사용:
- `SearchBar.tsx` — 셀러 검색에도 동일하게 사용
- `FilterPanel.tsx` — 타입 필터 동일, 정렬 옵션만 다름 (수량순 추가)
- `ImageUpload.tsx` — 셀러 사진 업로드에도 동일하게 사용
- `StarRating.tsx` — 셀러에서는 사용하지 않음 (재고에 별점 없음)

CellarForm과 WineForm은 유사한 필드가 많지만, 역할이 다르므로(셀러=재고, 테이스팅=경험) 별도 컴포넌트로 유지한다.

## Out of Scope

- 와인 자동 완성 / 바코드 스캔
- 셀러 통계 (총 병수, 총 가치 등)
- 음용 추천 / 드링킹 윈도우
- 셀러 내 와인 위치 시각화
- 소진된 와인 자동 아카이브/삭제
