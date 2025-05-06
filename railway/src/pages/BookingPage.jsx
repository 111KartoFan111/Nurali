import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookingForm from '../components/Booking/BookingForm';
import './BookingPage.css';

const BookingPage = () => {
  const { trainId, carriageId, seatId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seat, setSeat] = useState(null);
  const [train, setTrain] = useState(null);

  useEffect(() => {
    // Загрузка информации о месте при монтировании компонента
    const fetchSeatInfo = async () => {
      try {
        // Получаем информацию о месте
        const seatResponse = await axios.get(`http://localhost:5000/api/routes/carriages/${carriageId}/seats`);
        const seatData = seatResponse.data.find(s => s.id === Number(seatId));
        
        if (!seatData) {
          throw new Error('Место не найдено');
        }
        
        setSeat(seatData);
        
        // Получаем информацию о поезде
        const trainResponse = await axios.get(`http://localhost:5000/api/trains/${trainId}`);
        setTrain(trainResponse.data);
      } catch (err) {
        setError('Не удалось загрузить информацию о месте и поезде');
        console.error(err);
      }
    };
    
    fetchSeatInfo();
  }, [carriageId, seatId, trainId]);

  const handleBookingSubmit = async (bookingData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Отправка данных бронирования:', bookingData);
      
      // Прямой запрос к бэкенду, минуя слой API
      const response = await fetch('http://localhost:5000/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Если есть токен, добавляем его
          ...(localStorage.getItem('authToken')
            ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            : {})
        },
        body: JSON.stringify(bookingData)
      });
      
      // Проверяем статус ответа
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось создать бронирование');
      }
      
      const data = await response.json();
      console.log('Ответ от сервера:', data);
      
      // Перенаправляем на страницу успешного бронирования
      navigate('/booking/success');
    } catch (err) {
      console.error('Ошибка при создании бронирования:', err);
      setError(err.message || 'Не удалось создать бронирование. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <h2>Выбор места и бронирование</h2>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      <div className="booking-container">
        {seat && (
          <BookingForm
            selectedSeat={seat}
            trainId={Number(trainId)}
            onBookingSubmit={handleBookingSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default BookingPage;