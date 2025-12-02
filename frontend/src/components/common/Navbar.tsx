import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, setUserRole } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Iona Food Recovery Program
      </Link>

      <ul className="navbar-nav">
        <li>
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
        </li>
        <li>
          <span className="nav-link" style={{ cursor: 'default' }}>
            {user?.name}
          </span>
        </li>
        <li>
          <select
            value={user?.role}
            onChange={(e) => setUserRole(e.target.value as any)}
            className="btn btn-secondary btn-small"
            style={{ cursor: 'pointer' }}
          >
            <option value="admin">Admin</option>
            <option value="reporter">Reporter</option>
            <option value="driver">Driver</option>
            <option value="both">Both</option>
          </select>
        </li>
      </ul>
    </nav>
  );
}
