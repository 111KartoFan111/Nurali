import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { routesApi, bookingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Booking.css';

const Booking = () => {
  const { trainId, carriageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [train, setTrain] = useState(null);
  const [carriages, setCarriages] = useState([]);
  const [activeCarriage, setActiveCarriage] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [passengerInfo, setPassengerInfo] = useState({
    passenger_name: '',
    passenger_document: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Загружаем информацию о поезде и вагонах
  useEffect(() => {
    const fetchTrainAndCarriages = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Загружаем список вагонов поезда
        const carriagesData = await routesApi.getTrainCarriages(trainId);
        setCarriages(carriagesData);
        
        // Находим вагоны нужного типа
        const filteredCarriages = carriagesData.filter(c => c.carriage_type === carriageId);
        
        if (filteredCarriages.length > 0) {
          const firstCarriage = filteredCarriages[0];
          setActiveCarriage(firstCarriage);
          
          // Загружаем места выбранного вагона
          const seatsData = await routesApi.getCarriageSeats(firstCarriage.id);
          setSeats(seatsData);
        } else {
          setError('Вагоны выбранного типа не найдены');
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные о вагонах и местах');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrainAndCarriages();
  }, [trainId, carriageId]);
  
  // Предзаполняем информацию о пассажире данными пользователя
  useEffect(() => {
    if (user) {
      setPassengerInfo({
        passenger_name: `${user.first_name} ${user.last_name}`,
        passenger_document: ''
      });
    }
  }, [user]);
  
  const handleCarriageSelect = async (carriage) => {
    try {
      setActiveCarriage(carriage);
      setSelectedSeat(null);
      
      // Загружаем места выбранного вагона
      const seatsData = await routesApi.getCarriageSeats(carriage.id);
      setSeats(seatsData);
    } catch (err) {
      console.error('Ошибка при загрузке мест:', err);
      setError('Не удалось загрузить данные о местах');
    }
  };
  
  const handleSeatSelect = (seat) => {
    if (seat.status === 'free') {
      setSelectedSeat(seat);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPassengerInfo({
      ...passengerInfo,
      [name]: value
    });
  };
  
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSeat) {
      setError('Выберите место для бронирования');
      return;
    }
    
    try {
      setBookingLoading(true);
      setError('');
      
      const result = await bookingsApi.createBooking({
        seat_id: selectedSeat.id,
        train_id: trainId,
        passenger_name: passengerInfo.passenger_name,
        passenger_document: passengerInfo.passenger_document
      });
      
      setBookingSuccess(true);
      
      // Через 3 секунды перенаправляем в профиль
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (err) {
      console.error('Ошибка при бронировании:', err);
      setError('Не удалось создать бронирование. Пожалуйста, попробуйте снова.');
    } finally {
      setBookingLoading(false);
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
  
  // Форматирование даты
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'd MMMM yyyy', { locale: ru });
    } catch (error) {
      return 'Неизвестно';
    }
  };
  
  // Отображение схемы вагона и мест
  const renderCarriageScheme = () => {
    if (!activeCarriage || seats.length === 0) {
      return <p>Выберите вагон для отображения схемы мест</p>;
    }
    
    // Группируем места по типу вагона
    if (activeCarriage.carriage_type === 'Плацкарт') {
      return renderPlacartScheme();
    } else if (activeCarriage.carriage_type === 'Купе') {
      return renderCoupeScheme();
    } else if (activeCarriage.carriage_type === 'Люкс') {
      return renderLuxuryScheme();
    }
    
    return <p>Неизвестный тип вагона</p>;
  };
  
  // Схема плацкартного вагона
  const renderPlacartScheme = () => {
    const seatsByNumber = {};
    seats.forEach(seat => {
      seatsByNumber[seat.seat_number] = seat;
    });
    
    // Создаем схему плацкартного вагона (9 купе по 6 мест)
    const compartments = [];
    for (let i = 1; i <= 9; i++) {
      const lowerLeft = seatsByNumber[(i - 1) * 6 + 1] || { status: 'unknown', price: 'N/A' };
      const upperLeft = seatsByNumber[(i - 1) * 6 + 2] || { status: 'unknown', price: 'N/A' };
      const lowerRight = seatsByNumber[(i - 1) * 6 + 3] || { status: 'unknown', price: 'N/A' };
      const upperRight = seatsByNumber[(i - 1) * 6 + 4] || { status: 'unknown', price: 'N/A' };
      const lowerSide = seatsByNumber[(i - 1) * 6 + 5] || { status: 'unknown', price: 'N/A' };
      const upperSide = seatsByNumber[(i - 1) * 6 + 6] || { status: 'unknown', price: 'N/A' };
      
      compartments.push(
        <div key={i} className="placart-compartment">
          <div className="main-seats">
            <div 
              className={`seat ${lowerLeft.status} ${selectedSeat?.id === lowerLeft.id ? 'selected' : ''}`}
              onClick={() => handleSeatSelect(lowerLeft)}
            >
              <span className="seat-number">{lowerLeft.seat_number}</span>
              <span className="seat-price">{lowerLeft.price} ₸</span>
            </div>
            <div 
              className={`seat ${upperLeft.status} ${selectedSeat?.id === upperLeft.id ? 'selected' : ''}`}
              onClick={() => handleSeatSelect(upperLeft)}
            >
              <span className="seat-number">{upperLeft.seat_number}</span>
              <span className="seat-price">{upperLeft.price} ₸</span>
            </div>
            <div 
              className={`seat ${lowerRight.status} ${selectedSeat?.id === lowerRight.id ? 'selected' : ''}`}
              onClick={() => handleSeatSelect(lowerRight)}
            >
              <span className="seat-number">{lowerRight.seat_number}</span>
              <span className="seat-price">{lowerRight.price} ₸</span>
            </div>
            <div 
              className={`seat ${upperRight.status} ${selectedSeat?.id === upperRight.id ? 'selected' : ''}`}
              onClick={() => handleSeatSelect(upperRight)}
            >
              <span className="seat-number">{upperRight.seat_number}</span>
              <span className="seat-price">{upperRight.price} ₸</span>
            </div>
          </div>
          <div className="side-seats">
            <div 
              className={`seat ${lowerSide.status} ${selectedSeat?.id === lowerSide.id ? 'selected' : ''}`}
              onClick={() => handleSeatSelect(lowerSide)}
            >
              <span className="seat-number">{lowerSide.seat_number}</span>
              <span className="seat-price">{lowerSide.price} ₸</span>
            </div>
            <div 
              className={`seat ${upperSide.status} ${selectedSeat?.id === upperSide.id ? 'selected' : ''}`}
              onClick={() => handleSeatSelect(upperSide)}
            >
              <span className="seat-number">{upperSide.seat_number}</span>
              <span className="seat-price">{upperSide.price} ₸</span>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="carriage-scheme placart-scheme">
        <div className="scheme-legend">
          <div className="legend-item">
            <div className="legend-color free"></div>
            <div className="legend-text">Свободно</div>
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div>
            <div className="legend-text">Занято</div>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <div className="legend-text">Выбрано</div>
          </div>
        </div>
        
        <div className="scheme-compartments">
          {compartments}
        </div>
      </div>
    );
  };
  
  // Схема купейного вагона
  const renderCoupeScheme = () => {
    const seatsByNumber = {};
    seats.forEach(seat => {
      seatsByNumber[seat.seat_number] = seat;
    });
    
    // Создаем схему купейного вагона (9 купе по 4 места)
    const compartments = [];
    for (let i = 1; i <= 9; i++) {
      const lowerLeft = seatsByNumber[(i - 1) * 4 + 1] || { status: 'unknown', price: 'N/A' };
      const upperLeft = seatsByNumber[(i - 1) * 4 + 2] || { status: 'unknown', price: 'N/A' };
      const lowerRight = seatsByNumber[(i - 1) * 4 + 3] || { status: 'unknown', price: 'N/A' };
      const upperRight = seatsByNumber[(i - 1) * 4 + 4] || { status: 'unknown', price: 'N/A' };
      
      compartments.push(
        <div key={i} className="coupe-compartment">
          <div 
            className={`seat ${lowerLeft.status} ${selectedSeat?.id === lowerLeft.id ? 'selected' : ''}`}
            onClick={() => handleSeatSelect(lowerLeft)}
          >
            <span className="seat-number">{lowerLeft.seat_number}</span>
            <span className="seat-price">{lowerLeft.price} ₸</span>
          </div>
          <div 
            className={`seat ${upperLeft.status} ${selectedSeat?.id === upperLeft.id ? 'selected' : ''}`}
            onClick={() => handleSeatSelect(upperLeft)}
          >
            <span className="seat-number">{upperLeft.seat_number}</span>
            <span className="seat-price">{upperLeft.price} ₸</span>
          </div>
          <div 
            className={`seat ${lowerRight.status} ${selectedSeat?.id === lowerRight.id ? 'selected' : ''}`}
            onClick={() => handleSeatSelect(lowerRight)}
          >
            <span className="seat-number">{lowerRight.seat_number}</span>
            <span className="seat-price">{lowerRight.price} ₸</span>
          </div>
          <div 
            className={`seat ${upperRight.status} ${selectedSeat?.id === upperRight.id ? 'selected' : ''}`}
            onClick={() => handleSeatSelect(upperRight)}
          >
            <span className="seat-number">{upperRight.seat_number}</span>
            <span className="seat-price">{upperRight.price} ₸</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="carriage-scheme coupe-scheme">
        <div className="scheme-legend">
          <div className="legend-item">
            <div className="legend-color free"></div>
            <div className="legend-text">Свободно</div>
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div>
            <div className="legend-text">Занято</div>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <div className="legend-text">Выбрано</div>
          </div>
        </div>
        
        <div className="scheme-compartments">
          {compartments}
        </div>
      </div>
    );
  };
  
  // Схема люкс вагона
  const renderLuxuryScheme = () => {
    const seatsByNumber = {};
    seats.forEach(seat => {
      seatsByNumber[seat.seat_number] = seat;
    });
    
    // Создаем схему люкс вагона (9 купе по 2 места)
    const compartments = [];
    for (let i = 1; i <= 9; i++) {
      const lower = seatsByNumber[(i - 1) * 2 + 1] || { status: 'unknown', price: 'N/A' };
      const upper = seatsByNumber[(i - 1) * 2 + 2] || { status: 'unknown', price: 'N/A' };
      
      compartments.push(
        <div key={i} className="luxury-compartment">
          <div 
            className={`seat ${lower.status} ${selectedSeat?.id === lower.id ? 'selected' : ''}`}
            onClick={() => handleSeatSelect(lower)}
          >
            <span className="seat-number">{lower.seat_number}</span>
            <span className="seat-price">{lower.price} ₸</span>
          </div>
          <div 
            className={`seat ${upper.status} ${selectedSeat?.id === upper.id ? 'selected' : ''}`}
            onClick={() => handleSeatSelect(upper)}
          >
            <span className="seat-number">{upper.seat_number}</span>
            <span className="seat-price">{upper.price} ₸</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="carriage-scheme luxury-scheme">
        <div className="scheme-legend">
          <div className="legend-item">
            <div className="legend-color free"></div>
            <div className="legend-text">Свободно</div>
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div>
            <div className="legend-text">Занято</div>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <div className="legend-text">Выбрано</div>
          </div>
        </div>
        
        <div className="scheme-compartments">
          {compartments}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Загрузка информации о вагонах и местах...</p>
      </div>
    );
  }
  
  if (bookingSuccess) {
    return (
      <div className="booking-success card">
        <h2>Бронирование успешно!</h2>
        <p>Ваш билет забронирован. Вы будете перенаправлены в личный кабинет через несколько секунд...</p>
      </div>
    );
  }
  
  return (
    <div className="booking-page">
      <h1 className="booking-title">Выбор места и бронирование</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="booking-container">
        <div className="carriage-selection card">
          <h2>Выберите вагон</h2>
          
          <div className="carriages-list">
            {carriages
              .filter(c => c.carriage_type === carriageId)
              .map(carriage => (
                <button 
                  key={carriage.id}
                  className={`carriage-btn ${activeCarriage?.id === carriage.id ? 'active' : ''}`}
                  onClick={() => handleCarriageSelect(carriage)}
                >
                  Вагон {carriage.carriage_number}
                  <span className="free-seats-count">
                    Свободно: {carriage.free_seats_count}
                  </span>
                </button>
              ))}
          </div>
          
          <div className="carriage-scheme-container">
            <h3>Схема вагона {activeCarriage?.carriage_number}</h3>
            {renderCarriageScheme()}
          </div>
        </div>
        
        <div className="booking-form-container card">
          <h2>Информация о бронировании</h2>
          
          {selectedSeat ? (
            <div className="selected-seat-info">
              <p>
                <strong>Выбранное место:</strong> {selectedSeat.seat_number}
              </p>
              <p>
                <strong>Тип места:</strong> {
                  selectedSeat.seat_type === 'upper' ? 'Верхнее' :
                  selectedSeat.seat_type === 'lower' ? 'Нижнее' :
                  selectedSeat.seat_type === 'side' ? 'Боковое' :
                  selectedSeat.seat_type === 'luxury' ? 'Люкс' : 'Неизвестно'
                }
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
          
          <form className="booking-form" onSubmit={handleBookingSubmit}>
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
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary booking-submit-btn"
              disabled={!selectedSeat || bookingLoading}
            >
              {bookingLoading ? 'Оформление...' : 'Забронировать билет'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;