from datetime import datetime
from database import db

class Train(db.Model):
    __tablename__ = 'trains'

    id = db.Column(db.Integer, primary_key=True)
    train_number = db.Column(db.String(10), nullable=False)
    train_type = db.Column(db.String(50), nullable=False)  # скоростной, пассажирский, и т.д.
    departure_time = db.Column(db.DateTime, nullable=False)
    arrival_time = db.Column(db.DateTime, nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=False)
    
    # Отношение с вагонами
    carriages = db.relationship('Carriage', backref='train', lazy=True, cascade="all, delete-orphan")

    def __init__(self, train_number, train_type, departure_time, arrival_time, route_id):
        self.train_number = train_number
        self.train_type = train_type
        self.departure_time = departure_time
        self.arrival_time = arrival_time
        self.route_id = route_id

    def to_dict(self):
        return {
            'id': self.id,
            'train_number': self.train_number,
            'train_type': self.train_type,
            'departure_time': self.departure_time.isoformat(),
            'arrival_time': self.arrival_time.isoformat(),
            'route_id': self.route_id,
            'route': {
                'origin': self.route.origin,
                'destination': self.route.destination
            }
        }