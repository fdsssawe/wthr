"use client";

import { create, type GetState, type SetState } from "zustand";
import {
    getCurrentWeatherById,
    getCurrentWeatherByQuery,
} from "@/lib/weather-service";
import { persistStoredCities, readStoredCities } from "@/lib/storage";
import type { CityWeather, StoredCity } from "@/lib/weather";
import { toCityWeather } from "@/lib/weather";

const mapToStoredCities = (cities: CityWeather[]): StoredCity[] =>
    cities.map((city) => ({
        id: city.id,
        name: city.name,
    }));

export type WeatherStoreState = {
    cities: CityWeather[];
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
    refreshing: Record<number, boolean>;
    addCity: (query: string) => Promise<void>;
    removeCity: (id: number) => void;
    refreshCity: (id: number) => Promise<void>;
    initialize: () => Promise<void>;
    clearError: () => void;
    getCityById: (id: number) => CityWeather | undefined;
};

const weatherStore = (
    set: SetState<WeatherStoreState>,
    get: GetState<WeatherStoreState>,
): WeatherStoreState => ({
    cities: [],
    isInitialized: false,
    isLoading: false,
    error: null,
    refreshing: {},

    addCity: async (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) {
            set({ error: "Будь ласка, введіть назву міста" });
            return;
        }

        const { cities } = get();
        const hasDuplicate = cities.some(
            (city: CityWeather) => city.name.toLowerCase() === trimmed.toLowerCase(),
        );

        if (hasDuplicate) {
            set({ error: "Це місто вже додано" });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const current = await getCurrentWeatherByQuery(trimmed);
            const updatedCities = [...get().cities, toCityWeather(current)];

            set({ cities: updatedCities });
            persistStoredCities(mapToStoredCities(updatedCities));
        } catch (error) {
            console.error("Failed to add city", error);
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Не вдалося отримати погоду для цього міста",
            });
        } finally {
            set({ isLoading: false });
        }
    },

    removeCity: (id: number) => {
        const { cities } = get();
        const updatedCities = cities.filter(
            (city: CityWeather) => city.id !== id,
        );
        set({ cities: updatedCities });
        persistStoredCities(mapToStoredCities(updatedCities));
    },

    refreshCity: async (id: number) => {
        set((state: WeatherStoreState) => ({
            refreshing: {
                ...state.refreshing,
                [id]: true,
            },
            error: null,
        }));

        try {
            const current = await getCurrentWeatherById(id);
            set((state: WeatherStoreState) => {
                const updatedCities = state.cities.map((city: CityWeather) =>
                    city.id === id ? toCityWeather(current) : city,
                );
                persistStoredCities(mapToStoredCities(updatedCities));
                return { cities: updatedCities };
            });
        } catch (error) {
            console.error("Failed to refresh city", error);
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Не вдалося оновити погоду",
            });
        } finally {
            set((state: WeatherStoreState) => {
                const nextRefreshing = { ...state.refreshing };
                delete nextRefreshing[id];
                return { refreshing: nextRefreshing };
            });
        }
    },

    initialize: async () => {
        if (get().isInitialized) {
            return;
        }

        const storedCities = readStoredCities();

        if (!storedCities.length) {
            set({ isInitialized: true });
            return;
        }

        set({ isLoading: true, error: null });

        const results = await Promise.allSettled(
            storedCities.map((city) => getCurrentWeatherById(city.id)),
        );

        const rehydrated: CityWeather[] = [];
        const failed: StoredCity[] = [];

        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                rehydrated.push(toCityWeather(result.value));
            } else {
                failed.push(storedCities[index]);
                console.warn("Failed to rehydrate city", storedCities[index], result);
            }
        });

        set({
            cities: rehydrated,
            isInitialized: true,
            isLoading: false,
            error: failed.length
                ? `Не вдалося оновити: ${failed.map((city) => city.name).join(", ")}`
                : null,
        });

        persistStoredCities(mapToStoredCities(rehydrated));
    },

    clearError: () => set({ error: null }),

    getCityById: (id: number) => {
        return get().cities.find((city: CityWeather) => city.id === id);
    },
});

export const useWeatherStore = create<WeatherStoreState>(weatherStore);
