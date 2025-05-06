from database import db

class Carriage(db.Model):
    __tablename__ = 'carriages'

    id = db.Column(db.Integer, primary_key=True)
    carriage_number = db.Column(db.Integer, nullable=False)
    carriage_type = db.Column(db.String(50), nullable=False)  # плацкарт, купе, люкс
    train_id = db.Column(db.Integer, db.ForeignKey('trains.id'), nullable=False)
    total_seats = db.Column(db.Integer, nullable=False)
    
    # Отношение с местами
    seats = db.relationship('Seat', backref='seats_in_carriage', lazy=True, cascade="all, delete-orphan")

    def __init__(self, carriage_number, carriage_type, train_id, total_seats):
        self.carriage_number = carriage_number
        self.carriage_type = carriage_type
        self.train_id = train_id
        self.total_seats = total_seats

    def to_dict(self):
        return {
            'id': self.id,
            'carriage_number': self.carriage_number,
            'carriage_type': self.carriage_type,
            'train_id': self.train_id,
            'total_seats': self.total_seats
        }