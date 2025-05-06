import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import './BookingCard.css';

const BookingCard = ({ booking, onCancel, loading }) => {
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
  
  // Определение текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  // Определение типа места
  const getSeatTypeText = (type) => {
    switch (type) {
      case 'upper': return 'Верхнее';
      case 'lower': return 'Нижнее';
      case 'side': return 'Боковое';
      case 'luxury': return 'Люкс';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-header">
        <div className="booking-status">
          <span className={`status ${booking.status}`}>
            {getStatusText(booking.status)}
          </span>
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
            ({getSeatTypeText(booking.seat.seat_type)})
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
            onClick={() => onCancel(booking.id)}
            disabled={loading}
          >
            {loading ? 'Отмена...' : 'Отменить бронирование'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;