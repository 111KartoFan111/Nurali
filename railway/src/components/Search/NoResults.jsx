import { Link } from 'react-router-dom';
import './NoResults.css';

const NoResults = ({ origin, destination, date }) => {
  return (
    <div className="no-results">
      <h3>Поезда не найдены</h3>
      <p>К сожалению, на выбранную дату нет доступных поездов по маршруту {origin} - {destination}</p>
      <p>Попробуйте выбрать другую дату или направление</p>
      <Link to="/" className="btn btn-primary">Вернуться на главную</Link>
    </div>
  );
};

export default NoResults;