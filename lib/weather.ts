export interface WeatherDescription {
    id: number;
    main: string;
    description: string;
    icon: string;
}

export interface WeatherMain {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
}

export interface WeatherWind {
    speed: number;
    deg: number;
    gust?: number;
}

export interface WeatherClouds {
    all: number;
}

export interface WeatherSys {
    country: string;
    sunrise: number;
    sunset: number;
}

export interface Coordinates {
    lon: number;
    lat: number;
}

export interface CurrentWeatherResponse {
    id: number;
    name: string;
    coord: Coordinates;
    weather: WeatherDescription[];
    main: WeatherMain;
    wind: WeatherWind;
    clouds: WeatherClouds;
    sys: WeatherSys;
    dt: number;
    timezone: number;
    visibility: number;
}

export type CityWeather = CurrentWeatherResponse & {
    updatedAt: number;
};

export interface ForecastListItem {
    dt: number;
    main: WeatherMain;
    weather: WeatherDescription[];
    wind: WeatherWind;
    clouds: WeatherClouds;
    visibility: number;
    pop: number;
    dt_txt: string;
}

export interface ForecastResponse {
    cod: string;
    message: number;
    cnt: number;
    list: ForecastListItem[];
    city: {
        id: number;
        name: string;
        coord: Coordinates;
        country: string;
        population: number;
        timezone: number;
        sunrise: number;
        sunset: number;
    };
}

export interface StoredCity {
    id: number;
    name: string;
}

export const formatTemperature = (value: number): string => `${Math.round(value)}°C`;

export const formatTime = (timestamp: number, timezone: number): string => {
    const localDate = new Date((timestamp + timezone) * 1000);
    return localDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const toCityWeather = (
    payload: CurrentWeatherResponse,
    updatedAt: number = Date.now(),
): CityWeather => ({
    ...payload,
    updatedAt,
});

export interface GeocodeResultItem {
    name: string;
    local_names?: Record<string, string>;
    lat: number;
    lon: number;
    country: string;
    state?: string;
}

export interface CitySuggestion {
    id: string;
    label: string;
    query: string;
    coordinates: {
        lat: number;
        lon: number;
    };
}

const selectLocalizedName = (item: GeocodeResultItem): string => {
    const prefers = ["uk", "ru", "en"];
    const localized = item.local_names ?? {};
    for (const key of prefers) {
        if (localized[key]) {
            return localized[key] as string;
        }
    }
    return item.name;
};

export const toCitySuggestion = (item: GeocodeResultItem): CitySuggestion => {
    const baseName = selectLocalizedName(item);
    const parts = [baseName];
    if (item.state && item.state !== baseName) {
        parts.push(item.state);
    }
    parts.push(item.country);

    const label = parts.filter(Boolean).join(", ");

    return {
        id: `${item.lat.toFixed(4)}:${item.lon.toFixed(4)}`,
        label,
        query: label,
        coordinates: {
            lat: item.lat,
            lon: item.lon,
        },
    };
};
