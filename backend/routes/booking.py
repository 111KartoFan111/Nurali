from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models.booking import Booking
from models.seat import Seat
from models.train import Train
from models.user import User
from database import db

booking_bp = Blueprint('booking', __name__, url_prefix='/api/bookings')

@booking_bp.route('/test', methods=['GET'])
def test_booking_route():
    return jsonify({"message": "Booking test route works!"}), 200

@booking_bp.route('/', methods=['POST'])
def create_booking():
    # Для отладки: выведем все данные запроса
    print("Получен запрос на создание бронирования")
    print("Headers:", request.headers)
    print("Data:", request.get_json())
    
    # По умолчанию используем тестового пользователя с ID 1
    current_user_id = 1
    
    # Пытаемся получить ID пользователя из JWT-токена, если он есть
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            from flask_jwt_extended import decode_token
            token = auth_header.split(' ')[1]
            decoded = decode_token(token)
            current_user_id = decoded.get('identity', 1)
            print(f"Decoded token, user_id: {current_user_id}")
        except Exception as e:
            print(f"Error decoding token: {str(e)}")
            # При ошибке декодирования токена просто используем тестового пользователя
            pass
    
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    data = request.get_json()
    
    required_fields = ['seat_id', 'train_id', 'passenger_name', 'passenger_document']
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"Missing required field: {field}"}), 400
    
    seat = Seat.query.get(data['seat_id'])
    if not seat:
        return jsonify({"message": "Seat not found"}), 404
    
    if seat.status != 'free':
        return jsonify({"message": "Seat is already booked or sold"}), 400
    
    train = Train.query.get(data['train_id'])
    if not train:
        return jsonify({"message": "Train not found"}), 404
    
    price = seat.price
    
    new_booking = Booking(
        user_id=current_user_id,
        seat_id=data['seat_id'],
        train_id=data['train_id'],
        passenger_name=data['passenger_name'],
        passenger_document=data['passenger_document'],
        price=price
    )
    
    seat.status = 'booked'
    
    try:
        db.session.add(new_booking)
        db.session.commit()
        print(f"Бронирование успешно создано с ID: {new_booking.id}")
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка при сохранении: {str(e)}")
        return jsonify({"message": "Failed to save booking", "error": str(e)}), 500
    
    return jsonify({
        "message": "Booking created successfully",
        "booking": new_booking.to_dict()
    }), 201

@booking_bp.route('/', methods=['GET'])
def get_user_bookings():
    # Печатаем заголовки запроса для отладки
    print("Headers:", request.headers)
    
    # Пытаемся получить ID пользователя из JWT-токена, если он есть
    current_user_id = 1  # По умолчанию тестовый пользователь
    
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            from flask_jwt_extended import decode_token
            token = auth_header.split(' ')[1]
            print(f"Получен токен: {token}")
            
            decoded = decode_token(token)
            # Извлекаем ID пользователя из токена, по-разному в зависимости от версии flask_jwt_extended
            current_user_id = decoded.get('identity') or decoded.get('sub', 1)
            print(f"Decoded token, user_id: {current_user_id}")
        except Exception as e:
            print(f"Error decoding token: {str(e)}")
            # В случае ошибки используем тестового пользователя
    
    print(f"Fetching bookings for user {current_user_id}")
    
    bookings = Booking.query.filter_by(user_id=current_user_id).all()
    print(f"Found {len(bookings)} bookings")
    
    result = []
    for booking in bookings:
        booking_data = booking.to_dict()
        
        train = Train.query.get(booking.train_id)
        if train:
            booking_data['train'] = {
                'train_number': train.train_number,
                'train_type': train.train_type,
                'departure_time': train.departure_time.isoformat(),
                'arrival_time': train.arrival_time.isoformat(),
                'route': {
                    'origin': train.route.origin,
                    'destination': train.route.destination
                }
            }
        
        seat = Seat.query.get(booking.seat_id)
        if seat:
            booking_data['seat'] = {
                'seat_number': seat.seat_number,
                'seat_type': seat.seat_type,
                'price': seat.price,
                'carriage': {
                    'carriage_number': seat.carriage.carriage_number,
                    'carriage_type': seat.carriage.carriage_type
                }
            }
        
        result.append(booking_data)
    
    return jsonify(result), 200

@booking_bp.route('/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    current_user_id = get_jwt_identity()
    
    booking = Booking.query.get(booking_id)
    
    if not booking:
        return jsonify({"message": "Booking not found"}), 404
    
    if booking.user_id != current_user_id:
        return jsonify({"message": "Unauthorized access to booking"}), 403
    
    booking_data = booking.to_dict()
    
    train = Train.query.get(booking.train_id)
    if train:
        booking_data['train'] = {
            'train_number': train.train_number,
            'train_type': train.train_type,
            'departure_time': train.departure_time.isoformat(),
            'arrival_time': train.arrival_time.isoformat(),
            'route': {
                'origin': train.route.origin,
                'destination': train.route.destination
            }
        }
    
    seat = Seat.query.get(booking.seat_id)
    if seat:
        booking_data['seat'] = {
            'seat_number': seat.seat_number,
            'seat_type': seat.seat_type,
            'price': seat.price,
            'carriage': {
                'carriage_number': seat.carriage.carriage_number,
                'carriage_type': seat.carriage.carriage_type
            }
        }
    
    return jsonify(booking_data), 200

@booking_bp.route('/<int:booking_id>/cancel', methods=['PUT'])
def cancel_booking(booking_id):
    # Получаем данные из JWT токена, если токен есть
    auth_header = request.headers.get('Authorization')
    
    print(f"Запрос на отмену бронирования {booking_id}")
    print(f"Заголовки: {request.headers}")
    
    # Для тестирования позволим отменять бронирование даже без токена
    current_user_id = None
    
    if auth_header and auth_header.startswith('Bearer '):
        try:
            from flask_jwt_extended import decode_token
            token = auth_header.split(' ')[1]
            decoded = decode_token(token)
            current_user_id = decoded.get('identity') or decoded.get('sub')
            print(f"Токен декодирован, user_id: {current_user_id}")
        except Exception as e:
            print(f"Ошибка декодирования токена: {str(e)}")
    
    booking = Booking.query.get(booking_id)
    
    if not booking:
        return jsonify({"message": "Booking not found"}), 404
    
    # Проверяем принадлежит ли бронирование пользователю, только если ID пользователя определен
    if current_user_id is not None and booking.user_id != current_user_id:
        return jsonify({"message": "Unauthorized access to booking"}), 403
    
    if booking.status != 'active':
        return jsonify({"message": "Booking cannot be cancelled"}), 400
    
    booking.status = 'cancelled'
    
    seat = Seat.query.get(booking.seat_id)
    if seat:
        seat.status = 'free'
    
    try:
        db.session.commit()
        print(f"Бронирование {booking_id} успешно отменено")
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка при отмене бронирования: {str(e)}")
        return jsonify({"message": "Failed to cancel booking", "error": str(e)}), 500
    
    return jsonify({
        "message": "Booking cancelled successfully",
        "booking": booking.to_dict()
    }), 200