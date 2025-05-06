import { useState } from 'react';
import './SearchForm.css';

const SearchForm = ({ initialValues, onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    origin: initialValues.origin || '',
    destination: initialValues.destination || '',
    date: initialValues.date || ''
  });
  
  const cities = ['Астана', 'Алматы', 'Бурабай', 'Семей', 'Атырау'];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };
  
  // Текущая дата для минимального значения в поле даты
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <form className="search-form" onSubmit={handleSubmit}>
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
  );
};

export default SearchForm;