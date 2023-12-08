from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    wall = request.args.get('wall')
    path = request.form.get('path', default=[])
    return render_template('index.html', wall=wall, name="toto")