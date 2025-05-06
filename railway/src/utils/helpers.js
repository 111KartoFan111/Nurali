/**
 * Форматирует дату в строку формата YYYY-MM-DD
 * @param {Date} date - Объект даты
 * @returns {string} Строка в формате YYYY-MM-DD
 */
export const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Форматирует цену в строку с разделителями тысяч
   * @param {number} price - Цена
   * @returns {string} Форматированная цена
   */
  export const formatPrice = (price) => {
    return price.toLocaleString() + ' ₸';
  };
  
  /**
   * Получает текстовое представление типа места
   * @param {string} type - Тип места (upper, lower, side, luxury)
   * @returns {string} Текстовое представление типа
   */
  export const getSeatTypeText = (type) => {
    switch (type) {
      case 'upper': return 'Верхнее';
      case 'lower': return 'Нижнее';
      case 'side': return 'Боковое';
      case 'luxury': return 'Люкс';
      default: return 'Неизвестно';
    }
  };
  
  /**
   * Получает текстовое представление статуса бронирования
   * @param {string} status - Статус (active, completed, cancelled)
   * @returns {string} Текстовое представление статуса
   */
  export const getBookingStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };
  
  /**
   * Проверяет, не пуст ли объект
   * @param {Object} obj - Проверяемый объект
   * @returns {boolean} true, если объект пуст
   */
  export const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0;
  };
  
  /**
   * Проверяет, валидны ли два пароля (совпадают и не пусты)
   * @param {string} password - Пароль
   * @param {string} confirmPassword - Подтверждение пароля
   * @returns {boolean} true, если пароли валидны
   */
  export const validatePasswords = (password, confirmPassword) => {
    if (!password) return true; // Если пароль пустой, считаем валидным (не меняем)
    
    return password === confirmPassword && password.length >= 6;
  };