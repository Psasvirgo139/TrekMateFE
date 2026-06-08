import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

const CreateTourModal = ({ show, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'EASY',
    durationDays: 1,
    durationNights: 0,
    startLocation: '',
    endLocation: '',
    status: 'DRAFT'
  });

  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setFormData({
        title: '',
        difficulty: 'EASY',
        durationDays: 1,
        durationNights: 0,
        startLocation: '',
        endLocation: '',
        status: 'DRAFT'
      });
      setValidated(false);
      setSaving(false);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error creating tour:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" className="rounded-3">
      <Modal.Header closeButton className="bg-dark text-white border-0 py-3 px-4" style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
        <Modal.Title className="fw-bold fs-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Create New Tour
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body className="p-4 bg-white">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-secondary small">Tour Title <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="text" 
              required 
              placeholder="e.g., Trekking Giang Troi Waterfall 2D1N"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="rounded-3 border-secondary-subtle"
              style={{ borderRadius: '8px' }}
            />
            <Form.Control.Feedback type="invalid">
              Please specify a tour title.
            </Form.Control.Feedback>
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary small">Difficulty Level</Form.Label>
                <Form.Select 
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="rounded-3 border-secondary-subtle"
                  style={{ borderRadius: '8px' }}
                >
                  <option value="EASY">Easy</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HARD">Hard</option>
                  <option value="EXPERT">Expert</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary small">Initial Status</Form.Label>
                <Form.Select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="rounded-3 border-secondary-subtle"
                  style={{ borderRadius: '8px' }}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary small">Duration Days <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="number" 
                  min="1" 
                  required
                  value={formData.durationDays}
                  onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value) || 1})}
                  className="rounded-3 border-secondary-subtle"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary small">Duration Nights <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="number" 
                  min="0" 
                  required
                  value={formData.durationNights}
                  onChange={(e) => setFormData({...formData, durationNights: parseInt(e.target.value) || 0})}
                  className="rounded-3 border-secondary-subtle"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label className="fw-semibold text-secondary small">Start Location</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="e.g., Da Nang City Center"
                  value={formData.startLocation}
                  onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
                  className="rounded-3 border-secondary-subtle"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary small">End Location</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="e.g., Hoa Ninh, Hoa Vang"
                  value={formData.endLocation}
                  onChange={(e) => setFormData({...formData, endLocation: e.target.value})}
                  className="rounded-3 border-secondary-subtle"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </Col>
          </Row>
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
            {saving ? 'Saving...' : 'Create & Edit Details'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateTourModal;
