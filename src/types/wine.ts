export type WineType = '레드' | '화이트' | '로제' | '스파클링' | '기타';

export interface Wine {
  id: string;
  name: string;
  type: WineType | null;
  vintage: number | null;
  grape: string | null;
  region: string | null;
  price: number | null;
  rating: number;
  memo: string | null;
  image_url: string | null;
  tasting_date: string;
  cellar_wine_id: string | null;
  created_at: string;
  updated_at: string;
}

export type WineInsert = Omit<Wine, 'id' | 'created_at' | 'updated_at'>;
export type WineUpdate = Partial<WineInsert>;
