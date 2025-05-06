import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="navbar" ref={navbarRef}>
      <div className="navbar-container">
        <div className="logo-section">
          <div className="logo-circle">
            <img src="/logo.png" alt="TemirZhol Logo" className="logo-image" />
          </div>
          <div className="logo-text">
            <Link to="/" className="navbar-brand">TemirZhol</Link>
            <p>Твой путь к комфортным путешествиям</p>
          </div>
        </div>

        <button className={`mobile-menu-btn ${mobileMenuOpen ? 'mobile-menu-open' : ''}`} onClick={toggleMobileMenu}>
          <span className="mobile-menu-icon"></span>
        </button>

        <nav className={`navbar-nav ${mobileMenuOpen ? 'show' : ''}`}>
          <div className="phone-section">
            <span className="phone-icon">📞</span>
            <a href="tel:+70000000000" className="phone-number">+7 (777) 111 21 34</a>
          </div>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">Главная</Link>
            </li>
            <li className="nav-item">
              <Link to="/search" className="nav-link">Поиск билетов</Link>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link to="/profile" className="nav-link">Личный кабинет</Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link_exit">Выход</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Вход</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">Регистрация</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;