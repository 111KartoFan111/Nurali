import './SearchFilter.css';

const SearchFilter = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="search-filters">
      <h3 className="filters-title">Фильтры</h3>
      
      <div className="filter-group">
        <label htmlFor="trainType" className="filter-label">Тип поезда</label>
        <select 
          id="trainType" 
          name="trainType" 
          className="form-control"
          value={filters.trainType}
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
        >
          <option value="all">Любое время</option>
          <option value="morning">Утро (6:00 - 12:00)</option>
          <option value="afternoon">День (12:00 - 18:00)</option>
          <option value="evening">Вечер (18:00 - 23:00)</option>
          <option value="night">Ночь (23:00 - 6:00)</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="priceRange" className="filter-label">Ценовой диапазон</label>
        <select 
          id="priceRange" 
          name="priceRange" 
          className="form-control"
          value={filters.priceRange}
          onChange={handleChange}
        >
          <option value="all">Любая цена</option>
          <option value="economy">Эконом (до 5000 ₸)</option>
          <option value="standard">Стандарт (5000 - 10000 ₸)</option>
          <option value="premium">Премиум (от 10000 ₸)</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;