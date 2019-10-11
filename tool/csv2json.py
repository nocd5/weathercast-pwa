import pandas as pd

df = pd.read_csv("ame_master.csv")
df2 = df[df["種類"]!="雨"][["都府県振興局", "観測所番号", "観測所名","所在地"]]
df2[df2.duplicated(subset="観測所番号") == False].to_json("ame_master.json", orient='records', force_ascii=False)
