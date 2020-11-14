from flask import Flask

from .home.routes import home_bp


def create_app():
    app = Flask(__name__)

    app.register_blueprint(home_bp)

    return app
