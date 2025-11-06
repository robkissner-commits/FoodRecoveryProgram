import React, { useState, useEffect } from 'react';
import { dashboardAPI, eventsAPI } from '../../services/api';
import { DashboardStats, Event } from '../../types';
import { formatDateTime } from '../../utils/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getAdmin();
      setStats(response.data.stats);
      setUpcomingEvents(response.data.upcomingEvents || []);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploading(true);
    try {
      await eventsAPI.uploadCSV(csvFile);
      alert('Events uploaded successfully!');
      setCSVFile(null);
      fetchDashboard();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{stats?.total_events || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Deliveries</div>
          <div className="stat-value">{stats?.completed_deliveries || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Reporters</div>
          <div className="stat-value">{stats?.active_reporters || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Drivers</div>
          <div className="stat-value">{stats?.active_drivers || 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Upload Events CSV</div>
        <form onSubmit={handleCSVUpload}>
          <div className="form-group">
            <label className="form-label">
              CSV File (columns: title, location, start_time, end_time, expected_attendees, food_type, catering_company)
            </label>
            <input
              type="file"
              accept=".csv"
              className="form-control"
              onChange={(e) => setCSVFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!csvFile || uploading}>
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">Upcoming Events</div>
        {upcomingEvents.length === 0 ? (
          <div className="empty-state">No upcoming events</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Location</th>
                <th>Date & Time</th>
                <th>Reporter</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.location}</td>
                  <td>{formatDateTime(event.start_time)}</td>
                  <td>{event.reporter_name || 'Unassigned'}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: event.status === 'assigned' ? '#3b82f6' : '#6b7280', color: 'white' }}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
