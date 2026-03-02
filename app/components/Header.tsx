'use client'
import { useUpdateTime } from "../context/UpdateTimeContext";
import parseDate from "../utils/parseDate";
import Link from "next/link";
import { Settings, Siren } from "lucide-react";

const Header = () => {
    const { lastUpdateTime } = useUpdateTime();
    return (
        <nav className="flex flex-col bg-white/5 border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-3">
                <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                    <Siren className="h-5 w-5 text-red-400" />
                    התרעות אמת
                </Link>
                <Link href="/settings" className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">הגדרות</span>
                </Link>
            </div>
            {lastUpdateTime && (
                <div className="text-[11px] text-gray-500 text-center pb-1.5">
                    {`עדכון אחרון - ${parseDate(lastUpdateTime, true)}`}
                </div>
            )}
        </nav>
    )
}

export default Header
