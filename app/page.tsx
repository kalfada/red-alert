'use client'
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiResponse, History, RealTimeAlert } from "./types/types";
import { useUpdateTime } from "./context/UpdateTimeContext";
import CityAlerts from "./components/CityAlerts";
import { useLocalStorage } from "./hooks/useLocalStorage";
import Link from "next/link";
import { ToastContainer, Slide, toast } from "react-toastify";
import { Settings, MapPin, Loader2 } from "lucide-react";

export default function Home() {
  const [userLocation] = useLocalStorage<string>('userLocation', '');
  const [locationsOfInterest] = useLocalStorage<string[]>('locationsOfInterest', []);
  const [history, setHistory] = useState<Partial<Record<string, History[]>> | null>(null);
  const { setLastUpdateTime } = useUpdateTime()
  const lastRealtimeId = useRef('');

  const fetchAlerts = useCallback(async (): Promise<ApiResponse<Partial<Record<string, History[]>>>> => {
    const cities = [userLocation, ...locationsOfInterest].filter(Boolean);
    const params = cities.map((city, i) => `city_${i}=${encodeURIComponent(city)}`).join('&');
    const response = await fetch(`/api/history?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }

    return response.json();
  }, [userLocation, locationsOfInterest]);

  const fetchRealTimeAlerts = async (): Promise<ApiResponse<RealTimeAlert>> => {
    const response = await fetch('/api/realtime');

    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }

    return response.json();
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (!userLocation) {
        return;
      }
      fetchRealTimeAlerts()
        .then(result => {
          if (!result.success || !result?.data?.id) return
          const { id } = result.data;
          if (lastRealtimeId.current !== id) {
            lastRealtimeId.current = id;
            const relevantAlerts = result.data.data.filter(city => city === userLocation || locationsOfInterest.includes(city));

            if (!relevantAlerts.length) return;
            const { title } = result.data
            for (const city of relevantAlerts) {
              toast.error(`${city} - ${title}`, {
                position: "top-right",
                autoClose: 120000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
                theme: "dark",
                transition: Slide,
              });
            }
          }
        })
        .catch(console.error);
    }, 700)
    return () => clearInterval(interval);
  }, [userLocation, locationsOfInterest]);

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
    }, 2000)

    return () => clearInterval(interval);
  }, [setLastUpdateTime, userLocation, fetchAlerts]);

  if (!userLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] gap-5 px-4 text-center">
        <div className="rounded-full bg-white/5 p-6">
          <MapPin className="h-12 w-12 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold">נא לבחור מיקום</h1>
        <p className="text-gray-400 max-w-xs">בחר את עיר המגורים שלך כדי להתחיל לקבל התרעות</p>
        <Link
          href="/settings"
          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors px-5 py-2.5 rounded-lg text-sm font-medium"
        >
          <Settings className="h-4 w-4" />
          עבור להגדרות
        </Link>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        <span className="text-lg text-gray-400">טוען התרעות...</span>
      </div>
    );
  }

  const totalComponents = 1 + locationsOfInterest.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 sm:min-h-[calc(100vh-60px)] sm:flex sm:items-center sm:justify-center">
      <div className={`grid gap-3 w-full ${totalComponents === 1
        ? 'grid-cols-1 max-w-lg mx-auto'
        : totalComponents === 2
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
        <CityAlerts
          city={userLocation}
          alerts={history[userLocation] || []}
          isPrimary
        />
        {locationsOfInterest.map((location, index) => (
          <CityAlerts
            key={index}
            city={location}
            alerts={history[location] || []}
          />
        ))}
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={30000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
    </div>
  );
}
