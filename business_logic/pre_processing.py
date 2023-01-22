import pandas as pd

indices = [
			{"name": "alpha", "filename": "AlphaData"},
			{"name": "tsx", "filename": "TSXData"},
			{"name": "aequitas", "filename": "AequitasData"}
		]



class Exchange:

	def __init__(self):
		self.df = pd.DataFrame()
		self.json_data, self.df = self.process_data()
	
	def process_exchange_data(self, df):
		df.drop(["TimeStampEpoch", "Exchange"], axis=1, inplace=True)
		df = df.groupby(["Symbol", "OrderID", "MessageType"]).first()
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
		exchanges = self.data.keys()
		trade_dict = dict()
		request_dict = dict()
		cancelled_dict = dict()
		
		for exchange in exchanges:
			trade_dict[exchange] = self.get_trade(self.df.loc[exchange])
			request_dict[exchange] = self.most_requests(self.df.loc[exchange])
			cancelled_dict[exchange] = self.canc_rate(self.df.loc[exchange])
		
		return trade_dict, request_dict, cancelled_dict
		
	
	def get_trade(self, df):
		"""Get the stocks with most trades"""
		# df = df.groupby(["Symbol", "OrderID", "MessageType"]).first()
		df = df.reset_index(level=2)
		dict_ = df[df["MessageType"] == "Trade"].groupby(level=0).size().to_dict()
		return dict(sorted(dict_.items(), key=lambda x: x[1], reverse=True)[:10])
	
	def most_requests(self, df):
		"""Get the stocks which are most requested"""
		# df = df.groupby(["Symbol", "OrderID", "MessageType"]).first()
		df = df.reset_index(level=2)
		dict_ = df[df["MessageType"] == "NewOrderRequest"].groupby(level=0).size().to_dict()
		return dict(sorted(dict_.items(), key=lambda x: x[1], reverse=True)[:10])
	
	def canc_rate(self, df):
		"""Get the stocks whose cancellation rate is highest."""
		# df = df.groupby(["Symbol", "OrderID", "MessageType"]).first()
		df = df.reset_index(level=2)
		tot = df.groupby(level=0).size().to_dict()
		canc = df[df["MessageType"] == "CancelRequest"].groupby(level=0).size().to_dict()
		result = {key: (canc[key]*100)/tot[key] for key in canc.keys()}
		return dict(sorted(result.items(), key=lambda x: x[1], reverse=True)[:10])