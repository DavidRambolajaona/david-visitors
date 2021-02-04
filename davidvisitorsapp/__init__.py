from flask import Flask
from flask_cors import CORS
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

import os

from .home.routes import home_bp
from .user.routes import user_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    # mysql : https://stackoverflow.com/questions/25865270/how-to-install-python-mysqldb-module-using-pip/25865271
    # app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://davidvisitorsadmin:davidvisitorspassword@localhost/davidvisitors'
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL_DAVIDVISITORS')
    app.secret_key = os.environ.get('SECRET_KEY_DAVIDVISITORS')
    app.config['PERMANENT_SESSION_LIFETIME'] = 3600
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # https://flask-admin.readthedocs.io/en/latest/introduction

    # set optional bootswatch theme
    # See https://bootswatch.com/3/ for available swatches
    app.config['FLASK_ADMIN_SWATCH'] = 'superhero'

    admin = Admin(app, name='Admin interface :)', template_mode='bootstrap3')

    app.register_blueprint(home_bp)
    app.register_blueprint(user_bp)

    with app.app_context() :
        from .models import db, Visit, User

        admin.add_view(ModelView(Visit, db.session))
        admin.add_view(ModelView(User, db.session))
        
        db.init_app(app)
        db.create_all()

        return app
