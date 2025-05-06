from database import db

class Route(db.Model):
    __tablename__ = 'routes'

    id = db.Column(db.Integer, primary_key=True)
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    distance_km = db.Column(db.Integer, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    
    # Отношение с поездами
    trains = db.relationship('Train', backref='route', lazy=True)

    def __init__(self, origin, destination, distance_km, duration_minutes):
        self.origin = origin
        self.destination = destination
        self.distance_km = distance_km
        self.duration_minutes = duration_minutes

    def to_dict(self):
        return {
            'id': self.id,
            'origin': self.origin,
            'destination': self.destination,
            'distance_km': self.distance_km,
            'duration_minutes': self.duration_minutes
        }