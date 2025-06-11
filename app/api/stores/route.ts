import { NextResponse } from 'next/server';
import { getAllStores } from '@/lib/db';

export async function GET() {
  try {
    const stores = await getAllStores();
    console.log('stores from DB:', stores);

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}
