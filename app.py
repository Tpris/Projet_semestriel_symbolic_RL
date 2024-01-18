from flask import Flask, jsonify, request, render_template
from flask_cors import CORS

from algos.validation import json_to_wall, path_to_json, update_wingspan
from algos.genetic import algo_genetique
from algos.Astar import Astar_solve_wall

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/data', methods=['POST'])
def receive_data():
    try:
        json_data = request.get_json()
        wall = json_data['wall']
       
        wingspan = json_data['wingspan']
        update_wingspan(wingspan)
        path = algo_genetique(wall)
        response_data = {"path" : path}

        return jsonify(response_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.route('/api/data2', methods=['POST'])
def receive_data2():
    try:
        json_data = request.get_json()
        wall = json_data['wall']
        wingspan = json_data['wingspan']
        update_wingspan(wingspan)
        path = Astar_solve_wall(wall)
        print(path)
        response_data = {"path" : path}
        print(response_data)
        return jsonify(response_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/', methods=['GET'])
def index():
    wall = request.args.get('wall')
    path = request.form.get('path', default=[])
    return render_template('index.html', wall=wall, name="toto")

if __name__ == '__main__':
    app.run(debug=True)

