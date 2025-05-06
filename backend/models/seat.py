from database import db

class Seat(db.Model):
    __tablename__ = 'seats'

    id = db.Column(db.Integer, primary_key=True)
    seat_number = db.Column(db.Integer, nullable=False)
    carriage_id = db.Column(db.Integer, db.ForeignKey('carriages.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='free')  # free, booked, sold
    price = db.Column(db.Float, nullable=False)
    seat_type = db.Column(db.String(20), nullable=False)  # upper, lower, side

    # Отношение с вагоном
    carriage = db.relationship('Carriage', backref='carriage_seats')  # Изменили backref

    def __init__(self, seat_number, carriage_id, price, seat_type, status='free'):
        self.seat_number = seat_number
        self.carriage_id = carriage_id
        self.status = status
        self.price = price
        self.seat_type = seat_type

    def to_dict(self):
        return {
            'id': self.id,
            'seat_number': self.seat_number,
            'carriage_id': self.carriage_id,
            'status': self.status,
            'price': self.price,
            'seat_type': self.seat_type
        }