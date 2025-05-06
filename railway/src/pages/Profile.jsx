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
    
    // Загружаем бронирования
    fetchUserBookings();
  }, [user]);
  
  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await bookingsApi.getUserBookings();
      setBookings(data);
    } catch (err) {
      console.error('Ошибка при загрузке бронирований:', err);
      setError('Не удалось загрузить данные о бронированиях');
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
      
      const result = await bookingsApi.cancelBooking(bookingId);
      
      if (result) {
        // Обновляем список бронирований
        fetchUserBookings();
        setSuccessMessage('Бронирование успешно отменено');
      }
    } catch (err) {
      console.error('Ошибка при отмене бронирования:', err);
      setError('Не удалось отменить бронирование');
    } finally {
      setLoading(false);
    }
  };
  
  // Форматирование даты
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'd MMMM yyyy', { locale: ru });
    } catch (error) {
      return 'Неизвестно';
    }
  };
  
  // Форматирование времени
  const formatTime = (dateString) => {
    try {
      return format(parseISO(dateString), 'HH:mm', { locale: ru });
    } catch (error) {
      return 'Неизвестно';
    }
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
              {bookings.map(booking => (
                <div key={booking.id} className="booking-card card">
                  <div className="booking-header">
                    <div className="booking-status">
                      {booking.status === 'active' && (
                        <span className="status active">Активно</span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="status completed">Завершено</span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="status cancelled">Отменено</span>
                      )}
                    </div>
                    <div className="booking-date">
                      Дата бронирования: {formatDate(booking.booking_date)}
                    </div>
                  </div>
                  
                  <div className="booking-info">
                    <div className="route-info">
                      <div className="train-details">
                        <span className="train-number">Поезд №{booking.train.train_number}</span>
                        <span className="train-type">{booking.train.train_type}</span>
                      </div>
                      
                      <div className="route-direction">
                        <div className="station">
                          <div className="time">{formatTime(booking.train.departure_time)}</div>
                          <div className="date">{formatDate(booking.train.departure_time)}</div>
                          <div className="city">{booking.train.route.origin}</div>
                        </div>
                        
                        <div className="direction-arrow">→</div>
                        
                        <div className="station">
                          <div className="time">{formatTime(booking.train.arrival_time)}</div>
                          <div className="date">{formatDate(booking.train.arrival_time)}</div>
                          <div className="city">{booking.train.route.destination}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="passenger-info">
                      <div className="passenger-name">
                        <strong>Пассажир:</strong> {booking.passenger_name}
                      </div>
                      <div className="passenger-document">
                        <strong>Документ:</strong> {booking.passenger_document}
                      </div>
                    </div>
                    
                    <div className="ticket-info">
                      <div className="carriage-info">
                        <strong>Вагон:</strong> {booking.seat.carriage.carriage_number} 
                        ({booking.seat.carriage.carriage_type})
                      </div>
                      <div className="seat-info">
                        <strong>Место:</strong> {booking.seat.seat_number} 
                        ({
                          booking.seat.seat_type === 'upper' ? 'Верхнее' :
                          booking.seat.seat_type === 'lower' ? 'Нижнее' :
                          booking.seat.seat_type === 'side' ? 'Боковое' :
                          booking.seat.seat_type === 'luxury' ? 'Люкс' : 'Неизвестно'
                        })
                      </div>
                      <div className="price-info">
                        <strong>Стоимость:</strong> {booking.seat.price.toLocaleString()} ₸
                      </div>
                    </div>
                  </div>
                  
                  {booking.status === 'active' && (
                    <div className="booking-actions">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={loading}
                      >
                        Отменить бронирование
                      </button>
                    </div>
                  )}
                </div>
              ))}
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