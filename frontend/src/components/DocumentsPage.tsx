import React, { useEffect, useState } from 'react';
import { documentsAPI } from '../services/api';

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
      <h2 style={{ margin: 0, textAlign: 'center', color: '#6277ac', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>
        แบบฟอร์ม คำร้องต่างๆ / Request Forms
      </h2>

      <div style={{ marginTop: 24, borderTop: '1px solid #e6e6e6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 120px', padding: '12px 8px', fontWeight: 600, color: '#2b2b2b' }}>
          <div>แบบฟอร์ม</div>
          <div>ประเภทคำร้อง</div>
          <div style={{ textAlign: 'right' }}>ดาวน์โหลด</div>
        </div>
        <div style={{ borderTop: '1px solid #e6e6e6' }} />

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
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: '#2b5b9f',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 12
                }}
              >
                ดาวน์โหลด
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
