/**
 * Weather & UV Service for Regensburg Innenstadt (93047)
 * Coordinates: Lat 49.0134° N, Lon 12.1016° E
 * Integrates Open-Meteo Historical Archive (2016-2026) & Realtime Forecast
 */

const REGENSBURG_COORDS = {
  lat: 49.0134,
  lon: 12.1016,
  name: '93047 Regensburg Innenstadt'
};

// WMO Weather Interpretation Codes (German translation & Icons)
const WMO_WEATHER_CODES = {
  0: { desc: 'Klarer Himmel / Sonnig', icon: '☀️' },
  1: { desc: 'Hauptsächlich sonnig', icon: '🌤️' },
  2: { desc: 'Teilweise bewölkt', icon: '⛅' },
  3: { desc: 'Bedeckt', icon: '☁️' },
  45: { desc: 'Nebel', icon: '🌫️' },
  48: { desc: 'Raureif-Nebel', icon: '🌫️' },
  51: { desc: 'Leichter Nieselregen', icon: '🌦️' },
  53: { desc: 'Mäßiger Nieselregen', icon: '🌦️' },
  55: { desc: 'Dichter Nieselregen', icon: '🌧️' },
  61: { desc: 'Leichter Regen', icon: '🌧️' },
  63: { desc: 'Mäßiger Regen', icon: '🌧️' },
  65: { desc: 'Starker Regen', icon: '🌧️' },
  71: { desc: 'Leichter Schneefall', icon: '🌨️' },
  73: { desc: 'Mäßiger Schneefall', icon: '🌨️' },
  75: { desc: 'Starker Schneefall', icon: '❄️' },
  77: { desc: 'Schneegriesel', icon: '❄️' },
  80: { desc: 'Leichte Regenschauer', icon: '🌦️' },
  81: { desc: 'Mäßige Regenschauer', icon: '🌧️' },
  82: { desc: 'Heftige Regenschauer', icon: '⛈️' },
  85: { desc: 'Leichte Schneeschauer', icon: '🌨️' },
  86: { desc: 'Starke Schneeschauer', icon: '❄️' },
  95: { desc: 'Gewitter', icon: '⛈️' },
  96: { desc: 'Gewitter mit leichtem Hagel', icon: '⛈️' },
  99: { desc: 'Gewitter mit schwerem Hagel', icon: '⛈️' }
};

class WeatherService {
  constructor() {
    this.cache = new Map();
  }

  // Get Weather for specific Date (YYYY-MM-DD) for Regensburg 93047
  async getWeatherForDate(dateString) {
    if (!dateString) return null;

    // 1. Check in-memory cache
    if (this.cache.has(dateString)) {
      return this.cache.get(dateString);
    }

    // 2. Check IndexedDB persistent cache
    try {
      if (window.symptomDB) {
        const cached = await window.symptomDB.getCachedWeather(dateString);
        if (cached) {
          this.cache.set(dateString, cached);
          return cached;
        }
      }
    } catch (err) {
      console.warn('DB Cache read error:', err);
    }

    // 3. Fetch from Open-Meteo API
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const isHistorical = dateString < todayStr;
      
      let apiUrl = '';
      if (isHistorical) {
        // Historical Archive API (supports 2016-01-01 to present)
        apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${REGENSBURG_COORDS.lat}&longitude=${REGENSBURG_COORDS.lon}&start_date=${dateString}&end_date=${dateString}&daily=weathercode,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,uv_index_max,windspeed_10m_max,surface_pressure_mean&timezone=Europe%2FBerlin`;
      } else {
        // Forecast / Today API
        apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${REGENSBURG_COORDS.lat}&longitude=${REGENSBURG_COORDS.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,windspeed_10m_max,surface_pressure_mean&current_weather=true&timezone=Europe%2FBerlin`;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Weather API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const weatherData = this.parseWeatherData(data, dateString);

      // Save to cache
      this.cache.set(dateString, weatherData);
      if (window.symptomDB) {
        await window.symptomDB.cacheWeather(dateString, weatherData);
      }

      return weatherData;
    } catch (error) {
      console.error('Failed to fetch weather data for', dateString, error);
      // Fallback estimated data if offline
      return this.getFallbackWeather(dateString);
    }
  }

