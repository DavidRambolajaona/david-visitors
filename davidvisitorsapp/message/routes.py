from flask import Blueprint, render_template, session, request, redirect, jsonify
from sqlalchemy import and_, or_
from davidvisitorsapp.models import db, User, Visit
from davidvisitorsapp.socketio import socketio, send

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

@socketio.on('message')
def handleMessage(msg):
    data = {"type": "", "info": {}}
    isBroadCast = True

    dataClient = {}
    if len(str(msg)) > 0 :
        dataClient = json.loads(msg)
    if "type" in dataClient :
        if dataClient["type"] == "send_message_from_client" :
            if dataClient["info"]["user_id"] :
                user_id = dataClient["info"]["user_id"]
                user = User.query.get(user_id)
                info = {}
                info["user_id"] = user.user_id
                info["user_name"] = user.user_pseudo
                info["msg_val"] = dataClient["info"]["msg_val"]
                info["msg_date"] = datetime.now().strftime("%a %d %b %Y, %H:%M")
                info["msg_timestamp"] = dataClient["info"]["msg_timestamp"]
                info["visitor_id"] = session["visitor"]
                data["info"] = info
                data["type"] = "send_message_broadcast_from_server"
        
        elif  dataClient["type"] == "connection" :
            if "user" in session :
                user = User.query.get(session["user"])
                data["info"]["user"] = user.toDict(formatDate=True)
            if "visitor" in session :
                data["info"]["visitor_id"] = session["visitor"]
            
            data["type"] = "connection_response"
            isBroadCast = False

    dataJson = json.dumps(data)
    send(dataJson, broadcast=isBroadCast)
