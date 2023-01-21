from flask import Flask, render_template, make_response
from flask_restful import Api, Resource
import json
import firebase_admin
from firebase_admin import credentials, db, firestore

cred = credentials.Certificate("static\\files\\conuhacksnbcvisualize-firebase-adminsdk-cizk4-13c381ff83.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
db_ref = db.collection('nbc_db')


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