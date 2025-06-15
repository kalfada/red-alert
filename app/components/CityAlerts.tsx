import parseDate from "../utils/parseDate"
import { History } from "../types/types"
import AnimatedList from "./AnimatedList"

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
}

const CityAlerts = ({ city, alerts }: Props) => {
    return (
        <div className="flex flex-col gap-4 border border-[grey] p-4 rounded-lg" >
            {city && <div className="text-2xl font-bold">{city}</div>}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px]">
                {
                    alerts.length ?
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
                        : <div className="text-lg text-gray-500">אין התרעות עבור {city}</div>
                }
            </div>
        </div>
    )
}

export default CityAlerts

// import parseDate from "../utils/parseDate"
// import { History } from "../types/types"

// const warningColors = {
//     RED: '#d32f2f',
//     YELLOW: '#ed6c02',
//     BLUE: '#1976d2',
//     GREEN: '#2e7d32'
// }

// const categoryToColor: { [key: number]: string } = {
//     1: warningColors.RED,
//     2: warningColors.RED,
//     3: warningColors.RED,
//     13: warningColors.GREEN,
//     14: warningColors.YELLOW
// }

// interface Props {
//     city: string
//     alerts: History[]
// }

// const CityAlerts = ({ city, alerts }: Props) => {
//     return (
//         <div className="flex flex-col gap-4 border border-[grey] w-[540px] p-4 rounded-lg" >
//             {city && <div className="text-2xl font-bold">{city}</div>}
//             <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//                 {
//                     alerts.length ? alerts.map((alert, index) => (
//                         <div
//                             className={`flex justify-start p-4 rounded-lg min-w-[500px] text-white`}
//                             style={{ backgroundColor: categoryToColor[alert.category] || warningColors.RED }}
//                             key={index}
//                         >
//                             <span>{`${parseDate(alert.alertDate)} - ${alert.title.trim()}`}</span>
//                         </div>
//                     ))
//                         : <div className="text-lg text-gray-500">אין התרעות עבור {city}</div>
//                 }
//             </div>
//         </div>
//     )
// }

// export default CityAlerts