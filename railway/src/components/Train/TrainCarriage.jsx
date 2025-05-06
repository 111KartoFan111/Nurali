import { useState } from 'react';
import './TrainCarriage.css';

const TrainCarriage = ({ carriage, seats, onSeatSelect, selectedSeat }) => {
  const [showLegend, setShowLegend] = useState(false);

  // Группируем места по номеру
  const seatsByNumber = {};
  seats.forEach(seat => {
    seatsByNumber[seat.seat_number] = seat;
  });

  const toggleLegend = () => {
    setShowLegend(!showLegend);
  };

  // Выбор схемы вагона в зависимости от типа
  const renderCarriageScheme = () => {
    if (carriage.carriage_type === 'Плацкарт') {
      return renderPlacartScheme();
    } else if (carriage.carriage_type === 'Купе') {
      return renderCoupeScheme();
    } else if (carriage.carriage_type === 'Люкс') {
      return renderLuxuryScheme();
    }
    
    return <p>Неизвестный тип вагона</p>;
  };

  // Схема плацкартного вагона
  const renderPlacartScheme = () => {
    // Создаем схему плацкартного вагона (9 купе по 6 мест)
    const compartments = [];
    
    for (let i = 1; i <= 9; i++) {
      const lowerLeft = seatsByNumber[(i - 1) * 6 + 1] || { status: 'unknown' };
      const upperLeft = seatsByNumber[(i - 1) * 6 + 2] || { status: 'unknown' };
      const lowerRight = seatsByNumber[(i - 1) * 6 + 3] || { status: 'unknown' };
      const upperRight = seatsByNumber[(i - 1) * 6 + 4] || { status: 'unknown' };
      const lowerSide = seatsByNumber[(i - 1) * 6 + 5] || { status: 'unknown' };
      const upperSide = seatsByNumber[(i - 1) * 6 + 6] || { status: 'unknown' };
      
      compartments.push(
        <div key={i} className="placart-compartment">
          <div className="main-seats">
            <div 
              className={`seat ${lowerLeft.status} ${selectedSeat?.id === lowerLeft.id ? 'selected' : ''}`}
              onClick={() => lowerLeft.status === 'free' && onSeatSelect(lowerLeft)}
            >
              <span className="seat-number">{lowerLeft.seat_number}</span>
              <span className="seat-price">{lowerLeft.price} ₸</span>
            </div>
            <div 
              className={`seat ${upperLeft.status} ${selectedSeat?.id === upperLeft.id ? 'selected' : ''}`}
              onClick={() => upperLeft.status === 'free' && onSeatSelect(upperLeft)}
            >
              <span className="seat-number">{upperLeft.seat_number}</span>
              <span className="seat-price">{upperLeft.price} ₸</span>
            </div>
            <div 
              className={`seat ${lowerRight.status} ${selectedSeat?.id === lowerRight.id ? 'selected' : ''}`}
              onClick={() => lowerRight.status === 'free' && onSeatSelect(lowerRight)}
            >
              <span className="seat-number">{lowerRight.seat_number}</span>
              <span className="seat-price">{lowerRight.price} ₸</span>
            </div>
            <div 
              className={`seat ${upperRight.status} ${selectedSeat?.id === upperRight.id ? 'selected' : ''}`}
              onClick={() => upperRight.status === 'free' && onSeatSelect(upperRight)}
            >
              <span className="seat-number">{upperRight.seat_number}</span>
              <span className="seat-price">{upperRight.price} ₸</span>
            </div>
          </div>
          <div className="side-seats">
            <div 
              className={`seat ${lowerSide.status} ${selectedSeat?.id === lowerSide.id ? 'selected' : ''}`}
              onClick={() => lowerSide.status === 'free' && onSeatSelect(lowerSide)}
            >
              <span className="seat-number">{lowerSide.seat_number}</span>
              <span className="seat-price">{lowerSide.price} ₸</span>
            </div>
            <div 
              className={`seat ${upperSide.status} ${selectedSeat?.id === upperSide.id ? 'selected' : ''}`}
              onClick={() => upperSide.status === 'free' && onSeatSelect(upperSide)}
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
        <div className="scheme-compartments">
          {compartments}
        </div>
      </div>
    );
  };

  // Схема купейного вагона
  const renderCoupeScheme = () => {
    // Создаем схему купейного вагона (9 купе по 4 места)
    const compartments = [];
    
    for (let i = 1; i <= 9; i++) {
      const lowerLeft = seatsByNumber[(i - 1) * 4 + 1] || { status: 'unknown' };
      const upperLeft = seatsByNumber[(i - 1) * 4 + 2] || { status: 'unknown' };
      const lowerRight = seatsByNumber[(i - 1) * 4 + 3] || { status: 'unknown' };
      const upperRight = seatsByNumber[(i - 1) * 4 + 4] || { status: 'unknown' };
      
      compartments.push(
        <div key={i} className="coupe-compartment">
          <div 
            className={`seat ${lowerLeft.status} ${selectedSeat?.id === lowerLeft.id ? 'selected' : ''}`}
            onClick={() => lowerLeft.status === 'free' && onSeatSelect(lowerLeft)}
          >
            <span className="seat-number">{lowerLeft.seat_number}</span>
            <span className="seat-price">{lowerLeft.price} ₸</span>
          </div>
          <div 
            className={`seat ${upperLeft.status} ${selectedSeat?.id === upperLeft.id ? 'selected' : ''}`}
            onClick={() => upperLeft.status === 'free' && onSeatSelect(upperLeft)}
          >
            <span className="seat-number">{upperLeft.seat_number}</span>
            <span className="seat-price">{upperLeft.price} ₸</span>
          </div>
          <div 
            className={`seat ${lowerRight.status} ${selectedSeat?.id === lowerRight.id ? 'selected' : ''}`}
            onClick={() => lowerRight.status === 'free' && onSeatSelect(lowerRight)}
          >
            <span className="seat-number">{lowerRight.seat_number}</span>
            <span className="seat-price">{lowerRight.price} ₸</span>
          </div>
          <div 
            className={`seat ${upperRight.status} ${selectedSeat?.id === upperRight.id ? 'selected' : ''}`}
            onClick={() => upperRight.status === 'free' && onSeatSelect(upperRight)}
          >
            <span className="seat-number">{upperRight.seat_number}</span>
            <span className="seat-price">{upperRight.price} ₸</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="carriage-scheme coupe-scheme">
        <div className="scheme-compartments">
          {compartments}
        </div>
      </div>
    );
  };

  // Схема люкс вагона
  const renderLuxuryScheme = () => {
    // Создаем схему люкс вагона (9 купе по 2 места)
    const compartments = [];
    
    for (let i = 1; i <= 9; i++) {
      const lower = seatsByNumber[(i - 1) * 2 + 1] || { status: 'unknown' };
      const upper = seatsByNumber[(i - 1) * 2 + 2] || { status: 'unknown' };
      
      compartments.push(
        <div key={i} className="luxury-compartment">
          <div 
            className={`seat ${lower.status} ${selectedSeat?.id === lower.id ? 'selected' : ''}`}
            onClick={() => lower.status === 'free' && onSeatSelect(lower)}
          >
            <span className="seat-number">{lower.seat_number}</span>
            <span className="seat-price">{lower.price} ₸</span>
          </div>
          <div 
            className={`seat ${upper.status} ${selectedSeat?.id === upper.id ? 'selected' : ''}`}
            onClick={() => upper.status === 'free' && onSeatSelect(upper)}
          >
            <span className="seat-number">{upper.seat_number}</span>
            <span className="seat-price">{upper.price} ₸</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="carriage-scheme luxury-scheme">
        <div className="scheme-compartments">
          {compartments}
        </div>
      </div>
    );
  };

  return (
    <div className="train-carriage">
      <div className="carriage-header">
        <h3>Вагон №{carriage.carriage_number} ({carriage.carriage_type})</h3>
        <button className="legend-toggle" onClick={toggleLegend}>
          {showLegend ? 'Скрыть легенду' : 'Показать легенду'}
        </button>
      </div>

      {showLegend && (
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
      )}

      <div className="carriage-info">
        <p>Общее количество мест: {carriage.total_seats}</p>
        <p>Свободно: {seats.filter(seat => seat.status === 'free').length} мест</p>
      </div>

      {renderCarriageScheme()}
    </div>
  );
};

export default TrainCarriage;