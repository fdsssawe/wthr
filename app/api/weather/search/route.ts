import { NextResponse, type NextRequest } from "next/server";

const API_URL = "https://api.openweathermap.org/geo/1.0/direct";

const buildQuery = (request: NextRequest): string => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENWEATHER_API_KEY is not defined. Add it to your environment variables.",
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    throw new Error("Параметр query є обов'язковим");
  }

  const params = new URLSearchParams({
    q: query,
    limit: "5",
    appid: apiKey,
  });

  return params.toString();
};

export const GET = async (request: NextRequest) => {
  try {
    const query = buildQuery(request);
    const response = await fetch(`${API_URL}?${query}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      const payload = await response.json();
      const message = payload?.message ?? "Не вдалося знайти міста";
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
