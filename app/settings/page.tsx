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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Settings = () => {
    const [userLocation, setUserLocation] = useLocalStorage<string>('userLocation', '')
    const [locationsOfInterest, setLocationsOfInterest] = useLocalStorage<string[]>('locationsOfInterest', [])
    const [open, setOpen] = useState(false)

    return (
        <div className="flex flex-col items-center justify-center h-[90vh] gap-4">
            <h1>הגדרות</h1>
            <div>עיר מגורים</div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[300px] justify-between"
                        dir="rtl"
                    >
                        {userLocation
                            ? cities.find((city) => city === userLocation)
                            : "בחר עיר"}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-[var(--background)]" dir="rtl">
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
            <div>אזורי עניין</div>
            <MultiSelect
                style={{ width: '300px' }}
                onValueChange={(value) => setLocationsOfInterest(value)}
                defaultValue={locationsOfInterest}
                placeholder="בחר ערים"
                modalPopover={true}
                variant={'destructive'}
                options={
                    cities.map((key) => ({
                        value: key,
                        label: key
                    }))
                }
            />
        </div>
    )
}

export default Settings