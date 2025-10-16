"use client";

import Image from "next/image";
import Link from "next/link";

import {
    useWeatherStore,
    type WeatherStoreState,
} from "@/stores/weatherStore";
import type { CityWeather } from "@/lib/weather";
import { formatTemperature, formatTime } from "@/lib/weather";

import styles from "./CityCard.module.scss";

type CityCardProps = {
    city: CityWeather;
};

const CityCard = ({ city }: CityCardProps) => {
    const refreshCity = useWeatherStore(
        (state: WeatherStoreState) => state.refreshCity,
    );
    const removeCity = useWeatherStore(
        (state: WeatherStoreState) => state.removeCity,
    );
    const refreshingLookup = useWeatherStore(
        (state: WeatherStoreState) => state.refreshing,
    );

    const isRefreshing = Boolean(refreshingLookup[city.id]);
    const weather = city.weather[0];
    const updatedLabel = formatTime(city.dt, city.timezone);

    return (
        <article className={styles.card}>
            <Link href={`/cities/${city.id}`} className={styles.link}>
                <header className={styles.header}>
                    <div>
                        <h3 className={styles.title}>
                            {city.name}, <span className={styles.country}>{city.sys.country}</span>
                        </h3>
                        <p className={styles.description}>{weather?.description ?? ""}</p>
                    </div>
                    {weather?.icon ? (
                        <Image
                            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                            alt={weather.description}
                            width={64}
                            height={64}
                            className={styles.icon}
                        />
                    ) : null}
                </header>
                <div className={styles.body}>
                    <p className={styles.temperature}>{formatTemperature(city.main.temp)}</p>
                    <dl className={styles.meta}>
                        <div>
                            <dt>Відчувається як</dt>
                            <dd>{formatTemperature(city.main.feels_like)}</dd>
                        </div>
                        <div>
                            <dt>Вологість</dt>
                            <dd>{city.main.humidity}%</dd>
                        </div>
                        <div>
                            <dt>Вітер</dt>
                            <dd>{city.wind.speed.toFixed(1)} м/с</dd>
                        </div>
                    </dl>
                </div>
            </Link>
            <footer className={styles.footer}>
                <span className={styles.updated}>Оновлено о {updatedLabel}</span>
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={() => refreshCity(city.id)}
                        className={styles.button}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? "Оновлюємо..." : "Оновити"}
                    </button>
                    <button
                        type="button"
                        onClick={() => removeCity(city.id)}
                        className={styles.danger}
                    >
                        Видалити
                    </button>
                </div>
            </footer>
        </article>
    );
};

export default CityCard;
