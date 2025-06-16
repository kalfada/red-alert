'use client'
import { useEffect, useState } from "react";
import { ApiResponse, History } from "./types/types";
import { useUpdateTime } from "./context/UpdateTimeContext";
import CityAlerts from "./components/CityAlerts";
import { useLocalStorage } from "./hooks/useLocalStorage";
import Link from "next/link";

export default function Home() {
  const [userLocation] = useLocalStorage<string>('userLocation', '');
  const [locationsOfInterest] = useLocalStorage<string[]>('locationsOfInterest', []);
  const [history, setHistory] = useState<Partial<Record<string, History[]>> | null>(null);
  const { setLastUpdateTime } = useUpdateTime()

  const fetchAlerts = async (): Promise<ApiResponse<Partial<Record<string, History[]>>>> => {
    const response = await fetch('/api/history');

    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }

    return response.json();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!userLocation) {
        return;
      }
      fetchAlerts()
        .then(result => {

          if (result.success && result.data) {
            setHistory(result.data);
            setLastUpdateTime(new Date().toLocaleString());
          }
        })
        .catch(console.error);
    }, 700)

    return () => clearInterval(interval);
  }, [setLastUpdateTime, userLocation]);

  if (!userLocation) {
    return <div className="flex flex-col items-center justify-center h-[90vh] gap-4">
      <div className="text-4xl font-bold">נא לבחור מיקום</div>
      <div className="text-lg">לבחירת מיקום <Link href='/settings' className="underline">לחץ כאן</Link></div>
    </div>;
  }

  if (!history) {
    return <div className="flex flex-col items-center justify-center h-[90vh] gap-4">
      <div className="text-4xl font-bold">טוען...</div>
    </div>;
  }

  return (
    <div className="mx-auto flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <CityAlerts
          city={userLocation}
          alerts={history[userLocation] || []}
        />
        {locationsOfInterest.map((location, index) => (
          <CityAlerts
            key={index}
            city={location}
            alerts={history[location] || []}
          />
        ))}
      </div>
    </div>
  );
}
