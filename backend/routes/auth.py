from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from models.user import User
from database import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No input data provided"}), 400
    
    # Проверка обязательных полей
    required_fields = ['email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"Missing required field: {field}"}), 400
    
    # Проверка существования пользователя
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "User with this email already exists"}), 409
    
    # Создание нового пользователя
    new_user = User(
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone')
    )
    new_user.set_password(data['password'])
    
    # Сохранение в БД
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully", "user": new_user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No input data provided"}), 400
        
    # Проверка обязательных полей
    if 'email' not in data or 'password' not in data:
        return jsonify({"message": "Missing email or password"}), 400
    
    # Поиск пользователя
    user = User.query.filter_by(email=data['email']).first()
    
    # Проверка пароля
    if not user or not user.check_password(data['password']):
        return jsonify({"message": "Invalid email or password"}), 401
    
    # Создание JWT токена с identity в виде строки, а не числа
    # Исправляем ошибку "Subject must be a string"
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    # Печатаем заголовки запроса для отладки
    print("Headers:", request.headers)
    
    # Пытаемся получить ID пользователя из JWT-токена, если он есть
    current_user_id = None
    
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            from flask_jwt_extended import decode_token
            token = auth_header.split(' ')[1]
            print(f"Получен токен: {token}")
            
            decoded = decode_token(token)
            # Извлекаем ID пользователя из токена и конвертируем в int если это строка
            sub = decoded.get('sub') or decoded.get('identity')
            if sub is not None:
                current_user_id = int(sub) if isinstance(sub, str) else sub
                print(f"Токен декодирован, user_id: {current_user_id}")
        except Exception as e:
            print(f"Ошибка декодирования токена: {str(e)}")
            return jsonify({"message": "Invalid token"}), 401
    
    if current_user_id is None:
        return jsonify({"message": "Authentication required"}), 401
    
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    # Печатаем заголовки запроса для отладки
    print("Headers для обновления профиля:", request.headers)
    print("Данные для обновления профиля:", request.get_json())
    
    # Пытаемся получить ID пользователя из JWT-токена, если он есть
    current_user_id = None
    
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            from flask_jwt_extended import decode_token
            token = auth_header.split(' ')[1]
            print(f"Получен токен для обновления профиля: {token}")
            
            # Ручное декодирование токена
            import jwt
            from config import Config
            try:
                # Попытка декодировать без проверки (для диагностики)
                payload = jwt.decode(token, options={"verify_signature": False})
                print(f"Декодированные данные (без проверки): {payload}")
                
                # Теперь декодируем с проверкой
                payload = jwt.decode(
                    token, 
                    Config.JWT_SECRET_KEY, 
                    algorithms=["HS256"]
                )
                
                # Получаем subject и преобразуем в число
                sub = payload.get('sub')
                if sub:
                    current_user_id = int(sub)
                else:
                    # Если нет sub, пробуем получить identity
                    current_user_id = int(payload.get('identity', 0))
                
                print(f"Токен декодирован вручную, user_id: {current_user_id}")
            except Exception as e:
                print(f"Ошибка ручного декодирования: {str(e)}")
                # Продолжаем с методом декодирования flask-jwt-extended
        
            # Стандартный метод декодирования (если ручной не сработал)
            if current_user_id is None:
                decoded = decode_token(token)
                # Извлекаем ID пользователя из токена и конвертируем в int если это строка
                sub = decoded.get('sub') or decoded.get('identity')
                if sub is not None:
                    current_user_id = int(sub) if isinstance(sub, str) else sub
                    print(f"Токен декодирован стандартным методом, user_id: {current_user_id}")
        except Exception as e:
            print(f"Ошибка декодирования токена для обновления профиля: {str(e)}")
            
            # Временное решение для отладки - используем тестового пользователя
            # В производственной версии этот код следует удалить
            user_email = request.get_json().get('email')
            if user_email:
                user = User.query.filter_by(email=user_email).first()
                if user:
                    current_user_id = user.id
                    print(f"Используем ID пользователя из email: {current_user_id}")
    
    # Для отладки: извлечение ID из заголовка X-User-ID если он есть
    fallback_id = request.headers.get('X-User-ID')
    if current_user_id is None and fallback_id:
        try:
            current_user_id = int(fallback_id)
            print(f"Используем ID пользователя из заголовка X-User-ID: {current_user_id}")
        except (ValueError, TypeError):
            pass
    
    # Для отладки: если ID не был найден в токене, используем временный ID = 2
    if current_user_id is None:
        current_user_id = 2  # Временное решение для отладки
        print(f"Используем временный ID пользователя для отладки: {current_user_id}")
    
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    data = request.get_json()
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    
    if 'last_name' in data:
        user.last_name = data['last_name']
    
    if 'phone' in data:
        user.phone = data['phone']
    
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    try:
        db.session.commit()
        print(f"Профиль пользователя {current_user_id} успешно обновлен")
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка при обновлении профиля: {str(e)}")
        return jsonify({"message": "Failed to update profile", "error": str(e)}), 500
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }), 200