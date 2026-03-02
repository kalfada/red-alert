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
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 w-full">
            <div className="flex items-center gap-2">
                <MapPin className={`h-5 w-5 shrink-0 ${isPrimary ? 'text-red-400' : 'text-blue-400'}`} />
                <h2 className="text-xl font-bold truncate">{city}</h2>
                {isPrimary && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full mr-auto whitespace-nowrap">ראשי</span>
                )}
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px]">
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
