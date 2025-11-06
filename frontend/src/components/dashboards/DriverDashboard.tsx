import React, { useState, useEffect } from 'react';
import { dashboardAPI, deliveriesAPI } from '../../services/api';
import { RecoveryReport, Delivery } from '../../types';
import { formatRelativeTime } from '../../utils/format';

export default function DriverDashboard() {
  const [availableRecoveries, setAvailableRecoveries] = useState<RecoveryReport[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getDriver();
      setAvailableRecoveries(response.data.availableRecoveries || []);
      setActiveDeliveries(response.data.activeDeliveries || []);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async (reportId: number) => {
    try {
      await deliveriesAPI.accept(reportId);
      alert('Delivery accepted! Check your active deliveries.');
      fetchDashboard();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept delivery');
    }
  };

  const handleUpdateStatus = async (deliveryId: number, status: string) => {
    try {
      await deliveriesAPI.updateStatus(deliveryId, status);
      alert(`Delivery status updated to ${status}`);
      fetchDashboard();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

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
                <p><strong>Status:</strong> <span className="badge" style={{ backgroundColor: '#3b82f6', color: 'white' }}>{delivery.status}</span></p>

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
