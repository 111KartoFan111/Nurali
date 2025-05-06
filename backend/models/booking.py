from datetime import datetime
from database import db

class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    seat_id = db.Column(db.Integer, db.ForeignKey('seats.id'), nullable=False)
    train_id = db.Column(db.Integer, db.ForeignKey('trains.id'), nullable=False)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    passenger_name = db.Column(db.String(200), nullable=False)
    passenger_document = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="active")

    train = db.relationship('Train', backref='bookings')
    seat = db.relationship('Seat', backref='seat_bookings')

    def __init__(self, user_id, seat_id, train_id, passenger_name, passenger_document, price):
        self.user_id = user_id
        self.seat_id = seat_id
        self.train_id = train_id
        self.passenger_name = passenger_name
        self.passenger_document = passenger_document
        self.price = price

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'seat_id': self.seat_id,
            'train_id': self.train_id,
            'booking_date': self.booking_date.isoformat(),
            'passenger_name': self.passenger_name,
            'passenger_document': self.passenger_document,
            'price': self.price,
            'status': self.status
        }