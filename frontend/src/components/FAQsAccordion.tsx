import React, { useState } from 'react';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { faqAPI } from '../services/api';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string | null;
  display_order?: number;
  is_active?: boolean;
}

interface FAQsAccordionProps {
  faqs: FAQ[];
  containerStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  canManage?: boolean;
  onFaqsUpdated?: (faqs: FAQ[]) => void;
}

export default function FAQsAccordion({ faqs, containerStyle, titleStyle, canManage = false, onFaqsUpdated }: FAQsAccordionProps) {
  const layout = useResponsiveLayout();
  const isMobileView = layout.isMobile;
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [localFaqs, setLocalFaqs] = useState<FAQ[]>(faqs);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [modalFaqId, setModalFaqId] = useState<number | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: '', display_order: 0, is_active: true });

  React.useEffect(() => {
    setLocalFaqs(faqs);
  }, [faqs]);

  const publishFaqs = (nextFaqs: FAQ[]) => {
    setLocalFaqs(nextFaqs);
    onFaqsUpdated && onFaqsUpdated(nextFaqs);
  };

  const resetFaqForm = () => {
    setFaqForm({ question: '', answer: '', category: '', display_order: 0, is_active: true });
    setModalMode(null);
    setModalFaqId(null);
    setErrorMessage(null);
    setIsFaqModalOpen(false);
  };

  const openCreateModal = () => {
    const nextDisplayOrder = Math.max(0, ...localFaqs.map((faq) => faq.display_order ?? 0)) + 1;
    setFaqForm({ question: '', answer: '', category: '', display_order: nextDisplayOrder, is_active: true });
    setModalMode('create');
    setModalFaqId(null);
    setErrorMessage(null);
    setIsFaqModalOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      display_order: faq.display_order ?? 0,
      is_active: faq.is_active ?? true
    });
    setModalMode('edit');
    setModalFaqId(faq.id);
    setErrorMessage(null);
    setIsFaqModalOpen(true);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toSortedFaqs = (items: FAQ[]) => {
    return [...items].sort((a, b) => {
      const orderA = a.display_order ?? 0;
      const orderB = b.display_order ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.id - b.id;
    });
  };

  const handleCreateFAQ = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      setErrorMessage('Please fill in both question and answer.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await faqAPI.createFAQ({
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        category: faqForm.category.trim() || null,
        display_order: faqForm.display_order,
        is_active: faqForm.is_active
      });
      const created = res.data as FAQ;
      publishFaqs(toSortedFaqs([...localFaqs, created]));
      resetFaqForm();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : 'Unable to create FAQ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFAQ = async (faqId: number) => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      setErrorMessage('Please fill in both question and answer.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await faqAPI.updateFAQ(faqId, {
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        category: faqForm.category.trim() || null,
        display_order: faqForm.display_order,
        is_active: faqForm.is_active
      });
      const updated = res.data as FAQ;
      publishFaqs(toSortedFaqs(localFaqs.map((faq) => (faq.id === faqId ? updated : faq))));
      resetFaqForm();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : 'Unable to update FAQ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFAQ = async (faqId: number) => {
    if (!window.confirm('Delete this FAQ?')) {
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await faqAPI.deleteFAQ(faqId);
      publishFaqs(localFaqs.filter((faq) => faq.id !== faqId));
      if (expandedId === faqId) {
        setExpandedId(null);
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : 'Unable to delete FAQ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ margin: 0, marginBottom: isMobileView ? 12 : 18, marginTop: isMobileView ? 0 : -10, color: '#2b2b2b', fontSize: isMobileView ? 24 : 32, fontWeight: 600, textAlign: 'center', ...titleStyle }}>
        Frequently Asked Questions
      </h2>

      {canManage && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <button
            onClick={openCreateModal}
            style={{ border: 'none', borderRadius: 10, background: '#4960ac', color: '#fff', padding: '10px 16px', cursor: 'pointer', fontWeight: 600 }}
          >
            Add FAQ
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {localFaqs.length === 0 ? (
          <p style={{ color: '#6277ac', marginTop: 16 }}>No FAQs available</p>
        ) : (
          localFaqs.map((faq) => (
            <div
              key={faq.id}
              style={{
                border: '1px solid #d0d0d0',
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                marginBottom: 8
              }}
            >
              <button
                onClick={() => toggleExpand(faq.id)}
                style={{
                  width: '100%',
                  padding: isMobileView ? '12px 14px' : '16px 20px',
                  background: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: isMobileView ? 15 : 20,
                  fontWeight: 500,
                  color: '#6277ac',
                  transition: 'background-color 0.2s',
                  borderRadius: 12
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <span style={{ textAlign: 'left', flex: 1, marginRight: 12 }}><strong>Q :</strong> {faq.question}</span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 300,
                    color: '#6277ac',
                    minWidth: 24,
                    textAlign: 'center',
                    flexShrink: 0
                  }}
                >
                  {expandedId === faq.id ? '−' : '+'}
                </span>
              </button>

              {expandedId === faq.id && (
                <div style={{ padding: isMobileView ? '12px 14px' : '16px 20px', backgroundColor: '#D0E0F5', borderRadius: '0 0 12px 12px' }}>
                  <p style={{ margin: 0, color: '#000000', fontSize: isMobileView ? 15 : 20, lineHeight: 1.6 }}><strong>A :</strong> {faq.answer}</p>
                  {canManage && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => openEditModal(faq)}
                        style={{ border: '1px solid #4960ac', background: '#fff', color: '#4960ac', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFAQ(faq.id)}
                        disabled={isSubmitting}
                        style={{ border: '1px solid #b23b4b', background: '#fff', color: '#b23b4b', borderRadius: 8, padding: '6px 10px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: 13, opacity: isSubmitting ? 0.7 : 1 }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {canManage && isFaqModalOpen && modalMode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={resetFaqForm}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(760px, 100%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 16, border: '1px solid #d0d8ea', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', padding: isMobileView ? 14 : 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
              <div>
                <div style={{ fontSize: isMobileView ? 16 : 20, fontWeight: 700, color: '#2b2b2b' }}>{modalMode === 'create' ? 'Add FAQ' : 'Edit FAQ'}</div>
              </div>
              <button onClick={resetFaqForm} style={{ border: 'none', background: 'transparent', fontSize: 24, lineHeight: 1, cursor: 'pointer', color: '#4960ac' }}>×</button>
            </div>

            {errorMessage && <div style={{ marginBottom: 12, color: '#b23b4b', fontSize: 13 }}>{errorMessage}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <input
                value={faqForm.question}
                onChange={(e) => setFaqForm((prev) => ({ ...prev, question: e.target.value }))}
                placeholder="Question"
                style={{ border: '1px solid #d0d0d0', borderRadius: 10, padding: '11px 12px', fontSize: 14 }}
              />
              <input
                value={faqForm.category}
                onChange={(e) => setFaqForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Category (optional)"
                style={{ border: '1px solid #d0d0d0', borderRadius: 10, padding: '11px 12px', fontSize: 14 }}
              />
            </div>

            <textarea
              value={faqForm.answer}
              onChange={(e) => setFaqForm((prev) => ({ ...prev, answer: e.target.value }))}
              placeholder="Answer"
              rows={6}
              style={{ width: '100%', border: '1px solid #d0d0d0', borderRadius: 10, padding: '11px 12px', fontSize: 14, resize: 'vertical', marginBottom: 10, boxSizing: 'border-box' }}
            />

            {modalMode === 'edit' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4960ac', fontSize: 13 }}>
                  Order
                  <input
                    type="number"
                    value={faqForm.display_order}
                    onChange={(e) => setFaqForm((prev) => ({ ...prev, display_order: Number(e.target.value) || 0 }))}
                    style={{ width: 80, border: '1px solid #d0d0d0', borderRadius: 8, padding: '6px 8px', fontSize: 13 }}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4960ac', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={faqForm.is_active}
                    onChange={(e) => setFaqForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Active
                </label>
              </div>
            )}

            {modalMode === 'create' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4960ac', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={faqForm.is_active}
                    onChange={(e) => setFaqForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Active
                </label>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={resetFaqForm} style={{ border: '1px solid #8aa0c5', background: '#fff', color: '#4960ac', borderRadius: 10, padding: '9px 14px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => modalMode === 'create' ? handleCreateFAQ() : modalFaqId ? handleUpdateFAQ(modalFaqId) : undefined}
                style={{ border: 'none', borderRadius: 10, background: '#4960ac', color: '#fff', padding: '9px 14px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
              >
                {modalMode === 'create' ? 'Add FAQ' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
