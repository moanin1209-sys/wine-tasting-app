export type WineType = '레드' | '화이트' | '로제' | '스파클링' | '기타';

export interface CellarWine {
  id: string;
  name: string;
  type: WineType | null;
  vintage: number | null;
  grape: string | null;
  region: string | null;
  price: number | null;
  quantity: number;
  purchase_date: string | null;
  purchase_from: string | null;
  image_url: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export type CellarWineInsert = Omit<CellarWine, 'id' | 'created_at' | 'updated_at'>;
