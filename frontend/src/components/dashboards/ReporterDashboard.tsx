import React, { useState, useEffect } from 'react';
import { dashboardAPI, eventsAPI, recoveriesAPI } from '../../services/api';
import { Event } from '../../types';
import { formatDateTime } from '../../utils/format';

export default function ReporterDashboard() {
  const [assignedEvents, setAssignedEvents] = useState<Event[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getReporter();
      setAssignedEvents(response.data.assignedEvents || []);
      setAvailableEvents(response.data.availableEvents || []);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEvent = async (eventId: number) => {
    try {
      await eventsAPI.assignReporter(eventId);
      alert('Event assigned successfully!');
      fetchDashboard();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to assign event');
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Reporter Dashboard</h1>

      <div className="card">
        <div className="card-header">My Assigned Events</div>
        {assignedEvents.length === 0 ? (
          <div className="empty-state">No assigned events. Browse available events below to get started!</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Location</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignedEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.location}</td>
                  <td>{formatDateTime(event.start_time)}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <a href={`/report/${event.id}`} className="btn btn-primary btn-small">
                      Submit Report
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="card-header">Available Events</div>
        {availableEvents.length === 0 ? (
          <div className="empty-state">No available events at this time</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Location</th>
                <th>Date & Time</th>
                <th>Attendees</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {availableEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.location}</td>
                  <td>{formatDateTime(event.start_time)}</td>
                  <td>{event.expected_attendees || 'N/A'}</td>
                  <td>
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleAssignEvent(event.id)}
                    >
                      Accept
                    </button>
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
