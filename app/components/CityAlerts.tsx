import parseDate from "../utils/parseDate"
import { History } from "../types/types"
import AnimatedList from "./AnimatedList"
import { MapPin, ShieldAlert } from "lucide-react"

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
}

const CityAlerts = ({ city, alerts, isPrimary = false }: Props) => {
    return (
        <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-2 sm:p-3 sm:gap-2 w-full">
            <div className="flex items-center gap-2">
                <MapPin className={`h-4 w-4 shrink-0 ${isPrimary ? 'text-red-400' : 'text-blue-400'}`} />
                <h2 className="text-base font-bold truncate">{city}</h2>
                {isPrimary && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">ראשי</span>
                )}
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[150px] sm:max-h-[350px] scrollbar-hide">
                {alerts.length ? (
                    <AnimatedList
                        className="w-full"
                        items={alerts.map((alert) => ({
                            text: `${parseDate(alert.alertDate)} - ${alert.title.trim()}`,
                            color: categoryToColor[alert.category] || warningColors.RED,
                            textColor: 'white',
                        }))}
                        showGradients={false}
                        displayScrollbar={false}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
                        <ShieldAlert className="h-8 w-8" />
                        <span className="text-sm">אין התרעות עבור {city}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CityAlerts;
