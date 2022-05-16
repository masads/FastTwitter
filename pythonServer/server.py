import flask
from flask import request, jsonify


users = [
    {
        'username': 'bob',
        'password': 'password123'
    },
    {
        'username': 'joe',
        'password': 'password456'
    },
    {
        'username': 'sally',
        'password': 'password789'
    }

]

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/', methods=['GET'])
def home():
    return "<h1>Hi Members</p>"


@app.route('/allusers', methods=['GET'])
def allusers():
    return jsonify(users)


@app.route('/getuser', methods=['GET'])
def getuser():
    username = request.args.get('username')
    for user in users:
        if user['username'] == username:
            return jsonify(user)
    return "User not found"


@app.route('/createuser', methods=['POST'])
def createuser():
    data = request.get_json()
    username = data['username']
    password = data['password']
    for user in users:
        if user['username'] == username:
            return "User already exists"
    users.append({'username': username, 'password': password})
    return "User created"


app.run()