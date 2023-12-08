from flask import Flask, jsonify, request
from flask_cors import CORS

from validation import json_to_wall, path_to_json, update_wingspan
from genetic import algo_genetique

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

if __name__ == '__main__':
    app.run(debug=True)

