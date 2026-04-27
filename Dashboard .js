// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Activity, Pill, CheckCircle, XCircle, Clock } from 'lucide-react';

function AdherenceRing({ rate }) {
  const r = 48, cx = 60, cy = 60;
  const circumference = 2 * Math.PI * r;
  const dash = (rate / 100) * circumference;
  const color = rate >= 80 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="adherence-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg2)" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="adherence-ring-value">
        <span style={{ color }}>{rate}%</span>
        <span className="adherence-ring-label">adherence</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [schedRes, statsRes] = await Promise.all([
        api.get('/medications/schedule/today'),
        api.get('/adherence/stats')
      ]);
      setSchedule(schedRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async (item, status) => {
    try {
      await api.post('/adherence/log', {
        medicationId: item.medicationId,
        scheduledTime: item.scheduledTime,
        status
      });
      toast.success(status === 'taken' ? '✅ Marked as taken!' : status === 'skipped' ? '⏭️ Skipped' : '❌ Marked missed');
      fetchData();
    } catch (err) {
      toast.error('Failed to log');
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const upcoming = schedule.filter(s => s.status === 'pending');
  const done = schedule.filter(s => s.status === 'taken').length;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">{dateStr} · {timeStr}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><span className="spinner" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-label">Today's Progress</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>{done}/{schedule.length}</div>
              <div className="stat-desc">doses logged today</div>
              <div className="stat-icon"><Pill size={32} /></div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">30-Day Adherence</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats?.adherenceRate ?? 0}%</div>
              <div className="stat-desc">{stats?.taken ?? 0} of {stats?.total ?? 0} doses taken</div>
              <div className="stat-icon"><Activity size={32} /></div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Taken</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats?.taken ?? 0}</div>
              <div className="stat-desc">doses this month</div>
              <div className="stat-icon"><CheckCircle size={32} /></div>
            </div>
            <div className="stat-card red">
              <div className="stat-label">Missed</div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats?.missed ?? 0}</div>
              <div className="stat-desc">doses this month</div>
              <div className="stat-icon"><XCircle size={32} /></div>
            </div>
          </div>

          <div className="grid-2">
            {/* Today's Schedule */}
            <div className="card">
              <div className="card-title">Today's Schedule</div>
              {schedule.length === 0 ? (
                <div className="empty-state">
                  <Pill size={36} />
                  <p>No medications scheduled for today</p>
                </div>
              ) : (
                <div className="schedule-list">
                  {schedule.map((item, i) => (
                    <div key={i} className={`schedule-item ${item.status}`}>
                      <div className="med-dot" style={{ background: item.color || '#00d4ff' }} />
                      <div className="med-info">
                        <div className="med-name">{item.medicationName}</div>
                        <div className="med-detail">{item.dosage} · {item.instructions || 'No special instructions'}</div>
                      </div>
                      <div className="med-time">{item.scheduledTime}</div>
                      {item.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleLog(item, 'taken')}>✓</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleLog(item, 'skipped')}>Skip</button>
                        </div>
                      ) : (
                        <span className={`status-badge ${item.status}`}>{item.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adherence Overview */}
            <div className="card">
              <div className="card-title">Adherence Overview</div>
              <AdherenceRing rate={stats?.adherenceRate ?? 0} />

              {/* 7-day bar chart */}
              {stats?.daily && (
                <>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, marginTop: 8, textAlign: 'center' }}>Last 7 Days</div>
                  <div className="bar-chart">
                    {stats.daily.map((d, i) => (
                      <div key={i} className="bar-col">
                        <div className="bar-wrap">
                          <div className="bar" style={{
                            height: `${d.rate}%`,
                            background: d.rate >= 80 ? 'var(--success)' : d.rate >= 50 ? 'var(--warning)' : d.total === 0 ? 'var(--border)' : 'var(--danger)',
                            opacity: 0.8
                          }} title={`${d.rate}% (${d.taken}/${d.total})`} />
                        </div>
                        <div className="bar-label">{d.label}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Per-medication */}
              {stats?.perMed?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Per Medication</div>
                  {stats.perMed.map(m => (
                    <div key={m.medicationId} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color || 'var(--primary)', display: 'inline-block' }} />
                          {m.medicationName}
                        </span>
                        <span className="font-mono" style={{ fontSize: 12 }}>{m.adherenceRate}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${m.adherenceRate}%`,
                          background: m.adherenceRate >= 80 ? 'var(--success)' : m.adherenceRate >= 50 ? 'var(--warning)' : 'var(--danger)'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}