import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { Partner, Delivery } from '../../types';
import { formatDateTime } from '../../utils/format';

export default function PartnerDashboard() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [incomingDeliveries, setIncomingDeliveries] = useState<Delivery[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getPartner();
      setPartner(response.data.partner);
      setIncomingDeliveries(response.data.incomingDeliveries || []);
      setDeliveryHistory(response.data.deliveryHistory || []);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  if (!partner) {
    return (
      <div className="container">
        <div className="card">
          <h2>Partner Profile Not Found</h2>
          <p>Please contact an administrator to set up your organization's profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>{partner.organization_name}</h1>

      <div className="card">
        <div className="card-header">Organization Info</div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <strong>Address:</strong> {partner.address}
          </div>
          <div>
            <strong>Contact:</strong> {partner.contact_name} - {partner.contact_phone}
          </div>
          <div>
            <strong>Operating Hours:</strong> {partner.operating_hours || 'Not specified'}
          </div>
          <div>
            <strong>Current Need Level:</strong>{' '}
            <span
              className="badge"
              style={{
                backgroundColor:
                  partner.current_need_level === 'high'
                    ? '#ef4444'
                    : partner.current_need_level === 'medium'
                    ? '#f59e0b'
                    : '#10b981',
                color: 'white',
              }}
            >
              {partner.current_need_level}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Incoming Deliveries</div>
        {incomingDeliveries.length === 0 ? (
          <div className="empty-state">No incoming deliveries</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Driver</th>
                <th>Food Description</th>
                <th>Status</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {incomingDeliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>{delivery.event_title}</td>
                  <td>{delivery.driver_name}</td>
                  <td>{delivery.food_description}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                      {delivery.status}
                    </span>
                  </td>
                  <td>{delivery.pickup_time ? formatDateTime(delivery.pickup_time) : 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="card-header">Delivery History</div>
        {deliveryHistory.length === 0 ? (
          <div className="empty-state">No delivery history</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Driver</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveryHistory.slice(0, 10).map((delivery) => (
                <tr key={delivery.id}>
                  <td>{delivery.delivery_time ? formatDateTime(delivery.delivery_time) : 'N/A'}</td>
                  <td>{delivery.event_title}</td>
                  <td>{delivery.driver_name}</td>
                  <td>{delivery.food_quantity}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: delivery.status === 'delivered' ? '#10b981' : '#6b7280',
                        color: 'white',
                      }}
                    >
                      {delivery.status}
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
