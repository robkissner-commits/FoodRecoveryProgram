import React, { useState } from 'react';
import { RecoveryReport, Delivery } from '../../types';
import { formatRelativeTime } from '../../utils/format';

// Mock data for demo
const mockAvailableRecoveriesInitial: RecoveryReport[] = [
  {
    id: 101,
    event_id: 1,
    event_title: 'Alumni Conference Luncheon',
    event_location: 'Student Center Ballroom',
    reporter_id: 5,
    reporter_name: 'Sarah Johnson',
    food_quantity: '15-20 servings',
    food_description: 'Assorted sandwiches, garden salad, fruit platters. All properly stored and refrigerated.',
    photo_url: null,
    status: 'available' as const,
    reported_at: '2025-01-15T14:15:00',
    created_at: '2025-01-15T14:15:00',
  },
  {
    id: 102,
    event_id: 3,
    event_title: 'Student Organization Social',
    event_location: 'Campus Center Lounge',
    reporter_id: 8,
    reporter_name: 'Mike Chen',
    food_quantity: '8-10 pizza boxes, 50+ wings',
    food_description: 'Multiple pizzas (cheese, pepperoni, veggie) and buffalo wings. Still warm.',
    photo_url: null,
    status: 'available' as const,
    reported_at: '2025-01-20T19:10:00',
    created_at: '2025-01-20T19:10:00',
  },
];

const mockActiveDeliveriesInitial: Delivery[] = [
  {
    id: 201,
    recovery_report_id: 100,
    event_title: 'Faculty Workshop Lunch',
    pickup_location: 'Administration Building Room 201',
    driver_id: 10,
    partner_id: 15,
    partner_name: 'New Rochelle Food Pantry',
    partner_address: '123 Main St, New Rochelle, NY 10801',
    status: 'accepted' as const,
    accepted_at: '2025-01-12T13:30:00',
    picked_up_at: null,
    delivered_at: null,
    created_at: '2025-01-12T13:30:00',
  },
];

export default function DriverDashboard() {
  const [availableRecoveries, setAvailableRecoveries] = useState<RecoveryReport[]>(mockAvailableRecoveriesInitial);
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>(mockActiveDeliveriesInitial);

  const handleAcceptDelivery = (reportId: number) => {
    const recovery = availableRecoveries.find(r => r.id === reportId);
    if (recovery) {
      // Create new delivery from recovery
      const newDelivery: Delivery = {
        id: Date.now(),
        recovery_report_id: recovery.id,
        event_title: recovery.event_title,
        pickup_location: recovery.event_location,
        driver_id: 10,
        partner_id: 15,
        partner_name: 'New Rochelle Food Pantry',
        partner_address: '123 Main St, New Rochelle, NY 10801',
        status: 'accepted' as const,
        accepted_at: new Date().toISOString(),
        picked_up_at: null,
        delivered_at: null,
        created_at: new Date().toISOString(),
      };

      // Move from available to active
      setAvailableRecoveries(availableRecoveries.filter(r => r.id !== reportId));
      setActiveDeliveries([...activeDeliveries, newDelivery]);
      alert('Delivery accepted! Check your active deliveries for pickup and delivery details.');
    }
  };

  const handleUpdateStatus = (deliveryId: number, status: string) => {
    setActiveDeliveries(activeDeliveries.map(delivery => {
      if (delivery.id === deliveryId) {
        const updated = { ...delivery, status: status as any };
        if (status === 'picked_up') {
          updated.picked_up_at = new Date().toISOString();
        } else if (status === 'delivered') {
          updated.delivered_at = new Date().toISOString();
        }
        return updated;
      }
      return delivery;
    }));
    alert(`Delivery status updated to ${status}`);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Driver Dashboard</h1>

      <div className="card">
        <div className="card-header">Available Food Recoveries</div>
        {availableRecoveries.length === 0 ? (
          <div className="empty-state">No available recoveries at this time. Check back soon!</div>
        ) : (
          <div className="grid">
            {availableRecoveries.map((recovery) => (
              <div key={recovery.id} className="card">
                <h3>{recovery.event_title}</h3>
                <p><strong>Location:</strong> {recovery.event_location}</p>
                <p><strong>Quantity:</strong> {recovery.food_quantity}</p>
                <p><strong>Description:</strong> {recovery.food_description}</p>
                <p><strong>Reported:</strong> {formatRelativeTime(recovery.reported_at)}</p>
                <button
                  className="btn btn-success"
                  onClick={() => handleAcceptDelivery(recovery.id)}
                >
                  Accept Delivery
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">Active Deliveries</div>
        {activeDeliveries.length === 0 ? (
          <div className="empty-state">No active deliveries</div>
        ) : (
          <div className="grid">
            {activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="card">
                <h3>{delivery.event_title}</h3>
                <p><strong>Pickup:</strong> {delivery.pickup_location}</p>
                <p><strong>Deliver to:</strong> {delivery.partner_name}</p>
                <p><strong>Address:</strong> {delivery.partner_address}</p>
                <p><strong>Status:</strong> <span className="badge" style={{ backgroundColor: '#7D1D3F', color: 'white' }}>{delivery.status}</span></p>

                {delivery.status === 'accepted' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpdateStatus(delivery.id, 'picked_up')}
                  >
                    Mark as Picked Up
                  </button>
                )}

                {delivery.status === 'picked_up' && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleUpdateStatus(delivery.id, 'delivered')}
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
