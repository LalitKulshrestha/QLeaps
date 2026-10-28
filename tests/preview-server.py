"""Loopback-only browser fixture. Never sends submissions to Google.
Run: python3 tests/preview-server.py (port 8081). State file in /tmp switches
normal/empty/error/legacy; synthetic requests are captured in /tmp only.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
import json, re
ROOT=Path(__file__).resolve().parent.parent/'dist'
STATE=Path('/tmp/qleaps-fixture-state')
CAPTURE=Path('/tmp/qleaps-fixture-requests.json')
requests=[];receipts={}
JOB={'id':'QLJ-ABCDEF123456','title':'Test Design Lead','company':'Example Test Studio','area':'Design and product','location':'Mumbai','work_mode':'Hybrid','experience':'5–8 years','salary':'By agreement','description':'Synthetic local fixture for testing the application journey.','closes':''}
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):pass
    def output(self,data,status=200,mime='application/json'):
        raw=data.encode() if isinstance(data,str) else json.dumps(data).encode()
        self.send_response(status);self.send_header('Content-Type',mime);self.send_header('Content-Length',len(raw));self.end_headers();self.wfile.write(raw)
    def do_GET(self):
        url=urlsplit(self.path);params={k:v[0] for k,v in parse_qs(url.query).items()};state=STATE.read_text().strip() if STATE.exists() else 'normal'
        if url.path=='/__test/google':
            if state=='error':return self.output({'status':'error'},503)
            if params.get('action')=='jobs':data={'status':'success','version':2,'candidate_details':state!='legacy','jd_attachments':True,'jobs':[] if state in ['empty','legacy'] else [JOB]}
            else:data=receipts.get(params.get('request_id'),{'status':'pending','version':2})
            if params.get('callback'):return self.output(params['callback']+'('+json.dumps(data)+');',mime='application/javascript')
            return self.output(data)
        if url.path.startswith('/_astro/') and url.path.endswith('.js'):
            bundle=(ROOT/url.path.lstrip('/')).resolve()
            if not bundle.is_relative_to(ROOT.resolve()) or not bundle.is_file():return self.output({'status':'error'},404)
            code=bundle.read_text()
            code=re.sub(r'https://script\.google\.com/macros/s/[^\"\'\s]+/exec','http://127.0.0.1:8081/__test/google',code)
            return self.output(code,mime='application/javascript')
        return super().do_GET()
    def do_POST(self):
        if urlsplit(self.path).path!='/__test/google':return self.output({'status':'error'},404)
        p={k:v[0] for k,v in parse_qs(self.rfile.read(int(self.headers['Content-Length'])).decode(),keep_blank_values=True).items()}
        requests.append(p);CAPTURE.write_text(json.dumps(requests,indent=2));missing=[k for k in ['name','email','consent','request_id'] if not p.get(k)]
        if p.get('action')=='post_job':missing += [k for k in ['company','role','city','experience','description'] if not p.get(k)]
        if p.get('action')=='apply':missing += [k for k in ['phone','file_data','area'] if not p.get(k)]
        result={'status':'error','message':'Please check fields: '+','.join(missing)} if missing else {'status':'success','reference':'LOCAL-TEST-'+str(len(requests)),'version':2}
        receipts[p.get('request_id')]=result;self.output(result)
if __name__=='__main__':
    print('Isolated browser fixture: http://127.0.0.1:8081 (no Google writes)',flush=True)
    ThreadingHTTPServer(('127.0.0.1',8081),Handler).serve_forever()
