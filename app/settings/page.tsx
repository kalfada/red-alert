'use client'
// import { useLocalStorage } from "@uidotdev/usehooks"
import { useLocalStorage } from '../hooks/useLocalStorage';
import { cities } from './cities';
// import { useState } from "react";
import { MultiSelect } from '../components/MultiSelect';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const Settings = () => {
    const [userLocation, setUserLocation] = useLocalStorage<string>('userLocation', '')
    const [locationsOfInterest, setLocationsOfInterest] = useLocalStorage<string[]>('locationsOfInterest', [])

    return (
        <div className="flex flex-col items-center justify-center h-[90vh] gap-4">
            <h1>הגדרות</h1>
            <div>עיר מגורים</div>
            <Select dir='rtl' onValueChange={(value) => setUserLocation(value)} defaultValue={userLocation}>
                <SelectTrigger className='w-[300px]'>
                    <SelectValue placeholder="בחר עיר" />
                </SelectTrigger>
                <SelectContent side='top' position='popper' className="bg-background">
                    {cities.map((key) => (
                        <SelectItem key={key} value={key} className="bg-background hover:bg-accent">
                            {key}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div>ערים נוספות</div>
            <MultiSelect
                style={{ width: '300px' }}
                onValueChange={(value) => setLocationsOfInterest(value)}
                defaultValue={locationsOfInterest}
                placeholder="בחר ערים"
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