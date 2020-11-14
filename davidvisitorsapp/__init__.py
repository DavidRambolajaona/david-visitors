from flask import Flask

import os

from .home.routes import home_bp


def create_app():
    app = Flask(__name__)

    # app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://davidvisitorsadmin:davidvisitorspassword@localhost/davidvisitors'
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL_DAVIDVISITORS')
    app.secret_key = os.environ.get('SECRET_KEY_DAVIDVISITORS')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.register_blueprint(home_bp)

    with app.app_context() :
        from .models import db
        
        db.init_app(app)
        db.create_all()

        return app
