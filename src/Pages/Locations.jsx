import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  Badge,
  Spinner,
  InputGroup
} from "react-bootstrap";
import Header from "../Components/Header";
import "./Locations.css";

// Import local images for page header & tour cards
import LocationsHeroBg from "../Images/hero-slider-3.webp";
import dest1 from "../Images/destination-1.webp";
import dest2 from "../Images/destination-2.webp";
import dest3 from "../Images/destination-3.webp";

const Locations = () => {
  // Query parameters state
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [durationRange, setDurationRange] = useState("");
  const [sort, setSort] = useState("avgRating,desc");
  const [page, setPage] = useState(0);
  const [size] = useState(6);

  // API response state
  const [tours, setTours] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal detail view state
  const [selectedTour, setSelectedTour] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch tours from backend
  const fetchTours = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());
      params.append("status", "ACTIVE"); // Default to ACTIVE tours for public view

      if (search.trim()) params.append("search", search);
      if (difficulty) params.append("difficulty", difficulty);
      if (sort) params.append("sort", sort);

      // Map duration range to minDuration & maxDuration
      if (durationRange === "short") {
        params.append("maxDuration", "2");
      } else if (durationRange === "medium") {
        params.append("minDuration", "3");
        params.append("maxDuration", "5");
      } else if (durationRange === "long") {
        params.append("minDuration", "6");
      }

      const response = await fetch(`http://localhost:8080/api/api/tours?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tours. Is the server running?");
      }

      const json = await response.json();
      if (json && json.status === 200 && json.data) {
        setTours(json.data.content || []);
        setTotalPages(json.data.totalPages || 0);
        setTotalElements(json.data.totalElements || 0);
      } else {
        throw new Error(json.message || "Invalid API response structure");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on parameters change
  useEffect(() => {
    fetchTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, difficulty, durationRange, sort]);

  // Handle Search submit/enter
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      setPage(0);
      fetchTours();
    }
  };

  const handleSearchBlur = () => {
    setPage(0);
    fetchTours();
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setDifficulty("");
    setDurationRange("");
    setSort("avgRating,desc");
    setPage(0);
  };

  // Helper to map tour slug to imported local webp image
  const getTourImage = (slug) => {
    if (slug === "fansipan-summit") return dest3;
    if (slug === "ta-nang-phan-dung") return dest2;
    if (slug === "ma-pi-leng-trek") return dest1;
    return dest1; // fallback
  };

  // Helper to format currency
  const formatPrice = (price) => {
    if (!price) return "Contact Us";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Helper to render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const rounded = Math.round(parseFloat(rating || 0));
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rounded ? "text-warning" : "text-muted"}>
          {i <= rounded ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  // Difficulty badge variant mapping
  const getDifficultyVariant = (diff) => {
    if (!diff) return "secondary";
    switch (diff.toUpperCase()) {
      case "EASY": return "success";
      case "MODERATE": return "warning";
      case "HARD": return "danger";
      case "EXTREME": return "dark";
      default: return "secondary";
    }
  };

  // Handle Tour click for detail modal
  const handleOpenDetail = (tour) => {
    setSelectedTour(tour);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTour(null);
  };

  return (
    <div className="locations-page">
      {/* Shared Header Component */}
      <Header
        bgImage={LocationsHeroBg}
        pageTitle="TrekMate Tours"
        subheading="CHINH PHỤC THỬ THÁCH — AN TOÀN TUYỆT ĐỐI"
        mainHeading="Danh Sách Các Tuyến Đường Trekking"
        description="Khám phá bộ sưu tập các cung đường trekking được thiết kế tỉ mỉ bằng React Bootstrap, đầy đủ lộ trình, dự báo thời tiết và hướng dẫn viên bản địa giàu kinh nghiệm."
        showDescription={true}
      />

      <Container className="my-5 py-3">
        {/* Controls Bar: Search, Filter, Sort */}
        <Card className="border-0 shadow-sm p-4 mb-4 control-card">
          <Row className="g-3">
            {/* Search Input */}
            <Col xs={12}>
              <InputGroup className="search-group">
                <InputGroup.Text className="bg-transparent border-end-0 text-muted">🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm tour theo tên, điểm xuất phát hoặc điểm kết thúc... (Nhấn Enter)"
                  className="border-start-0 ps-1"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  onBlur={handleSearchBlur}
                />
              </InputGroup>
            </Col>

            {/* Filters */}
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="filter-label-text">Mức Độ Khó</Form.Label>
                <Form.Select
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">Tất cả độ khó</option>
                  <option value="EASY">Easy (Dễ)</option>
                  <option value="MODERATE">Moderate (Vừa phải)</option>
                  <option value="HARD">Hard (Khó)</option>
                  <option value="EXTREME">Extreme (Mạo hiểm)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="filter-label-text">Thời Gian Đi</Form.Label>
                <Form.Select
                  value={durationRange}
                  onChange={(e) => {
                    setDurationRange(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">Tất cả thời gian</option>
                  <option value="short">Dưới 3 ngày</option>
                  <option value="medium">Từ 3 đến 5 ngày</option>
                  <option value="long">Trên 5 ngày</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="filter-label-text">Sắp Xếp Theo</Form.Label>
                <Form.Select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="avgRating,desc">Đánh giá cao nhất</option>
                  <option value="durationDays,asc">Thời gian ngắn nhất</option>
                  <option value="durationDays,desc">Thời gian dài nhất</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Reset Filter Button Row */}
          {(search || difficulty || durationRange || sort !== "avgRating,desc") && (
            <div className="d-flex justify-content-end mt-3">
              <Button variant="outline-danger" size="sm" onClick={handleResetFilters}>
                🔄 Xóa bộ lọc
              </Button>
            </div>
          )}
        </Card>

        {/* Active Badges */}
        {(difficulty || durationRange || search) && (
          <div className="d-flex flex-wrap gap-2 mb-4">
            {search && (
              <Badge bg="info" className="p-2 d-flex align-items-center gap-1 active-filter-badge">
                Từ khóa: "{search}"
                <span className="ms-1 cursor-pointer" onClick={() => { setSearch(""); setPage(0); setTimeout(fetchTours, 50); }}>×</span>
              </Badge>
            )}
            {difficulty && (
              <Badge bg={getDifficultyVariant(difficulty)} className="p-2 d-flex align-items-center gap-1 active-filter-badge">
                Độ khó: {difficulty}
                <span className="ms-1 cursor-pointer" onClick={() => { setDifficulty(""); setPage(0); }}>×</span>
              </Badge>
            )}
            {durationRange && (
              <Badge bg="secondary" className="p-2 d-flex align-items-center gap-1 active-filter-badge">
                Thời gian: {durationRange === "short" ? "< 3 ngày" : durationRange === "medium" ? "3 - 5 ngày" : "> 5 ngày"}
                <span className="ms-1 cursor-pointer" onClick={() => { setDurationRange(""); setPage(0); }}>×</span>
              </Badge>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-5 shadow-sm rounded-3 bg-white border">
            <div className="fs-1 mb-3">⚠️</div>
            <h3 className="text-danger fw-bold">Không thể kết nối máy chủ</h3>
            <p className="text-muted mb-4">{error}</p>
            <Button variant="warning" onClick={fetchTours} className="rounded-pill px-4">
              Thử lại
            </Button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && !error && (
          <div className="d-flex justify-content-center align-items-center py-5 my-5">
            <Spinner animation="border" variant="success" className="me-2" />
            <span className="fs-5 text-success font-weight-bold">Đang tải danh sách Tour...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tours.length === 0 && (
          <div className="text-center py-5 shadow-sm rounded-3 bg-white border">
            <div className="fs-1 mb-3">🔍</div>
            <h3 className="text-dark fw-bold">Không tìm thấy tour phù hợp</h3>
            <p className="text-muted mb-4">Hãy thử thay đổi từ khóa tìm kiếm hoặc các cài đặt lọc hiện tại của bạn.</p>
            <Button variant="warning" onClick={handleResetFilters} className="rounded-pill px-4">
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}

        {/* Tour Grid */}
        {!loading && !error && tours.length > 0 && (
          <>
            <Row className="g-4">
              {tours.map((tour) => (
                <Col key={tour.id} xs={12} md={6} lg={4}>
                  <Card className="h-100 border-0 shadow-sm tour-bootstrap-card">
                    {/* Tour Image Header */}
                    <div className="position-relative card-image-container">
                      <Card.Img
                        variant="top"
                        src={getTourImage(tour.slug)}
                        alt={tour.title}
                        className="tour-card-image"
                      />
                      <Badge
                        bg={getDifficultyVariant(tour.difficulty)}
                        className="position-absolute top-0 start-0 m-3 px-3 py-2 text-uppercase badge-difficulty"
                      >
                        {tour.difficulty}
                      </Badge>
                      <div className="price-tag-badge">
                        {tour.priceFrom ? formatPrice(tour.priceFrom) : "Liên hệ"}
                      </div>
                    </div>

                    {/* Card Body */}
                    <Card.Body className="d-flex flex-column p-4">
                      {/* Rating Row */}
                      <div className="d-flex align-items-center gap-1 mb-2">
                        <div className="me-1">{renderStars(tour.avgRating)}</div>
                        <span className="fw-bold text-dark small">{tour.avgRating ? parseFloat(tour.avgRating).toFixed(1) : "0.0"}</span>
                        <span className="text-muted small">({tour.totalReviews || 0} đánh giá)</span>
                      </div>

                      {/* Card Title */}
                      <Card.Title className="fw-bold mb-3 text-dark fs-5 card-main-title">
                        {tour.title}
                      </Card.Title>

                      {/* Quick Details Table */}
                      <Row className="g-2 text-muted small mb-3 border-bottom pb-3">
                        <Col xs={6} className="d-flex align-items-center gap-2">
                          <span>⏱️</span>
                          <span>{tour.durationDays} Ngày {tour.durationNights} Đêm</span>
                        </Col>
                        <Col xs={6} className="d-flex align-items-center gap-2">
                          <span>🏃</span>
                          <span>{tour.distanceKm} km</span>
                        </Col>
                        <Col xs={6} className="d-flex align-items-center gap-2">
                          <span>🏔️</span>
                          <span>Cực đại: {tour.maxElevationM}m</span>
                        </Col>
                        <Col xs={6} className="d-flex align-items-center gap-2">
                          <span>📍</span>
                          <span>{tour.startLocation?.split(",")[0]}</span>
                        </Col>
                      </Row>

                      {/* Highlights */}
                      {tour.highlights && tour.highlights.length > 0 && (
                        <div className="mb-4">
                          <div className="text-uppercase text-muted fw-bold small-label mb-2">Điểm Nổi Bật</div>
                          <ul className="list-unstyled d-flex flex-column gap-1 mb-0">
                            {tour.highlights.slice(0, 2).map((hl, idx) => (
                              <li key={idx} className="small text-dark d-flex align-items-start gap-2">
                                <span className="text-warning">✓</span>
                                <span>{hl}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top w-100">
                        {/* Availability */}
                        <div className="d-flex align-items-center gap-2">
                          <span className={`pulse-dot ${tour.upcomingDeparturesCount > 0 ? "active" : "inactive"}`}></span>
                          <span className="small fw-semibold text-muted">
                            {tour.upcomingDeparturesCount > 0
                              ? `${tour.upcomingDeparturesCount} chuyến sắp đi`
                              : "Chưa có lịch"}
                          </span>
                        </div>

                        {/* Trigger Modal */}
                        <Button
                          variant="success"
                          className="rounded-pill px-4 btn-detail-action"
                          onClick={() => handleOpenDetail(tour)}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                <Button
                  variant="outline-success"
                  className="rounded-circle d-flex align-items-center justify-content-center page-btn"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                >
                  ‹
                </Button>
                <span className="text-muted fw-bold">
                  Trang {page + 1} / {totalPages} (Tổng số: {totalElements} tour)
                </span>
                <Button
                  variant="outline-success"
                  className="rounded-circle d-flex align-items-center justify-content-center page-btn"
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page === totalPages - 1}
                >
                  ›
                </Button>
              </div>
            )}
          </>
        )}
      </Container>

      {/* Immersive Tour Detail Modal */}
      {selectedTour && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="tour-detail-modal">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold fs-4 text-success">{selectedTour.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            {/* Banner Image */}
            <div className="rounded-3 overflow-hidden mb-4 modal-image-wrapper">
              <img
                src={getTourImage(selectedTour.slug)}
                alt={selectedTour.title}
                className="w-100 object-fit-cover modal-image"
                height="320px"
              />
            </div>

            <Row className="g-4">
              {/* Tour Key Statistics */}
              <Col xs={12} md={7}>
                <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Thông Tin Hành Trình</h5>
                <Row className="g-3">
                  <Col xs={6}>
                    <div className="text-muted small">Thời Gian</div>
                    <div className="fw-bold text-dark">{selectedTour.durationDays} Ngày {selectedTour.durationNights} Đêm</div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-muted small">Độ Khó</div>
                    <div>
                      <Badge bg={getDifficultyVariant(selectedTour.difficulty)} className="text-uppercase px-3 py-1">
                        {selectedTour.difficulty}
                      </Badge>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-muted small">Quãng Đường</div>
                    <div className="fw-bold text-dark">{selectedTour.distanceKm} Kilometres</div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-muted small">Độ Cao Cực Đại</div>
                    <div className="fw-bold text-dark">{selectedTour.maxElevationM} Mét</div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-muted small">Điểm Xuất Phát</div>
                    <div className="fw-bold text-dark">{selectedTour.startLocation}</div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-muted small">Điểm Kết Thúc</div>
                    <div className="fw-bold text-dark">{selectedTour.endLocation}</div>
                  </Col>
                </Row>

                {/* Rating summary */}
                <div className="mt-4 p-3 bg-light rounded-3 d-flex align-items-center gap-3">
                  <div className="fs-1 fw-bold text-dark">{selectedTour.avgRating ? parseFloat(selectedTour.avgRating).toFixed(1) : "0.0"}</div>
                  <div>
                    <div>{renderStars(selectedTour.avgRating)}</div>
                    <div className="small text-muted">{selectedTour.totalReviews || 0} lượt đánh giá từ khách hàng</div>
                  </div>
                </div>
              </Col>

              {/* Highlights & Quick booking */}
              <Col xs={12} md={5}>
                <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Điểm Nổi Bật</h5>
                {selectedTour.highlights && selectedTour.highlights.length > 0 ? (
                  <ul className="d-flex flex-column gap-2 ps-3 mb-4 text-dark small">
                    {selectedTour.highlights.map((hl, index) => (
                      <li key={index} className="lh-base">
                        {hl}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted small mb-4">Đang cập nhật các điểm nổi bật...</p>
                )}

                {/* Price and Action */}
                <Card className="border-0 bg-success bg-opacity-10 p-3 rounded-3 mt-3">
                  <div className="small text-muted mb-1">Giá Tour Khởi Điểm</div>
                  <div className="fs-4 fw-bold text-success mb-2">
                    {selectedTour.priceFrom ? formatPrice(selectedTour.priceFrom) : "Liên Hệ Trực Tiếp"}
                  </div>
                  <div className="small text-muted mb-3">
                    {selectedTour.upcomingDeparturesCount > 0
                      ? `Hiện có ${selectedTour.upcomingDeparturesCount} lịch khởi hành đang mở đăng ký.`
                      : "Chưa có lịch khởi hành sắp tới."}
                  </div>
                  <Button variant="success" className="w-100 rounded-pill fw-bold" onClick={handleCloseModal}>
                    Yêu Cầu Đặt Chuyến
                  </Button>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="secondary" className="rounded-pill px-4" onClick={handleCloseModal}>
              Đóng lại
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Locations;