import React, { useEffect, useState } from 'react';
import { filesAPI } from '../services/api';

type Category = {
  key: string;
  label: string;
};

type QueueStatus = 'queued' | 'uploading' | 'uploaded' | 'failed';

type QueueItem = {
  id: string;
  fileName: string;
  status: QueueStatus;
  timestamp: number;
};

type Props = {
  height?: number | string;
};

const FALLBACK_CATEGORIES: Category[] = [
  { key: 'curriculum', label: 'หลักสูตร' },
  { key: 'regulation', label: 'ระเบียบ' },
  { key: 'course_structure', label: 'โครงสร้างรายวิชา' }
];

export default function ManageDocumentPage({ height = 'auto' }: Props) {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [filesByCategory, setFilesByCategory] = useState<Record<string, File[]>>({});
  const [queueByCategory, setQueueByCategory] = useState<Record<string, QueueItem[]>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await filesAPI.getCategories();
        const list = res.data?.categories || [];
        if (list.length > 0) {
          setCategories(list);
        }
      } catch (err) {
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleFileChange = (categoryKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const onlyPdf = files.filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));

    setFilesByCategory((prev) => ({ ...prev, [categoryKey]: onlyPdf }));
    setQueueByCategory((prev) => {
      const existing = prev[categoryKey] || [];
      const queuedItems: QueueItem[] = onlyPdf.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        fileName: file.name,
        status: 'queued',
        timestamp: Date.now()
      }));

      const keepHistory = existing.filter((item) => item.status === 'uploaded' || item.status === 'failed');
      return {
        ...prev,
        [categoryKey]: [...queuedItems, ...keepHistory].slice(0, 12)
      };
    });

    setError(null);
    setSuccess(null);
  };

  const handleUpload = async (categoryKey: string, categoryLabel: string) => {
    const selectedFiles = filesByCategory[categoryKey] || [];
    if (selectedFiles.length === 0) {
      setError('กรุณาเลือกไฟล์ PDF อย่างน้อย 1 ไฟล์');
      return;
    }

    setUploadingCategory(categoryKey);
    setError(null);
    setSuccess(null);
    setQueueByCategory((prev) => ({
      ...prev,
      [categoryKey]: (prev[categoryKey] || []).map((item) =>
        item.status === 'queued' ? { ...item, status: 'uploading' } : item
      )
    }));

    try {
      const res = await filesAPI.uploadTrainingFiles(categoryKey, selectedFiles);
      const uploadedCount = res.data?.filenames?.length || 0;
      const uploadedNames = new Set((res.data?.filenames || []).map((name) => name.toLowerCase()));

      setQueueByCategory((prev) => ({
        ...prev,
        [categoryKey]: (prev[categoryKey] || []).map((item) => {
          if (item.status !== 'uploading') return item;
          return uploadedNames.has(item.fileName.toLowerCase())
            ? { ...item, status: 'uploaded', timestamp: Date.now() }
            : { ...item, status: 'failed', timestamp: Date.now() };
        })
      }));

      setSuccess(`อัปโหลดสำเร็จ ${uploadedCount} ไฟล์ ไปยังไดรฟ์ ${categoryLabel}`);
      setFilesByCategory((prev) => ({ ...prev, [categoryKey]: [] }));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'อัปโหลดไฟล์ไม่สำเร็จ');
      setQueueByCategory((prev) => ({
        ...prev,
        [categoryKey]: (prev[categoryKey] || []).map((item) =>
          item.status === 'uploading' ? { ...item, status: 'failed', timestamp: Date.now() } : item
        )
      }));
    } finally {
      setUploadingCategory(null);
    }
  };

  const getStatusStyle = (status: QueueStatus) => {
    if (status === 'uploaded') return { bg: '#e8f5e9', color: '#2e7d32', label: 'Uploaded' };
    if (status === 'failed') return { bg: '#ffebee', color: '#c62828', label: 'Failed' };
    if (status === 'uploading') return { bg: '#fff8e1', color: '#ef6c00', label: 'Uploading' };
    return { bg: '#edf3fc', color: '#4960ac', label: 'Queued' };
  };

  return (
    <div style={{ width: '100%', height, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ margin: 0, marginBottom: 20, color: '#4960ac' }}>Manage Document</h2>

      <div style={{ marginBottom: 18, color: '#6277ac', fontSize: 14 }}>
        แบ่งการจัดเก็บเอกสารเป็น 3 ไดรฟ์สำหรับเตรียมเชื่อมต่อระบบ Model (mount ในขั้นตอนถัดไป)
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {categories.map((category) => {
          const categoryFiles = filesByCategory[category.key] || [];
          const queueItems = queueByCategory[category.key] || [];
          const isUploading = uploadingCategory === category.key;

          return (
            <div key={category.key} style={{ border: '1px solid #d7e2f3', borderRadius: 10, background: '#fff', padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ color: '#2f3f72', fontWeight: 700, fontSize: 16 }}>{category.label}</div>
                <span style={{ background: '#edf3fc', color: '#4960ac', fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '3px 8px' }}>
                  DRIVE
                </span>
              </div>

              <div style={{ border: '1px dashed #b9c9e8', borderRadius: 8, padding: 10, marginBottom: 10, background: '#f8fbff' }}>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  onChange={(e) => handleFileChange(category.key, e)}
                  disabled={loadingCategories || uploadingCategory !== null}
                  style={{ color: '#2f3f72', width: '100%' }}
                />
                <div style={{ marginTop: 8, color: '#6277ac', fontSize: 12 }}>
                  {categoryFiles.length > 0
                    ? `เลือกแล้ว ${categoryFiles.length} ไฟล์`
                    : 'ยังไม่ได้เลือกไฟล์ PDF'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUpload(category.key, category.label)}
                disabled={loadingCategories || uploadingCategory !== null}
                style={{
                  width: '100%',
                  height: 38,
                  border: 'none',
                  borderRadius: 8,
                  background: '#4960ac',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: loadingCategories || uploadingCategory !== null ? 'not-allowed' : 'pointer',
                  opacity: loadingCategories || uploadingCategory !== null ? 0.7 : 1
                }}
              >
                {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดเข้าไดรฟ์นี้'}
              </button>

              <div style={{ marginTop: 10, borderTop: '1px solid #eef3fb', paddingTop: 10 }}>
                <div style={{ fontSize: 12, color: '#6277ac', marginBottom: 6 }}>สถานะคิวเอกสาร</div>
                {queueItems.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#9aa9c7' }}>ยังไม่มีรายการในคิว</div>
                ) : (
                  <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto' }}>
                    {queueItems.map((item) => {
                      const statusStyle = getStatusStyle(item.status);
                      return (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: 12, color: '#2f3f72', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.fileName}>
                            {item.fileName}
                          </div>
                          <span style={{ background: statusStyle.bg, color: statusStyle.color, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                            {statusStyle.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 8, border: '1px solid #f2c7cf', background: '#fff0f2', color: '#c73445' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 8, border: '1px solid #d7e2f3', background: '#f0f6fe', color: '#4960ac' }}>
          {success}
        </div>
      )}
    </div>
  );
}
