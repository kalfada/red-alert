// app/api/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, History } from '../../types/types';

interface OrefHistoryItem {
    data: string;
    date: string;
    time: string;
    alertDate: string;
    category: number;
    category_desc: string;
    matrix_id: number;
    rid: number;
    NAME_HE: string;
    NAME_EN: string;
    NAME_AR: string;
    NAME_RU: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Partial<Record<string, History[]>>>>> {
    try {
        const { searchParams } = new URL(request.url);
        const cityParams = Array.from(searchParams.entries())
            .filter(([key]) => key.startsWith('city_'))
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);

        if (cityParams.length === 0) {
            return NextResponse.json<ApiResponse<Partial<Record<string, History[]>>>>(
                { success: false, error: 'No cities provided' },
                { status: 400 }
            );
        }

        const url = `https://alerts-history.oref.org.il//Shared/Ajax/GetAlarmsHistory.aspx?${cityParams.join('&')}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,he;q=0.8",
                "referer": "https://alerts-history.oref.org.il/12481-he/Pakar.aspx?pagemode=iframe&u1st=0",
                "x-requested-with": "XMLHttpRequest",
                "Authorization": "Bearer 8fbacceaca9bc2b486ec02e8519bd9",
            },
        });

        if (!response.ok) {
            return NextResponse.json<ApiResponse<Partial<Record<string, History[]>>>>(
                { success: false, error: `HTTP error! status: ${response.status}` },
                { status: response.status }
            );
        }

        const rawData: OrefHistoryItem[] = await response.json();

        const data: History[] = rawData.map(item => ({
            alertDate: item.alertDate,
            title: item.category_desc,
            data: item.data,
            category: item.category,
        }));

        data.sort((a, b) => new Date(b.alertDate).getTime() - new Date(a.alertDate).getTime());

        const grouped = data.reduce<Record<string, History[]>>((acc, alert) => {
            const key = alert.data;
            (acc[key] ??= []).push(alert);
            return acc;
        }, {});

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