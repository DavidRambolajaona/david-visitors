from flask import Blueprint, render_template, session, request, redirect, jsonify
from sqlalchemy import and_, or_
from davidvisitorsapp.models import db, User, Visit, Message
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
                dateNow = datetime.utcnow()
                info["msg_date"] = dateNow.strftime("%a %d %b %Y, %H:%M")
                info["msg_timestamp"] = dataClient["info"]["msg_timestamp"]
                info["visitor_id"] = session["visitor"]
                info["user_colors"] = user.user_colors
                data["info"] = info
                data["type"] = "send_message_broadcast_from_server"

                # Saving the message
                msg = Message()
                msg.message_text = dataClient["info"]["msg_val"]
                msg.message_user_id = dataClient["info"]["user_id"]
                msg.message_user = User.query.get(dataClient["info"]["user_id"])
                msg.message_date_creation = dateNow
                db.session.add(msg)
                db.session.commit()
        
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

@message_bp.route('/api/message/messages', methods=["GET"])
def getMessages():
    msgId = request.args.get("top_msg_id")
    if msgId is None or len(msgId) == 0 :
        dateFilter = datetime.utcnow()
    else :
        dateFilter = Message.query.get(msgId).message_date_creation

    limitNbMsg = 30
    msgs = Message.query.filter(Message.message_date_creation < dateFilter).order_by(Message.message_date_creation.desc()).limit(limitNbMsg)
    data = {"success": True, "msgs": [], "topMsg": False}
    if msgs.count() < limitNbMsg :
        data["topMsg"] = True
    for msg in msgs :
        m = {"msg_id": msg.message_id}
        m["msg_text"] = msg.message_text
        m["msg_user_id"] = msg.message_user_id
        m["msg_user_name"] = msg.message_user.user_pseudo
        m["msg_date"] = msg.message_date_creation.strftime("%a %d %b %Y, %H:%M")
        m["msg_user_colors"] = msg.message_user.user_colors
        data["msgs"].append(m)
    return jsonify(data)