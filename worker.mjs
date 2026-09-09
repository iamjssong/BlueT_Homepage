import { assets } from './generated-assets.mjs';
const json=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const allowedOrigins=new Set(['https://iamjssong.github.io','https://bluet-golf-homepage.iamjssong.chatgpt.site']);
const cors=(response,origin)=>{if(!allowedOrigins.has(origin))return response;const headers=new Headers(response.headers);headers.set('Access-Control-Allow-Origin',origin);headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');headers.set('Access-Control-Allow-Headers','Content-Type, Authorization');headers.set('Vary','Origin');return new Response(response.body,{status:response.status,statusText:response.statusText,headers})};
const sha=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');
function equal(a,b){if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0}
export default {async fetch(request,env){
 const url=new URL(request.url),path=url.pathname;
 try {
 if(request.method==='OPTIONS'&&path.startsWith('/api/'))return cors(new Response(null,{status:204}),request.headers.get('Origin')||'');
 if(path==='/api/news'&&request.method==='GET'){
  const {results}=await env.DB.prepare('SELECT id,category,title,body,date FROM posts ORDER BY id DESC').all();return cors(json(200,results),request.headers.get('Origin')||'');
 }
 if(path.startsWith('/api/')){
  if(!['/api/news','/api/login','/api/delete'].includes(path))return json(404,{error:'찾을 수 없습니다.'});
  if(request.method!=='POST')return json(405,{error:'허용되지 않은 요청입니다.'});
  if(request.headers.get('Origin')&&!allowedOrigins.has(request.headers.get('Origin'))&&request.headers.get('Origin')!==url.origin)return json(403,{error:'허용되지 않은 요청입니다.'});
  if(!env.ADMIN_PASSWORD_SHA256)return json(503,{error:'관리자 설정을 확인해 주세요.'});
  const key=await sha(request.headers.get('cf-connecting-ip')||request.headers.get('oai-authenticated-user-id')||'unknown');
  const now=Math.floor(Date.now()/1000);
  const attempt=await env.DB.prepare('SELECT attempts,expires FROM auth_attempts WHERE key=?').bind(key).first();
  if(attempt&&attempt.expires>now&&attempt.attempts>=10)return json(429,{error:'로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.'});
  const auth=request.headers.get('Authorization')||'';
  if(!auth.startsWith('Bearer ')||!equal(await sha(auth.slice(7)),env.ADMIN_PASSWORD_SHA256)){
   await env.DB.prepare('INSERT INTO auth_attempts(key,attempts,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN expires<=? THEN 1 ELSE attempts+1 END,expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END').bind(key,now+900,now,now).run();
   return json(401,{error:'관리자 비밀번호를 확인해 주세요.'});
  }
  await env.DB.prepare('DELETE FROM auth_attempts WHERE key=?').bind(key).run();
  if(path==='/api/login')return cors(json(200,{ok:true}),request.headers.get('Origin')||'');
  if(Number(request.headers.get('Content-Length'))>100000)return json(413,{error:'입력 내용이 너무 깁니다.'});
  const text=await request.text();if(text.length>100000)return json(413,{error:'입력 내용이 너무 깁니다.'});
  let data;try{data=JSON.parse(text)}catch{return json(400,{error:'입력 내용을 확인해 주세요.'})}
  if(!data||typeof data!=='object')return json(400,{error:'입력 내용을 확인해 주세요.'});
  if(data.id!==undefined&&(!Number.isSafeInteger(data.id)||data.id<1))return json(400,{error:'글 번호를 확인해 주세요.'});
  if(path==='/api/delete'){
   if(!data.id)return json(400,{error:'글 번호를 확인해 주세요.'});
   await env.DB.prepare('DELETE FROM posts WHERE id=?').bind(data.id).run();return json(200,{ok:true});
  }
  const title=typeof data.title==='string'?data.title.trim():'',body=typeof data.body==='string'?data.body.trim():'';
  if(!title||title.length>100||!body||body.length>20000||!['공지','뉴스'].includes(data.category))return json(400,{error:'분류와 제목, 내용을 확인해 주세요.'});
  if(data.id)await env.DB.prepare('UPDATE posts SET title=?,body=?,category=? WHERE id=?').bind(title,body,data.category,data.id).run();
  else await env.DB.prepare('INSERT INTO posts(title,body,category) VALUES(?,?,?)').bind(title,body,data.category).run();
  return cors(json(200,{ok:true}),request.headers.get('Origin')||'');
 }
 if(!['GET','HEAD'].includes(request.method))return json(405,{error:'허용되지 않은 요청입니다.'});
 const asset=assets[path==='/'?'/index.html':path==='/admin'||path==='/admin/'?'/admin.html':path];
 if(!asset)return new Response('Not found',{status:404});
 const bytes=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));
 return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'"}});
 }catch{return json(500,{error:'처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'})}
}};
