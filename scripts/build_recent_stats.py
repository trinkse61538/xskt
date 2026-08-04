#!/usr/bin/env python3
import json,re
from pathlib import Path
import pandas as pd
ROOT=Path(__file__).resolve().parents[1]
CSV=ROOT/"data/history/xsmn_history.csv"
OUT=ROOT/"data/history/recent-history.v40.js"
PRIZES=["giai_db","giai_1","giai_2","giai_3","giai_4","giai_5","giai_6","giai_7","giai_8"]
df=pd.read_csv(CSV,dtype=str)
df["dt"]=pd.to_datetime(df["ngay"],dayfirst=True)
df["station"]=df["tinh"].replace({"TP. HCM":"TP.HCM"})
def hits(r):
    out=set()
    for c in PRIZES:
        for x in str(r[c]).split("|"):
            x=re.sub(r"\D","",x)
            if x:out.add(x[-2:].zfill(2))
    return sorted(out)
stations={}
for name,g in df.groupby("station"):
    g=g.sort_values("dt"); counts=[0]*100;draws=[]
    for _,r in g.iterrows():
        h=hits(r)
        for x in h:counts[int(x)]+=1
        draws.append({"d":r["dt"].date().isoformat(),"h":h})
    stations[name]={"n":len(g),"latest":draws[-1]["d"],"all":counts,"draws":list(reversed(draws[-100:]))}
payload={"updatedThrough":max(v["latest"] for v in stations.values()),"baseline":round(1-.99**18,6),
         "stations":stations,"note":"Tỷ lệ kỳ có xuất hiện là tần suất thực nghiệm, không phải xác suất kỳ tới."}
OUT.write_text("window.XSMN_HISTORY="+json.dumps(payload,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8")
print("Built",OUT,"through",payload["updatedThrough"])
