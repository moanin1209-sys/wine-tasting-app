export type WineType = '레드' | '화이트' | '로제' | '스파클링' | '기타';

export interface WishlistWine {
  id: string;
  name: string;
  type: WineType | null;
  grape: string | null;
  region: string | null;
  price_range: string | null;
  reason: string | null;
  priority: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type WishlistWineInsert = Omit<WishlistWine, 'id' | 'created_at' | 'updated_at'>;
export type WishlistWineUpdate = Partial<WishlistWineInsert>;
