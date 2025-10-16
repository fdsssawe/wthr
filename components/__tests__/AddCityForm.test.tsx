import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AddCityForm from "../AddCityForm/AddCityForm";

const mockStore = {
    addCity: jest.fn(),
    isLoading: false,
    error: null as string | null,
    clearError: jest.fn(),
};

jest.mock("@/stores/weatherStore", () => ({
    useWeatherStore: (selector: (state: typeof mockStore) => unknown) =>
        selector(mockStore),
}));

describe("AddCityForm", () => {
    beforeEach(() => {
        mockStore.addCity.mockResolvedValue(undefined);
        mockStore.clearError.mockReset();
        mockStore.addCity.mockClear();
        mockStore.isLoading = false;
        mockStore.error = null;
    });

    //тест базвого сабму і очищення інпуту
    it("submits city name and clears the input", async () => {
        const user = userEvent.setup();

        render(<AddCityForm />);

        const input = screen.getByPlaceholderText(/Наприклад/i);
        await user.type(input, "Київ");

        await user.click(screen.getByRole("button", { name: /Додати/i }));

        expect(mockStore.addCity).toHaveBeenCalledWith("Київ");
        expect(input).toHaveValue("");
    });

    //перевірка рендеру помилки
    it("renders error message when store has error", () => {
        mockStore.error = "Сталася помилка";

        render(<AddCityForm />);

        expect(screen.getByRole("alert")).toHaveTextContent("Сталася помилка");
    });

    //коли вводим щось в інпут то помилка має зникати
    it("clears error when user edits the field", async () => {
        mockStore.error = "Сталася помилка";
        const user = userEvent.setup();

        render(<AddCityForm />);

        const input = screen.getByPlaceholderText(/Наприклад/i);
        await user.type(input, "Львів");

        expect(mockStore.clearError).toHaveBeenCalled();
    });
});
