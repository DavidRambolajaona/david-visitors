from davidvisitorsapp import create_app, get_socketio

app = create_app()
socketio = get_socketio(app)
socketio.init_app(app)

if __name__ == "__main__" :
    #app.run(debug=True, host='0.0.0.0')
    socketio.run(app, debug=True, host='0.0.0.0')