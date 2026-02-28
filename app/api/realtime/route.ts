import { NextResponse } from 'next/server';
import type { ApiResponse, RealTimeAlert } from '../../types/types';

export async function GET(): Promise<NextResponse<ApiResponse<RealTimeAlert>>> {
    try {
        const response = await fetch('https://www.oref.org.il/warningMessages/alert/Alerts.json', {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)',
            }
        });

        if (!response.ok) {
            return NextResponse.json<ApiResponse<RealTimeAlert>>(
                { success: false, error: `HTTP error! status: ${response.status}` },
                { status: response.status }
            );
        }

        let data: RealTimeAlert | null = null

        try {
            data = await response.json();

        } catch {
            return NextResponse.json<ApiResponse<RealTimeAlert>>(
                { success: true },
                { status: 200 }
            );
        }

        if (!data) {
            return NextResponse.json<ApiResponse<RealTimeAlert>>(
                { success: true },
                { status: 200 }
            );
        }

        return NextResponse.json<ApiResponse<RealTimeAlert>>({
            success: true,
            data
        });

    } catch (error) {
        console.error('Error fetching alerts:', error);
        return NextResponse.json<ApiResponse<RealTimeAlert>>(
            { success: false, error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}