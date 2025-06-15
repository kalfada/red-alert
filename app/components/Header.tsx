'use client'
import { useUpdateTime } from "../context/UpdateTimeContext";
import parseDate from "../utils/parseDate";
import Link from "next/link";

const Header = () => {
    const { lastUpdateTime } = useUpdateTime();
    return (
        <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <Link href="/" className="text-lg font-bold">
                התרעות אמת
            </Link>
            {lastUpdateTime ? <div className="text-sm">{`עדכון אחרון - ${parseDate(lastUpdateTime, true)}`}</div> : null}
            <div className="flex space-x-4">
                <Link href="/settings" className="hover:underline">הגדרות</Link>
            </div>
        </nav>
    )
}

export default Header