import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
// Keep writes via anon client by relying on RLS admin policies

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { provider, is_enabled, api_key, settings } = body as { provider: 'removebg' | 'stability'; is_enabled: boolean; api_key: string; settings?: any };
    if (!provider) return NextResponse.json({ error: 'provider is required' }, { status: 400 });

    const { error } = await supabase.from('background_removal_settings').upsert(
      { provider, is_enabled: !!is_enabled, api_key: api_key || '', settings: settings || {} },
      { onConflict: 'provider' }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { active_provider } = body as { active_provider: 'removebg' | 'stability' };
    if (!active_provider) return NextResponse.json({ error: 'active_provider is required' }, { status: 400 });

    const { error } = await supabase.from('background_removal_active').upsert(
      { id: true, active_provider },
      { onConflict: 'id' }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}

