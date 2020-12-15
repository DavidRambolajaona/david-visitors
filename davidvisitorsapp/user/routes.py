from flask import Blueprint, render_template, session, request, redirect, jsonify
from sqlalchemy import and_, or_
from davidvisitorsapp.models import db, User

from datetime import datetime

import time
import random
import string
import json
import hashlib

user_bp = Blueprint('user_bp', __name__, template_folder='template')


@user_bp.route('/api/user/check', methods=["POST"])
def checkUser():
    pseudoOrEmail = request.form["pseudo"].strip()
    password = hashlib.md5(request.form["password"].encode('utf-8')).hexdigest().strip()
    user = User.query.filter( and_( or_(User.user_pseudo.like(pseudoOrEmail), User.user_email.like(pseudoOrEmail)), User.user_password.like(password) ) ).first()
    
    if user == None :
        return jsonify({"exist": False})
    else :
        return jsonify({"exist": True})


@user_bp.route('/api/user/create', methods=["POST"])
def createUser():
    data = {"success": True}
    if "pseudo" in request.form and "password" in request.form :
        pseudo = request.form["pseudo"].strip()

        # Check si le pseudo existe déjà dans la base de donnée
        userCheck = User.query.filter(User.user_pseudo==pseudo).first()
        if userCheck != None :
            data["success"] = False
            data["message"] = "Pseudo déjà utilisé par un autre utilisateur"
        else :
            # Insertion du nouvel utilisateur
            password = hashlib.md5(request.form["password"].strip().encode('utf-8')).hexdigest()
            email = None
            if "email" in request.form and len(request.form["email"].strip()) > 0 :
                email = request.form["email"]
            user = User(pseudo, password, email)
            db.session.add(user)
            db.session.commit()

            data["user"] = user.toDict()
            if "user_password" in data["user"].keys() :
                del data["user"]["user_password"]

    else :
        data["success"] = False
        data["message"] = "Le pseudo ou le mot de passe n'est pas spécifié"
    return jsonify(data)