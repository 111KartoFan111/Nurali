import axios from 'axios';

// Создаём экземпляр Axios с базовыми настройками
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Указываем базовый URL
    timeout: 10000, // Указываем время ожидания запроса
});

// Добавляем перехватчик для всех запросов
api.interceptors.request.use(
    (config) => {
        // Получаем токен из localStorage
        const token = localStorage.getItem('token');
        
        // Если токен существует, добавляем его в заголовки
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // Отладочная информация
            console.log(`Отправка запроса ${config.method} ${config.url} с токеном`);
        } else {
            console.warn(`Отправка запроса ${config.method} ${config.url} без токена!`);
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Добавляем перехватчик для всех ответов, чтобы логировать ошибки
api.interceptors.response.use(
    (response) => {
        // Отладочная информация для успешных ответов
        console.log(`Ответ от ${response.config.url}: `, response.status);
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
            headers: error.config?.headers, // Добавлено для отладки
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
            
            // Ручная проверка токена перед отправкой
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Попытка создать бронирование без токена!');
                throw new Error('Требуется авторизация');
            }
            
            // Используем настроенный экземпляр API
            const response = await api.post('/bookings/', bookingData);
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании бронирования:', error);
            throw error;
        }
    },

    getUserBookings: async () => {
        try {
            // Ручная проверка токена перед отправкой
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Попытка получить бронирования без токена!');
                throw new Error('Требуется авторизация');
            }
            
            console.log('Запрос на получение списка бронирований пользователя');
            
            // Используем настроенный экземпляр API
            const response = await api.get('/bookings/');
            
            // Отладочная информация для анализа структуры ответа
            console.log('Полученные бронирования:', response.data);
            
            // Проверяем, что ответ является массивом
            if (!Array.isArray(response.data)) {
                console.error('Ответ от API не является массивом:', response.data);
                return []; // Возвращаем пустой массив для предотвращения ошибок
            }
            
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении бронирований:', error);
            // Выбрасываем ошибку вместо возврата пустого массива для лучшей отладки
            throw error;
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
            console.log(`Отмена бронирования ${bookingId}`);
            
            const response = await api.put(`/bookings/${bookingId}/debug-cancel`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при отмене бронирования:', error);
            throw error;
        }
    },
};