from flask import Blueprint, render_template, session, request, redirect
from davidvisitorsapp.models import db, Visit, User

from datetime import datetime

import time
import random
import string
import json

home_bp = Blueprint('home_bp', __name__, template_folder='template', static_folder='static', static_url_path='/home-static')


@home_bp.before_request
def beforeRequest():
    if request.path not in ["/dropdb"] :
        session.permanent = True
        if "visitor" in session :
            visit = Visit.query.filter(Visit.visit_id==session["visitor"]).first()
            if not visit or visit.visit_date_visit_date != datetime.utcnow().date() :
                del session["visitor"]
        if "visitor" not in session :
            visit = Visit()
            visit.visit_date_visit = datetime.utcnow()
            visit.visit_date_visit_date = datetime.utcnow().date()
            visit.visit_user_agent = request.headers.get('User-Agent')
            visit.visit_adresse_ip = request.remote_addr
            visit.visit_rank_site = len(Visit.query.all()) + 1
            visit.visit_rank_day = len(Visit.query.filter(Visit.visit_date_visit_date == datetime.utcnow().date()).all()) + 1

            db.session.add(visit)
            db.session.commit()

            session["visitor"] = visit.visit_id


@home_bp.route('/')
def index():
    data = {}
    visit = Visit.query.filter(Visit.visit_id==session["visitor"]).first()

    rank_site = visit.visit_rank_site
    data["rank_site"] = rank_site
    data["rank_site_th"] = getRankText(rank_site)
    nbVisits = len(Visit.query.all())
    data["total_visit_site"] = nbVisits

    rank_day = visit.visit_rank_day
    data["rank_day"] = rank_day
    data["rank_day_th"] = getRankText(rank_day)
    nbVisitsDay = len(Visit.query.filter(Visit.visit_date_visit_date == datetime.utcnow().date()).all())
    data["total_visit_day"] = nbVisitsDay

    data["visitor_id"] = visit.visit_id

    user = None 
    if "user" in session :
        user = User.query.get(session["user"])

    
    return render_template('home.html', data = data, user = user)

@home_bp.route('/dropdb')
def dropdb() :
    db.drop_all()
    db.create_all()
    if "visitor" in session :
        del session["visitor"]
    if "user" in session :
        del session["user"]
    return redirect("/")


def getRankText(n) :
    s = str(n)
    return "th" if (len(s) > 1 and s[len(s)-2:len(s)] in ["11", "12", "13"]) or s[-1] not in "123" else "st" if s[-1] == "1" else "nd" if s[-1] == "2" else "rd"

def getRandomText() :
    timestamp = time.time()
    letters = string.ascii_lowercase
    random_letters = ''.join(random.choice(letters) for i in range(6))
    return str(timestamp) + '/' + random_letters
    