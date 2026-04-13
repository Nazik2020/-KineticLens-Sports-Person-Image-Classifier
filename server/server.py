from flask import Flask, jsonify, request

import util

app = Flask(__name__)


@app.route('/classify_image', methods=['GET', 'POST'])
def classify_image():
    if request.method == 'POST':
        image_data = request.form.get('image_data')
        response = jsonify(util.classify_image(image_data))
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    return "Please use POST to classify an image."


if __name__ == '__main__':
    print("Starting Flask Server for Sports Celebrity Classification")
    util.load_saved_artifacts()
    app.run(port=5000)
