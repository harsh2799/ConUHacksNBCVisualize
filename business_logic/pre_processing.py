import pandas as pd

indices = [
			{"name": "alpha", "filename": "AlphaData"},
			{"name": "tsx", "filename": "TSXData"},
			{"name": "aequitas", "filename": "AequitasData"}
		]

class Exchange:
	def __init__(self):
		self.df = pd.DataFrame()
		self.json_data = self.process_index()
		self.trade_dict, self.request_dict, self.cancelled_dict = self.get_details()
	
	def process_exchange_data(self, df):
		df.drop(["TimeStampEpoch", "Exchange"], axis=1, inplace=True)
		df = df.groupby(["Symbol", "OrderID", "MessageType"]).first()
		df["TimeStamp"] = df["TimeStamp"].astype(str)
		df.fillna("", inplace=True)
		nested_dict = {}
		temp_dict = df.to_dict(orient='index')
		for key1, value1 in temp_dict.items():
			if key1[0] not in nested_dict:
				nested_dict[key1[0]] = {}
			if key1[1] not in nested_dict[key1[0]]:
				nested_dict[key1[0]][key1[1]] = {}
			nested_dict[key1[0]][key1[1]][key1[2]] = value1
		
		return nested_dict, df

	def process_index(self):
		global indices
		data = {}
		for index in indices:
			data[index["name"]], df = self.process_exchange_data(pd.read_json(f"D:\Git Repositories\ConUHacksNBCVisualize\static\Hackathon\Hackathon\{index['filename']}.json"))
			df['Exchange'] = index["name"]
			self.df = self.df.append(df, ignore_index=False)
		self.df = self.df.groupby(["Exchange", "Symbol", "OrderID", "MessageType"]).first()

		return data
	
	def get_details(self):
		trade_dict = dict()
		request_dict = dict()
		cancelled_dict = dict()
		for exchange in indices:
			
			# print(self.df.loc[exchange["name"]])
			trade_dict[exchange["name"]] = self.get_trade(self.df.loc[exchange["name"]])
			request_dict[exchange["name"]] = self.most_requests(self.df.loc[exchange["name"]])
			cancelled_dict[exchange["name"]] = self.canc_rate(self.df.loc[exchange["name"]])
		
		return trade_dict, request_dict, cancelled_dict
		
	
	def get_trade(self, df):
		"""Get the stocks with most trades"""
		# df = df.groupby(["Symbol", "OrderID", "MessageType"]).first()
		df = df.reset_index(level=2)
		dict_ = df[df["MessageType"] == "Trade"].groupby(level=0).size().to_dict()
		return dict_
	
	def most_requests(self, df):
		"""Get the stocks which are most requested"""
		# df = df.groupby(["Symbol", "OrderID", "MessageType"]).first()
		df = df.reset_index(level=2)
		dict_ = df[df["MessageType"] == "NewOrderRequest"].groupby(level=0).size().to_dict()
		return dict_
	
	def canc_rate(self, df):
		"""Get the stocks whose cancellation rate is highest."""
		# df = df.groupby(["Symbol", "OrderID", "MessageType"]).first()
		df = df.reset_index(level=2)
		
		canc = df[df["MessageType"] == "CancelRequest"].groupby(level=0).size().to_dict()
		
		return canc