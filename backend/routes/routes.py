from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from models.route import Route
from models.train import Train
from models.carriage import Carriage
from models.seat import Seat
from database import db

routes_bp = Blueprint('routes', __name__, url_prefix='/api/routes')

@routes_bp.route('/', methods=['GET'])
def get_all_routes():
    routes = Route.query.all()
    return jsonify([route.to_dict() for route in routes]), 200

@routes_bp.route('/<int:route_id>', methods=['GET'])
def get_route(route_id):
    route = Route.query.get(route_id)
    if not route:
        return jsonify({"message": "Route not found"}), 404
    return jsonify(route.to_dict()), 200

@routes_bp.route('/search', methods=['GET'])
def search_trains():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    date_str = request.args.get('date')
    
    if not origin or not destination:
        return jsonify({"message": "Origin and destination are required"}), 400
    
    # Поиск маршрута
    route = Route.query.filter_by(origin=origin, destination=destination).first()
    if not route:
        return jsonify({"message": "No routes found for the specified origin and destination"}), 404
    
    # Если указана дата, фильтруем поезда по дате
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            trains = Train.query.filter(
                Train.route_id == route.id,
                db.func.date(Train.departure_time) == target_date
            ).all()
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
    else:
        # Если дата не указана, возвращаем все поезда на этом маршруте
        trains = Train.query.filter_by(route_id=route.id).all()
    
    result = []
    for train in trains:
        train_data = train.to_dict()
        # Добавляем информацию о свободных местах по типам вагонов
        seats_info = {}
        
        for carriage in train.carriages:
            carriage_type = carriage.carriage_type
            if carriage_type not in seats_info:
                seats_info[carriage_type] = {
                    'available': 0,
                    'min_price': float('inf')
                }
            
            # Подсчет свободных мест и минимальной цены
            free_seats = Seat.query.filter_by(carriage_id=carriage.id, status='free').all()
            seats_info[carriage_type]['available'] += len(free_seats)
            
            # Находим минимальную цену
            for seat in free_seats:
                if seat.price < seats_info[carriage_type]['min_price']:
                    seats_info[carriage_type]['min_price'] = seat.price
            
            # Если нет свободных мест, установим минимальную цену в 0
            if seats_info[carriage_type]['min_price'] == float('inf'):
                seats_info[carriage_type]['min_price'] = 0
        
        train_data['seats_info'] = seats_info
        result.append(train_data)
    
    return jsonify(result), 200

@routes_bp.route('/trains/<int:train_id>/carriages', methods=['GET'])
def get_train_carriages(train_id):
    train = Train.query.get(train_id)
    if not train:
        return jsonify({"message": "Train not found"}), 404
    
    carriages = Carriage.query.filter_by(train_id=train_id).all()
    
    result = []
    for carriage in carriages:
        carriage_data = carriage.to_dict()
        # Добавляем информацию о свободных местах
        free_seats_count = Seat.query.filter_by(carriage_id=carriage.id, status='free').count()
        carriage_data['free_seats_count'] = free_seats_count
        result.append(carriage_data)
    
    return jsonify(result), 200

@routes_bp.route('/carriages/<int:carriage_id>/seats', methods=['GET'])
def get_carriage_seats(carriage_id):
    carriage = Carriage.query.get(carriage_id)
    if not carriage:
        return jsonify({"message": "Carriage not found"}), 404
    
    seats = Seat.query.filter_by(carriage_id=carriage_id).all()
    
    return jsonify([seat.to_dict() for seat in seats]), 200