import { NextResponse, type NextRequest } from "next/server";

const API_URL = "https://api.openweathermap.org/data/2.5/weather";

const buildQueryString = (request: NextRequest): string => {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        throw new Error(
            "OPENWEATHER_API_KEY is not defined. Add it to your environment variables.",
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const query = searchParams.get("query");

    if (!id && !query) {
        throw new Error("Потрібно передати id або query для запиту погоди");
    }

    const params = new URLSearchParams({
        appid: apiKey,
        units: "metric",
        lang: "uk",
    });

    if (id) {
        params.set("id", id);
    } else if (query) {
        params.set("q", query);
    }

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
            const message = payload?.message ?? "Не вдалося отримати дані";
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
