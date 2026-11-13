import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, History } from '../../types/types';
import { historyFor } from '@/lib/history';

type HistoryResponse = ApiResponse<Partial<Record<string, History[]>>>;

export function GET(request: NextRequest): NextResponse<HistoryResponse> {
    const cities = new Set(
        Array.from(request.nextUrl.searchParams.entries())
            .filter(([key]) => key.startsWith('city_'))
            .map(([, value]) => value)
    );

    if (cities.size === 0) {
        return NextResponse.json<HistoryResponse>(
            { success: false, error: 'No cities provided' },
            { status: 400 }
        );
    }

    return NextResponse.json<HistoryResponse>({ success: true, data: historyFor(cities) });
}
