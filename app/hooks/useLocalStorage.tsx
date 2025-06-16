import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

// Helper to safely access localStorage
const getLocalStorageItem = (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn('Unable to access localStorage:', error);
        return null;
    }
};

// Helper to safely set localStorage
const setLocalStorageItem = (key: string, value: unknown) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('Unable to write to localStorage:', error);
    }
};

// Helper to safely remove from localStorage
const removeLocalStorageItem = (key: string) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn('Unable to remove from localStorage:', error);
    }
};

const useLocalStorageSubscribe = (callback: () => void) => {
    if (typeof window !== 'undefined') {
        try {
            window.addEventListener("storage", callback);
            return () => window.removeEventListener("storage", callback);
        } catch (error) {
            console.warn('Unable to subscribe to storage events:', error);
        }
    }
    return () => { }; // Noop for SSR or when storage events aren't available
};

// Return the initialValue for server rendering
const getLocalStorageServerSnapshot = (initialValue: unknown) => {
    return JSON.stringify(initialValue);
};

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const getSnapshot = () => getLocalStorageItem(key);

    // We need to capture initialValue in a ref to avoid changing
    // the server snapshot function on re-renders
    const initialValueRef = useRef(initialValue);

    const store = useSyncExternalStore(
        useLocalStorageSubscribe,
        getSnapshot,
        () => getLocalStorageServerSnapshot(initialValueRef.current)
    );

    const setState = useCallback(
        (v: T | ((prev: T) => T)) => {
            try {
                const prevValue = store ? JSON.parse(store) : initialValueRef.current;
                const nextState = typeof v === "function" ? (v as (prev: T) => T)(prevValue) : v;

                if (nextState === undefined || nextState === null) {
                    removeLocalStorageItem(key);
                } else {
                    setLocalStorageItem(key, nextState);
                }
            } catch (e) {
                console.warn('Error updating state:', e);
            }
        },
        [key, store]
    );

    useEffect(() => {
        // Only run on the client
        if (
            getLocalStorageItem(key) === null &&
            typeof initialValue !== "undefined"
        ) {
            setLocalStorageItem(key, initialValue);
        }
    }, [key, initialValue]);

    let valueToReturn: T;
    try {
        // Always return initialValue on server/first render to prevent hydration mismatch
        if (typeof window === 'undefined') {
            valueToReturn = initialValue;
        } else {
            valueToReturn = store ? JSON.parse(store) : initialValue;
        }
    } catch (e) {
        console.warn('Error parsing stored value:', e);
        valueToReturn = initialValue;
    }

    return [valueToReturn, setState];
}