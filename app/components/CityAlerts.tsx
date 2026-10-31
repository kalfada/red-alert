import { memo } from "react"
import parseDate from "../utils/parseDate"
import { History } from "../types/types"
import { MapPin, ShieldAlert, Siren } from "lucide-react"

const warningColors = {
    RED: '#d32f2f',
    YELLOW: '#ed6c02',
    BLUE: '#1976d2',
    GREEN: '#2e7d32'
}

const categoryToColor: { [key: number]: string } = {
    1: warningColors.RED,
    2: warningColors.RED,
    3: warningColors.RED,
    13: warningColors.GREEN,
    14: warningColors.YELLOW
}

interface Props {
    city: string
    alerts: History[]
    isPrimary?: boolean
    active?: { title: string }
}

const CityAlerts = ({ city, alerts, isPrimary = false, active }: Props) => {
    return (
        <div className={`flex flex-col gap-1 rounded-xl border p-2 sm:p-3 sm:gap-2 w-full transition-colors ${active ? 'border-red-500 bg-red-500/15' : 'border-white/10 bg-white/5'}`}>
            <div className="flex items-center gap-2">
                <MapPin className={`h-4 w-4 shrink-0 ${isPrimary ? 'text-red-400' : 'text-blue-400'}`} />
                <h2 className="text-base font-bold truncate">{city}</h2>
                {isPrimary && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">ראשי</span>
                )}
            </div>
            {active && (
                <div role="alert" className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold animate-pulse">
                    <Siren className="h-4 w-4 shrink-0" />
                    {active.title}
                </div>
            )}
            {alerts.length ? (
                <ul className="flex flex-col gap-2 p-1 overflow-y-auto max-h-[150px] sm:max-h-[350px] scrollbar-hide">
                    {alerts.map((alert) => (
                        <li
                            key={alert.rid}
                            className="px-3 py-2 rounded-lg text-sm text-white animate-in fade-in zoom-in-95 duration-200"
                            style={{ backgroundColor: categoryToColor[alert.category] || warningColors.RED }}
                        >
                            {`${parseDate(alert.alertDate)} - ${alert.title.trim()}`}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
                    <ShieldAlert className="h-8 w-8" />
                    <span className="text-sm">אין התרעות עבור {city}</span>
                </div>
            )}
        </div>
    )
}

export default memo(CityAlerts);
