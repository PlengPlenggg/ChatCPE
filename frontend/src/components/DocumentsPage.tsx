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

const DOCUMENTS_CACHE_KEY = 'documents_forms_cache_v1';

type DocumentsCachePayload = {
  items: FormItem[];
  fetchedAt: number;
};

export default function DocumentsPage({ height = 'auto' }: Props) {
  const [items, setItems] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const handleDownload = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const saveCache = (forms: FormItem[]) => {
    const payload: DocumentsCachePayload = {
      items: forms,
      fetchedAt: Date.now()
    };
    localStorage.setItem(DOCUMENTS_CACHE_KEY, JSON.stringify(payload));
    setLastUpdated(payload.fetchedAt);
  };

  const loadFromApi = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await documentsAPI.getForms();
      const forms = res.data || [];
      setItems(forms);
      saveCache(forms);
    } catch (err) {
      setError('ไม่สามารถโหลดรายการแบบฟอร์มได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const rawCache = localStorage.getItem(DOCUMENTS_CACHE_KEY);
        if (rawCache) {
          const parsed = JSON.parse(rawCache) as DocumentsCachePayload;
          if (Array.isArray(parsed.items)) {
            setItems(parsed.items);
            setLastUpdated(typeof parsed.fetchedAt === 'number' ? parsed.fetchedAt : null);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        localStorage.removeItem(DOCUMENTS_CACHE_KEY);
      }
      await loadFromApi();
    };
    bootstrap();
  }, []);

  return (
    <div style={{ width: '100%', height, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ margin: 0, marginBottom: 20, textAlign: 'center', color: '#6277ac', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>
        แบบฟอร์ม คำร้องต่างๆ / Request Forms
      </h2>

      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#6277ac', fontSize: 12 }}>
          {lastUpdated
            ? `อัปเดตล่าสุด: ${new Date(lastUpdated).toLocaleString()}`
            : 'ยังไม่มีข้อมูลแคช'}
        </div>
      </div>

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
