export interface History {
    alertDate: string
    title: string
    data: string
    category: number
}

export interface RealTimeAlert {
    id: string
    title: string
    data: string[]
    cat: number
    desc: string
}

export interface HistoryResponse {
    alerts?: Alert[];
    // Add other root properties if they exist
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    success: boolean;
}