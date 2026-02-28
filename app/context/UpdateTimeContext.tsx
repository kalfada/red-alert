'use client';

import { createContext, useContext, useState } from 'react';

type UpdateTimeContextType = {
    lastUpdateTime: string | null;
    setLastUpdateTime: (time: string) => void;
};

const UpdateTimeContext = createContext<UpdateTimeContextType | undefined>(undefined);

export function UpdateTimeProvider({ children }: { children: React.ReactNode }) {
    const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

    return (
        <UpdateTimeContext.Provider value={{ lastUpdateTime, setLastUpdateTime }}>
            {children}
        </UpdateTimeContext.Provider>
    );
}

export function useUpdateTime() {
    const context = useContext(UpdateTimeContext);
    if (context === undefined) {
        throw new Error('useUpdateTime must be used within a UpdateTimeProvider');
    }
    return context;
}
