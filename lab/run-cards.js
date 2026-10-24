import {annotated,searchSuggestions} from './reports.js';
import {sticker} from './identity.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=v=>v?new Date(v).toLocaleString('ru-RU',{timeZone:'Europe/Rome',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
const names={structure:'Паспорт идеи',research:'Рынок и аналоги',experiment:'План эксперимента',evaluate:'Разбор результатов',focus:'План фокуса',partners:'Поиск партнёров',operations:'Инструкция для передачи'};
const states={queued:'В очереди',running:'Выполняется',completed:'Готово',failed:'Ошибка',cancelled:'Остановлен',interrupted:'Прерван перезапуском'};
const labels={buyer:'Покупатель',problem:'Проблема',offer:'Предложение',revenueModel:'Монетизация',channel:'Канал',assumptions:'Гипотезы',unknowns:'Неизвестное',hypothesis:'Гипотеза',metric:'Метрика',threshold:'Порог, %',minSample:'Минимальная выборка',deadline:'Срок',budget:'Бюджет',reason:'Основание',title:'Название',trigger:'Триггер',inputs:'Входы',steps:'Шаги',quality:'Приёмка',escalation:'Эскалация',access:'Доступ',notes:'Примечания'};
const badge=(s,kind='neutral')=>`<span class="badge ${kind}"><i class="dot"></i>${esc(s)}</span>`;
const button=(t,a,id,cls='')=>`<button class="${cls}" data-action="${a}" data-id="${esc(id)}">${t}</button>`;
const safeSource=s=>{try{const u=new URL(s.url);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
export const excerpt=(s,n=170)=>{s=String(s??'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n).trimEnd()+'…':s;};

export function runPreview(r){
  const s=r.result?.structured;
  if(s){const fields=r.kind==='structure'?['buyer','offer','unknowns']:r.kind==='experiment'?['hypothesis','metric','reason']:['title','trigger','quality'];
    return `<dl class="result-preview">${fields.map(k=>`<div><dt>${labels[k]||k}</dt><dd>${esc(excerpt(s[k])||'Не указано')}</dd></div>`).join('')}</dl>`;}
  const text=(r.result?.parts||[]).map(p=>p.text).join('\n').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/[*#`]/g,'');
  return text?`<p class="report-excerpt">${esc(excerpt(text,420))}</p>`:'';
}
export function renderRunCard(r,p,{expanded=new Set(),pending=[]}={}){
  const accepted=pending.includes(r.id),relation=accepted?'pending':r.comparison?.state||'proposal',s=r.result?.structured;
  const hasPassport=['buyer','problem','offer'].every(k=>p.passport?.[k]?.trim());
  const adopted=['adopted','matches','pending'].includes(relation);
  const relationBadge=({adopted:'Применено к паспорту',matches:'Совпадает с паспортом',pending:'Применено · сохраните проект',changed:'Вводные изменились',proposal:'Предложение ИИ'})[relation];
  let next='';
  if(r.status==='completed'){
    if(s&&!(r.kind==='structure'&&adopted))next+=button(r.kind==='structure'?'Применить к паспорту':'Применить как черновик','apply',r.id,'primary');
    if(r.kind==='structure'&&hasPassport)next+=button('Перейти к исследованию →','next-research',r.id,adopted?'primary':'quiet');
    if(r.kind==='research')next+=`<button class="primary" data-action="next-step" data-tab="experiments">Подготовить эксперимент →</button>`;
    if(r.kind==='experiment')next+=`<button data-action="next-step" data-tab="experiments">Открыть эксперименты →</button>`;
    if(r.kind==='evaluate')next+=`<button data-action="next-step" data-tab="history">Записать решение →</button>`;
  }
  const sources=(r.result?.sources||[]).filter(safeSource),fullId='full-'+r.id,metaId='meta-'+r.id;
  return `<article class="run-card" data-run-id="${esc(r.id)}">
    <div class="run-card-head">${sticker(p,true)}<div class="run-card-title"><strong>${names[r.kind]||esc(r.kind)}</strong><div class="meta">${date(r.created)} · версия входа ${r.input_version}${r.research?' · '+esc(r.research.label):''}${sources.length?' · источников: '+sources.length:''}</div></div>${badge(states[r.status]||r.status,r.status==='completed'?'':r.status==='failed'?'error':'neutral')}${relationBadge&&r.status==='completed'?badge(relationBadge,relation==='changed'?'warn':'neutral'):''}</div>
    ${relation==='changed'?'<div class="notice">Содержимое проекта изменилось после запуска или применения. Сравните полный результат с текущими вводными.</div>':''}
    ${r.error?`<div class="notice">${esc(r.error)}</div>`:''}
    ${['queued','running'].includes(r.status)?`<p class="muted">Ожидаем ответ. Страницу можно переключать; запуск сохраняется.</p>${button('Остановить','cancel',r.id,'small-btn')}`:''}
    ${runPreview(r)}
    ${r.result?`<details class="run-full" data-disclosure="${esc(fullId)}" ${expanded.has(fullId)?'open':''}><summary><span class="when-closed">Развернуть полный результат</span><span class="when-open">Свернуть полный результат</span></summary><div class="run-body">${s?`<div class="notice info">Предложение ИИ. Применение к паспорту не подтверждает спрос.</div>${Object.entries(s).map(([k,v])=>`<p class="structured-field"><strong>${esc(labels[k]||k)}</strong><br>${esc(v)}</p>`).join('')}`:(r.result.parts||[]).map(part=>`<div class="report">${annotated(part)}</div>`).join('')}${sources.length?`<div class="sources"><strong>Источники поиска · ${date(r.result.retrievedAt)}</strong><small>${esc(r.result.support||'Содержание источников требует проверки.')}</small>${sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`).join('')}</div>`:''}${r.result.searchSuggestions?searchSuggestions(r.result.searchSuggestions):''}</div></details>`:''}
    ${next?`<div class="run-next"><span class="meta">Следующий шаг</span><div class="actions">${next}</div></div>`:''}
    ${r.selection||r.usage?`<details class="run-meta" data-disclosure="${esc(metaId)}" ${expanded.has(metaId)?'open':''}><summary>Модель и расход</summary><div class="hint">${r.selection?`${esc(r.selection.provider)} / ${esc(r.selection.model)} · ключ ${esc(r.selection.keyName)}<br>`:''}${r.research?`Глубина: ${esc(r.research.label)} · ${r.research.maxOutputTokens?'ваш лимит: '+r.research.maxOutputTokens+' токенов.':'без ограничения токенов Atlas.'} ${esc(r.research.searchLimit)}<br>`:''}${r.comparison?.appliedAt?`Применено: ${date(r.comparison.appliedAt)} · версия ${r.comparison.appliedVersion}<br>`:''}${r.usage?`Вход ${r.usage.input_tokens??'—'} / выход ${r.usage.output_tokens??'—'} токенов · поиск ${r.usage.web_search_calls??'—'}. Стоимость неизвестна; счёт проверяйте в кабинете провайдера.`:'Расход пока не получен.'}</div></details>`:''}
  </article>`;
}
