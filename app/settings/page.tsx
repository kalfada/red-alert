'use client'
import { useState } from "react";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { cities } from './cities';
import { MultiSelect } from '../components/MultiSelect';
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, MapPin, Map, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const Settings = () => {
    const [userLocation, setUserLocation] = useLocalStorage<string>('userLocation', '')
    const [locationsOfInterest, setLocationsOfInterest] = useLocalStorage<string[]>('locationsOfInterest', [])
    const [open, setOpen] = useState(false)

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] p-4" dir="rtl">
            <div className="w-full max-w-md flex flex-col gap-6">
                <h1 className="text-3xl font-bold text-center">הגדרות</h1>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <MapPin className="h-5 w-5 text-blue-400" />
                        עיר מגורים
                    </div>
                    <p className="text-sm text-gray-400">העיר הראשית שלך לקבלת התרעות</p>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                                dir="rtl"
                            >
                                {userLocation
                                    ? cities.find((city) => city === userLocation)
                                    : "בחר עיר..."}
                                <ChevronsUpDown className="opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[var(--background)]" dir="rtl">
                            <Command>
                                <CommandInput placeholder="חפש עיר..." />
                                <CommandList>
                                    <CommandEmpty>לא נמצאה עיר.</CommandEmpty>
                                    <CommandGroup>
                                        {cities.map((city) => (
                                            <CommandItem
                                                key={city}
                                                value={city}
                                                onSelect={(currentValue) => {
                                                    setUserLocation(currentValue === userLocation ? "" : currentValue)
                                                    setOpen(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "ml-2 h-4 w-4",
                                                        userLocation === city ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {city}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <Map className="h-5 w-5 text-emerald-400" />
                        אזורי עניין
                    </div>
                    <p className="text-sm text-gray-400">ערים נוספות שתרצה לעקוב אחריהן</p>
                    <MultiSelect
                        className="w-full"
                        onValueChange={(value) => setLocationsOfInterest(value)}
                        defaultValue={locationsOfInterest}
                        placeholder="בחר ערים..."
                        modalPopover={true}
                        variant={'default'}
                        options={
                            cities.map((key) => ({
                                value: key,
                                label: key
                            }))
                        }
                    />
                </div>

                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                    className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors py-2 cursor-pointer"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    איפוס הגדרות
                </button>
            </div>
        </div>
    )
}

export default Settings
