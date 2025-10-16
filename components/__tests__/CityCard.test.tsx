import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CityCard from "../CityCard/CityCard";
import type { CityWeather } from "@/lib/weather";

const mockStore = {
    refreshCity: jest.fn(),
    removeCity: jest.fn(),
    refreshing: {} as Record<number, boolean>,
};

jest.mock("@/stores/weatherStore", () => ({
    useWeatherStore: (selector: (state: typeof mockStore) => unknown) =>
        selector(mockStore),
}));

const baseCity: CityWeather = {
    id: 703448,
    name: "Київ",
    coord: { lat: 50.45, lon: 30.523 },
    weather: [
        {
            id: 800,
            main: "Clear",
            description: "чисте небо",
            icon: "01d",
        },
    ],
    main: {
        temp: 21.4,
        feels_like: 22.1,
        temp_min: 18.3,
        temp_max: 24.6,
        pressure: 1015,
        humidity: 56,
    },
    wind: {
        speed: 3.4,
        deg: 180,
        gust: 5.1,
    },
    clouds: { all: 10 },
    sys: {
        country: "UA",
        sunrise: 1697337600,
        sunset: 1697380200,
    },
    dt: 1697360000,
    timezone: 10800,
    visibility: 10000,
    updatedAt: Date.now(),
};

describe("CityCard", () => {
    beforeEach(() => {
        mockStore.refreshCity.mockResolvedValue(undefined);
        mockStore.removeCity.mockClear();
        mockStore.refreshCity.mockClear();
        mockStore.refreshing = {};
    });

    //тест рендер інфи
    it("renders city information", () => {
        render(<CityCard city={baseCity} />);

        expect(screen.getByText(/Київ/)).toBeInTheDocument();
        expect(screen.getByText(/чисте небо/)).toBeInTheDocument();
        expect(screen.getByText(/Оновити/)).toBeEnabled();
    });

    //клік оновлення
    it("calls refreshCity when refresh button is clicked", async () => {
        const user = userEvent.setup();
        render(<CityCard city={baseCity} />);

        await user.click(screen.getByRole("button", { name: /Оновити/ }));

        expect(mockStore.refreshCity).toHaveBeenCalledWith(baseCity.id);
    });

    //видалення
    it("calls removeCity when remove button is clicked", async () => {
        const user = userEvent.setup();
        render(<CityCard city={baseCity} />);

        await user.click(screen.getByRole("button", { name: /Видалити/ }));

        expect(mockStore.removeCity).toHaveBeenCalledWith(baseCity.id);
    });

    //дізейбл кнопки доки йде оновлення
    it("disables refresh button while refreshing", () => {
        mockStore.refreshing = { [baseCity.id]: true };

        render(<CityCard city={baseCity} />);

        expect(screen.getByRole("button", { name: /Оновлюємо/ })).toBeDisabled();
    });
});
