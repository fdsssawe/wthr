import { NextResponse, type NextRequest } from "next/server";

const API_URL = "https://api.openweathermap.org/data/2.5/forecast";

const buildQueryString = (request: NextRequest): string => {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        throw new Error(
            "OPENWEATHER_API_KEY is not defined. Add it to your environment variables.",
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
        throw new Error("Параметри lat та lon є обов'язковими");
    }

    const params = new URLSearchParams({
        lat,
        lon,
        appid: apiKey,
        units: "metric",
        cnt: "8",
        lang: "uk",
    });

    return params.toString();
};

export const GET = async (request: NextRequest) => {
    try {
        const queryString = buildQueryString(request);
        const response = await fetch(`${API_URL}?${queryString}`, {
            cache: "no-store",
        });

        if (!response.ok) {
            const payload = await response.json();
            const message = payload?.message ?? "Не вдалося отримати прогноз";
            return NextResponse.json({ message }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Неочікувана помилка сервера";
        return NextResponse.json({ message }, { status: 500 });
    }
};
