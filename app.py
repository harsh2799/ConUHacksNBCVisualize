from flask import Flask, render_template, make_response
from flask_restful import Api, Resource
import json	
# import firebase_admin
# from firebase_admin import credentials, db, firestore
from business_logic.pre_processing import Exchange

# cred = credentials.Certificate("static\\files\\conuhacksnbcvisualize-firebase-adminsdk-cizk4-13c381ff83.json")
# firebase_admin.initialize_app(cred)
# db = firestore.client()
# db_ref = db.collection('nbc_db')

app = Flask(__name__)
api = Api(app)

processed_data = Exchange()

class Temp(Resource):
	def get(self):
		print("Get")
		return make_response(render_template('index.html'))

	def post(self):
		# print("Here Hhere")
		return json.dumps({
			"exchanges": ["alpha", "aequitas", "tsx"],
			"json_data": processed_data.json_data,
			"trade_data": processed_data.trade_dict,
			"cancelled_data": processed_data.cancelled_dict,
			"total_data": processed_data.request_dict
		})

api.add_resource(Temp, '/')

if __name__ == '__main__':
	
	# print(data['tsx'])
	app.run(
		host='localhost',
		port=5000,
		debug=True
	)