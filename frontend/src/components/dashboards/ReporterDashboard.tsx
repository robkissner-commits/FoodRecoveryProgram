import React, { useState } from 'react';
import { Event } from '../../types';
import { formatDateTime } from '../../utils/format';

// Mock data for demo
const mockAssignedEventsInitial: Event[] = [
  {
    id: 1,
    title: 'Alumni Conference Luncheon',
    location: 'Student Center Ballroom',
    start_time: '2025-01-15T12:00:00',
    end_time: '2025-01-15T14:00:00',
    expected_attendees: 150,
    food_type: 'Buffet: sandwiches and salads',
    catering_company: 'Premier Catering',
    contact_name: 'John Smith',
    contact_email: 'jsmith@premier.com',
    contact_phone: '555-1234',
    status: 'assigned' as const,
    created_at: '2025-01-01T10:00:00',
  },
  {
    id: 3,
    title: 'Student Organization Social',
    location: 'Campus Center Lounge',
    start_time: '2025-01-20T17:00:00',
    end_time: '2025-01-20T19:00:00',
    expected_attendees: 80,
    food_type: 'Pizza and wings',
    catering_company: "Joe's Pizza",
    contact_name: 'Lisa Johnson',
    contact_email: 'lisa@joespizza.com',
    contact_phone: '555-7890',
    status: 'assigned' as const,
    created_at: '2025-01-02T14:00:00',
  },
];

const mockAvailableEventsInitial: Event[] = [
  {
    id: 2,
    title: 'Faculty Meeting Dinner',
    location: 'Administration Building Room 301',
    start_time: '2025-01-18T18:00:00',
    end_time: '2025-01-18T20:00:00',
    expected_attendees: 50,
    food_type: 'Italian catering',
    catering_company: "Antonio's Italian",
    contact_name: 'Maria Garcia',
    contact_email: 'maria@antonios.com',
    contact_phone: '555-4567',
    status: 'scheduled' as const,
    created_at: '2025-01-02T09:00:00',
  },
  {
    id: 4,
    title: 'Board of Trustees Reception',
    location: "President's House",
    start_time: '2025-01-22T19:00:00',
    end_time: '2025-01-22T21:00:00',
    expected_attendees: 100,
    food_type: "Hors d'oeuvres and desserts",
    catering_company: 'Gourmet Events Co.',
    contact_name: 'David Lee',
    contact_email: 'david@gourmetevents.com',
    contact_phone: '555-2345',
    status: 'scheduled' as const,
    created_at: '2025-01-03T11:00:00',
  },
  {
    id: 5,
    title: 'Graduate Program Open House',
    location: 'Library Conference Center',
    start_time: '2025-01-25T16:00:00',
    end_time: '2025-01-25T18:00:00',
    expected_attendees: 60,
    food_type: 'Coffee, pastries, and finger foods',
    catering_company: 'Morning Glory Bakery',
    contact_name: 'Susan Williams',
    contact_email: 'susan@morningglory.com',
    contact_phone: '555-6789',
    status: 'scheduled' as const,
    created_at: '2025-01-04T08:00:00',
  },
];

export default function ReporterDashboard() {
  const [assignedEvents, setAssignedEvents] = useState<Event[]>(mockAssignedEventsInitial);
  const [availableEvents, setAvailableEvents] = useState<Event[]>(mockAvailableEventsInitial);

  const handleAssignEvent = (eventId: number) => {
    const event = availableEvents.find(e => e.id === eventId);
    if (event) {
      // Move event from available to assigned
      setAvailableEvents(availableEvents.filter(e => e.id !== eventId));
      setAssignedEvents([...assignedEvents, { ...event, status: 'assigned' as const }]);
      alert('Event assigned successfully! You can now submit a recovery report after the event.');
    }
  };

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
                    <span className="badge" style={{ backgroundColor: '#7D1D3F', color: 'white' }}>
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => alert('In the full app, this would open a form to submit a recovery report with photos, food quantity, and description.')}
                    >
                      Submit Report
                    </button>
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
