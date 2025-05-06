import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { bookingsApi } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, account
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  // Загружаем данные пользователя и его бронирования
  useEffect(() => {
    // Заполняем форму данными пользователя
    if (user) {
      setFormData({
        ...formData,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || ''
      });
    }
    
    // Загружаем бронирования при первом рендеринге
    // и при переключении на вкладку бронирований
    if (activeTab === 'bookings') {
      fetchUserBookings();
    }
  }, [user, activeTab]);
  
  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Отладочная информация
      console.log('Запрос бронирований. Токен:', localStorage.getItem('token'));
      
      // Важно: мы используем прямой вызов axios вместо нашего API слоя для отладки
      const response = await fetch('http://localhost:5000/api/bookings/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Полученные бронирования:', data);
      setBookings(data);
    } catch (err) {
      console.error('Ошибка при загрузке бронирований:', err);
      setError(`Не удалось загрузить данные о бронированиях: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSuccessMessage('');
    setError('');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');
    
    const { first_name, last_name, phone, password, confirmPassword } = formData;
    
    // Проверка паролей, если они введены
    if (password && password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    try {
      setLoading(true);
      
      const result = await updateProfile({
        first_name,
        last_name,
        phone,
        password: password || undefined
      });
      
      if (result.success) {
        setSuccessMessage('Профиль успешно обновлен');
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setError('Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError('');
      
      // Отладочная информация
      console.log(`Отмена бронирования ${bookingId}. Токен:`, localStorage.getItem('token'));
      
      try {
        // Используем API клиент вместо прямого fetch
        await bookingsApi.cancelBooking(bookingId);
        
        // Обновляем список бронирований
        fetchUserBookings();
        setSuccessMessage('Бронирование успешно отменено');
      } catch (err) {
        console.error('Ошибка при отмене бронирования:', err);
        setError(`Не удалось отменить бронирование: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  // Форматирование даты
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'd MMMM yyyy', { locale: ru });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error, dateString);
      return 'Неизвестно';
    }
  };
  
  // Форматирование времени
  const formatTime = (dateString) => {
    try {
      return format(parseISO(dateString), 'HH:mm', { locale: ru });
    } catch (error) {
      console.error('Ошибка форматирования времени:', error, dateString);
      return 'Неизвестно';
    }
  };
  
  // Получение текстового статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };
  
  // Получение текстового типа места
  const getSeatTypeText = (type) => {
    switch (type) {
      case 'upper': return 'Верхнее';
      case 'lower': return 'Нижнее';
      case 'side': return 'Боковое';
      case 'luxury': return 'Люкс';
      default: return 'Неизвестно';
    }
  };
  
  // Рендер элементов бронирования с проверками на null и undefined
  const renderBooking = (booking) => {
    if (!booking) return null;
    
    // Проверяем наличие необходимых свойств
    const hasTrain = booking.train && typeof booking.train === 'object';
    const hasSeat = booking.seat && typeof booking.seat === 'object';
    
    // Проверяем наличие вложенных свойств
    const hasRouteInfo = hasTrain && booking.train.route && typeof booking.train.route === 'object';
    const hasCarriageInfo = hasSeat && booking.seat.carriage && typeof booking.seat.carriage === 'object';
    
    return (
      <div key={booking.id} className="booking-card card">
        <div className="booking-header">
          <div className="booking-status">
            <span className={`status ${booking.status || 'unknown'}`}>
              {getStatusText(booking.status)}
            </span>
          </div>
          <div className="booking-date">
            Дата бронирования: {formatDate(booking.booking_date)}
          </div>
        </div>
        
        <div className="booking-info">
          <div className="route-info">
            {hasTrain && (
              <div className="train-details">
                <span className="train-number">Поезд №{booking.train.train_number || 'Неизвестно'}</span>
                <span className="train-type">{booking.train.train_type || 'Неизвестно'}</span>
              </div>
            )}
            
            {hasTrain && hasRouteInfo && (
              <div className="route-direction">
                <div className="station">
                  <div className="time">{formatTime(booking.train.departure_time)}</div>
                  <div className="date">{formatDate(booking.train.departure_time)}</div>
                  <div className="city">{booking.train.route.origin || 'Неизвестно'}</div>
                </div>
                
                <div className="direction-arrow">→</div>
                
                <div className="station">
                  <div className="time">{formatTime(booking.train.arrival_time)}</div>
                  <div className="date">{formatDate(booking.train.arrival_time)}</div>
                  <div className="city">{booking.train.route.destination || 'Неизвестно'}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="passenger-info">
            <div className="passenger-name">
              <strong>Пассажир:</strong> {booking.passenger_name || 'Неизвестно'}
            </div>
            <div className="passenger-document">
              <strong>Документ:</strong> {booking.passenger_document || 'Неизвестно'}
            </div>
          </div>
          
          <div className="ticket-info">
            {hasSeat && hasCarriageInfo && (
              <>
                <div className="carriage-info">
                  <strong>Вагон:</strong> {booking.seat.carriage.carriage_number || 'Неизвестно'} 
                  ({booking.seat.carriage.carriage_type || 'Неизвестно'})
                </div>
                <div className="seat-info">
                  <strong>Место:</strong> {booking.seat.seat_number || 'Неизвестно'} 
                  ({getSeatTypeText(booking.seat.seat_type)})
                </div>
                <div className="price-info">
                  <strong>Стоимость:</strong> {booking.price || (booking.seat.price && booking.seat.price.toLocaleString())} ₸
                </div>
              </>
            )}
          </div>
        </div>
        
        {booking.status === 'active' && (
          <div className="booking-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => handleCancelBooking(booking.id)}
              disabled={loading}
            >
              {loading ? 'Отмена...' : 'Отменить бронирование'}
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="profile-page">
      <h1 className="profile-title">Личный кабинет</h1>
      
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => handleTabChange('bookings')}
        >
          Мои билеты
        </button>
        <button 
          className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => handleTabChange('account')}
        >
          Настройки аккаунта
        </button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      
      {activeTab === 'bookings' && (
        <div className="bookings-tab">
          <h2 className="tab-title">Мои билеты</h2>
          
          <div className="debug-info" style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '5px' }}>
            <p><strong>Отладочная информация:</strong></p>
            <p>Токен: {localStorage.getItem('token') ? 'Присутствует' : 'Отсутствует'}</p>
            <p>ID пользователя: {user?.id || 'Неизвестно'}</p>
            <button 
              className="btn btn-primary" 
              onClick={fetchUserBookings}
              style={{ marginTop: '0.5rem' }}
            >
              Обновить бронирования
            </button>
          </div>
          
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <p>Загрузка бронирований...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="no-bookings card">
              <p>У вас пока нет забронированных билетов</p>
              <a href="/search" className="btn btn-primary">Забронировать билет</a>
            </div>
          ) : (
            <div className="bookings-list">
              {Array.isArray(bookings) ? (
                bookings.map(booking => renderBooking(booking))
              ) : (
                <div className="alert alert-danger">
                  Неверный формат данных о бронированиях. Ожидался массив, получено: {typeof bookings}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'account' && (
        <div className="account-tab">
          <h2 className="tab-title">Настройки аккаунта</h2>
          
          <div className="account-info card">
            <div className="user-email">
              <strong>Email:</strong> {user?.email}
            </div>
            
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name" className="form-label">Имя</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name" className="form-label">Фамилия</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Телефон</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">Новый пароль (оставьте пустым, чтобы не менять)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength="6"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Подтвердите новый пароль</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  minLength="6"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={logout}
                >
                  Выйти из аккаунта
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;