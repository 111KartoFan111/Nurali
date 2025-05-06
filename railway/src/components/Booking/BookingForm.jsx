import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './BookingForm.css';

const BookingForm = ({ selectedSeat, trainId, onBookingSubmit, loading }) => {
  const { user } = useAuth();
  const [passengerInfo, setPassengerInfo] = useState({
    passenger_name: '',
    passenger_document: ''
  });

  // Предзаполняем информацию о пассажире данными пользователя
  useEffect(() => {
    if (user) {
      setPassengerInfo({
        passenger_name: `${user.first_name} ${user.last_name}`,
        passenger_document: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPassengerInfo({
      ...passengerInfo,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Добавляем информацию о токене в лог для отладки
    console.log('Токен для бронирования:', localStorage.getItem('token'));
    
    onBookingSubmit({
      seat_id: selectedSeat.id,
      train_id: trainId,
      passenger_name: passengerInfo.passenger_name,
      passenger_document: passengerInfo.passenger_document
    });
  };

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
    <div className="booking-form-wrapper">
      <h3 className="booking-form-title">Информация о бронировании</h3>
      
      {selectedSeat ? (
        <div className="selected-seat-info">
          <p>
            <strong>Выбранное место:</strong> {selectedSeat.seat_number}
          </p>
          <p>
            <strong>Тип места:</strong> {getSeatTypeText(selectedSeat.seat_type)}
          </p>
          <p>
            <strong>Стоимость:</strong> {selectedSeat.price.toLocaleString()} ₸
          </p>
        </div>
      ) : (
        <div className="no-seat-selected">
          <p>Выберите место на схеме вагона для бронирования</p>
        </div>
      )}
      
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="passenger_name" className="form-label">ФИО пассажира</label>
          <input
            type="text"
            id="passenger_name"
            name="passenger_name"
            className="form-control"
            value={passengerInfo.passenger_name}
            onChange={handleInputChange}
            required
            pattern="[А-Яа-яA-Za-z\s]+"
            title="Введите ФИО, используя только буквы и пробелы"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="passenger_document" className="form-label">Номер документа (паспорт/ИИН)</label>
          <input
            type="text"
            id="passenger_document"
            name="passenger_document"
            className="form-control"
            value={passengerInfo.passenger_document}
            onChange={handleInputChange}
            required
            pattern="[0-9A-Za-z]+"
            title="Введите номер документа, используя только цифры и буквы"
          />
        </div>
        
        <button 
          type="submit" 
          className={`btn btn-primary booking-submit-btn ${loading ? 'loading' : ''}`}
          disabled={!selectedSeat || loading}
        >
          {loading ? 'Оформление...' : 'Забронировать билет'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;