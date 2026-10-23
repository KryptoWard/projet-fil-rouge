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
            cardPosted: "Carte météo envoyée.",
            messagePosted: "Message envoyé.",
            messageError:
                "Le message n’a pas pu être enregistré. Réessaie lorsque la connexion sera rétablie.",
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
            cardPosted: "Weather card sent.",
            messagePosted: "Message sent.",
            messageError:
                "The message could not be saved. Try again when the connection is restored.",
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
        elements.cityForm.addEventListener("submit", async event => {
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
                cities.forEach(city => {
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

    // Native SVG images also load when the HTML is opened directly
    function svgElement(tag, attributes, text) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function createWeatherCard(city, weather) {
        const words = strings();
        const condition = describeWeather(weather.weather_code);
        const cityLabel = cityName(city);
        const temperature = Math.round(weather.temperature_2m);
        const feelsLike = Math.round(weather.apparent_temperature);
        const wind = Math.round(weather.wind_speed_10m);
        const description = enAnglais()
            ? `Weather in ${cityLabel}: ${condition.label}, ${temperature} degrees Celsius, feels like ${feelsLike}, wind ${wind} kilometers per hour`
            : `Météo à ${cityLabel} : ${condition.label}, ${temperature} degrés Celsius, ressenti ${feelsLike}, vent ${wind} kilomètres par heure`;
        const image = svgElement("svg", {
            viewBox: "0 0 760 360", width: 760, height: 360,
            class: "weather-card-image", role: "img", "aria-label": description,
            "font-family": "Arial, Helvetica, sans-serif"
        });
        image.append(svgElement("image", {
            href: "src/assets/svg/fond-carte-meteo.svg", width: 760, height: 360
        }));

        // Keep the original drawing and safely insert the live values as text
        const labels = [
            [60, 55, 14, "#8a6748", 700, words.currentWeather],
            [58, 104, city.name.length > 25 ? 28 : city.name.length > 18 ? 32 : 36, "#342e27", 700, city.name],
            [61, 132, 15, "#756b5f", 400, [city.admin1, city.country].filter(Boolean).join(", ")],
            [58, 238, 88, "#342e27", 600, `${temperature}°C`],
            [330, 188, condition.label.length > 18 ? 18 : 22, "#574333", 700, condition.label],
            [332, 222, 16, "#756b5f", 400, `${words.feelsLike}  ${feelsLike}°C`],
            [332, 250, 16, "#756b5f", 400, `${words.wind}  ${wind} km/h`],
            [60, 319, 13, "#756b5f", 400, `${words.updatedAt} ${weather.time?.split("T")[1] || ""}`]
        ];
        labels.forEach(([x, y, size, fill, weight, text], index) => {
            image.append(svgElement("text", {
                x, y, fill, "font-size": size, "font-weight": weight,
                "letter-spacing": index === 0 ? 2 : 0
            }, text));
        });
        image.append(svgElement("image", {
            href: `src/assets/svg/meteo-${condition.icon}.svg`,
            x: 562, y: 127, width: 96, height: 96
        }));

        const article = document.createElement("article");
        article.className = "weather-card";
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

    // Persist structured weather snapshots and render them without external image URLs.
    window.weatherCards = {
        render: createWeatherCard,
        valid(snapshot) {
            if (
                !snapshot ||
                typeof snapshot.city?.name !== "string" ||
                !snapshot.city.name.length ||
                snapshot.city.name.length > 120
            )
                return false;
            if (
                ![snapshot.city.admin1, snapshot.city.country].every(
                    value => value == null || (typeof value === "string" && value.length <= 120)
                )
            )
                return false;
            const weather = snapshot.weather;
            return (
                weather &&
                ["temperature_2m", "apparent_temperature", "wind_speed_10m", "weather_code"].every(
                    key => Number.isFinite(weather[key])
                ) &&
                (weather.time == null ||
                    (typeof weather.time === "string" && weather.time.length <= 40))
            );
        }
    };

    function busy(button, value) {
        button.dataset.busy = String(value);
        button.disabled = value || !window.conversationView?.ready;
    }

    // Save the current weather in the channel selected before the request began

    async function postWeatherCard(cityQuery = "", channelId = window.conversationView?.activeId) {
        let city = readSavedCity();
        const query = cityQuery.trim();

        if (query) {
            const matches = await searchCities(query);
            city = matches[0] || null;
            if (!city) {
                if (window.conversationView?.activeId === channelId)
                    setStatus(strings().cityNotFound);
                return false;
            }
        }

        if (!city) {
            setStatus(strings().cityMissing);
            return false;
        }

        const weather = await getCurrentWeather(city);
        const snapshot = {
            city: { name: city.name, admin1: city.admin1, country: city.country },
            weather: {
                temperature_2m: weather.temperature_2m,
                apparent_temperature: weather.apparent_temperature,
                wind_speed_10m: weather.wind_speed_10m,
                weather_code: weather.weather_code,
                time: weather.time
            }
        };
        if (!window.weatherCards.valid(snapshot)) throw new Error("Invalid weather snapshot");
        await window.conversationView.send(
            { kind: "weather", body: null, weather: snapshot },
            channelId
        );
        if (!window.conversationView || window.conversationView.activeId === channelId)
            setStatus(strings().cardPosted);
        return true;
    }

    // Let the compact button post the configured city's weather card immediately
    if (elements.weatherButton) {
        elements.weatherButton.addEventListener("click", async () => {
            if (!window.conversationView?.ready || elements.weatherButton.dataset.busy === "true")
                return;
            const channelId = window.conversationView?.activeId;
            busy(elements.weatherButton, true);
            setStatus(strings().loading);

            try {
                await postWeatherCard("", channelId);
            } catch (error) {
                if (window.conversationView?.activeId === channelId)
                    setStatus(strings().messageError);
            } finally {
                busy(elements.weatherButton, false);
            }
        });
    }

    // Handle /meteo and /meteo city before treating the input as a regular message
    if (elements.messageForm) {
        // Enter sends the message, while Shift + Enter keeps a new line
        elements.messageInput.addEventListener("keydown", event => {
            if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;

            event.preventDefault();
            if (event.repeat) return;

            const sendButton = elements.messageForm.querySelector('button[type="submit"]');
            if (!window.conversationView?.ready || sendButton.disabled) return;

            elements.messageForm.requestSubmit(sendButton);
        });

        elements.messageForm.addEventListener("submit", async event => {
            event.preventDefault();
            if (!window.conversationView?.ready) return;
            const sendButton = elements.messageForm.querySelector('button[type="submit"]');
            if (sendButton.dataset.busy === "true") return;
            const channelId = window.conversationView?.activeId;
            const originalInput = elements.messageInput.value;
            const message = originalInput.trim();
            if (!message) {
                setStatus(strings().messageEmpty);
                return;
            }

            const gifCommand = message.match(/^\/gif(?:\s+(.+))?$/i);
            if (gifCommand) {
                if (window.chatGifs?.open(gifCommand[1] || "", channelId)) {
                    window.conversationView.clearDraft(channelId, originalInput);
                }
                return;
            }

            if (/^\/cat$/i.test(message)) {
                busy(sendButton, true);
                try {
                    const posted = await window.chatCats.send(channelId);
                    if (posted) window.conversationView.clearDraft(channelId, originalInput);
                } catch {
                    if (window.conversationView.activeId === channelId)
                        setStatus(strings().messageError);
                } finally {
                    busy(sendButton, false);
                }
                return;
            }

            const weatherCommand = message.match(/^\/meteo(?:\s+(.+))?$/i);
            if (weatherCommand) {
                busy(sendButton, true);
                setStatus(strings().loading);

                try {
                    const posted = await postWeatherCard(weatherCommand[1] || "", channelId);
                    if (posted) {
                        if (window.conversationView)
                            window.conversationView.clearDraft(channelId, originalInput);
                        else if (elements.messageInput.value === originalInput)
                            elements.messageInput.value = "";
                    }
                } catch (error) {
                    if (window.conversationView?.activeId === channelId)
                        setStatus(strings().messageError);
                } finally {
                    busy(sendButton, false);
                }
                return;
            }

            busy(sendButton, true);
            try {
                await window.conversationView.send(
                    { kind: "text", body: message, weather: null },
                    channelId
                );
                window.conversationView.clearDraft(channelId, originalInput);
                if (window.conversationView.activeId === channelId)
                    setStatus(strings().messagePosted);
            } catch (error) {
                if (window.conversationView.activeId === channelId)
                    setStatus(strings().messageError);
            } finally {
                busy(sendButton, false);
            }
        });
    }
})();
