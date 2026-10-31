'use client'
import { useEffect, useState } from "react";
import { useUpdateTime } from "../context/UpdateTimeContext";
import parseDate from "../utils/parseDate";
import Link from "next/link";
import { Settings, Siren } from "lucide-react";

const STALE_MS = 12_000; // > 2 missed server pings

const Header = () => {
    const { lastUpdateTime } = useUpdateTime();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const stale = lastUpdateTime !== null && now - lastUpdateTime > STALE_MS;
    const label = lastUpdateTime !== null && (
        <span className={stale ? "text-red-400 font-semibold" : undefined} role={stale ? "alert" : undefined}>
            {stale && "⚠ אין חיבור — המידע עלול להיות לא מעודכן · "}
            {`עדכון אחרון - ${parseDate(lastUpdateTime, true)}`}
        </span>
    );

    return (
        <nav className="flex flex-wrap items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 backdrop-blur-sm">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                <Siren className="h-5 w-5 text-red-400" />
                התרעות אמת
            </Link>
            {label && (
                <div className="text-sm text-gray-300 hidden sm:block">{label}</div>
            )}
            <Link href="/settings" className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">הגדרות</span>
            </Link>
            {label && (
                <div className="text-[11px] text-gray-500 w-full text-center pt-1 sm:hidden">{label}</div>
            )}
        </nav>
    )
}

export default Header
