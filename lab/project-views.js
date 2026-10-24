import {icons,colors,identityFor,identitySymbol,sticker} from './identity.js';
import {excerpt} from './run-cards.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fields=[['buyer','Кто платит'],['problem','Конкретная проблема'],['offer','Предложение'],['revenueModel','Как зарабатываем'],['channel','Доступ к покупателю'],['assumptions','Гипотезы'],['unknowns','Неизвестное и вопросы']];
const date=v=>new Date(v).toLocaleDateString('ru-RU',{timeZone:'Europe/Rome',day:'2-digit',month:'short'});

export function passportView(p,{field,select,button,aiButton,missingKey,statuses,catalog=[],editing=false,expanded=new Set()}){
  const hasPassport=Object.values(p.passport).some(Boolean),identity=identityFor(p),edit=editing||!hasPassport;
  const key='idea-editor-'+(p.id||'new');
  return `${missingKey()}<div class="workspace passport-workspace"><div>
    <details class="panel idea-editor" data-disclosure="${key}" ${!p.id||expanded.has(key)?'open':''}><summary><strong>Исходная идея</strong><span class="meta">Описание, ограничения и стикер · раскрыть для изменения</span></summary><div class="editor-body">
      ${!p.id?`<label class="picker">Взять направление из Атласа<select id="catalog"><option value="">Своя идея</option>${catalog.map(c=>`<option value="${esc(c.id)}">${esc(c.title)}</option>`).join('')}</select></label>`:''}
      <div class="form-grid">${field('Название','title',p.title,'text',{full:true,required:true})}${field('Опишите покупателя, проблему и своё решение','idea',p.idea,'textarea',{full:true,large:true})}${field('Страна','country',p.country)}${field('Город','city',p.city)}${field('Лимит теста, EUR','budget',p.budget,'number')}${field('Доступно часов в неделю','hours',p.hours,'number')}</div>
      <details class="sticker-editor" data-disclosure="sticker-editor" ${expanded.has('sticker-editor')?'open':''}><summary><span class="identity-preview">${sticker(p,true)}</span>Изменить стикер</summary><div class="form-grid">${select('Смысловой значок','identity.icon',identity.icon,icons.map(([id,label])=>[id,label]))}${select('Цвет','identity.color',identity.color,colors)}<label class="full">Своё изображение (PNG, JPEG, WebP, до 150 КБ)<input id="sticker-upload" type="file" accept="image/png,image/jpeg,image/webp"></label></div><div class="actions spaced">${button('Подобрать по смыслу идеи','suggest-sticker','small-btn')}${identity.image?button('Убрать своё изображение','remove-sticker-image','small-btn'):''}</div><div class="hint">Стикер сохраняется с проектом. Изображение остаётся на этом компьютере и не отправляется модели.</div></details>
      <div class="actions spaced">${aiButton('structure','Структурировать с ИИ')}${button('Сохранить описание','save')}</div><div class="hint">Результат сохраняется отдельным предложением. Вы сами решаете, применять ли его к паспорту.</div>
    </div></details>
    <div class="panel"><div class="record-header"><h2>Паспорт идеи</h2>${hasPassport?button(edit?'Завершить редактирование':'Редактировать','edit-passport','small-btn'):''}</div>
      ${edit?`<div class="form-grid">${fields.map(([k,t])=>field(t,'passport.'+k,p.passport[k],'textarea',{full:k==='unknowns'})).join('')}</div>`:`<dl class="passport-overview">${fields.slice(0,3).map(([k,t])=>`<div><dt>${t}</dt><dd>${esc(excerpt(p.passport[k],230)||'Не указано')}</dd></div>`).join('')}</dl><details class="passport-full" data-disclosure="passport-full" ${expanded.has('passport-full')?'open':''}><summary>Все поля паспорта</summary>${fields.map(([k,t])=>`<p class="structured-field"><strong>${t}</strong><br>${esc(p.passport[k]||'Не указано')}</p>`).join('')}</details>`}
    </div></div>
    <aside><div class="panel"><h3>Статус работы</h3>${select('Вы выбираете стратегию','status',p.status,Object.entries(statuses))}<div class="hint">Статус не подтверждает спрос или прибыльность.</div><details class="clarity-guide"><summary>Как сделать идею яснее</summary><p>Один покупатель. Одна ситуация. Один результат.</p><p class="muted">Укажите, кому, когда и почему текущий способ решения неудобен. Неизвестное можно оставить неизвестным.</p></details></div></aside>
  </div><div id="runs"></div>`;
}

