from flask import Flask, jsonify, request, render_template
from flask_cors import CORS

from validation import json_to_wall, path_to_json
from genetic import algo_genetique

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/', methods=['GET'])
def index():
    wall = request.args.get('wall')
    path = request.form.get('path', default=[])
    return render_template('index.html', wall=wall, name="toto")

@app.route('/api/data', methods=['POST'])
def receive_data():
    try:
        json_data = request.get_json()


        path = algo_genetique(json_data)
        print(path)
        response_data = {"path" : path}
        print(response_data)
        return jsonify(response_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)

