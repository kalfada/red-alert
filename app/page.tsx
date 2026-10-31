'use client'
import { useEffect, useRef, useState } from "react";
import { ApiResponse, History, RealTimeAlert } from "./types/types";
import { useUpdateTime } from "./context/UpdateTimeContext";
import CityAlerts from "./components/CityAlerts";
import { useLocalStorage } from "./hooks/useLocalStorage";
import Link from "next/link";
import { ToastContainer, Slide, toast } from "react-toastify";
import { Settings, MapPin, Loader2 } from "lucide-react";

const EMPTY: History[] = [];
const HISTORY_POLL_MS = 10_000;  // realtime goes over SSE; history only needs a slow refresh
const HISTORY_AFTER_ALERT_MS = 2000; // oref history lags realtime a bit
const COOLDOWN = 2 * 60 * 1000;  // toast dedupe + how long a card stays "active"

type ActiveAlerts = Record<string, { title: string; until: number }>;

export default function Home() {
  const [userLocation] = useLocalStorage<string>('userLocation', '');
  const [locationsOfInterest] = useLocalStorage<string[]>('locationsOfInterest', []);
  const [history, setHistory] = useState<Partial<Record<string, History[]>> | null>(null);
  const [active, setActive] = useState<ActiveAlerts>({});
  const { setLastUpdateTime } = useUpdateTime();
  const shownAlerts = useRef(new Map<string, number>());
  const refreshHistorySoon = useRef(() => { });

  const params = [userLocation, ...locationsOfInterest]
    .filter(Boolean)
    .map((city, i) => `city_${i}=${encodeURIComponent(city)}`)
    .join('&');

  // History: fetch now, then every HISTORY_POLL_MS; never overlapping.
  useEffect(() => {
    if (!userLocation) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    let inFlight = false;
    let lastText = '';

    const load = async () => {
      clearTimeout(timer);
      inFlight = true;
      try {
        const response = await fetch(`/api/history?${params}`);
        const text = await response.text();
        if (response.ok && text !== lastText) {
          const result: ApiResponse<Partial<Record<string, History[]>>> = JSON.parse(text);
          if (result.success && result.data) {
            lastText = text;
            setHistory(result.data);
          }
        }
      } catch (error) {
        console.error(error);
      }
      inFlight = false;
      if (!stopped) timer = setTimeout(load, HISTORY_POLL_MS);
    };

    refreshHistorySoon.current = () => {
      if (inFlight || stopped) return;
      clearTimeout(timer);
      timer = setTimeout(load, HISTORY_AFTER_ALERT_MS);
    };

    load();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [userLocation, params]);

  // Realtime: server pushes alerts over SSE; EventSource reconnects on its own.
  useEffect(() => {
    if (!userLocation) return;
    // ponytail: start the stale clock now, so a stream that never connects still turns the header red
    setLastUpdateTime(Date.now());
    const events = new EventSource(`/api/stream?${params}`);

    events.addEventListener('ping', (e) => {
      const { lastOk, now } = JSON.parse(e.data);
      // Age measured on the server's clock, so client/server clock skew doesn't matter.
      if (lastOk) setLastUpdateTime(Date.now() - (now - lastOk));
    });

    events.addEventListener('alert', (e) => {
      const alert: RealTimeAlert = JSON.parse(e.data);
      const now = Date.now();
      for (const city of alert.data) {
        const key = `${city}-${alert.title}`;
        const lastShown = shownAlerts.current.get(key);
        if (lastShown && now - lastShown < COOLDOWN) continue;
        shownAlerts.current.set(key, now);
        toast.error(`${city} - ${alert.title}`, {
          toastId: key,
          position: "top-right",
          autoClose: 120000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          theme: "dark",
          transition: Slide,
        });
      }
      setActive(prev => {
        const next = { ...prev };
        for (const city of alert.data) next[city] = { title: alert.title, until: now + COOLDOWN };
        return next;
      });
      refreshHistorySoon.current();
    });

    return () => {
      events.close();
      setLastUpdateTime(null);
    };
  }, [userLocation, params, setLastUpdateTime]);

  // Clear active cards exactly when the earliest one expires.
  useEffect(() => {
    const untils = Object.values(active).map(a => a.until);
    if (!untils.length) return;
    const timer = setTimeout(() => {
      const now = Date.now();
      setActive(prev => Object.fromEntries(Object.entries(prev).filter(([, a]) => a.until > now)));
    }, Math.min(...untils) - Date.now());
    return () => clearTimeout(timer);
  }, [active]);

  const toasts = (
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
  );

  let content: React.ReactNode;
  if (!userLocation) {
    content = (
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
  } else if (!history) {
    content = (
      <div className="flex flex-col items-center justify-center h-[85vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        <span className="text-lg text-gray-400">טוען התרעות...</span>
      </div>
    );
  } else {
    const totalComponents = 1 + locationsOfInterest.length;
    content = (
      <div className="w-full max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 sm:min-h-[calc(100vh-60px)] sm:flex sm:items-center sm:justify-center">
        <div className={`grid gap-3 w-full ${totalComponents === 1
          ? 'grid-cols-1 max-w-lg mx-auto'
          : totalComponents === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
          <CityAlerts
            city={userLocation}
            alerts={history[userLocation] ?? EMPTY}
            active={active[userLocation]}
            isPrimary
          />
          {locationsOfInterest.map((location) => (
            <CityAlerts
              key={location}
              city={location}
              alerts={history[location] ?? EMPTY}
              active={active[location]}
            />
          ))}
        </div>
      </div>
    );
  }

  // Toasts stay outside the branches so the container never remounts (dropping toasts) when loading finishes.
  return <>{content}{toasts}</>;
}
