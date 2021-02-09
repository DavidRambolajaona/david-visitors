from flask import Blueprint, render_template, session, request, redirect, jsonify
from sqlalchemy import and_, or_
from davidvisitorsapp.models import db, User, Visit

from datetime import datetime

import time
import random
import string
import json
import hashlib

message_bp = Blueprint('message_bp', __name__, template_folder='templates', static_folder='static', static_url_path='/message-static')


@message_bp.route('/messagetest', methods=["POST"])
def mtest():
    pass