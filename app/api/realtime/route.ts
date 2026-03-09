import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, RealTimeAlert } from '../../types/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<RealTimeAlert>>> {
    try {
        const { searchParams } = new URL(request.url);
        const cities = Array.from(searchParams.entries())
            .filter(([key]) => key.startsWith('city_'))
            .map(([, value]) => value);

        const mock = searchParams.get('mock');
        if (mock && cities.length > 0) {
            return NextResponse.json<ApiResponse<RealTimeAlert>>({
                success: true,
                data: {
                    id: "mock-test-2",
                    cat: 1,
                    title: "ירי רקטות וטילים",
                    data: cities,
                    desc: "היכנסו למרחב המוגן",
                }
            });
        }

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

        if (cities.length > 0) {
            const citySet = new Set(cities);
            data = {
                ...data,
                data: [...new Set(data.data.filter(city => citySet.has(city)))]
            };
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
