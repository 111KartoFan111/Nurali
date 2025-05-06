import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">TemirZhol</h3>
            <p>Ведущий сервис бронирования железнодорожных билетов в Казахстане. Быстро, удобно и надежно.</p>
            <p>Мы делаем планирование путешествий простым и приятным для каждого пассажира.</p>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Контакты</h3>
            <div className="footer-contact">
              <span className="footer-contact-icon">✉️</span>
              <p>Email: info@railway-booking.com</p>
            </div>
            <div className="footer-contact">
              <span className="footer-contact-icon">📞</span>
              <p>Телефон: +7 777 111 21 34</p>
            </div>
            <div className="footer-contact">
              <span className="footer-contact-icon">🏢</span>
              <p>Адрес: г. Астана, ул. Кунаева, 2</p>
            </div>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Полезные ссылки</h3>
            <ul className="footer-links">
              <li>
                <a href="#" title="О нас">О компании</a>
              </li>
              <li>
                <a 
                  href="https://travel.yandex.ru/journal/veschi-v-poezd/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="Список вещей в поезд"
                >
                  Что взять с собой в поезд
                </a>
              </li>
              <li>
                <a 
                  href="https://www.tutu.ru/poezda/content/5-pravil-etiketa-v-poezde/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="Правила этикета в поезде"
                >
                  5 правил этикета в поезде
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} TemirZhol. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;