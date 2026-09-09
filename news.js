(() => {
let posts=[], filter='전체', limit=5;
const $=s=>document.querySelector(s), dialog=$('#news-dialog'), content=$('#dialog-content');
const apiBase=location.hostname.endsWith('.github.io')?'https://bluet-golf-homepage.iamjssong.chatgpt.site':'';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(path){const response=await fetch(apiBase+path,{cache:'no-store'});if(!response.ok)throw Error('소식을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.');return response.json()}
function render(){const list=posts.filter(p=>filter==='전체'||p.category===filter);$('#news-status').textContent=list.length?'':filter==='전체'?'아직 등록된 소식이 없습니다. BlueT Golf의 새로운 이야기를 이곳에서 전하겠습니다.':`등록된 ${filter}가 없습니다.`;$('#news-list').innerHTML=list.slice(0,limit).map(p=>`<button class="news-row" data-post="${p.id}"><span class="news-category">${p.category}</span><span class="news-post-title">${escape(p.title)}</span><time>${escape(p.date)}</time><span aria-hidden="true">↗</span></button>`).join('');$('#more-news').hidden=list.length<=limit;}
async function load(){try{posts=await api('/api/news');render()}catch(e){$('#news-status').textContent=e.message;$('#news-list').innerHTML='<button class="text-button" id="retry-news">다시 시도</button>';$('#retry-news').onclick=load}}
function show(html){content.innerHTML=html;if(!dialog.open)dialog.showModal()}
function detail(id){const p=posts.find(p=>p.id===id);show(`<p class="eyebrow">${p.category} · ${escape(p.date)}</p><h2 id="dialog-title">${escape(p.title)}</h2><div class="post-body">${escape(p.body)}</div>`)}
$('#news-list').onclick=e=>{const button=e.target.closest('[data-post]');if(button)detail(Number(button.dataset.post))};document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;limit=5;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button))});render()});$('#more-news').onclick=()=>{limit+=5;render()};$('.dialog-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});load();
})();
