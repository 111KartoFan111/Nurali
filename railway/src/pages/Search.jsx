import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { routesApi } from '../services/api';
import './Search.css';

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [searchParams, setSearchParams] = useState({
    origin: queryParams.get('origin') || '',
    destination: queryParams.get('destination') || '',
    date: queryParams.get('date') || ''
  });
  
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    trainType: 'all',
    carriageType: 'all',
    timeRange: 'all',
    priceRange: 'all'
  });
  
  const cities = ['Астана', 'Алматы', 'Бурабай', 'Семей', 'Атырау'];
  
  // Загружаем поезда при изменении параметров поиска
  useEffect(() => {
    const fetchTrains = async () => {
      if (searchParams.origin && searchParams.destination && searchParams.date) {
        try {
          setLoading(true);
          setError('');
          
          const data = await routesApi.searchTrains(
            searchParams.origin,
            searchParams.destination,
            searchParams.date
          );
          
          setTrains(data);
        } catch (err) {
          console.error('Ошибка при поиске поездов:', err);
          setError('Не удалось загрузить данные о поездах');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchTrains();
  }, [searchParams]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Обновляем URL с новыми параметрами поиска
    const queryParams = new URLSearchParams({
      origin: searchParams.origin,
      destination: searchParams.destination,
      date: searchParams.date
    }).toString();
    
    navigate(`/search?${queryParams}`);
  };
  
  const handleSelectTrain = (trainId, carriageType) => {
    navigate(`/booking/${trainId}/${carriageType}`);
  };
  
  // Фильтрация поездов
  const filteredTrains = trains.filter(train => {
    // Фильтр по типу поезда
    if (filters.trainType !== 'all' && train.train_type !== filters.trainType) {
      return false;
    }
    
    // Фильтр по типу вагона
    if (filters.carriageType !== 'all') {
      const hasCarriageType = train.seats_info && 
        Object.keys(train.seats_info).includes(filters.carriageType) && 
        train.seats_info[filters.carriageType].available > 0;
      
      if (!hasCarriageType) {
        return false;
      }
    }
    
    // Фильтр по времени отправления
    if (filters.timeRange !== 'all') {
      const departureHour = new Date(train.departure_time).getHours();
      
      if (filters.timeRange === 'morning' && (departureHour < 6 || departureHour >= 12)) {
        return false;
      } else if (filters.timeRange === 'afternoon' && (departureHour < 12 || departureHour >= 18)) {
        return false;
      } else if (filters.timeRange === 'evening' && (departureHour < 18 || departureHour >= 23)) {
        return false;
      } else if (filters.timeRange === 'night' && (departureHour >= 6 && departureHour < 23)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Текущая дата для минимального значения в поле даты
  const today = new Date().toISOString().split('T')[0];
  
  // Форматирование времени для отображения
  const formatTime = (dateString) => {
    try {
      return format(parseISO(dateString), 'HH:mm', { locale: ru });
    } catch (error) {
      return 'Неизвестно';
    }
  };
  
  // Форматирование даты для отображения
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
    <div className="search-page">
      <div className="search-form-container">
        <form className="search-form card" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="origin" className="form-label">Откуда</label>
              <select 
                id="origin" 
                name="origin" 
                className="form-control"
                value={searchParams.origin}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите город</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="destination" className="form-label">Куда</label>
              <select 
                id="destination" 
                name="destination" 
                className="form-control"
                value={searchParams.destination}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите город</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="date" className="form-label">Дата</label>
              <input 
                type="date" 
                id="date" 
                name="date" 
                className="form-control"
                min={today}
                value={searchParams.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group search-button-group">
              <button type="submit" className="btn btn-primary">Найти</button>
            </div>
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Загрузка поездов...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : trains.length > 0 ? (
        <div className="search-results">
          <div className="filters-panel card">
            <h3>Фильтры</h3>
            
            <div className="filter-group">
              <label htmlFor="trainType" className="filter-label">Тип поезда</label>
              <select 
                id="trainType" 
                name="trainType" 
                className="form-control"
                value={filters.trainType}
                onChange={handleFilterChange}
              >
                <option value="all">Все типы</option>
                <option value="Скоростной">Скоростной</option>
                <option value="Пассажирский">Пассажирский</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="carriageType" className="filter-label">Тип вагона</label>
              <select 
                id="carriageType" 
                name="carriageType" 
                className="form-control"
                value={filters.carriageType}
                onChange={handleFilterChange}
              >
                <option value="all">Все типы</option>
                <option value="Плацкарт">Плацкарт</option>
                <option value="Купе">Купе</option>
                <option value="Люкс">Люкс</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="timeRange" className="filter-label">Время отправления</label>
              <select 
                id="timeRange" 
                name="timeRange" 
                className="form-control"
                value={filters.timeRange}
                onChange={handleFilterChange}
              >
                <option value="all">Любое время</option>
                <option value="morning">Утро (6:00 - 12:00)</option>
                <option value="afternoon">День (12:00 - 18:00)</option>
                <option value="evening">Вечер (18:00 - 23:00)</option>
                <option value="night">Ночь (23:00 - 6:00)</option>
              </select>
            </div>
          </div>
          
          <div className="trains-container">
            <h2 className="search-results-title">
              Поезда на {formatDate(trains[0]?.departure_time || '')}
            </h2>
            
            {filteredTrains.length === 0 ? (
              <div className="alert alert-info">
                Нет поездов, соответствующих выбранным фильтрам
              </div>
            ) : (
              filteredTrains.map(train => (
                <div key={train.id} className="train-card card">
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
                              onClick={() => handleSelectTrain(train.id, type)}
                            >
                              Выбрать
                            </button>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : searchParams.origin && searchParams.destination && searchParams.date ? (
        <div className="no-results card">
          <h3>Поезда не найдены</h3>
          <p>К сожалению, на выбранную дату нет доступных поездов по маршруту {searchParams.origin} - {searchParams.destination}</p>
          <p>Попробуйте выбрать другую дату или направление</p>
        </div>
      ) : null}
    </div>
  );
};

export default Search;