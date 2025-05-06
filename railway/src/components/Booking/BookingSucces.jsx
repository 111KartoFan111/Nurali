import { Link } from 'react-router-dom';
import './BookingSuccess.css';

const BookingSuccess = () => {
  return (
    <div className="booking-success">
      <div className="success-icon">✓</div>
      <h2>Бронирование успешно!</h2>
      <p>Ваш билет забронирован. Вы можете просмотреть детали в личном кабинете.</p>
      <div className="success-actions">
        <Link to="/profile" className="btn btn-primary">
          Перейти в личный кабинет
        </Link>
        <Link to="/search" className="btn btn-secondary">
          Искать ещё билеты
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;