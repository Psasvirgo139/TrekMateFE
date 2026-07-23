import React, { useMemo } from "react";
import "./WeatherForecast.css";

const WARNING_LABELS = {
  DANGER:  { emoji: "🔴", label: "Danger" },
  WARNING: { emoji: "🟠", label: "Warning" },
  CAUTION: { emoji: "🟡", label: "Caution" },
  INFO:    { emoji: "🟢", label: "Normal" },
};

// Map icon slug từ backend sang emoji
const WEATHER_ICON_MAP = {
  "sunny":          "☀️",
  "mostly-sunny":   "🌤️",
  "partly-cloudy":  "⛅",
  "cloudy":         "☁️",
  "foggy":          "🌫️",
  "drizzle":        "🌦️",
  "rainy":          "🌧️",
  "snowy":          "❄️",
  "showers":        "🌦️",
  "thunderstorm":   "⛈️",
};

const getWeatherEmoji = (icon) => WEATHER_ICON_MAP[icon] || "🌡️";

const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  // forecastDate từ backend là LocalDate: "2026-07-26" — parse trực tiếp không qua Date()
  const parts = String(dateStr).split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};


/**
 * WeatherForecast — hiển thị dự báo thời tiết từng ngày trong BookingDetail.
 * Props:
 *   - weatherForecast: Array<WeatherDayResponse> | undefined
 *   - departureDate: string (ISO date)
 *   - returnDate: string (ISO date)
 *   - loading: boolean
 */
const WeatherForecast = ({ weatherForecast, departureDate, returnDate, loading }) => {
  // Tìm ngày có warning level cao nhất để hiển thị banner
  const topWarning = useMemo(() => {
    if (!weatherForecast?.length) return null;
    const priority = { DANGER: 4, WARNING: 3, CAUTION: 2, INFO: 1 };
    const top = weatherForecast.reduce((best, day) => {
      const lvl = day.warningLevel || "INFO";
      if ((priority[lvl] || 0) > (priority[best?.warningLevel || "INFO"] || 0)) return day;
      return best;
    }, null);
    return top?.warningLevel !== "INFO" ? top : null;
  }, [weatherForecast]);

  const isOutOfRange = !loading && (!weatherForecast || weatherForecast.length === 0);

  return (
    <div className="weather-card">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="weather-header">
        <div className="weather-header-left">
          <span className="weather-header-icon">🌤️</span>
          <div>
            <div className="weather-header-title">Weather forecast</div>
            <div className="weather-header-subtitle">
              {departureDate && returnDate
                ? `${formatShortDate(departureDate)} – ${formatShortDate(returnDate)}`
                : "According to departure date"
              }
              &nbsp;· Open-Meteo
            </div>
          </div>
        </div>
        {isOutOfRange && (
          <div className="weather-out-of-range">
            <span>📅</span>
            <span>Beyond 16 days forecast</span>
          </div>
        )}
      </div>

      {/* ── Loading ──────────────────────────────────────── */}
      {loading && (
        <div className="weather-loading">
          <div className="weather-spinner" />
          <span>Loading weather forecast...</span>
        </div>
      )}

      {/* ── Empty / Out of range ─────────────────────────── */}
      {!loading && isOutOfRange && (
        <div className="weather-empty">
          <span className="weather-empty-icon">🌡️</span>
          <span className="weather-empty-text">No weather data</span>
          <span className="weather-empty-sub">
            Forecasts are updated automatically every night. Trips within 16 days will have data after the next update.
          </span>
        </div>
      )}

      {/* ── Day cards ────────────────────────────────────── */}
      {!loading && weatherForecast?.length > 0 && (
        <div className="weather-scroll-track">
          {weatherForecast.map((day) => {
            const warnLevel = day.warningLevel || "INFO";
            return (
              <div
                key={day.dayNumber}
                className={`weather-day-card warn-${warnLevel}`}
              >
                {/* Warning dot */}
                {warnLevel !== "INFO" && (
                  <span className={`weather-warning-dot warn-${warnLevel}`} />
                )}

                <span className="weather-day-label">Day {day.dayNumber}</span>
                <span className="weather-day-date">{formatShortDate(day.forecastDate)}</span>

                <span className="weather-day-icon">{getWeatherEmoji(day.weatherIcon)}</span>
                <span className="weather-day-summary">{day.weatherSummary || "—"}</span>

                {/* Temp */}
                <div className="weather-day-temp">
                  <span className="weather-temp-max">
                    {day.tempMaxC != null ? `${day.tempMaxC}°` : "—"}
                  </span>
                  <span className="weather-temp-min">
                    {day.tempMinC != null ? `${day.tempMinC}°` : ""}
                  </span>
                </div>

                {/* Details: rain prob + wind */}
                <div className="weather-day-details">
                  {day.precipitationProb != null && (
                    <span className="weather-detail-chip">
                      💧{day.precipitationProb}%
                    </span>
                  )}
                  {day.windSpeedKmh != null && (
                    <span className="weather-detail-chip">
                      💨{day.windSpeedKmh}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Warning banner ───────────────────────────────── */}
      {!loading && topWarning && (
        <div className={`weather-warning-banner warn-${topWarning.warningLevel}`}>
          <span>{WARNING_LABELS[topWarning.warningLevel]?.emoji}</span>
          <span>
            <strong>{WARNING_LABELS[topWarning.warningLevel]?.label}:</strong>{" "}
            {topWarning.weatherWarning}
          </span>
        </div>
      )}
    </div>
  );
};

export default WeatherForecast;
