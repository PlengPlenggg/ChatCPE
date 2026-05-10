import React, { useEffect, useState } from 'react';
import { documentsAPI, API_BASE_URL } from '../services/api';

type FormItem = {
  code: string;
  title: string;
  url: string;
};

type Props = {
  height?: number | string;
};

export default function DocumentsPage({ height = 'auto' }: Props) {
  const [items, setItems] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = (url: string) => {
    const downloadUrl = `${API_BASE_URL}/documents/download?url=${encodeURIComponent(url)}`;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await documentsAPI.getForms();
        setItems(res.data || []);
      } catch (err) {
        setError('ไม่สามารถโหลดรายการแบบฟอร์มได้');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ width: '100%', height, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ margin: 0, marginBottom: 20, textAlign: 'center', color: '#6277ac', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>
        แบบฟอร์ม คำร้องต่างๆ / Request Forms
      </h2>

      <div style={{ marginTop: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 120px', padding: '12px 8px', marginBottom: 8, fontWeight: 600, color: '#2b2b2b', borderBottom: '1px solid #d0d0d0' }}>
          <div>แบบฟอร์ม</div>
          <div>ประเภทคำร้อง</div>
          <div style={{ textAlign: 'right' }}>ดาวน์โหลด</div>
        </div>

        {loading && (
          <div style={{ padding: 16, color: '#6277ac' }}>กำลังโหลดรายการแบบฟอร์ม...</div>
        )}
        {error && (
          <div style={{ padding: 16, color: '#d32f2f' }}>{error}</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div style={{ padding: 16, color: '#6277ac' }}>ไม่พบรายการแบบฟอร์ม</div>
        )}

        {!loading && !error && items.map((item, idx) => (
          <div key={`${item.code}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '240px 1fr 120px', padding: '14px 8px', borderBottom: '1px solid #efefef', alignItems: 'center' }}>
            <div style={{ color: '#2b2b2b', fontWeight: 600 }}>{item.code}</div>
            <div style={{ color: '#2b2b2b', lineHeight: 1.4, fontWeight: 600 }}>
              {item.title.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => handleDownload(item.url)}
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: '#2b5b9f',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                ดาวน์โหลด
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
