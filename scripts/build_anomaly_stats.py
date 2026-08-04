#!/usr/bin/env python3
import json,re,math
from pathlib import Path
import numpy as np
import pandas as pd
ROOT=Path(__file__).resolve().parents[1]
CSV=ROOT/"data/history/xsmn_history.csv"
OUT=ROOT/"data/history/anomaly-history.v43.js"
PRIZES=["giai_db","giai_1","giai_2","giai_3","giai_4","giai_5","giai_6","giai_7","giai_8"]
df=pd.read_csv(CSV,dtype=str);df["dt"]=pd.to_datetime(df["ngay"],dayfirst=True);df["station"]=df["tinh"].replace({"TP. HCM":"TP.HCM"})
def tails(r):
    o=[]
    for c in PRIZES:
        for x in str(r[c]).split("|"):
            d=re.sub(r"\\D","",x)
            if d:o.append(int(d[-2:]))
    return o
def p2(z):return math.erfc(abs(float(z))/math.sqrt(2))
def bh(vals):
    p=np.asarray(vals,float);n=len(p);order=np.argsort(p);q=np.empty(n);run=1.
    for j in range(n-1,-1,-1):
        i=order[j];run=min(run,p[i]*n/(j+1));q[i]=min(run,1.)
    return q
def chisf(x,dfree=99):
    if x<=0:return 1.
    z=((x/dfree)**(1/3)-(1-2/(9*dfree)))/math.sqrt(2/(9*dfree))
    return .5*math.erfc(z/math.sqrt(2))
def state(zs,d):
    if sum(x>=1.8 for x in zs)>=2 and max(zs)>=2.5:return "PERSISTENT_UP"
    if sum(x<=-1.8 for x in zs)>=2 and min(zs)<=-2.5:return "PERSISTENT_DOWN"
    if max(zs)>=2.5 or d>=2.5:return "WATCH_UP"
    if min(zs)<=-2.5 or d<=-2.5:return "WATCH_DOWN"
    return "NORMAL"
tmp={};tests=[];sttests=[]
for st,g in df.groupby("station"):
    g=g.sort_values("dt");draws=[tails(r) for _,r in g.iterrows()];rec={"n":len(draws),"latest":g.iloc[-1]["dt"].date().isoformat(),"windows":{}}
    for w in (30,100,300):
        use=draws[-min(w,len(draws)):];vals=[x for dr in use for x in dr];N=len(vals);cnt=np.bincount(vals,minlength=100);exp=N*.01;sd=math.sqrt(N*.01*.99) if N else 1
        z=(cnt-exp)/sd;ps=np.array([p2(x) for x in z]);rec["windows"][w]={"z":[round(float(x),3) for x in z]}
        for n,p in enumerate(ps):tests.append((st,w,n,float(p)))
    a=np.bincount([x for dr in draws[-30:] for x in dr],minlength=100);prev=draws[-300:-30] if len(draws)>30 else [];b=np.bincount([x for dr in prev for x in dr],minlength=100)
    n1=max(1,sum(map(len,draws[-30:])));n0=max(1,sum(map(len,prev)));pool=(a+b)/(n1+n0);den=np.sqrt(np.maximum(pool*(1-pool)*(1/n1+1/n0),1e-12));rec["drift"]=[round(float(x),3) for x in ((a/n1-b/n0)/den)]
    vals=[x for dr in draws[-min(300,len(draws)):] for x in dr];cnt=np.bincount(vals,minlength=100);N=len(vals);exp=N/100 if N else 0;chi=float((((cnt-exp)**2)/exp).sum()) if exp else 0;pc=chisf(chi) if exp else 1
    rec["dist"]={"window":min(300,len(draws)),"chi2":round(chi,3),"p":round(pc,8)};tmp[st]=rec;sttests.append((st,pc))
qv=bh([x[3] for x in tests]);qmap={(s,w,n):float(q) for (s,w,n,p),q in zip(tests,qv)};sq=bh([x[1] for x in sttests]);stq={s:float(q) for (s,p),q in zip(sttests,sq)}
stations={}
for st,rec in tmp.items():
    nums=[]
    for n in range(100):
        zs=[rec["windows"][w]["z"][n] for w in (30,100,300)];qs=[qmap[(st,w,n)] for w in (30,100,300)];d=rec["drift"][n];s=state(zs,d)
        nums.append({"n":f"{n:02d}","state":s,"dir":"UP" if s.endswith("UP") else ("DOWN" if s.endswith("DOWN") else "NONE"),"z30":zs[0],"z100":zs[1],"z300":zs[2],"driftZ":d,"q30":round(qs[0],5),"q100":round(qs[1],5),"q300":round(qs[2],5),"fdr":min(qs)<=.05})
    stations[st]={"n":rec["n"],"latest":rec["latest"],"stationDist":{**rec["dist"],"q":round(stq[st],5),"anomaly":stq[st]<=.05},"numbers":nums}
payload={"updatedThrough":max(v["latest"] for v in stations.values()),"model":"Anomaly Watch v4.3","null":"Uniform raw-tail null p=0.01","windows":[30,100,300],"thresholds":{"watchAbsZ":2.5,"persistentAbsZ":1.8,"persistentMinWindows":2,"fdrConfirmedQ":0.05},"stations":stations,"note":"Statistical deviation flag only; not a forecast or evidence of a machine/ball defect."}
OUT.write_text("window.XSMN_ANOMALY="+json.dumps(payload,ensure_ascii=False,separators=(",",":"))+";\\n",encoding="utf-8")
print("Built",OUT,"through",payload["updatedThrough"])
