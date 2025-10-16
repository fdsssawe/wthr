"use client";

import { useEffect } from "react";

import AddCityForm from "@/components/AddCityForm/AddCityForm";
import CityList from "@/components/CityList/CityList";
import {
  useWeatherStore,
  type WeatherStoreState,
} from "@/stores/weatherStore";

import styles from "./page.module.scss";

export default function HomePage() {
  const initialize = useWeatherStore(
    (state: WeatherStoreState) => state.initialize,
  );
  const isInitialized = useWeatherStore(
    (state: WeatherStoreState) => state.isInitialized,
  );
  const citiesCount = useWeatherStore(
    (state: WeatherStoreState) => state.cities.length,
  );

  useEffect(() => {
    if (!isInitialized) {
      void initialize();
    }
  }, [initialize, isInitialized]);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <h1>Погода</h1>
        </div>
        <div className={styles.stats}>
          <span className={styles.statValue}>{citiesCount}</span>
          <span className={styles.statLabel}>міст у списку</span>
        </div>
      </section>

      <section className={styles.controls}>
        <AddCityForm />
      </section>

      <CityList />
    </main>
  );
}
