import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const VALID_TYPES = ['레드', '화이트', '로제', '스파클링', '기타'];

function validateWishlistUpdate(body: Record<string, unknown>) {
  const errors: string[] = [];

  if ('name' in body && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
    errors.push('와인명은 비어있을 수 없습니다');
  }
  if ('type' in body && body.type != null && !VALID_TYPES.includes(body.type as string)) {
    errors.push('유효하지 않은 와인 타입입니다');
  }
  if ('priority' in body && body.priority != null) {
    const p = Number(body.priority);
    if (!Number.isInteger(p) || p < 1 || p > 5) {
      errors.push('우선순위는 1-5 사이 정수여야 합니다');
    }
  }

  return errors;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('wishlist_wines')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const errors = validateWishlistUpdate(body);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if ('name' in body) updateData.name = (body.name as string).trim();
  if ('type' in body) updateData.type = body.type || null;
  if ('grape' in body) updateData.grape = body.grape?.trim() || null;
  if ('region' in body) updateData.region = body.region?.trim() || null;
  if ('price_range' in body) updateData.price_range = body.price_range?.trim() || null;
  if ('reason' in body) updateData.reason = body.reason?.trim() || null;
  if ('priority' in body) updateData.priority = body.priority;
  if ('image_url' in body) updateData.image_url = body.image_url || null;

  const { data, error } = await supabase
    .from('wishlist_wines')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: wishlistWine } = await supabase
    .from('wishlist_wines')
    .select('image_url')
    .eq('id', id)
    .single();

  if (wishlistWine?.image_url) {
    const path = wishlistWine.image_url.split('/wine-photos/')[1];
    if (path) {
      await supabase.storage.from('wine-photos').remove([path]);
    }
  }

  const { error } = await supabase
    .from('wishlist_wines')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