export function researchOptions(projects,currentId,query=''){
  const q=query.toLocaleLowerCase('ru-RU').trim();
  return projects.filter(p=>p.id===currentId||!q||p.title.toLocaleLowerCase('ru-RU').includes(q)).map(p=>{
    const last=p.lastResearch,info=last?` · ${last.status==='completed'?'исследование':last.status==='failed'?'ошибка исследования':'запуск'} ${date(last.at)}`:' · ещё не исследована';
    return `<option value="${esc(p.id)}" ${p.id===currentId?'selected':''}>${esc(identitySymbol(p)+' '+p.title+info)}</option>`;
  }).join('');
}
export function researchView(p,{projects,profiles,depth,context,missingKey,aiButton,tokenLimitValue=null}){
  const profile=profiles.find(d=>d.id===depth)||profiles[1],ready=['buyer','problem','offer'].every(k=>p.passport[k]?.trim());
  return `<div class="panel research-picker"><div class="eyebrow">Продолжить работу с идеей</div>${projects.length>6?'<label>Найти идею<input type="search" id="idea-filter" placeholder="Название идеи"></label>':''}<label>Идея для исследования<select id="research-project">${!p.id?'<option value="" selected>Текущая несохранённая идея</option>':''}${researchOptions(projects,p.id)}</select></label><div class="hint">Выбор идеи открывает её паспорт и историю. Исследование запускается только кнопкой ниже.</div></div>
    ${missingKey()}<div class="panel"><div class="eyebrow">Источники → сравнение → границы вывода</div><h2>Исследование рынка</h2><p class="muted">Покупатели, аналоги, предложения и аргументы против идеи. Источники и выбранная глубина сохраняются с результатом.</p>
    <fieldset class="depth-options"><legend>Глубина исследования</legend>${profiles.map(d=>`<label class="depth-option"><input type="radio" name="research-depth" value="${d.id}" ${d.id===depth?'checked':''}><strong>${d.label}</strong><span>${d.id==='quick'?'Первичный обзор и основные неизвестные':d.id==='standard'?'Покупатели, аналоги, цены и контраргументы':'Сегменты, противоречия и план проверки спроса'}</span></label>`).join('')}</fieldset>
    <div id="research-scope" class="research-scope">${researchScope({...profile,maxOutputTokens:tokenLimitValue})}</div>
    <label class="token-limit">Ваш лимит выходных токенов (необязательно)<input id="research-token-limit" type="number" min="1" step="1" value="${tokenLimitValue??''}" placeholder="Без ограничения Atlas"></label><div class="hint">Пустое поле — Atlas не задаёт лимит токенов. Действуют параметры и технические ограничения выбранного провайдера. Глубина меняет охват поиска, а не обрезает ответ.</div>
    <label>Фокус исследования (необязательно)<textarea id="ai-context" placeholder="Например: какие задачи пользователей стоит проверить в первую очередь">${esc(context)}</textarea></label>
    ${ready?'':`<div class="notice spaced">Сначала заполните в паспорте покупателя, проблему и предложение. <button class="text-link" data-action="next-step" data-tab="passport">Открыть паспорт</button></div>`}
    <div class="actions spaced">${aiButton('research','Запустить исследование')}</div><div class="hint">Каждый запуск использует платный API. Стоимость заранее неизвестна. Расход контролируете вы; автоматического повтора нет.</div></div>
    <div class="notice info">Наличие конкурента или прайса подтверждает предложение. Продажи и прибыль требуют отдельных доказательств.</div><div id="runs"></div>`;
}
export function researchScope(p){return `<p>${esc(p.scope)}</p><div class="meta">${p.maxOutputTokens?'Ваш лимит: '+p.maxOutputTokens+' выходных токенов.':'Без ограничения токенов со стороны Atlas.'} ${esc(p.searchLimit)}</div>`;}
