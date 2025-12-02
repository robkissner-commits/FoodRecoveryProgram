import React, { useState } from 'react';
import { formatDateTime } from '../../utils/format';

// Mock data for demo
const mockStats = {
  total_events: 24,
  completed_deliveries: 18,
  active_reporters: 12,
  active_drivers: 8,
};

const mockUpcomingEvents = [
  {
    id: 1,
    title: 'Alumni Conference Luncheon',
    location: 'Student Center Ballroom',
    start_time: '2025-01-15T12:00:00',
    end_time: '2025-01-15T14:00:00',
    expected_attendees: 150,
    food_type: 'Buffet: sandwiches and salads',
    reporter_name: 'Sarah Johnson',
    status: 'assigned' as const,
  },
  {
    id: 2,
    title: 'Faculty Meeting Dinner',
    location: 'Administration Building Room 301',
    start_time: '2025-01-18T18:00:00',
    end_time: '2025-01-18T20:00:00',
    expected_attendees: 50,
    food_type: 'Italian catering',
    reporter_name: null,
    status: 'scheduled' as const,
  },
  {
    id: 3,
    title: 'Student Organization Social',
    location: 'Campus Center Lounge',
    start_time: '2025-01-20T17:00:00',
    end_time: '2025-01-20T19:00:00',
    expected_attendees: 80,
    food_type: 'Pizza and wings',
    reporter_name: 'Mike Chen',
    status: 'assigned' as const,
  },
  {
    id: 4,
    title: 'Board of Trustees Reception',
    location: "President's House",
    start_time: '2025-01-22T19:00:00',
    end_time: '2025-01-22T21:00:00',
    expected_attendees: 100,
    food_type: 'Hors d\'oeuvres and desserts',
    reporter_name: null,
    status: 'scheduled' as const,
  },
];

export default function AdminDashboard() {
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploading(true);
    setUploadMessage('');

    // Simulate upload delay
    setTimeout(() => {
      setUploadMessage(`✓ Successfully imported ${Math.floor(Math.random() * 10) + 5} events from ${csvFile.name}`);
      setCSVFile(null);
      setUploading(false);
    }, 1500);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">Total Events</div>
          <div className="stat-value" style={{ color: '#7D1D3F' }}>{mockStats.total_events}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Deliveries</div>
          <div className="stat-value" style={{ color: '#FFC72C' }}>{mockStats.completed_deliveries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Reporters</div>
          <div className="stat-value" style={{ color: '#7D1D3F' }}>{mockStats.active_reporters}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Drivers</div>
          <div className="stat-value" style={{ color: '#FFC72C' }}>{mockStats.active_drivers}</div>
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
          {uploadMessage && (
            <div style={{ padding: '0.75rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              {uploadMessage}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={!csvFile || uploading}>
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">Upcoming Events</div>
        <table className="table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Location</th>
              <th>Date & Time</th>
              <th>Attendees</th>
              <th>Reporter</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockUpcomingEvents.map((event) => (
              <tr key={event.id}>
                <td><strong>{event.title}</strong></td>
                <td>{event.location}</td>
                <td>{formatDateTime(event.start_time)}</td>
                <td>{event.expected_attendees}</td>
                <td>{event.reporter_name || <span style={{ color: '#ef4444' }}>Unassigned</span>}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: event.status === 'assigned' ? '#7D1D3F' : '#6b7280',
                      color: 'white'
                    }}
                  >
                    {event.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
