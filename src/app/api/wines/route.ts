import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const cellarWineId = request.nextUrl.searchParams.get('cellar_wine_id');

  let query = supabase
    .from('wines')
    .select('*')
    .order('tasting_date', { ascending: false });

  if (cellarWineId) {
    query = query.eq('cellar_wine_id', cellarWineId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // 테이스팅 노트 생성
  const { data, error } = await supabase
    .from('wines')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 셀러 와인에서 마신 경우: 수량 1 감소
  if (body.cellar_wine_id) {
    const { data: cellar } = await supabase
      .from('cellar_wines')
      .select('quantity')
      .eq('id', body.cellar_wine_id)
      .single();

    if (cellar && cellar.quantity > 0) {
      await supabase
        .from('cellar_wines')
        .update({ quantity: cellar.quantity - 1 })
        .eq('id', body.cellar_wine_id);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
