from flask import Blueprint, render_template

home_bp = Blueprint('home', __name__, template_folder='template')


@home_bp.route('/')
def index():
    return render_template('home.html')