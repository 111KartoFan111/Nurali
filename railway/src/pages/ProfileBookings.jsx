import { useState, useEffect } from 'react';
import BookingCard from '../components/Booking/BookingCard';
import { bookingsApi } from '../services/api';
import './ProfileBookings.css';

const ProfileBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Загрузка бронирований при монтировании компонента
  useEffect(() => {
    fetchBookings();
  }, []);

  // Функция для загрузки бронирований
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Запрос на получение бронирований');
      const data = await bookingsApi.getUserBookings();
      console.log('Полученные бронирования:', data);
      setBookings(data);
    } catch (err) {
      console.error('Ошибка при загрузке бронирований:', err);
      setError('Не удалось загрузить данные о бронированиях');
    } finally {
      setLoading(false);
    }
  };

  // Функция для отмены бронирования
  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Вы уверены, что хотите отменить бронирование?')) {
      setCancellingId(bookingId);
      try {
        await bookingsApi.cancelBooking(bookingId);
        // Обновляем список бронирований после отмены
        fetchBookings();
      } catch (err) {
        console.error('Ошибка при отмене бронирования:', err);
        alert('Не удалось отменить бронирование. Пожалуйста, попробуйте позже.');
      } finally {
        setCancellingId(null);
      }
    }
  };

  // Функция для перехода на страницу бронирования
  const handleBookNew = () => {
    window.location.href = '/search';
  };

  return (
    <div className="profile-bookings">
      <h2>Мои билеты</h2>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка бронирований...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="bookings-list">
          {bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
              loading={cancellingId === booking.id}
            />
          ))}
        </div>
      ) : (
        <div className="no-bookings">
          <p>У вас пока нет забронированных билетов</p>
          <button 
            className="btn btn-primary"
            onClick={handleBookNew}
          >
            Забронировать билет
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileBookings;