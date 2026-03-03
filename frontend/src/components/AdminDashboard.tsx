import React, { useEffect, useMemo, useState } from 'react';
import { authAPI, chatAPI } from '../services/api';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  last_active_at?: string | null;
};

type AdminDashboardProps = {
  height?: number | string;
  view?: 'dashboard' | 'information' | 'all';
};

type ChatAnalytics = {
  total_questions: number;
  unique_users: number;
  top_questions: Array<{ question: string; count: number }>;
  hourly_usage: Array<{ hour: number; count: number }>;
  daily_usage: Array<{ date: string; count: number }>;
  weekday_usage: Array<{ day: string; count: number }>;
  peak_hour: { hour: number; count: number; label: string };
  peak_day: { date: string | null; count: number };
  generated_at: string;
  applied_range_days?: number | null;
};

export default function AdminDashboard({ height = 'auto', view = 'all' }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [notifying, setNotifying] = useState<number | null>(null);
  const [notifiedUsers, setNotifiedUsers] = useState<Record<number, boolean>>({});
  const [searchName, setSearchName] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff' | 'user'>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active_30d' | 'inactive_30d' | 'inactive_60d' | 'never_active'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dashboardRange, setDashboardRange] = useState<'7' | '30' | '90' | 'all'>('7');
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const showDashboard = view === 'dashboard' || view === 'all';
  const showInformation = view === 'information' || view === 'all';
  const filteredUsers = useMemo(() => {
    const now = Date.now();
    return users.filter((user) => {
      const nameMatched = user.name.toLowerCase().includes(searchName.trim().toLowerCase());
      const roleMatched = roleFilter === 'all' ? true : user.role === roleFilter;

      let activityMatched = true;
      const lastActive = user.last_active_at ? new Date(user.last_active_at).getTime() : null;
      const ageDays = lastActive ? (now - lastActive) / (1000 * 60 * 60 * 24) : null;

      if (activityFilter === 'never_active') {
        activityMatched = !lastActive;
      } else if (activityFilter === 'active_30d') {
        activityMatched = !!lastActive && ageDays !== null && ageDays <= 30;
      } else if (activityFilter === 'inactive_30d') {
        activityMatched = !lastActive || (ageDays !== null && ageDays > 30);
      } else if (activityFilter === 'inactive_60d') {
        activityMatched = !lastActive || (ageDays !== null && ageDays > 60);
      }

      return nameMatched && roleMatched && activityMatched;
    });
  }, [users, searchName, roleFilter, activityFilter]);

  const usersPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    if (showInformation) {
      loadUsers();
    }
  }, [showInformation]);

  useEffect(() => {
    if (showDashboard) {
      loadAnalytics(dashboardRange);
    }
  }, [showDashboard, dashboardRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, roleFilter, activityFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatDateTime = (value?: string | null) => {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString();
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (range: '7' | '30' | '90' | 'all') => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const response = await chatAPI.getAdminAnalytics(range === 'all' ? undefined : Number(range));
      setAnalytics(response.data);
    } catch (err: any) {
      setAnalyticsError(err.response?.data?.detail || 'Failed to load chat analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!notifiedUsers[userId]) {
      setError('กรุณาส่งแจ้งเตือนผู้ใช้ก่อนทำการลบ');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      return;
    }

    setDeleting(userId);
    try {
      await authAPI.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setNotifiedUsers((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const handleNotifyBeforeDelete = async (userId: number) => {
    setNotifying(userId);
    setError(null);
    try {
      await authAPI.notifyUserBeforeDelete(userId);
      setNotifiedUsers((prev) => ({ ...prev, [userId]: true }));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send notification');
    } finally {
      setNotifying(null);
    }
  };

  return (
    <div style={{ 
      height, 
      overflow: 'auto', 
      padding: '0'
    }}>
      <h2 style={{ marginTop: 0, color: '#4960ac', marginBottom: '20px' }}>
        {view === 'dashboard' ? 'Dashboard' : view === 'information' ? 'User Information' : 'User Management'}
      </h2>

      {showDashboard && (
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, color: '#4960ac' }}>
            AI Usage Dashboard
          </h3>
          <select
            value={dashboardRange}
            onChange={(e) => setDashboardRange(e.target.value as '7' | '30' | '90' | 'all')}
            style={{
              height: '34px',
              borderRadius: '8px',
              border: '1px solid #d7e2f3',
              padding: '0 10px',
              color: '#2f3f72',
              background: '#fff',
              fontSize: '13px'
            }}
          >
            <option value="7">ย้อนหลัง 7 วัน</option>
            <option value="30">ย้อนหลัง 30 วัน</option>
            <option value="90">ย้อนหลัง 90 วัน</option>
            <option value="all">ทั้งหมด</option>
          </select>
        </div>

        {analyticsError && (
          <div
            style={{
              backgroundColor: '#fff0f2',
              color: '#c73445',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #f2c7cf',
              marginBottom: '12px',
              fontSize: '13px',
            }}
          >
            ❌ {analyticsError}
          </div>
        )}

        {analyticsLoading && (
          <div style={{ color: '#6277ac', fontSize: '13px', marginBottom: '12px' }}>
            ⏳ Loading usage analytics...
          </div>
        )}

        {!analyticsLoading && analytics && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: '#f8fbff', border: '1px solid #d7e2f3', borderRadius: '8px', padding: '12px' }}>
                <div style={{ color: '#6277ac', fontSize: '12px' }}>Total Questions</div>
                <div style={{ color: '#2f3f72', fontWeight: 700, fontSize: '22px' }}>{analytics.total_questions}</div>
              </div>
              <div style={{ background: '#f8fbff', border: '1px solid #d7e2f3', borderRadius: '8px', padding: '12px' }}>
                <div style={{ color: '#6277ac', fontSize: '12px' }}>Active Users (asked)</div>
                <div style={{ color: '#2f3f72', fontWeight: 700, fontSize: '22px' }}>{analytics.unique_users}</div>
              </div>
              <div style={{ background: '#f8fbff', border: '1px solid #d7e2f3', borderRadius: '8px', padding: '12px' }}>
                <div style={{ color: '#6277ac', fontSize: '12px' }}>Peak Hour</div>
                <div style={{ color: '#2f3f72', fontWeight: 700, fontSize: '18px' }}>{analytics.peak_hour.label}</div>
                <div style={{ color: '#6277ac', fontSize: '12px' }}>{analytics.peak_hour.count} questions</div>
              </div>
              <div style={{ background: '#f8fbff', border: '1px solid #d7e2f3', borderRadius: '8px', padding: '12px' }}>
                <div style={{ color: '#6277ac', fontSize: '12px' }}>Peak Day</div>
                <div style={{ color: '#2f3f72', fontWeight: 700, fontSize: '16px' }}>
                  {analytics.peak_day.date ? new Date(analytics.peak_day.date).toLocaleDateString() : '-'}
                </div>
                <div style={{ color: '#6277ac', fontSize: '12px' }}>{analytics.peak_day.count} questions</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div style={{ border: '1px solid #d7e2f3', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                <div style={{ background: '#edf3fc', padding: '10px 12px', color: '#4960ac', fontWeight: 600, fontSize: '13px' }}>
                  คำถามที่ถูกถามบ่อยที่สุด
                </div>
                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  {analytics.top_questions.length === 0 ? (
                    <div style={{ padding: '12px', color: '#9aa9c7', fontSize: '13px' }}>ยังไม่มีข้อมูลคำถาม</div>
                  ) : (
                    analytics.top_questions.map((item, index) => (
                      <div key={`${item.question}-${index}`} style={{ borderTop: index === 0 ? 'none' : '1px solid #eef3fb', padding: '10px 12px' }}>
                        <div style={{ color: '#2f3f72', fontSize: '13px', lineHeight: 1.4 }}>{item.question}</div>
                        <div style={{ color: '#6277ac', fontSize: '12px', marginTop: '4px' }}>Asked {item.count} times</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ border: '1px solid #d7e2f3', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                <div style={{ background: '#edf3fc', padding: '10px 12px', color: '#4960ac', fontWeight: 600, fontSize: '13px' }}>
                  ความถี่การใช้งานรายชั่วโมง
                </div>
                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  {(() => {
                    const maxHourly = Math.max(1, ...analytics.hourly_usage.map((item) => item.count));
                    return analytics.hourly_usage.map((item, index) => (
                      <div key={item.hour} style={{ borderTop: index === 0 ? 'none' : '1px solid #eef3fb', padding: '8px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ color: '#2f3f72', fontSize: '13px' }}>{String(item.hour).padStart(2, '0')}:00 - {String(item.hour).padStart(2, '0')}:59</span>
                          <span style={{ color: '#6277ac', fontSize: '12px', fontWeight: 600 }}>{item.count}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: '#edf3fc' }}>
                          <div style={{ height: '100%', width: `${(item.count / maxHourly) * 100}%`, borderRadius: 999, background: '#7587b8' }} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ border: '1px solid #d7e2f3', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                <div style={{ background: '#edf3fc', padding: '10px 12px', color: '#4960ac', fontWeight: 600, fontSize: '13px' }}>
                  การใช้งานรายวัน
                </div>
                <div style={{ padding: '10px 12px' }}>
                  {(() => {
                    const maxDaily = Math.max(1, ...analytics.daily_usage.map((item) => item.count));
                    return analytics.daily_usage.map((item) => (
                      <div key={item.date} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: '#2f3f72', fontSize: '12px' }}>{new Date(item.date).toLocaleDateString()}</span>
                          <span style={{ color: '#6277ac', fontSize: '12px', fontWeight: 600 }}>{item.count}</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 999, background: '#edf3fc' }}>
                          <div style={{ height: '100%', width: `${(item.count / maxDaily) * 100}%`, borderRadius: 999, background: '#4960ac' }} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div style={{ border: '1px solid #d7e2f3', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                <div style={{ background: '#edf3fc', padding: '10px 12px', color: '#4960ac', fontWeight: 600, fontSize: '13px' }}>
                  การใช้งานตามวันในสัปดาห์
                </div>
                <div style={{ padding: '10px 12px' }}>
                  {(() => {
                    const maxWeekday = Math.max(1, ...analytics.weekday_usage.map((item) => item.count));
                    return analytics.weekday_usage.map((item) => (
                      <div key={item.day} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: '#2f3f72', fontSize: '12px' }}>{item.day}</span>
                          <span style={{ color: '#6277ac', fontSize: '12px', fontWeight: 600 }}>{item.count}</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 999, background: '#edf3fc' }}>
                          <div style={{ height: '100%', width: `${(item.count / maxWeekday) * 100}%`, borderRadius: 999, background: '#7f93c4' }} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '8px', color: '#9aa9c7', fontSize: '11px' }}>
              Last updated: {formatDateTime(analytics.generated_at)}
            </div>
          </>
        )}
      </div>
      )}

      {showInformation && (
      <>
      {error && (
        <div
          style={{
            backgroundColor: '#fff0f2',
            color: '#c73445',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #f2c7cf',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          ❌ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          ⏳ Loading users...
        </div>
      )}

      {!loading && (
        <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search by name..."
            style={{
              width: '100%',
              maxWidth: '320px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #d7e2f3',
              padding: '0 12px',
              color: '#2f3f72',
              background: '#fff'
            }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'staff' | 'user')}
            style={{
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #d7e2f3',
              padding: '0 10px',
              color: '#2f3f72',
              background: '#fff'
            }}
          >
            <option value="all">All Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value as 'all' | 'active_30d' | 'inactive_30d' | 'inactive_60d' | 'never_active')}
            style={{
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #d7e2f3',
              padding: '0 10px',
              color: '#2f3f72',
              background: '#fff'
            }}
          >
            <option value="all">ทุกสถานะการเข้าใช้</option>
            <option value="active_30d">เข้าใช้ใน 30 วัน</option>
            <option value="inactive_30d">ไม่เข้าใช้นานกว่า 30 วัน</option>
            <option value="inactive_60d">ไม่เข้าใช้นานกว่า 60 วัน</option>
            <option value="never_active">ยังไม่เคยเข้าใช้</option>
          </select>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          No users found
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px',
            border: '1px solid #d7e2f3',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#edf3fc',
                borderBottom: '2px solid #d7e2f3'
              }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4960ac' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4960ac' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4960ac' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4960ac' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4960ac' }}>Last Active</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#4960ac' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, index) => (
                <tr key={user.id} style={{ 
                  backgroundColor: index % 2 === 0 ? '#f8fbff' : '#ffffff',
                  borderBottom: '1px solid #e6eef9',
                  transition: 'background-color 0.2s'
                }}>
                  <td style={{ padding: '12px', color: '#6277ac' }}>{user.id}</td>
                  <td style={{ padding: '12px', color: '#2f3f72', fontWeight: '500' }}>{user.name}</td>
                  <td style={{ padding: '12px', color: '#6277ac' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: user.role === 'admin' ? '#e9effb' : '#f1f5fd',
                      color: '#4960ac',
                      border: '1px solid #d7e2f3'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#6277ac' }}>{formatDateTime(user.last_active_at)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {user.role !== 'admin' ? (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleNotifyBeforeDelete(user.id)}
                          disabled={notifying === user.id || deleting === user.id}
                          style={{
                            backgroundColor: notifiedUsers[user.id] ? '#4caf50' : '#4960ac',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: notifying === user.id || deleting === user.id ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            opacity: notifying === user.id || deleting === user.id ? 0.6 : 1,
                            transition: 'opacity 0.2s'
                          }}
                        >
                          {notifying === user.id ? '⏳' : notifiedUsers[user.id] ? 'Notified' : 'Notify'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={deleting === user.id || !notifiedUsers[user.id]}
                          style={{
                            backgroundColor: '#c73445',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: deleting === user.id || !notifiedUsers[user.id] ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            opacity: deleting === user.id || !notifiedUsers[user.id] ? 0.6 : 1,
                            transition: 'opacity 0.2s'
                          }}
                        >
                          {deleting === user.id ? '⏳' : 'Delete'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#9aa9c7', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ color: '#6277ac', fontSize: '12px' }}>
            แสดง {(currentPage - 1) * usersPerPage + 1} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} จาก {filteredUsers.length} ผู้ใช้
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                border: '1px solid #d7e2f3',
                background: '#fff',
                color: '#4960ac',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.6 : 1
              }}
            >
              ก่อนหน้า
            </button>
            <span style={{ color: '#2f3f72', fontSize: '12px', fontWeight: 600 }}>
              หน้า {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                border: '1px solid #d7e2f3',
                background: '#fff',
                color: '#4960ac',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.6 : 1
              }}
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f6fe', borderRadius: '6px', border: '1px solid #d7e2f3', fontSize: '12px', color: '#6277ac' }}>
        Total Users: <strong>{users.length}</strong>
      </div>
      </>
      )}
    </div>
  );
}
