import axios from 'axios';

// Создаём экземпляр Axios с базовыми настройками
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Указываем базовый URL
    timeout: 10000, // Указываем время ожидания запроса
});

// Добавляем перехватчик для всех запросов
api.interceptors.request.use(
    (config) => {
        // Исправление: Использование правильного имени ключа для токена
        const token = localStorage.getItem('token'); // Ранее было 'access_token'
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Добавляем перехватчик для всех ответов, чтобы логировать ошибки
api.interceptors.response.use(
    (response) => {
        // Успешный ответ
        return response;
    },
    (error) => {
        // Детальное логирование ошибок
        console.error('API error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            stack: error.stack
        });
        return Promise.reject(error);
    }
);

// API для маршрутов
export const routesApi = {
    getAllRoutes: async () => {
        try {
            const response = await api.get('/routes');
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении маршрутов:', error);
            throw error;
        }
    },

    searchTrains: async (origin, destination, date) => {
        try {
            const response = await api.get('/routes/search', {
                params: { origin, destination, date },
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка при поиске поездов:', error);
            throw error;
        }
    },

    getTrainCarriages: async (trainId) => {
        try {
            const response = await api.get(`/routes/trains/${trainId}/carriages`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении вагонов:', error);
            throw error;
        }
    },

    getCarriageSeats: async (carriageId) => {
        try {
            const response = await api.get(`/routes/carriages/${carriageId}/seats`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении мест:', error);
            throw error;
        }
    },
};

// API для бронирований
export const bookingsApi = {
    createBooking: async (bookingData) => {
        try {
            console.log('Отправка данных бронирования:', bookingData);
            console.log('Токен для бронирования:', localStorage.getItem('token'));
            
            // Использовать axios вместо fetch
            const response = await api.post('/bookings/', bookingData);
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании бронирования:', error);
            throw error;
        }
    },

    getUserBookings: async () => {
      try {
          console.log('Запрос на получение списка бронирований пользователя');
          console.log('Токен для получения бронирований:', localStorage.getItem('token'));
          
          // Использовать axios вместо fetch
          const response = await api.get('/bookings/');
          return response.data;
      } catch (error) {
          console.error('Ошибка при получении бронирований:', error);
          // В случае сетевой ошибки или проблем с авторизацией, возвращаем пустой массив
          // чтобы не ломать интерфейс
          return [];
      }
    },

    getBookingDetails: async (bookingId) => {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении деталей бронирования:', error);
            throw error;
        }
    },

    cancelBooking: async (bookingId) => {
        try {
            // Печатаем токен для отладки (можно удалить в производственной версии)
            console.log('Токен для отмены бронирования:', localStorage.getItem('token'));
            
            const response = await api.put(`/bookings/${bookingId}/cancel`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при отмене бронирования:', error);
            throw error;
        }
    },
};