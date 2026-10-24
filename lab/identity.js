// Local semantic stickers. No generated images or external requests.
export const icons = [
  ['browser','Браузер и расширения','🧩','M4 5h24v22H4z M4 11h24 M8 8h1m3 0h1 M11 18h4v-3h5v3h3v5h-3v3h-5v-3h-4z'],
  ['route','Маршрут и доставка','📍','M23 11c0 6-7 11-7 11S9 17 9 11a7 7 0 1 1 14 0z M13 11a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M9 22H5l-2 6h26l-2-6h-4'],
  ['shop','Магазин и продажи','🛍','M7 11h18l2 17H5z M11 12V8a5 5 0 0 1 10 0v4 M12 19h8'],
  ['tools','Мастерская и сервис','🔧','M19 5a7 7 0 0 0-8 9L4 24l4 4 10-8a7 7 0 0 0 9-8l-5 4-5-5z'],
  ['food','Еда и гостеприимство','🍽','M6 4v8m4-8v8m4-8v8M6 9v3a4 4 0 0 0 8 0V9M10 16v12 M25 4c-7 4-7 13 0 13V4v24'],
  ['book','Обучение и знания','📚','M16 8C10 4 6 5 3 6v20c5-2 9-1 13 2 4-3 8-4 13-2V6c-3-1-7-2-13 2v20 M7 11h4m-4 5h4m10-5h4m-4 5h4'],
  ['health','Здоровье и забота','💚','M16 28 4 16C-3 6 10 0 16 9 22 0 35 6 28 16z M7 16h5l2-4 4 8 2-4h5'],
  ['growth','Аналитика и финансы','📈','M5 4v24h24 M9 21l6-7 5 3 8-11 M22 6h6v6'],
  ['leaf','Природа и устойчивость','🌿','M6 26C0 12 13 3 28 4c0 15-8 25-20 20 M5 28 23 9 M11 22v-8m0 8h8'],
  ['home','Дом и пространство','🏠','M3 15 16 4l13 11 M7 12v16h18V12 M13 28V18h6v10'],
  ['people','Люди и сообщества','🤝','M12 11a5 5 0 1 0-10 0a5 5 0 1 0 10 0 M30 11a5 5 0 1 0-10 0a5 5 0 1 0 10 0 M1 28v-4c0-8 13-8 13 0v4m4 0v-4c0-8 13-8 13 0v4'],
  ['spark','Новая возможность','✦','M16 3 20 12l9 4-9 4-4 9-4-9-9-4 9-4z']
];
export const colors = [['teal','Бирюзовый'],['blue','Синий'],['violet','Фиолетовый'],['amber','Янтарный'],['rose','Розовый'],['green','Зелёный']];
const themes = [
  ['browser',/chrome|браузер|расширен|browser|плагин|приложен|software|автоматизац|нейросет|\bai\b/i],
  ['route',/маршрут|доставк|логист|путешеств|route|туризм|транспорт/i],
  ['food',/ресторан|кафе|пекар|кухн|питан|еда\b|food|кофе/i],
  ['health',/здоров|медиц|стомат|клиник|забот|health/i],
  ['book',/обучен|образован|репетитор|школ|курс|книг|знани/i],
  ['tools',/мастерск|ремонт|сервис|инструмент|ремесл/i],
  ['shop',/магазин|торгов|продаж|товар|shop|ecommerce/i],
  ['growth',/аналитик|финанс|бюджет|инвест|бухгалтер/i],
  ['leaf',/эколог|растен|сад\b|природ|ферм|переработ/i],
  ['home',/недвижим|жиль|дом\b|уборк|интерьер/i],
  ['people',/сообществ|партн[её]р|команд|клуб|семь/i]
];
export function suggestedIdentity(p) {
  const title=String(p.title||''),all=title+' '+String(p.idea||'');
  const icon=(themes.find(([,re])=>re.test(title))||themes.find(([,re])=>re.test(all)))?.[0]||'spark';
  let hash=0;for(const c of all)hash=(hash*31+c.codePointAt(0))>>>0;
  return {icon,color:colors[hash%colors.length][0],image:''};
}
export function identityFor(p){return p.identity||suggestedIdentity(p);}
export function identitySymbol(p){return icons.find(i=>i[0]===identityFor(p).icon)?.[2]||'✦';}
export function sticker(p,small=false){
  const s=identityFor(p),icon=icons.find(i=>i[0]===s.icon)||icons.at(-1),color=colors.some(c=>c[0]===s.color)?s.color:'teal';
  const image=/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s.image||'')?s.image:'';
  return `<span class="sticker sticker-${color}${small?' sticker-small':''}" aria-hidden="true">${image?`<img src="${image}" alt="">`:`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${icon[3]}"/></svg>`}</span>`;
}
