import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import './TrainCard.css';

const TrainCard = ({ train, onSelectCarriage }) => {
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
  
  // Расчет времени в пути
  const calculateDuration = (departure, arrival) => {
    try {
      const start = parseISO(departure);
      const end = parseISO(arrival);
      const diff = end.getTime() - start.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours} ч ${minutes} мин`;
    } catch (error) {
      return 'Неизвестно';
    }
  };

  return (
    <div className="train-card">
      <div className="train-header">
        <div className="train-number">Поезд №{train.train_number}</div>
        <div className="train-type">{train.train_type}</div>
      </div>
      
      <div className="train-info">
        <div className="train-route">
          <div className="departure">
            <div className="time">{formatTime(train.departure_time)}</div>
            <div className="date">{formatDate(train.departure_time)}</div>
            <div className="city">{train.route.origin}</div>
          </div>
          
          <div className="duration">
            <div className="duration-time">
              {calculateDuration(train.departure_time, train.arrival_time)}
            </div>
            <div className="duration-line"></div>
          </div>
          
          <div className="arrival">
            <div className="time">{formatTime(train.arrival_time)}</div>
            <div className="date">{formatDate(train.arrival_time)}</div>
            <div className="city">{train.route.destination}</div>
          </div>
        </div>
        
        <div className="train-carriages">
          {train.seats_info && Object.entries(train.seats_info).map(([type, info]) => (
            info.available > 0 && (
              <div key={type} className="carriage-option">
                <div className="carriage-type">{type}</div>
                <div className="carriage-seats">
                  Свободно: {info.available} мест
                </div>
                <div className="carriage-price">
                  от {info.min_price.toLocaleString()} ₸
                </div>
                <button 
                  className="btn btn-primary select-btn"
                  onClick={() => onSelectCarriage(train.id, type)}
                >
                  Выбрать
                </button>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainCard;