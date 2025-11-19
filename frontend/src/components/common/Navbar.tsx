import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Iona Food Recovery Program
      </Link>

      <ul className="navbar-nav">
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>
            <li>
              <span className="nav-link" style={{ cursor: 'default' }}>
                {user?.name} ({user?.role})
              </span>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-secondary btn-small">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
