import React, { useState } from 'react';
import ReporterDashboard from './ReporterDashboard';
import DriverDashboard from './DriverDashboard';

export default function BothDashboard() {
  const [activeTab, setActiveTab] = useState<'reporter' | 'driver'>('reporter');

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('reporter')}
          className={`btn ${activeTab === 'reporter' ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            borderRadius: '0.375rem 0.375rem 0 0',
            borderBottom: activeTab === 'reporter' ? '3px solid #3b82f6' : 'none'
          }}
        >
          Reporter View
        </button>
        <button
          onClick={() => setActiveTab('driver')}
          className={`btn ${activeTab === 'driver' ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            borderRadius: '0.375rem 0.375rem 0 0',
            borderBottom: activeTab === 'driver' ? '3px solid #3b82f6' : 'none'
          }}
        >
          Driver View
        </button>
      </div>

      {activeTab === 'reporter' && <ReporterDashboard />}
      {activeTab === 'driver' && <DriverDashboard />}
    </div>
  );
}
