import React, { useState } from "react";
import { fetchAiGearRecommendation } from "../../services/bookingApi";
import "./AiGearRecommendation.css";

const CATEGORY_ICONS = {
  "Bảo hộ":    "🛡️",
  "Quần áo":   "👕",
  "Cắm trại":  "⛺",
  "Kỹ thuật":  "🔧",
  "Y tế":      "💊",
  "Ăn uống":   "🍱",
  "Điện tử":   "🔋",
  "Điều hướng":"🗺️",
};

const getCategoryIcon = (category) => {
  if (!category) return "🎒";
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (category.includes(key)) return icon;
  }
  return "🎒";
};

/**
 * GearItemCard — hiển thị một trang bị được AI gợi ý.
 * Nếu isAvailableForRent = true → highlight với badge xanh.
 */
const GearItemCard = ({ item }) => {
  const isAvail = item.isAvailableForRent;

  return (
    <div className={`gear-item-card ${isAvail ? "gear-item--available" : ""}`}>
      {isAvail && (
        <div className="gear-avail-badge">
          <span>✓</span> Có thể thuê
        </div>
      )}

      <div className="gear-item-header">
        <span className="gear-category-icon">{getCategoryIcon(item.category)}</span>
        <div className="gear-item-info">
          <span className="gear-item-name">{item.name}</span>
          {item.category && (
            <span className="gear-item-category">{item.category}</span>
          )}
        </div>
      </div>

      <p className="gear-item-reason">{item.reason}</p>

      {isAvail && (
        <div className="gear-rental-info">
          {item.equipmentImageUrl && (
            <img
              src={item.equipmentImageUrl}
              alt={item.name}
              className="gear-rental-thumb"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
          <div className="gear-rental-meta">
            {item.pricePerDay && (
              <span className="gear-rental-price">💰 {item.pricePerDay}</span>
            )}
            <a
              href="/equipment"
              className="gear-rental-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Xem trang thiết bị →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * AiGearRecommendation — component gợi ý trang bị AI trong BookingDetail.
 * Props:
 *   - departureId: string (UUID)
 *   - weatherForecast: Array (để show context)
 */
const AiGearRecommendation = ({ departureId }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleGetRecommendation = async () => {
    if (!departureId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAiGearRecommendation(departureId);
      setRecommendation(data);
      setExpanded(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể lấy gợi ý AI lúc này.");
    } finally {
      setLoading(false);
    }
  };

  const highlightCount = recommendation
    ? [...(recommendation.essentials || []), ...(recommendation.recommended || [])]
        .filter((i) => i.isAvailableForRent).length
    : 0;

  return (
    <div className="ai-gear-wrapper">
      {/* ── Trigger card ────────────────────────────────── */}
      {!recommendation && (
        <div className="ai-trigger-card">
          <div className="ai-trigger-left">
            <div className="ai-trigger-icon">🤖</div>
            <div>
              <div className="ai-trigger-title">Gợi ý trang bị thông minh</div>
              <div className="ai-trigger-sub">
                AI phân tích thời tiết & địa hình để tư vấn nên mang theo gì
              </div>
            </div>
          </div>
          <button
            id="ai-gear-recommend-btn"
            onClick={handleGetRecommendation}
            disabled={loading || !departureId}
            className="ai-trigger-btn"
          >
            {loading ? (
              <span className="ai-trigger-loading">
                <span className="ai-dots"><span /><span /><span /></span>
                Đang phân tích...
              </span>
            ) : (
              <>✨ Gợi ý ngay</>
            )}
          </button>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────── */}
      {error && (
        <div className="ai-error-box">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={handleGetRecommendation} className="ai-retry-btn">Thử lại</button>
        </div>
      )}

      {/* ── Result panel ────────────────────────────────── */}
      {recommendation && (
        <div className="ai-result-panel">
          {/* Header */}
          <div className="ai-result-header">
            <div className="ai-result-header-left">
              <span className="ai-result-icon">🤖</span>
              <div>
                <div className="ai-result-title">Gợi ý trang bị AI</div>
                {recommendation.weatherSummary && (
                  <div className="ai-result-weather-ctx">
                    🌡️ {recommendation.weatherSummary}
                  </div>
                )}
              </div>
            </div>
            <div className="ai-result-header-right">
              {highlightCount > 0 && (
                <span className="ai-avail-count">
                  {highlightCount} món có sẵn để thuê
                </span>
              )}
              <button
                onClick={() => setExpanded((p) => !p)}
                className="ai-collapse-btn"
                aria-label="Toggle AI recommendation"
              >
                {expanded ? "▲" : "▼"}
              </button>
            </div>
          </div>

          {expanded && (
            <>
              {/* Overall advice */}
              {recommendation.overallAdvice && (
                <div className="ai-overall-advice">
                  <span>💡</span>
                  <p>{recommendation.overallAdvice}</p>
                </div>
              )}

              {/* Essentials section */}
              {recommendation.essentials?.length > 0 && (
                <div className="ai-gear-section">
                  <div className="ai-section-label ai-section-label--essential">
                    <span>⚡</span> Trang bị cần thiết
                    <span className="ai-section-count">{recommendation.essentials.length} món</span>
                  </div>
                  <div className="ai-gear-grid">
                    {recommendation.essentials.map((item, idx) => (
                      <GearItemCard key={`ess-${idx}`} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended section */}
              {recommendation.recommended?.length > 0 && (
                <div className="ai-gear-section">
                  <div className="ai-section-label ai-section-label--recommended">
                    <span>👍</span> Nên mang theo
                    <span className="ai-section-count">{recommendation.recommended.length} món</span>
                  </div>
                  <div className="ai-gear-grid">
                    {recommendation.recommended.map((item, idx) => (
                      <GearItemCard key={`rec-${idx}`} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              {recommendation.disclaimer && (
                <div className="ai-disclaimer">
                  <span>ℹ️</span>
                  <span>{recommendation.disclaimer}</span>
                </div>
              )}

              {/* Refresh button */}
              <div className="ai-refresh-row">
                <button
                  onClick={handleGetRecommendation}
                  disabled={loading}
                  className="ai-refresh-btn"
                >
                  {loading ? "Đang phân tích lại..." : "🔄 Phân tích lại"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AiGearRecommendation;
