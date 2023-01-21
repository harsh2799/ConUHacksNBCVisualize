from flask import Flask, render_template, make_response
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)



class Temp(Resource):
	def get(self):
		print("Get")
		return make_response(render_template('index.html'))

api.add_resource(Temp, '/')

if __name__ == '__main__':
	app.run(
		host='localhost',
		port=5000,
		debug=True
	)