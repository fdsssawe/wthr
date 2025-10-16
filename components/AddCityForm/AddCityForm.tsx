"use client";

import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type FormEvent,
    type KeyboardEvent,
} from "react";

import { getCitySuggestions } from "@/lib/weather-service";
import type { CitySuggestion } from "@/lib/weather";
import {
    useWeatherStore,
    type WeatherStoreState,
} from "@/stores/weatherStore";
import styles from "./AddCityForm.module.scss";

const MIN_QUERY_LENGTH = 2;
const FETCH_DEBOUNCE = 300;

const AddCityForm = () => {
    const addCity = useWeatherStore((state: WeatherStoreState) => state.addCity);
    const isLoading = useWeatherStore(
        (state: WeatherStoreState) => state.isLoading,
    );
    const error = useWeatherStore((state: WeatherStoreState) => state.error);
    const clearError = useWeatherStore(
        (state: WeatherStoreState) => state.clearError,
    );

    const [value, setValue] = useState("");
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const listboxId = useId();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestQueryRef = useRef("");

    const closeSuggestions = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        setIsOpen(false);
        setSuggestions([]);
        setActiveIndex(-1);
        setIsFetching(false);
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!value.trim()) {
            return;
        }

        closeSuggestions();
        await addCity(value);
        setValue("");
    };

    const handleChange = (next: string) => {
        setValue(next);
        if (!isOpen) {
            setIsOpen(true);
        }
        if (error) {
            clearError();
        }
    };

    const fetchSuggestions = useCallback(async (query: string) => {
        latestQueryRef.current = query;
        setIsFetching(true);
        try {
            const result = await getCitySuggestions(query);
            if (latestQueryRef.current !== query) {
                return;
            }
            setSuggestions(result);
            setActiveIndex(result.length ? 0 : -1);
        } catch (err) {
            console.error("Failed to load city suggestions", err);
            if (latestQueryRef.current === query) {
                setSuggestions([]);
            }
        } finally {
            if (latestQueryRef.current === query) {
                setIsFetching(false);
            }
        }
    }, []);

    useEffect(() => {
        const trimmed = value.trim();

        if (trimmed.length < MIN_QUERY_LENGTH) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            setSuggestions([]);
            setIsFetching(false);
            setActiveIndex(-1);
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }

        debounceRef.current = setTimeout(() => {
            void fetchSuggestions(trimmed);
        }, FETCH_DEBOUNCE);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    }, [value, fetchSuggestions]);

    const handleSuggestionSelect = async (suggestion: CitySuggestion) => {
        closeSuggestions();
        setValue("");
        await addCity(suggestion.query);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || !suggestions.length) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((prev) => {
                const next = prev + 1;
                return next >= suggestions.length ? 0 : next;
            });
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((prev) => {
                if (prev <= 0) {
                    return suggestions.length - 1;
                }
                return prev - 1;
            });
        } else if (event.key === "Enter") {
            if (activeIndex >= 0 && activeIndex < suggestions.length) {
                event.preventDefault();
                void handleSuggestionSelect(suggestions[activeIndex]);
            }
        } else if (event.key === "Escape") {
            closeSuggestions();
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            closeSuggestions();
        }, 150);
    };

    const hasSuggestions = suggestions.length > 0;
    const showSuggestions = isOpen && (hasSuggestions || isFetching);

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label} htmlFor="city-input">
                Додайте нове місто
            </label>
            <div className={styles.controls}>
                <div className={styles.inputWrapper} onBlur={handleBlur}>
                    <input
                        id="city-input"
                        type="text"
                        value={value}
                        onChange={(event) => handleChange(event.target.value)}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Наприклад, Київ"
                        className={styles.input}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? "city-error" : undefined}
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={showSuggestions}
                        aria-controls={hasSuggestions ? listboxId : undefined}
                        autoComplete="off"
                    />
                    {showSuggestions ? (
                        <div className={styles.suggestions}>
                            {isFetching ? (
                                <p className={styles.suggestionInfo}>Пошук міст...</p>
                            ) : null}
                            {!isFetching && !hasSuggestions ? (
                                <p className={styles.suggestionInfo}>Міст не знайдено</p>
                            ) : null}
                            {hasSuggestions ? (
                                <ul
                                    id={listboxId}
                                    role="listbox"
                                    aria-label="Рекомендовані міста"
                                >
                                    {suggestions.map((suggestion, index) => (
                                        <li key={suggestion.id}>
                                            <button
                                                type="button"
                                                className={
                                                    index === activeIndex
                                                        ? `${styles.suggestion} ${styles.activeSuggestion}`
                                                        : styles.suggestion
                                                }
                                                role="option"
                                                aria-selected={index === activeIndex}
                                                disabled={isLoading}
                                                onMouseDown={(event) => {
                                                    event.preventDefault();
                                                    void handleSuggestionSelect(suggestion);
                                                }}
                                                onMouseEnter={() => setActiveIndex(index)}
                                            >
                                                {suggestion.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                    ) : null}
                </div>
                <button
                    type="submit"
                    className={styles.submit}
                    disabled={isLoading || !value.trim()}
                >
                    {isLoading ? "Завантаження..." : "Додати"}
                </button>
            </div>
            {error ? (
                <p id="city-error" role="alert" className={styles.error}>
                    {error}
                </p>
            ) : null}
        </form>
    );
};

export default AddCityForm;
