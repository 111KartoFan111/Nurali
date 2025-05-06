/**
 * Проверяет, корректный ли email
 * @param {string} email - Email для проверки
 * @returns {boolean} true, если email корректный
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Проверяет, корректен ли номер телефона
   * @param {string} phone - Номер телефона для проверки
   * @returns {boolean} true, если номер телефона корректный
   */
  export const isValidPhone = (phone) => {
    // Простая проверка на формат +Цифры, минимум 10 цифр
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phone ? phoneRegex.test(phone) : true; // Телефон может быть необязательным
  };
  
  /**
   * Проверяет, корректное ли имя пользователя
   * @param {string} name - Имя для проверки
   * @returns {boolean} true, если имя корректное
   */
  export const isValidName = (name) => {
    return name.trim().length >= 2; // Имя должно содержать хотя бы 2 символа
  };
  
  /**
   * Проверяет, корректен ли пароль
   * @param {string} password - Пароль для проверки
   * @returns {boolean} true, если пароль корректный
   */
  export const isValidPassword = (password) => {
    return password.length >= 6; // Пароль должен содержать хотя бы 6 символов
  };
  
  /**
   * Проверяет форму регистрации
   * @param {Object} formData - Данные формы
   * @returns {Object} Объект с ошибками (пустой, если ошибок нет)
   */
  export const validateRegistrationForm = (formData) => {
    const errors = {};
    
    if (!isValidEmail(formData.email)) {
      errors.email = 'Неверный формат email';
    }
    
    if (!isValidName(formData.first_name)) {
      errors.first_name = 'Имя должно содержать не менее 2 символов';
    }
    
    if (!isValidName(formData.last_name)) {
      errors.last_name = 'Фамилия должна содержать не менее 2 символов';
    }
    
    if (formData.phone && !isValidPhone(formData.phone)) {
      errors.phone = 'Неверный формат номера телефона';
    }
    
    if (!isValidPassword(formData.password)) {
      errors.password = 'Пароль должен содержать не менее 6 символов';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    
    return errors;
  };
  
  /**
   * Проверяет форму входа
   * @param {Object} formData - Данные формы
   * @returns {Object} Объект с ошибками (пустой, если ошибок нет)
   */
  export const validateLoginForm = (formData) => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email обязателен';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Неверный формат email';
    }
    
    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    }
    
    return errors;
  };
  
  /**
   * Проверяет форму поиска
   * @param {Object} searchParams - Параметры поиска
   * @returns {Object} Объект с ошибками (пустой, если ошибок нет)
   */
  export const validateSearchForm = (searchParams) => {
    const errors = {};
    
    if (!searchParams.origin) {
      errors.origin = 'Выберите город отправления';
    }
    
    if (!searchParams.destination) {
      errors.destination = 'Выберите город назначения';
    }
    
    if (searchParams.origin === searchParams.destination && searchParams.origin) {
      errors.destination = 'Город назначения должен отличаться от города отправления';
    }
    
    if (!searchParams.date) {
      errors.date = 'Выберите дату';
    }
    
    return errors;
  };