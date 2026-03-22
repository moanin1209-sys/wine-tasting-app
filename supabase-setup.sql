-- Wine Tasting App: Supabase 초기 설정 SQL
-- Supabase 대시보드 → SQL Editor에서 실행하세요

-- 1. wines 테이블 생성
CREATE TABLE wines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('레드', '화이트', '로제', '스파클링', '기타')),
  vintage integer,
  grape text,
  region text,
  price integer,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  memo text,
  image_url text,
  tasting_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wines_updated_at
  BEFORE UPDATE ON wines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 3. 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('wine-photos', 'wine-photos', true);

-- 4. 스토리지 정책: 누구나 읽기 가능
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wine-photos');

-- 5. 스토리지 정책: service_role로 업로드/삭제 가능
CREATE POLICY "Service role upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wine-photos');

CREATE POLICY "Service role delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'wine-photos');
