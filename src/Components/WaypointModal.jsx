import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

const WaypointModal = ({ show, onClose, onSave, waypoint = null, totalWaypoints = 0 }) => {
  const [formData, setFormData] = useState({
    name: '',
    sequenceOrder: 1,
    waypointType: 'CAMP',
    lat: '',
    lng: '',
    elevationM: '',
    description: '',
    hasToilet: false,
    hasShelter: false,
    hasPhoneSignal: false,
    hasFirstAid: false,
    waterSource: ''
  });

  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      if (waypoint) {
        setFormData({
          name: waypoint.name || '',
          sequenceOrder: waypoint.sequenceOrder || 1,
          waypointType: waypoint.waypointType || 'CAMP',
          lat: waypoint.lat !== null && waypoint.lat !== undefined ? waypoint.lat : '',
          lng: waypoint.lng !== null && waypoint.lng !== undefined ? waypoint.lng : '',
          elevationM: waypoint.elevationM !== null && waypoint.elevationM !== undefined ? waypoint.elevationM : '',
          description: waypoint.description || '',
          hasToilet: !!waypoint.hasToilet,
          hasShelter: !!waypoint.hasShelter,
          hasPhoneSignal: !!waypoint.hasPhoneSignal,
          hasFirstAid: !!waypoint.hasFirstAid,
          waterSource: waypoint.waterSource || ''
        });
      } else {
        setFormData({
          name: '',
          sequenceOrder: totalWaypoints + 1,
          waypointType: 'CAMP',
          lat: '',
          lng: '',
          elevationM: '',
          description: '',
          hasToilet: false,
          hasShelter: false,
          hasPhoneSignal: false,
          hasFirstAid: false,
          waterSource: ''
        });
      }
      setValidated(false);
      setSaving(false);
    }
  }, [show, waypoint, totalWaypoints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      sequenceOrder: parseInt(formData.sequenceOrder),
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lng: formData.lng ? parseFloat(formData.lng) : null,
      elevationM: formData.elevationM ? parseInt(formData.elevationM) : null
    };

    try {
      await onSave(payload);
    } catch (error) {
      console.error("Error saving waypoint:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="bg-dark text-white border-0 py-3 px-4" style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
        <Modal.Title className="fw-bold fs-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {waypoint ? 'Edit Waypoint' : 'Add Waypoint'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body className="p-4 bg-white">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-secondary small">Waypoint Name <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="text" 
              required 
              placeholder="e.g., Camp Site Black Stone"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ borderRadius: '8px' }}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a waypoint name.
            </Form.Control.Feedback>
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary small">Sequence Order <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="number" 
                  min="1" 
                  required
                  value={formData.sequenceOrder}
                  onChange={(e) => setFormData({...formData, sequenceOrder: e.target.value})}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary small">Waypoint Type</Form.Label>
                <Form.Select
                  value={formData.waypointType}
                  onChange={(e) => setFormData({...formData, waypointType: e.target.value})}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="START">START</option>
                  <option value="END">END</option>
                  <option value="CAMP">CAMP</option>
                  <option value="VIEWPOINT">VIEWPOINT</option>
                  <option value="REST_STOP">REST STOP</option>
                  <option value="WATER_SOURCE">WATER SOURCE</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-secondary small">Description / Activity Notes</Form.Label>
            <Form.Control 
              as="textarea"
              rows={3}
              placeholder="Provide a brief description about activities or safety here..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary small">Elevation (meters)</Form.Label>
                <Form.Control 
                  type="number" 
                  placeholder="e.g., 350"
                  value={formData.elevationM}
                  onChange={(e) => setFormData({...formData, elevationM: e.target.value})}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary small">Latitude</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.000001"
                  placeholder="e.g., 16.0245"
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: e.target.value})}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary small">Longitude</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.000001"
                  placeholder="e.g., 108.0125"
                  value={formData.lng}
                  onChange={(e) => setFormData({...formData, lng: e.target.value})}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold text-secondary small">Water Source Info</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="e.g., Natural stream / Bottles provided..."
              value={formData.waterSource}
              onChange={(e) => setFormData({...formData, waterSource: e.target.value})}
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="fw-semibold text-secondary small mb-2">Amenities & Safety Checklist</Form.Label>
            <Row className="gy-2">
              <Col xs={6}>
                <Form.Check 
                  type="checkbox"
                  id="hasToilet-cb-en"
                  label="🚽 Toilet available"
                  checked={formData.hasToilet}
                  onChange={(e) => setFormData({...formData, hasToilet: e.target.checked})}
                  className="fw-medium text-dark small"
                />
              </Col>
              <Col xs={6}>
                <Form.Check 
                  type="checkbox"
                  id="hasShelter-cb-en"
                  label="🛖 Rain shelter available"
                  checked={formData.hasShelter}
                  onChange={(e) => setFormData({...formData, hasShelter: e.target.checked})}
                  className="fw-medium text-dark small"
                />
              </Col>
              <Col xs={6}>
                <Form.Check 
                  type="checkbox"
                  id="hasPhoneSignal-cb-en"
                  label="📶 Mobile signal available"
                  checked={formData.hasPhoneSignal}
                  onChange={(e) => setFormData({...formData, hasPhoneSignal: e.target.checked})}
                  className="fw-medium text-dark small"
                />
              </Col>
              <Col xs={6}>
                <Form.Check 
                  type="checkbox"
                  id="hasFirstAid-cb-en"
                  label="🩺 First aid kit available"
                  checked={formData.hasFirstAid}
                  onChange={(e) => setFormData({...formData, hasFirstAid: e.target.checked})}
                  className="fw-medium text-dark small"
                />
              </Col>
            </Row>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="bg-light p-3 border-0" style={{ borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
          <Button variant="secondary" onClick={onClose} disabled={saving} className="fw-semibold px-4 py-2" style={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saving}
            className="fw-bold px-4 py-2 border-0"
            style={{ backgroundColor: '#012d1d', borderRadius: '8px' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default WaypointModal;
