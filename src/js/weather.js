(() => {
    "use strict";

    const storageKey = "ville-meteo";
    const enAnglais = () => document.documentElement.lang === "en";

    // Cache the controls used by the settings and conversation pages
    const elements = {
        cityForm: document.querySelector("#weather-city-form"),
        cityInput: document.querySelector("#weather-city"),
        cityCurrent: document.querySelector("#weather-city-current"),
        cityResults: document.querySelector("#weather-city-results"),
        weatherButton: document.querySelector("#share-weather"),
        messageForm: document.querySelector("#message-form"),
        messageInput: document.querySelector("#message"),
        messageList: document.querySelector("#message-list"),
        status: document.querySelector("#weather-status")
    };

    // Keep weather feedback and labels in both languages supported by the site
    const text = {
        fr: {
            cityNotSet: "Aucune ville enregistrée.",
            citySaved: "Ville enregistrée :",
            searching: "Recherche des villes…",
            noResults: "Aucune ville trouvée. Ajoute le pays si le nom est ambigu.",
            cityNotFound: "Ville introuvable. Ajoute le pays pour préciser ta recherche.",
            searchError: "La recherche des villes a échoué. Vérifie ta connexion et réessaie.",
            saveError: "Impossible d’enregistrer la ville dans ce navigateur.",
            cityMissing: "Choisis d’abord une ville dans les paramètres ou écris /meteo [ville].",
            loading: "Récupération de la météo…",
            weatherError: "La météo est momentanément indisponible. Réessaie plus tard.",
            cardPosted: "Carte météo ajoutée à la conversation sur cet appareil.",
            messagePosted: "Message ajouté à la conversation sur cet appareil.",
            messageEmpty: "Écris un message avant de l’envoyer.",
            chooseCity: "Choisir cette ville",
            currentWeather: "MÉTÉO ACTUELLE",
            clear: "Ciel dégagé",
            mainlyClear: "Principalement dégagé",
            partlyCloudy: "Partiellement nuageux",
            overcast: "Couvert",
            fog: "Brouillard",
            drizzle: "Bruine",
            freezingDrizzle: "Bruine verglaçante",
            rain: "Pluie",
            freezingRain: "Pluie verglaçante",
            snow: "Neige",
            showers: "Averses",
            thunderstorm: "Orage",
            unknown: "Conditions variables",
            feelsLike: "Ressenti",
            wind: "Vent",
            updatedAt: "Actualisé à",
            source: "Données météo par",
            license: "CC BY 4.0",
            me: "Moi"
        },
        en: {
            cityNotSet: "No city saved.",
            citySaved: "Saved city:",
            searching: "Searching for cities…",
            noResults: "No cities found. Add the country if the name is ambiguous.",
            cityNotFound: "City not found. Add the country to narrow the search.",
            searchError: "City search failed. Check your connection and try again.",
            saveError: "This browser could not save the city.",
            cityMissing: "Choose a city in Settings or type /meteo [city].",
            loading: "Getting the current weather…",
            weatherError: "The weather service is unavailable right now. Try again later.",
            cardPosted: "Weather card added to this conversation on this device.",
            messagePosted: "Message added to this conversation on this device.",
            messageEmpty: "Write a message before sending it.",
            chooseCity: "Choose this city",
            currentWeather: "CURRENT WEATHER",
            clear: "Clear sky",
            mainlyClear: "Mainly clear",
            partlyCloudy: "Partly cloudy",
            overcast: "Overcast",
            fog: "Fog",
            drizzle: "Drizzle",
            freezingDrizzle: "Freezing drizzle",
            rain: "Rain",
            freezingRain: "Freezing rain",
            snow: "Snow",
            showers: "Showers",
            thunderstorm: "Thunderstorm",
            unknown: "Variable conditions",
            feelsLike: "Feels like",
            wind: "Wind",
            updatedAt: "Updated at",
            source: "Weather data by",
            license: "CC BY 4.0",
            me: "Me"
        }
    };

    function strings() {
        return enAnglais() ? text.en : text.fr;
    }

    function setStatus(message) {
        if (elements.status) elements.status.textContent = message;
    }

    function cityName(city) {
        return [city.name, city.admin1, city.country]
            .filter((part, index, parts) => part && parts.indexOf(part) === index)
            .join(", ");
    }

    // Read the preferred city from this browser without failing when storage is blocked
    function readSavedCity() {
        try {
            return JSON.parse(window.localStorage.getItem(storageKey) || "null");
        } catch (error) {
            return null;
        }
    }

    function showSavedCity() {
        if (!elements.cityCurrent) return;
        const city = readSavedCity();
        elements.cityCurrent.textContent = city
            ? `${strings().citySaved} ${cityName(city)}`
            : strings().cityNotSet;
    }

    // Look up a city name and return matching places with coordinates
    async function searchCities(query) {
        const language = enAnglais() ? "en" : "fr";
        const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
        url.search = new URLSearchParams({ name: query, count: "8", language }).toString();

        const response = await fetch(url);
        if (!response.ok) throw new Error("Geocoding request failed");
        const data = await response.json();
        return data.results || [];
    }

    // Save the selected coordinates locally for the weather button
    if (elements.cityForm) {
        showSavedCity();
        elements.cityForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const query = elements.cityInput.value.trim();
            if (!query) return;

            elements.cityResults.replaceChildren();
            elements.cityCurrent.textContent = strings().searching;

            try {
                const cities = await searchCities(query);
                if (cities.length === 0) {
                    elements.cityCurrent.textContent = strings().noResults;
                    return;
                }

                elements.cityCurrent.textContent = "";
                cities.forEach((city) => {
                    const item = document.createElement("li");
                    const button = document.createElement("button");
                    button.type = "button";
                    button.textContent = cityName(city);
                    button.setAttribute("aria-label", `${strings().chooseCity} ${cityName(city)}`);
                    button.addEventListener("click", () => {
                        const savedCity = {
                            name: city.name,
                            admin1: city.admin1 || "",
                            country: city.country || "",
                            latitude: city.latitude,
                            longitude: city.longitude
                        };

                        try {
                            window.localStorage.setItem(storageKey, JSON.stringify(savedCity));
                            showSavedCity();
                            elements.cityResults.replaceChildren();
                        } catch (error) {
                            elements.cityCurrent.textContent = strings().saveError;
                        }
                    });
                    item.append(button);
                    elements.cityResults.append(item);
                });
            } catch (error) {
                elements.cityCurrent.textContent = strings().searchError;
            }
        });
    }

    // Match each WMO code to a short description and a weather icon style
    function describeWeather(code) {
        const words = strings();
        if (code === 0) return { label: words.clear, icon: "clear" };
        if (code === 1) return { label: words.mainlyClear, icon: "clear" };
        if (code === 2) return { label: words.partlyCloudy, icon: "partly-cloudy" };
        if (code === 3) return { label: words.overcast, icon: "cloudy" };
        if ([45, 48].includes(code)) return { label: words.fog, icon: "fog" };
        if ([51, 53, 55].includes(code)) return { label: words.drizzle, icon: "rain" };
        if ([56, 57].includes(code)) return { label: words.freezingDrizzle, icon: "rain" };
        if ([61, 63, 65].includes(code)) return { label: words.rain, icon: "rain" };
        if ([66, 67].includes(code)) return { label: words.freezingRain, icon: "rain" };
        if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: words.snow, icon: "snow" };
        if ([80, 81, 82].includes(code)) return { label: words.showers, icon: "rain" };
        if ([95, 96, 99].includes(code)) return { label: words.thunderstorm, icon: "storm" };
        return { label: words.unknown, icon: "cloudy" };
    }

    // Use inline SVG shapes so the weather image stays self contained on GitHub Pages
    function weatherIconMarkup(style) {
        const cloud = '<path class="weather-cloud" d="M24 65h47a15 15 0 0 0 0-30 23 23 0 0 0-44-4A17 17 0 0 0 24 65Z"/>';
        const sun = '<circle class="weather-sun" cx="43" cy="35" r="15"/><path class="weather-sun-rays" d="M43 9v7m0 38v7M17 35h7m38 0h7M25 17l5 5m27 27 5 5m0-37-5 5M30 48l-5 5"/>';
        const symbols = {
            clear: sun,
            "partly-cloudy": `${sun}${cloud}`,
            cloudy: cloud,
            fog: `${cloud}<path class="weather-fog-lines" d="M20 73h53M27 82h43"/>`,
            rain: `${cloud}<path class="weather-rain-drops" d="m34 72-4 9m20-9-4 9m20-9-4 9"/>`,
            snow: `${cloud}<path class="weather-snowflakes" d="M34 74v10m-4-5h8m-7-3 6 6m0-6-6 6m19-8v10m-4-5h8m-7-3 6 6m0-6-6 6"/>`,
            storm: `${cloud}<path class="weather-lightning" d="m49 67-10 15h9l-3 12 15-19h-10l5-8Z"/>`
        };

        return symbols[style] || symbols.cloudy;
    }

    // Request current conditions for the chosen coordinates
    async function getCurrentWeather(city) {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.search = new URLSearchParams({
            latitude: String(city.latitude),
            longitude: String(city.longitude),
            current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
            temperature_unit: "celsius",
            wind_speed_unit: "kmh",
            timezone: "auto"
        }).toString();

        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather request failed");
        const data = await response.json();
        return data.current;
    }

    // Escape city names and labels before placing them inside SVG text elements
    function escapeXml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    // Create a shareable SVG image with the city, conditions, and current values
    function createWeatherCard(city, weather) {
        const words = strings();
        const condition = describeWeather(weather.weather_code);
        const cityLabel = cityName(city);
        const escapedCity = escapeXml(city.name);
        const escapedRegion = escapeXml([city.admin1, city.country].filter(Boolean).join(", "));
        const escapedCondition = escapeXml(condition.label);
        const temperature = Math.round(weather.temperature_2m);
        const feelsLike = Math.round(weather.apparent_temperature);
        const wind = Math.round(weather.wind_speed_10m);
        const time = weather.time ? weather.time.split("T")[1] : "";
        const cityFontSize = city.name.length > 25 ? 28 : city.name.length > 18 ? 32 : 36;
        const conditionFontSize = condition.label.length > 18 ? 18 : 22;
        const svgImage = `
            <svg xmlns="http://www.w3.org/2000/svg" width="760" height="360" viewBox="0 0 760 360">
                <defs>
                    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stop-color="#fffaf0"/>
                        <stop offset="1" stop-color="#eee3d2"/>
                    </linearGradient>
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#342e27" flood-opacity=".16"/>
                    </filter>
                    <style>
                        text { font-family: Arial, Helvetica, sans-serif; }
                        .weather-sun { fill: #e3a849; }
                        .weather-sun-rays { fill: none; stroke: #c27b32; stroke-linecap: round; stroke-width: 4; }
                        .weather-cloud { fill: #fffaf0; stroke: #9b795b; stroke-linejoin: round; stroke-width: 3; }
                        .weather-fog-lines, .weather-rain-drops, .weather-snowflakes { fill: none; stroke: #75808a; stroke-linecap: round; stroke-width: 4; }
                        .weather-lightning { fill: #d28a35; stroke: #a64f32; stroke-linejoin: round; stroke-width: 2; }
                    </style>
                </defs>
                <rect x="8" y="8" width="744" height="344" rx="24" fill="url(#paper)" stroke="#cdbca5" stroke-width="2" filter="url(#shadow)"/>
                <path d="M32 9h8v342h-8a24 24 0 0 1-24-24V33A24 24 0 0 1 32 9Z" fill="#a64f32"/>
                <text x="60" y="55" fill="#8a6748" font-size="14" font-weight="700" letter-spacing="2">${escapeXml(words.currentWeather)}</text>
                <text x="58" y="104" fill="#342e27" font-size="${cityFontSize}" font-weight="700">${escapedCity}</text>
                <text x="61" y="132" fill="#756b5f" font-size="15">${escapedRegion}</text>
                <text x="58" y="238" fill="#342e27" font-size="88" font-weight="600">${temperature}°C</text>
                <text x="330" y="188" fill="#574333" font-size="${conditionFontSize}" font-weight="700">${escapedCondition}</text>
                <text x="332" y="222" fill="#756b5f" font-size="16">${escapeXml(words.feelsLike)}  ${feelsLike}°C</text>
                <text x="332" y="250" fill="#756b5f" font-size="16">${escapeXml(words.wind)}  ${wind} km/h</text>
                <circle cx="610" cy="175" r="91" fill="#e8dfd1"/>
                <svg x="562" y="127" width="96" height="96" viewBox="0 0 96 96">${weatherIconMarkup(condition.icon)}</svg>
                <path d="M58 282h644" stroke="#d2c5b2" stroke-width="1.5"/>
                <text x="60" y="319" fill="#756b5f" font-size="13">${escapeXml(words.updatedAt)} ${escapeXml(time)}</text>
                <text x="700" y="319" fill="#8a6748" font-size="13" text-anchor="end">Open-Meteo · CC BY 4.0</text>
            </svg>`;
        const image = document.createElement("img");
        image.className = "weather-card-image";
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgImage)}`;
        image.alt = enAnglais()
            ? `Weather in ${cityLabel}: ${condition.label}, ${temperature} degrees Celsius, feels like ${feelsLike}, wind ${wind} kilometers per hour`
            : `Météo à ${cityLabel} : ${condition.label}, ${temperature} degrés Celsius, ressenti ${feelsLike}, vent ${wind} kilomètres par heure`;
        image.width = 760;
        image.height = 360;

        const article = document.createElement("article");
        article.className = "weather-card local-message";
        article.append(image);

        // Keep a clickable attribution alongside the credit drawn into the image
        const credit = document.createElement("a");
        credit.className = "weather-card-credit";
        credit.href = "https://open-meteo.com/";
        credit.target = "_blank";
        credit.rel = "noreferrer";
        credit.textContent = `${words.source} Open-Meteo · ${words.license}`;
        article.append(credit);
        return article;
    }

    // Keep every message inside a valid list item in the conversation thread
    function appendMessage(article) {
        const item = document.createElement("li");
        item.append(article);
        elements.messageList.append(item);
        item.scrollIntoView({ block: "nearest" });
    }

    // Add the card to the local thread using either the saved city or a command argument
    async function postWeatherCard(cityQuery = "") {
        let city = readSavedCity();
        const query = cityQuery.trim();

        if (query) {
            const matches = await searchCities(query);
            city = matches[0] || null;
            if (!city) {
                setStatus(strings().cityNotFound);
                return false;
            }
        }

        if (!city) {
            setStatus(strings().cityMissing);
            return false;
        }

        const weather = await getCurrentWeather(city);
        appendMessage(createWeatherCard(city, weather));
        setStatus(strings().cardPosted);
        return true;
    }

    // Let the compact button post the configured city's weather card immediately
    if (elements.weatherButton) {
        elements.weatherButton.addEventListener("click", async () => {
            elements.weatherButton.disabled = true;
            setStatus(strings().loading);

            try {
                await postWeatherCard();
            } catch (error) {
                setStatus(strings().weatherError);
            } finally {
                elements.weatherButton.disabled = false;
            }
        });
    }

    // Handle /meteo and /meteo city before treating the input as a regular message
    if (elements.messageForm) {
        elements.messageForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const message = elements.messageInput.value.trim();
            if (!message) {
                setStatus(strings().messageEmpty);
                return;
            }

            const weatherCommand = message.match(/^\/meteo(?:\s+(.+))?$/i);
            if (weatherCommand) {
                const sendButton = elements.messageForm.querySelector('button[type="submit"]');
                sendButton.disabled = true;
                setStatus(strings().loading);

                try {
                    const posted = await postWeatherCard(weatherCommand[1] || "");
                    if (posted) elements.messageInput.value = "";
                } catch (error) {
                    setStatus(strings().weatherError);
                } finally {
                    sendButton.disabled = false;
                }
                return;
            }

            const article = document.createElement("article");
            article.className = "local-message text-message";
            const heading = document.createElement("h3");
            const paragraph = document.createElement("p");
            heading.textContent = strings().me;
            paragraph.textContent = message;
            article.append(heading, paragraph);
            appendMessage(article);
            elements.messageInput.value = "";
            setStatus(strings().messagePosted);
        });
    }
})();