  parseWeatherData(apiData, dateString) {
    if (!apiData || !apiData.daily) {
      return this.getFallbackWeather(dateString);
    }

    const d = apiData.daily;
    const index = (d.time || []).indexOf(dateString) >= 0 ? d.time.indexOf(dateString) : 0;

    const code = d.weathercode ? d.weathercode[index] : 0;
    const wmo = WMO_WEATHER_CODES[code] || { desc: 'Heiter', icon: '🌤️' };

    const tempMax = d.temperature_2m_max ? Math.round(d.temperature_2m_max[index] * 10) / 10 : 20;
    const tempMin = d.temperature_2m_min ? Math.round(d.temperature_2m_min[index] * 10) / 10 : 10;
    const tempMean = d.temperature_2m_mean ? Math.round(d.temperature_2m_mean[index] * 10) / 10 : Math.round((tempMax + tempMin) / 2);
    
    // UV-Index
    const uvMax = d.uv_index_max ? Math.round(d.uv_index_max[index] * 10) / 10 : 3.0;
    const uvInfo = this.getUvClassification(uvMax);

    // Pressure (hPa)
    const pressure = d.surface_pressure_mean ? Math.round(d.surface_pressure_mean[index]) : 1015;

    // Rain / Precipitation
    const rain = d.precipitation_sum ? Math.round(d.precipitation_sum[index] * 10) / 10 : 0;

    // Wind speed
    const wind = d.windspeed_10m_max ? Math.round(d.windspeed_10m_max[index]) : 12;

    return {
      date: dateString,
      location: '93047 Regensburg',
      weatherCode: code,
      condition: wmo.desc,
      icon: wmo.icon,
      tempMax,
      tempMin,
      tempMean,
      uvIndex: uvMax,
      uvLevel: uvInfo.level,
      uvLabel: uvInfo.label,
      uvClass: uvInfo.className,
      pressure,
      rain,
      wind
    };
  }

  getUvClassification(uv) {
    if (uv < 3) {
      return { level: 'Niedrig', label: 'Kein Schutz nötig', className: 'uv-low' };
    } else if (uv < 6) {
      return { level: 'Mäßig', label: 'Sonnenschutz ratsam', className: 'uv-moderate' };
    } else if (uv < 8) {
      return { level: 'Hoch', label: 'Sonnenschutz erforderlich', className: 'uv-high' };
    } else if (uv < 11) {
      return { level: 'Sehr hoch', label: 'Aufenthalt im Schatten!', className: 'uv-veryhigh' };
    } else {
      return { level: 'Extrem', label: 'Mittagssonne meiden!', className: 'uv-extreme' };
    }
  }

  getFallbackWeather(dateString) {
    const month = parseInt(dateString.split('-')[1], 10) || 6;
    // Estimated average weather for Regensburg by month
    const avgTemps = [1, 3, 7, 12, 16, 20, 22, 21, 16, 11, 5, 2];
    const avgUvs = [1, 2, 3, 5, 7, 8, 8, 7, 5, 3, 1, 1];

    const temp = avgTemps[month - 1] || 15;
    const uv = avgUvs[month - 1] || 4.5;
    const uvInfo = this.getUvClassification(uv);

    return {
      date: dateString,
      location: '93047 Regensburg (Offline)',
      weatherCode: 1,
      condition: 'Sonnig / Wechselnd',
      icon: '⛅',
      tempMax: temp + 4,
      tempMin: temp - 4,
      tempMean: temp,
      uvIndex: uv,
      uvLevel: uvInfo.level,
      uvLabel: uvInfo.label,
      uvClass: uvInfo.className,
      pressure: 1015,
      rain: 0,
      wind: 10
    };
  }
}

window.weatherService = new WeatherService();
