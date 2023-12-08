from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    wall = request.args.get('wall')
    path = request.form.get('path', default=[])
    return render_template('index.html', wall=wall, name="toto")

if __name__ == '__main__':
    app.run(debug=True)

