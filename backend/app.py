from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import datetime, timedelta
import os

# Импортируем базу данных
from database import db

def create_app():
    app = Flask(__name__)
    
    # Импортируем конфигурацию
    from config import Config
    app.config.from_object(Config)
    
    # Инициализация расширений с более широкими настройками CORS
    # Это позволит принимать запросы от любого источника с любыми заголовками и методами
    CORS(app, 
         resources={r"/*": {"origins": "*"}}, 
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Импортируем модели для создания таблиц
    import models.user
    import models.route
    import models.train
    import models.carriage
    import models.seat
    import models.booking
    
    # Регистрация маршрутов
    from routes.auth import auth_bp
    from routes.routes import routes_bp
    from routes.booking import booking_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(routes_bp)
    app.register_blueprint(booking_bp)
    
    # Обработчик ошибок JWT
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'message': 'The token has expired',
            'error': 'token_expired'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'message': 'Signature verification failed',
            'error': 'invalid_token'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'message': 'Request does not contain an access token',
            'error': 'authorization_required'
        }), 401
    
    # Добавляем обработчик предварительных запросов OPTIONS для поддержки CORS
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    return app

def populate_test_data(app):
    # Остальной код без изменений
    with app.app_context():
        from models.user import User
        from models.route import Route
        from models.train import Train
        from models.carriage import Carriage
        from models.seat import Seat
        
        # Проверяем, есть ли уже данные в БД
        if Route.query.count() > 0:
            return
        
        # Добавляем маршруты
        routes = [
            Route('Астана', 'Алматы', 1200, 840),  # 14 часов
            Route('Астана', 'Бурабай', 250, 180),  # 3 часа
            Route('Астана', 'Семей', 750, 600),    # 10 часов
            Route('Астана', 'Атырау', 1800, 1080)  # 18 часов
        ]
        
        for route in routes:
            db.session.add(route)
        
        db.session.commit()
        
        # Добавляем поезда для каждого маршрута
        for route in routes:
            # Создаем поезда на ближайшие 5 дней
            for day in range(5):
                departure_time = datetime.now() + timedelta(days=day)
                arrival_time = departure_time + timedelta(minutes=route.duration_minutes)
                
                train = Train(
                    train_number=f"{100 + route.id}{day}A",
                    train_type='Пассажирский',
                    departure_time=departure_time,
                    arrival_time=arrival_time,
                    route_id=route.id
                )
                db.session.add(train)
        
        db.session.commit()
        
        # Добавляем вагоны и места для поездов
        trains = Train.query.all()
        for train in trains:
            # Добавляем различные типы вагонов для каждого поезда
            carriage_types = ['Плацкарт', 'Купе', 'Люкс']
            seats_in_carriage = {'Плацкарт': 54, 'Купе': 36, 'Люкс': 18}
            base_prices = {'Плацкарт': 3000, 'Купе': 6000, 'Люкс': 12000}
            
            for carriage_type in carriage_types:
                # Добавляем 1-2 вагона каждого типа
                for i in range(1, 3):
                    carriage = Carriage(
                        carriage_number=i + (0 if carriage_type == 'Плацкарт' else 
                                            (2 if carriage_type == 'Купе' else 4)),
                        carriage_type=carriage_type,
                        train_id=train.id,
                        total_seats=seats_in_carriage[carriage_type]
                    )
                    db.session.add(carriage)
                    db.session.flush()  # Чтобы получить ID вагона
                    
                    # Добавляем места для вагона
                    for seat_num in range(1, seats_in_carriage[carriage_type] + 1):
                        # Определяем тип места (верхнее/нижнее/боковое)
                        if carriage_type == 'Плацкарт':
                            if seat_num % 2 == 0:
                                seat_type = 'upper'
                            else:
                                seat_type = 'lower'
                            if seat_num > 48:
                                seat_type = 'side'
                        elif carriage_type == 'Купе':
                            if seat_num % 4 == 0 or seat_num % 4 == 1:
                                seat_type = 'lower'
                            else:
                                seat_type = 'upper'
                        else:  # Люкс
                            seat_type = 'luxury'
                        
                        # Вычисляем цену в зависимости от типа места
                        price_modifier = 1.0
                        if seat_type == 'upper':
                            price_modifier = 0.9
                        elif seat_type == 'side':
                            price_modifier = 0.8
                        
                        # Создаем место
                        seat = Seat(
                            seat_number=seat_num,
                            carriage_id=carriage.id,
                            price=base_prices[carriage_type] * price_modifier,
                            seat_type=seat_type
                        )
                        db.session.add(seat)
        
        # Создаем тестового пользователя
        if User.query.filter_by(email='test@example.com').first() is None:
            test_user = User(
                email='test@example.com',
                first_name='Test',
                last_name='User',
                phone='+77771234567'
            )
            test_user.set_password('password123')
            db.session.add(test_user)
        
        db.session.commit()

if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        # Создаем все таблицы
        db.create_all()
        # Заполняем тестовыми данными
        populate_test_data(app)
    
    app.run(debug=True)