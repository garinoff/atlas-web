const appRoot=new URL('../',import.meta.url);
let base=location.origin,session='';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function serverUrl(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw new Error('Введите HTTPS-адрес сервера без пути и параметров.');return u.origin;}
function loadSession(){session=sessionStorage.getItem('atlas-session:'+base)||'';}
export async function rawApi(path,method='GET',data,csrf=''){
  const response=await fetch(base+'/api'+path,{method,credentials:'omit',headers:{'Content-Type':'application/json','X-Atlas-Token':csrf,...(session?{Authorization:'Bearer '+session}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{})});
  if(response.status===401){sessionStorage.removeItem('atlas-session:'+base);session='';}
  return response;
}
export async function connect(){
  const pages=location.hostname.endsWith('.github.io');
  if(pages){let manifest={};try{const r=await fetch(new URL('hosting.json',appRoot));if(r.ok)manifest=await r.json();}catch{}
    try{base=serverUrl(manifest.backendUrl||localStorage.getItem('atlas-server-url')||'');}catch{base='';}
  }
  if(base){loadSession();try{const r=await rawApi('/status');if(r.ok)return await r.json();if(!pages&&r.status!==401)throw new Error('Сервер Atlas недоступен.');}catch(e){if(!pages&&location.hostname==='127.0.0.1')throw e;}}
  const app=document.querySelector('#app');app.innerHTML=`<main class="login-panel panel"><div class="brand">Atlas</div><h1>Ваша рабочая лаборатория</h1><p>Исследования и проекты доступны только владельцу.</p><form id="atlas-login"><label>HTTPS-адрес сервера<input id="atlas-backend" type="url" required value="${esc(base)}" placeholder="https://ваш-сервер.onrender.com"></label><label class="spaced">Код доступа владельца<input id="atlas-owner-password" type="password" required autocomplete="current-password"></label><p class="hint">Код доступа хранится в секретных настройках сервера как ATLAS_OWNER_TOKEN. Это отдельный код входа, а не ключ ИИ.</p><button type="submit" class="primary">Войти</button><p id="login-error" role="alert" class="hint"></p></form></main>`;
  return new Promise(resolve=>{document.querySelector('#atlas-login').addEventListener('submit',async e=>{
    e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;const password=document.querySelector('#atlas-owner-password');
    try{base=serverUrl(document.querySelector('#atlas-backend').value);const r=await fetch(base+'/api/auth',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:password.value})});password.value='';const v=await r.json();if(!r.ok)throw new Error(v.error||'Не удалось войти.');
      session=v.token;sessionStorage.setItem('atlas-session:'+base,session);localStorage.setItem('atlas-server-url',base);const status=await rawApi('/status');if(!status.ok)throw new Error('Не удалось открыть сессию.');resolve(await status.json());
    }catch(err){document.querySelector('#login-error').textContent=err.message==='Failed to fetch'?'Сервер ещё не настроен или недоступен.':err.message;}finally{b.disabled=false;}
  });});
}
export async function downloadExport(path,csrf){const r=await rawApi(path.slice(4),'GET',undefined,csrf);if(!r.ok)throw new Error('Не удалось скачать экспорт. Проверьте вход.');const url=URL.createObjectURL(await r.blob()),link=document.createElement('a');link.href=url;link.download=path==='/api/backup'?'atlas-backup.json':path.includes('format=md')?'atlas-project.md':'atlas-project.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
export async function logout(csrf){try{await rawApi('/auth','DELETE',undefined,csrf);}finally{sessionStorage.removeItem('atlas-session:'+base);session='';location.reload();}}
export const guideUrl=new URL('guide/',appRoot).href;
