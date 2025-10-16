"use client";

import { formatTime } from "@/lib/weather";

import styles from "./TemperatureChart.module.scss";

type TemperaturePoint = {
    timestamp: number;
    temperature: number;
};

type TemperatureChartProps = {
    data: TemperaturePoint[];
    timezone: number;
};

const TemperatureChart = ({ data, timezone }: TemperatureChartProps) => {
    if (!data.length) {
        return null;
    }

    const temperatures = data.map((point) => point.temperature);
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const range = Math.max(maxTemp - minTemp, 1);

    const points = data.map((point, index) => {
        const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
        const normalized = (point.temperature - minTemp) / range;
        const y = 10 + (1 - normalized) * 80;

        return {
            x,
            y,
            timestamp: point.timestamp,
            label: formatTime(point.timestamp, timezone),
            temperature: point.temperature,
        };
    });

    const linePath = points.map((point) => `${point.x},${point.y}`).join(" ");
    const areaPath = `${linePath} 100,100 0,100`;

    return (
        <div className={styles.chart}>
            <svg className={styles.line} viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="temperatureGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon fill="url(#temperatureGradient)" points={areaPath} />
                <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    points={linePath}
                />
            </svg>

            {points.map((point, index) => (
                <div
                    key={`${point.timestamp}-${index}`}
                    className={styles.point}
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                    <span className={styles.dot} />
                    <span className={styles.temp}>
                        {Math.round(point.temperature)}°
                    </span>
                    <span className={styles.time}>{point.label}</span>
                </div>
            ))}
        </div>
    );
};

export type { TemperaturePoint };
export default TemperatureChart;
