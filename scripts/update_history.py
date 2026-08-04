#!/usr/bin/env python3
# Fetch missing XSMN dates, validate 18 results/station, append historical CSV.
import csv, hashlib, random, re, time, unicodedata
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

ROOT=Path(__file__).resolve().parents[1]
CSV=ROOT/"data/history/xsmn_history.csv"
FAIL=ROOT/"data/history/update_failures.csv"
NODRAW=ROOT/"data/history/no_draw.csv"
BASE="https://xoso.com.vn/xsmn-{dd}-{mm}-{yyyy}.html"
SCHEDULE={
0:["TP. HCM","Đồng Tháp","Cà Mau"],1:["Bến Tre","Vũng Tàu","Bạc Liêu"],
2:["Đồng Nai","Cần Thơ","Sóc Trăng"],3:["Tây Ninh","An Giang","Bình Thuận"],
4:["Vĩnh Long","Bình Dương","Trà Vinh"],5:["TP. HCM","Long An","Bình Phước","Hậu Giang"],
6:["Tiền Giang","Kiên Giang","Đà Lạt"]}
EXPECTED={"giai_8":1,"giai_7":1,"giai_6":3,"giai_5":1,"giai_4":7,"giai_3":2,"giai_2":1,"giai_1":1,"giai_db":1}
ORDER=["giai_8","giai_7","giai_6","giai_5","giai_4","giai_3","giai_2","giai_1","giai_db"]
LABEL={"giai_8":"8","giai_7":"7","giai_6":"6","giai_5":"5","giai_4":"4","giai_3":"3","giai_2":"2","giai_1":"1","giai_db":"DB"}
COLS=["ngay","thu","tinh","giai_db","giai_1","giai_2","giai_3","giai_4","giai_5","giai_6","giai_7","giai_8","source_url","source_sha256"]

class NoDraw(Exception): pass
def deaccent(s):
    s=(s or "").replace("Đ","D").replace("đ","d")
    return "".join(c for c in unicodedata.normalize("NFD",s) if unicodedata.category(c)!="Mn")
def visible(html):
    soup=BeautifulSoup(html,"html.parser")
    for t in soup(["script","style","noscript","svg"]):t.decompose()
    return soup.get_text(" ",strip=True)
def tokenize(text):
    s=deaccent(text)
    s=re.sub(r"\bGIAI\s*(?:DAC\s*BIET|DB)\b"," DB ",s,flags=re.I)
    s=re.sub(r"\bG\s*\.?\s*DB\b"," DB ",s,flags=re.I)
    s=re.sub(r"\b(?:DAC\s*BIET|DB)\b"," DB ",s,flags=re.I)
    for k in range(1,9):
        s=re.sub(rf"\bGIAI\s*{k}\b",f" {k} ",s,flags=re.I)
        s=re.sub(rf"\bG\s*\.?\s*{k}\b",f" {k} ",s,flags=re.I)
    return re.findall(r"DB|\d{1,6}",s,flags=re.I)
def parse_sequence(text,n):
    toks=tokenize(text)
    for start,t in enumerate(toks):
        if t!="8":continue
        i=start; rows={}; good=True
        for key in ORDER:
            lab=LABEL[key]
            if i>=len(toks) or (toks[i].upper()!="DB" if lab=="DB" else toks[i]!=lab):
                good=False;break
            i+=1; need=EXPECTED[key]*n; vals=[]
            while i<len(toks) and len(vals)<need:
                if toks[i].isdigit() and 2<=len(toks[i])<=6: vals.append(toks[i]);i+=1
                else: good=False;break
            if not good or len(vals)!=need:good=False;break
            rows[key]=vals
        if good:return rows
    return None
def session():
    s=requests.Session()
    retry=Retry(total=4,backoff_factor=.8,status_forcelist=[429,500,502,503,504],allowed_methods=["GET"])
    s.mount("https://",HTTPAdapter(max_retries=retry));s.headers["User-Agent"]="Mozilla/5.0 XSMN-history-updater"
    return s
def fetch_day(s,dt):
    url=BASE.format(dd=dt.strftime("%d"),mm=dt.strftime("%m"),yyyy=dt.strftime("%Y"))
    r=s.get(url,timeout=30);r.raise_for_status()
    text=visible(r.text); nt=deaccent(text).lower()
    if any(p in nt for p in ["khong mo thuong","khong quay thuong","tam dung quay so","tam ngung quay so"]):
        raise NoDraw("source reports no draw")
    stations=SCHEDULE[dt.weekday()]
    rows=parse_sequence(text,len(stations))
    if rows is None:raise ValueError("No valid G8→DB sequence")
    sha=hashlib.sha256(r.text.encode("utf-8","ignore")).hexdigest()
    out=[]
    for j,st in enumerate(stations):
        rec={"ngay":dt.strftime("%d-%m-%Y"),"thu":str(dt.weekday()),"tinh":st,"source_url":url,"source_sha256":sha}
        for key in ORDER:
            e=EXPECTED[key]; rec[key]="|".join(rows[key][j*e:(j+1)*e])
        if sum(len(rec[k].split("|")) for k in EXPECTED)!=18:raise ValueError(f"{st}: result count !=18")
        out.append(rec)
    return out
def append_rows(path,rows,cols):
    exists=path.exists()
    with path.open("a",newline="",encoding="utf-8-sig") as f:
        w=csv.DictWriter(f,fieldnames=cols); 
        if not exists:w.writeheader()
        w.writerows(rows)
def main():
    with CSV.open(encoding="utf-8-sig") as f:
        rows=list(csv.DictReader(f))
    existing={datetime.strptime(r["ngay"],"%d-%m-%Y").date() for r in rows}
    latest=max(existing)
    now=datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))
    target=now.date() if (now.hour,now.minute)>=(18,30) else now.date()-timedelta(days=1)
    if latest>=target:
        print("History already current through",latest);return
    s=session();d=latest+timedelta(days=1)
    while d<=target:
        if d in existing:d+=timedelta(days=1);continue
        try:
            got=fetch_day(s,d);append_rows(CSV,got,COLS);print(d,"OK",len(got),"stations")
        except NoDraw as e:
            append_rows(NODRAW,[{"date":d.isoformat(),"reason":str(e)}],["date","reason"]);print(d,"NO_DRAW")
        except Exception as e:
            append_rows(FAIL,[{"date":d.isoformat(),"error":repr(e)}],["date","error"])
            raise SystemExit(f"{d} failed; stopped so next run retries this date: {e}")
        d+=timedelta(days=1);time.sleep(.2+random.uniform(0,.08))
if __name__=="__main__":main()
