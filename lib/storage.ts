import type { StoredCity } from "./weather";

const STORAGE_KEY = "wthr:cities";

export const readStoredCities = (): StoredCity[] => {
    if (typeof window === "undefined") {
        return [];
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw) as StoredCity[];
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(
            (item): item is StoredCity =>
                typeof item?.id === "number" && typeof item?.name === "string",
        );
    } catch (error) {
        console.warn("Failed to parse stored cities", error);
        return [];
    }
};

export const persistStoredCities = (cities: StoredCity[]): void => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
    } catch (error) {
        console.warn("Failed to persist cities", error);
    }
};

export const clearStoredCities = (): void => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
};
