from flask import render_template
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
     return send_from_directory('/')

if __name__ == '__main__':
    app.run()