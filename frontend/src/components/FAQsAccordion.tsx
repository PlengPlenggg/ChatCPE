import React, { useState } from 'react';

interface FAQ {
  id: string | number;
  question: string;
  answer: string;
}

interface FAQsAccordionProps {
  faqs: FAQ[];
  containerStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
}

export default function FAQsAccordion({ faqs, containerStyle, titleStyle }: FAQsAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const toggleExpand = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ margin: 0, marginBottom: 24, color: '#2b2b2b', fontSize: 24, fontWeight: 600, ...titleStyle }}>
        Frequently Asked Questions
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {faqs.length === 0 ? (
          <p style={{ color: '#6277ac', marginTop: 16 }}>No FAQs available</p>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq.id}
              style={{
                border: '1px solid #c8d4e8',
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}
            >
              <button
                onClick={() => toggleExpand(faq.id)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#4960ac',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9fbfd')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <span style={{ textAlign: 'left', flex: 1, marginRight: 12 }}>{faq.question}</span>
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
                <div style={{ borderTop: '1px solid #e8edf5', padding: '16px 20px', backgroundColor: '#f0f3fa' }}>
                  <p style={{ margin: 0, color: '#6277ac', fontSize: 14, lineHeight: 1.6 }}>{faq.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
