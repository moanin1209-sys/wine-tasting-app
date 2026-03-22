-- Wine Cellar: Supabase 마이그레이션 SQL
-- Supabase 대시보드 → SQL Editor에서 실행하세요

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
