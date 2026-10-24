const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function annotated(part){
  const chars=Array.from(part.text),marks=new Map();
  for(const a of part.annotations||[]){
    if(!Number.isInteger(a.start_index)||!Number.isInteger(a.end_index)||a.start_index<0||a.end_index<a.start_index||a.end_index>chars.length)continue;
    let url;try{url=new URL(a.url);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)continue;}catch{continue;}
    const link=` <a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer" title="${esc(a.title)}">[${esc(a.title||'источник')}]</a>`;
    marks.set(a.end_index,(marks.get(a.end_index)||'')+link);
  }
  return (marks.get(0)||'')+chars.map((c,i)=>esc(c)+(marks.get(i+1)||'')).join('');
}
export function searchSuggestions(items=[]){
  // An opaque-origin sandbox and restrictive CSP isolate provider HTML from Atlas.
  return items.filter(s=>typeof s==='string').map(s=>{
    const doc=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https://www.gstatic.com; script-src 'none'; base-uri 'none'; form-action 'none'"></head><body>${s}</body></html>`;
    return `<iframe class="search-suggestions" title="Поисковые подсказки Google" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer" srcdoc="${esc(doc)}"></iframe>`;
  }).join('');
}
