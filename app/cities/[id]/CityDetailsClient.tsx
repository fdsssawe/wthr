"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import TemperatureChart, {
    type TemperaturePoint,
} from "@/components/TemperatureChart/TemperatureChart";
import {
    getCurrentWeatherById,
    getForecastByCoords,
} from "@/lib/weather-service";
import type { CityWeather } from "@/lib/weather";
import {
    formatTemperature,
    formatTime,
    toCityWeather,
} from "@/lib/weather";
import {
    useWeatherStore,
    type WeatherStoreState,
} from "@/stores/weatherStore";

import styles from "./city-details.module.scss";

type CityDetailsClientProps = {
    cityId: number;
};

const CityDetailsClient = ({ cityId }: CityDetailsClientProps) => {
    const storedCity = useWeatherStore((state: WeatherStoreState) =>
        state.getCityById(cityId),
    );
    const refreshCityFromStore = useWeatherStore(
        (state: WeatherStoreState) => state.refreshCity,
    );

    const [city, setCity] = useState<CityWeather | null>(storedCity ?? null);
    const [loading, setLoading] = useState(!storedCity);
    const [error, setError] = useState<string | null>(null);
    const [forecastLoading, setForecastLoading] = useState(false);
    const [forecastError, setForecastError] = useState<string | null>(null);
    const [forecastPoints, setForecastPoints] = useState<TemperaturePoint[]>([]);

    const loadForecast = useCallback(async (target: CityWeather) => {
        try {
            setForecastLoading(true);
            const forecast = await getForecastByCoords(
                target.coord.lat,
                target.coord.lon,
            );
            const points: TemperaturePoint[] = forecast.list.map((item) => ({
                timestamp: item.dt,
                temperature: item.main.temp,
            }));
            setForecastPoints(points);
            setForecastError(null);
        } catch (err) {
            console.error("Failed to load forecast", err);
            setForecastError(
                err instanceof Error ? err.message : "Не вдалося завантажити прогноз",
            );
        } finally {
            setForecastLoading(false);
        }
    }, []);

    useEffect(() => {
        if (storedCity) {
            setCity(storedCity);
            void loadForecast(storedCity);
            setLoading(false);
        }
    }, [storedCity, loadForecast]);

    useEffect(() => {
        if (storedCity) {
            return;
        }

        const fetchCity = async () => {
            try {
                setLoading(true);
                const current = await getCurrentWeatherById(cityId);
                const hydrated = toCityWeather(current);
                setCity(hydrated);
                await loadForecast(hydrated);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch city", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Не вдалося завантажити дані міста",
                );
            } finally {
                setLoading(false);
            }
        };

        void fetchCity();
    }, [cityId, storedCity, loadForecast]);

    const handleRefresh = async () => {
        if (storedCity) {
            await refreshCityFromStore(cityId);
            return;
        }

        try {
            setLoading(true);
            const current = await getCurrentWeatherById(cityId);
            const hydrated = toCityWeather(current);
            setCity(hydrated);
            await loadForecast(hydrated);
        } catch (err) {
            console.error("Failed to refresh city", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Не вдалося оновити дані міста",
            );
        } finally {
            setLoading(false);
        }
    };

    const details = useMemo(() => {
        if (!city) {
            return [];
        }

        return [
            {
                label: "Мінімальна",
                value: formatTemperature(city.main.temp_min),
            },
            {
                label: "Максимальна",
                value: formatTemperature(city.main.temp_max),
            },
            {
                label: "Вологість",
                value: `${city.main.humidity}%`,
            },
            {
                label: "Тиск",
                value: `${city.main.pressure} гПа`,
            },
            {
                label: "Вітер",
                value: `${city.wind.speed.toFixed(1)} м/с`,
            },
            {
                label: "Хмарність",
                value: `${city.clouds.all}%`,
            },
        ];
    }, [city]);

    if (loading) {
        return (
            <section className={styles.loading}>
                <p>Завантажуємо дані міста...</p>
            </section>
        );
    }

    if (error || !city) {
        return (
            <section className={styles.error}>
                <h2>Щось пішло не так</h2>
                <p>{error ?? "Місто не знайдено"}</p>
                <Link href="/" className={styles.backLink}>
                    Повернутися на головну
                </Link>
            </section>
        );
    }

    const weather = city.weather[0];

    return (
        <section className={styles.container}>
            <header className={styles.header}>
                <div>
                    <Link href="/" className={styles.backLink}>
                        ← Повернутися до списку
                    </Link>
                    <h1 className={styles.title}>
                        {city.name}, <span>{city.sys.country}</span>
                    </h1>
                    <p className={styles.subtitle}>{weather?.description ?? ""}</p>
                </div>
                <div className={styles.currentTemp}>
                    <span>{formatTemperature(city.main.temp)}</span>
                    <button type="button" onClick={handleRefresh} className={styles.refresh}>
                        Оновити зараз
                    </button>
                </div>
            </header>

            <section className={styles.details}>
                <article className={styles.infoCard}>
                    <h2>Поточні показники</h2>
                    <dl>
                        <div>
                            <dt>Відчувається як</dt>
                            <dd>{formatTemperature(city.main.feels_like)}</dd>
                        </div>
                        <div>
                            <dt>Видимість</dt>
                            <dd>{(city.visibility / 1000).toFixed(1)} км</dd>
                        </div>
                        <div>
                            <dt>Схід</dt>
                            <dd>{formatTime(city.sys.sunrise, city.timezone)}</dd>
                        </div>
                        <div>
                            <dt>Захід</dt>
                            <dd>{formatTime(city.sys.sunset, city.timezone)}</dd>
                        </div>
                    </dl>
                </article>

                <article className={styles.infoCard}>
                    <h2>Деталі</h2>
                    <dl>
                        {details.map((item) => (
                            <div key={item.label}>
                                <dt>{item.label}</dt>
                                <dd>{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                </article>
            </section>

            <section className={styles.forecast}>
                <div className={styles.forecastHeader}>
                    <h2>Погодні зміни найближчої доби</h2>
                    {forecastLoading ? <span>Оновлюємо прогноз...</span> : null}
                </div>
                {forecastError ? (
                    <p className={styles.errorText}>{forecastError}</p>
                ) : forecastPoints.length ? (
                    <TemperatureChart data={forecastPoints} timezone={city.timezone} />
                ) : (
                    <p className={styles.emptyForecast}>Немає достатніх даних для прогнозу.</p>
                )}
            </section>
        </section>
    );
};

export default CityDetailsClient;
