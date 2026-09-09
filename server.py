import os, json, secrets, hashlib, hmac, sqlite3
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parent
DATA=ROOT.parent/'.bluet-data'; DATA.mkdir(exist_ok=True)
KEY=DATA/'admin-password.txt'
if not KEY.exists():
    KEY.write_text(secrets.token_urlsafe(15)); KEY.chmod(0o600)
PASSWORD=KEY.read_text().strip()
DB=DATA/'news.sqlite3'
with sqlite3.connect(DB) as c:
    c.execute('CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, category TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, date TEXT NOT NULL DEFAULT (date(\'now\')) )')
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw): super().__init__(*a,directory=str(ROOT),**kw)
    def output(self,status,data):
        raw=json.dumps(data,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(raw)
    def do_GET(self):
        path=urlparse(self.path).path
        if path=='/api/news':
            with sqlite3.connect(DB) as c:
                c.row_factory=sqlite3.Row
                rows=[dict(r) for r in c.execute('SELECT * FROM posts ORDER BY id DESC')]
            return self.output(200,rows)
        if path.endswith('.py') or path.startswith('/.') or path.startswith('/design/') or path.endswith('.md'):
            return self.send_error(404)
        return super().do_GET()
    def do_POST(self):
        if urlparse(self.path).path not in ['/api/news','/api/login','/api/delete']:return self.output(404,{'error':'찾을 수 없습니다.'})
        if self.headers.get('Origin') and self.headers['Origin'] not in ['http://127.0.0.1:8765','http://localhost:8765']:return self.output(403,{'error':'허용되지 않은 요청입니다.'})
        if not hmac.compare_digest(self.headers.get('Authorization',''), 'Bearer '+PASSWORD):return self.output(401,{'error':'관리자 비밀번호를 확인해 주세요.'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length>100000:raise ValueError()
            data=json.loads(self.rfile.read(length) or '{}')
            if self.path=='/api/login':return self.output(200,{'ok':True})
            with sqlite3.connect(DB) as c:
                if self.path=='/api/delete':
                    c.execute('DELETE FROM posts WHERE id=?',(int(data['id']),))
                else:
                    title=str(data.get('title','')).strip();body=str(data.get('body','')).strip();category=data.get('category')
                    if not title or len(title)>100 or not body or len(body)>20000 or category not in ['공지','뉴스']:raise ValueError()
                    if data.get('id'):c.execute('UPDATE posts SET title=?,body=?,category=? WHERE id=?',(title,body,category,int(data['id'])))
                    else:c.execute('INSERT INTO posts(title,body,category) VALUES(?,?,?)',(title,body,category))
            self.output(200,{'ok':True})
        except (ValueError,KeyError,TypeError):self.output(400,{'error':'제목과 내용을 확인해 주세요.'})
ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
