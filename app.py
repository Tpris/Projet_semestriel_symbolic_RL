from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data():
    data = {'message': 'Hello, this is your API response!'}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
