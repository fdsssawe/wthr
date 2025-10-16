"use client";

import type { CityWeather } from "@/lib/weather";
import {
    useWeatherStore,
    type WeatherStoreState,
} from "@/stores/weatherStore";

import CityCard from "../CityCard/CityCard";
import styles from "./CityList.module.scss";

const CityList = () => {
    const cities = useWeatherStore((state: WeatherStoreState) => state.cities);
    const isLoading = useWeatherStore(
        (state: WeatherStoreState) => state.isLoading,
    );
    const isInitialized = useWeatherStore(
        (state: WeatherStoreState) => state.isInitialized,
    );

    if (!isInitialized) {
        return <p className={styles.placeholder}>Завантажуємо дані...</p>;
    }

    if (!cities.length && isLoading) {
        return <p className={styles.placeholder}>Завантажуємо дані...</p>;
    }

    if (!cities.length && isInitialized) {
        return (
            <div className={styles.empty}>
                <h3>Додайте перше місто</h3>
                <p>
                    Почніть з улюбленого міста, щоб отримувати актуальну інформацію про
                    погоду.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {cities.map((city: CityWeather) => (
                <CityCard key={city.id} city={city} />
            ))}
        </div>
    );
};

export default CityList;
