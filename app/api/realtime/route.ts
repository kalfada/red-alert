// app/api/history/route.ts
import { NextResponse } from 'next/server';
import type { ApiResponse, History } from '../../types/types';

export async function GET(): Promise<NextResponse<ApiResponse<Partial<Record<string, History[]>>>>> {
    try {
        const response = await fetch('https://www.oref.org.il/warningMessages/alert/Alerts.json', {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)',
            }
        });

        if (!response.ok) {
            return NextResponse.json<ApiResponse<Partial<Record<string, History[]>>>>(
                { success: false, error: `HTTP error! status: ${response.status}` },
                { status: response.status }
            );
        }

        const data: History[] = await response.json();
        console.log('Fetched alerts:', data);
        data.sort((a, b) => new Date(b.alertDate).getTime() - new Date(a.alertDate).getTime());
        const grouped = Object.groupBy(data, alert => alert.data);

        return NextResponse.json<ApiResponse<Partial<Record<string, History[]>>>>({
            success: true,
            data: grouped
        });

    } catch (error) {
        console.error('Error fetching alerts:', error);
        return NextResponse.json<ApiResponse<Partial<Record<string, History[]>>>>(
            { success: false, error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}