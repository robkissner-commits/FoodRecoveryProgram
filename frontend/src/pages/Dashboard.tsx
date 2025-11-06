import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import ReporterDashboard from '../components/dashboards/ReporterDashboard';
import DriverDashboard from '../components/dashboards/DriverDashboard';
import PartnerDashboard from '../components/dashboards/PartnerDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'reporter' && <ReporterDashboard />}
      {user.role === 'driver' && <DriverDashboard />}
      {user.role === 'partner' && <PartnerDashboard />}
    </div>
  );
}
