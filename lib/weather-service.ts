import type {
    CitySuggestion,
    CurrentWeatherResponse,
    ForecastResponse,
    GeocodeResultItem,
} from "./weather";
import { toCitySuggestion } from "./weather";

const fetchJson = async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        let message = "Не вдалося отримати дані погоди";

        try {
            const errorPayload = (await response.json()) as { message?: string };
            if (errorPayload?.message) {
                message = errorPayload.message;
            }
        } catch (error) {
            console.warn("Failed to parse weather API error", error);
        }

        throw new Error(message);
    }

    return (await response.json()) as T;
};

export const getCurrentWeatherByQuery = async (
    query: string,
): Promise<CurrentWeatherResponse> => {
    const encoded = encodeURIComponent(query.trim());
    return fetchJson<CurrentWeatherResponse>(
        `/api/weather/current?query=${encoded}`,
    );
};

export const getCurrentWeatherById = async (
    id: number,
): Promise<CurrentWeatherResponse> => {
    return fetchJson<CurrentWeatherResponse>(`/api/weather/current?id=${id}`);
};

export const getForecastByCoords = async (
    lat: number,
    lon: number,
): Promise<ForecastResponse> => {
    const searchParams = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
    });

    return fetchJson<ForecastResponse>(`/api/weather/forecast?${searchParams}`);
};

export const getCitySuggestions = async (
    query: string,
): Promise<CitySuggestion[]> => {
    const trimmed = query.trim();

    if (!trimmed) {
        return [];
    }

    const encoded = encodeURIComponent(trimmed);
    const result = await fetchJson<GeocodeResultItem[]>(
        `/api/weather/search?query=${encoded}`,
    );

    return result.map((item) => toCitySuggestion(item));
};
