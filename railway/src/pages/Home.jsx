import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: ''
  });

  const cities = ['Астана', 'Алматы', 'Бурабай', 'Семей', 'Атырау'];

  // Эффект для установки минимальной даты
  useEffect(() => {
    setSearchParams(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (searchParams.origin === searchParams.destination) {
      alert('Пункт отправления и назначения не могут быть одинаковыми!');
      return;
    }

    const queryParams = new URLSearchParams({
      origin: searchParams.origin,
      destination: searchParams.destination,
      date: searchParams.date
    }).toString();

    navigate(`/search?${queryParams}`);
  };

  const today = new Date().toISOString().split('T')[0];

  const isFormValid = searchParams.origin && 
                      searchParams.destination && 
                      searchParams.date && 
                      searchParams.origin !== searchParams.destination;

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Путешествуйте с комфортом по всему Казахстану</h1>
          <p>Быстрое бронирование железнодорожных билетов на все направления</p>
        </div>

        <div className="search-card">
          <h2 className="search-title">Поиск билетов</h2>

          <form className="search-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="origin" className="form-label">Откуда *</label>
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
              <label htmlFor="destination" className="form-label">Куда *</label>
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
              <label htmlFor="date" className="form-label">Дата *</label>
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

            <button 
              type="submit" 
              className="btn search-btn"
              disabled={!isFormValid}
            >
              Найти билеты
            </button>
          </form>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Наши преимущества</h2>

        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🚄</div>
            <h3 className="feature-title">Удобный поиск</h3>
            <p className="feature-description">Находите билеты на нужные вам направления быстро и легко, с интуитивно понятным интерфейсом</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎫</div>
            <h3 className="feature-title">Выбор места</h3>
            <p className="feature-description">Выбирайте любое доступное место в вагоне при бронировании билета с интерактивной схемой вагона</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3 className="feature-title">Быстрое бронирование</h3>
            <p className="feature-description">Забронируйте билет в несколько кликов и отправляйтесь в путь без лишних задержек!</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;