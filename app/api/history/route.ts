// app/api/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, History } from '../../types/types';
import { cached } from '@/lib/cache';
import { cities as knownCities } from '../../settings/cities';

type HistoryResponse = ApiResponse<Partial<Record<string, History[]>>>;

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

const KNOWN_CITIES = new Set(knownCities);
const MAX_CITIES = 30;
const TTL_MS = 1000;
const OREF_TOKEN = process.env.OREF_TOKEN ?? '8fbacceaca9bc2b486ec02e8519bd9';

async function fetchCityHistory(city: string): Promise<History[]> {
    const url = `https://alerts-history.oref.org.il//Shared/Ajax/GetAlarmsHistory.aspx?city_0=${encodeURIComponent(city)}`;
    const response = await fetch(url, {
        headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "referer": "https://alerts-history.oref.org.il/12481-he/Pakar.aspx?pagemode=iframe&u1st=0",
            "x-requested-with": "XMLHttpRequest",
            "Authorization": `Bearer ${OREF_TOKEN}`,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
        throw new Error(`oref history HTTP ${response.status}`);
    }

    // oref answers some cities with an empty body instead of [].
    const text = (await response.text()).replace(/^﻿/, '').trim();
    const rawData: OrefHistoryItem[] = text ? JSON.parse(text) : [];
    return rawData.map(item => ({
        alertDate: item.alertDate,
        title: item.category_desc,
        data: item.data,
        category: item.category,
        rid: item.rid,
    }));
}

export async function GET(request: NextRequest): Promise<NextResponse<HistoryResponse>> {
    // Trust boundary: only known cities, deduped and capped, so one request can't fan out
    // to hundreds of upstream calls or fill the cache with junk keys.
    const cities = [...new Set(
        Array.from(request.nextUrl.searchParams.entries())
            .filter(([key, value]) => key.startsWith('city_') && KNOWN_CITIES.has(value))
            .map(([, value]) => value)
    )].slice(0, MAX_CITIES);

    if (cities.length === 0) {
        return NextResponse.json<HistoryResponse>(
            { success: false, error: 'No cities provided' },
            { status: 400 }
        );
    }

    try {
        // Promise.all on purpose: a partial failure must not render a city as "no alerts".
        const perCity = await Promise.all(
            cities.map(city => cached(`history:${city}`, TTL_MS, () => fetchCityHistory(city)))
        );

        const data = perCity.flat();
        data.sort((a, b) => new Date(b.alertDate).getTime() - new Date(a.alertDate).getTime());

        const grouped = data.reduce<Record<string, History[]>>((acc, alert) => {
            (acc[alert.data] ??= []).push(alert);
            return acc;
        }, {});

        return NextResponse.json<HistoryResponse>({ success: true, data: grouped });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return NextResponse.json<HistoryResponse>(
            { success: false, error: 'Failed to fetch alerts' },
            { status: 502 }
        );
    }
}
