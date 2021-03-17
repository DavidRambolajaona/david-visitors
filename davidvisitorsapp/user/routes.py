from flask import Blueprint, render_template, session, request, redirect, jsonify
from sqlalchemy import and_, or_
from davidvisitorsapp.models import db, User, Visit

from datetime import datetime

import time
import random
import string
import json
import hashlib

user_bp = Blueprint('user_bp', __name__, template_folder='templates', static_folder='static', static_url_path='/user-static')


@user_bp.route('/api/user/check', methods=["POST"])
def checkUser():
    if "pseudo" in request.form and "password" in request.form :
        pseudoOrEmail = request.form["pseudo"].strip()
        password = hashlib.md5(request.form["password"].encode('utf-8')).hexdigest().strip()
        user = User.query.filter( and_( or_(User.user_pseudo.like(pseudoOrEmail), User.user_email.like(pseudoOrEmail)), User.user_password.like(password) ) ).first()
        
        if user == None :
            return jsonify({"success": False, "exist": False, "code": "user_not_exist"})
        else :
            userArray = user.toDict()
            if "user_password" in userArray.keys() :
                del userArray["user_password"]

            # Mise à jour de la ligne Visit pour l'user courant
            if "visitor" in session and "to_log" in request.form :
                v = Visit.query.get(session["visitor"])
                v.visit_user_id = user.user_id
                v.visit_date_login = datetime.utcnow()
                db.session.commit()

                session["user"] = user.user_id

            # Bouton HTML du compte de l'internaute
            btnHtml = render_template("pieces/button_user.html", user = user)

            # Input d'envoi de message
            messageInputHtml = render_template("pieces/message_input_send.html")
            
            return jsonify({"success": True, "exist": True, "user": userArray, "btn_user": btnHtml, "message_input": messageInputHtml})
    else :
        return jsonify({"success": False, "message": "Pseudo et password doivent être spécifiés"})


@user_bp.route('/api/user/create', methods=["POST"])
def createUser():
    data = {"success": True}
    if "pseudo" in request.form and "password" in request.form :
        pseudo = request.form["pseudo"].strip()
        if len(pseudo) == 0 :
            return jsonify({"success": False, "message": "Pseudo non spécifié", "code": "pseudo_empty"})
        if len(request.form["password"].strip()) == 0 :
            return jsonify({"success": False, "message": "Mot de passe non spécifié", "code": "password_empty"})

        # Check si le pseudo existe déjà dans la base de donnée
        userCheck = User.query.filter(User.user_pseudo==pseudo).first()
        if userCheck != None :
            data["success"] = False
            data["message"] = "Pseudo déjà utilisé par un autre utilisateur"
            data["code"] = "pseudo_already_exists"
        else :
            # Insertion du nouvel utilisateur
            password = hashlib.md5(request.form["password"].strip().encode('utf-8')).hexdigest()
            email = None
            if "email" in request.form and len(request.form["email"].strip()) > 0 :
                email = request.form["email"].strip()
                # Check si l'email existe déjà dans la base de donnée
                userCheckEmail = User.query.filter(User.user_email==email).first()
                if userCheckEmail != None :
                    return jsonify({"success": False, "message": "Email déjà utilisé par un autre utilisateur", "code": "email_already_exists"})
            user = User(pseudo, password, email)
            db.session.add(user)
            db.session.commit()

            # Mise à jour de la ligne Visit pour l'user courant
            if "visitor" in session and "to_log" in request.form :
                v = Visit.query.get(session["visitor"])
                v.visit_user_id = user.user_id
                v.visit_date_login = datetime.utcnow()
                db.session.commit()

                session["user"] = user.user_id

            data["user"] = user.toDict()
            if "user_password" in data["user"].keys() :
                del data["user"]["user_password"]

            # Bouton HTML du compte de l'internaute
            btnHtml = render_template("pieces/button_user.html", user = user)
            data["btn_user"] = btnHtml

            # Input d'envoi de message
            messageInputHtml = render_template("pieces/message_input_send.html")
            data["message_input"] = messageInputHtml

    else :
        data["success"] = False
        data["message"] = "Le pseudo ou le mot de passe n'est pas spécifié"
        data["code"] = "pseudo_or_password_unspecified"
    return jsonify(data)


@user_bp.route('/api/user/logout', methods=["GET"])
def logoutUser() :
    if "visitor" in session :
        v = Visit.query.get(session["visitor"])
        v.visit_date_logout = datetime.utcnow()
        db.session.commit()

    if "user" in session :
        del session["user"] 

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

    data = {}
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

    infoVisitHtml = render_template("pieces/info_visit.html", data=data)

    btnSigninHtml = render_template("pieces/button_user.html")

    messageInputHtml = render_template("pieces/message_input_send.html")

    return jsonify({"success": True, "btn_signin": btnSigninHtml,  "code": "", "info_visit": infoVisitHtml, "message_input": messageInputHtml})


def getRankText(n) :
    s = str(n)
    return "th" if (len(s) > 1 and s[len(s)-2:len(s)] in ["11", "12", "13"]) or s[-1] not in "123" else "st" if s[-1] == "1" else "nd" if s[-1] == "2" else "rd"