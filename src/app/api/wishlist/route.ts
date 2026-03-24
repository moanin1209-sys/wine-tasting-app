import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const VALID_TYPES = ['레드', '화이트', '로제', '스파클링', '기타'];

function validateWishlistInput(body: Record<string, unknown>) {
  const errors: string[] = [];

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('와인명은 필수입니다');
  }
  if (body.type != null && !VALID_TYPES.includes(body.type as string)) {
    errors.push('유효하지 않은 와인 타입입니다');
  }
  if (body.priority != null) {
    const p = Number(body.priority);
    if (!Number.isInteger(p) || p < 1 || p > 5) {
      errors.push('우선순위는 1-5 사이 정수여야 합니다');
    }
  }
  if (body.grape != null && typeof body.grape !== 'string') {
    errors.push('품종은 문자열이어야 합니다');
  }
  if (body.region != null && typeof body.region !== 'string') {
    errors.push('산지는 문자열이어야 합니다');
  }

  return errors;
}

export async function GET() {
  const { data, error } = await supabase
    .from('wishlist_wines')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const errors = validateWishlistInput(body);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
  }

  const insertData = {
    name: (body.name as string).trim(),
    type: body.type || null,
    grape: body.grape?.trim() || null,
    region: body.region?.trim() || null,
    price_range: body.price_range?.trim() || null,
    reason: body.reason?.trim() || null,
    priority: body.priority ?? 3,
    image_url: body.image_url || null,
  };

  const { data, error } = await supabase
    .from('wishlist_wines')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
