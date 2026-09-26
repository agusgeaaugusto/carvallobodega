const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

$('#year').textContent=new Date().getFullYear();
const header=$('.site-header');
const menuToggle=$('#menuToggle');
const mainNav=$('#mainNav');

function closeMenu(){
  mainNav?.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded','false');
  if(menuToggle)menuToggle.innerHTML='<i class="fa-solid fa-bars" aria-hidden="true"></i>';
}
menuToggle?.addEventListener('click',()=>{
  const open=!mainNav.classList.contains('open');
  mainNav.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open);
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.innerHTML=open?'<i class="fa-solid fa-xmark" aria-hidden="true"></i>':'<i class="fa-solid fa-bars" aria-hidden="true"></i>';
});
$$('.nav a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});

function updateHeader(){header?.classList.toggle('scrolled',window.scrollY>24);}
updateHeader();
window.addEventListener('scroll',updateHeader,{passive:true});

const revealObserver='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}
}),{threshold:.12,rootMargin:'0px 0px -30px'}):null;
function observeReveals(root=document){$$('.reveal:not(.visible)',root).forEach(element=>revealObserver?revealObserver.observe(element):element.classList.add('visible'));}
observeReveals();

const sectionObserver='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  $$('.nav a').forEach(link=>link.classList.toggle('active',link.hash===`#${entry.target.id}`));
}),{rootMargin:'-35% 0px -55%',threshold:0}):null;
if(sectionObserver)$$('header[id],section[id]').forEach(section=>sectionObserver.observe(section));

function uniqueItems(items){
  const seen=new Set();
  return(Array.isArray(items)?items:[]).filter(item=>{
    const key=String(item?.id||item?.url||'').trim();
    if(!key||seen.has(key))return false;
    seen.add(key);return true;
  });
}
function versionedUrl(url,version){
  if(!url)return'';
  const clean=url.replace(/([?&])(cb|v)=[^&]*/g,'$1').replace(/\?&/g,'?').replace(/&&+/g,'&').replace(/[?&]$/,'');
  return`${clean}${clean.includes('?')?'&':'?'}v=${encodeURIComponent(String(version||'actual'))}`;
}
function imageUrl(item,size=1800){
  let url=item?.url||'';
  if(url)url=/[?&]sz=w\d+/.test(url)?url.replace(/sz=w\d+/,`sz=w${size}`):`${url}${url.includes('?')?'&':'?'}sz=w${size}`;
  else if(item?.id)url=`https://drive.google.com/thumbnail?id=${item.id}&sz=w${size}`;
  return versionedUrl(url,item?.modified||item?.id);
}
function createMediaCard(item,type,index){
  const article=document.createElement('article');
  article.className=`media-card ${type}-card reveal media-loading`;
  article.dataset.driveId=String(item?.id||'');
  const image=document.createElement('img');
  image.src=imageUrl(item,type==='promo'?1600:1800);
  image.alt=type==='promo'?`Promoción ${index+1} de Carvallo Bodega`:`Producto destacado ${index+1} de Carvallo Bodega`;
  image.loading=index<2?'eager':'lazy';image.decoding='async';
  image.addEventListener('load',()=>article.classList.remove('media-loading'),{once:true});
  image.addEventListener('error',()=>{article.classList.remove('media-loading');article.classList.add('media-error');image.alt='Imagen temporalmente no disponible';},{once:true});
  article.appendChild(image);return article;
}
function replaceChildren(container,children,emptyMessage){
  if(!container)return;
  if(!children.length){const empty=document.createElement('div');empty.className='media-placeholder';empty.textContent=emptyMessage;container.replaceChildren(empty);}else container.replaceChildren(...children);
  container.setAttribute('aria-busy','false');observeReveals(container);
}

let galleryIndex=0,galleryTimer;
function galleryCards(){return$$('.gallery-card');}
function updateGallery(){
  const cards=galleryCards(),dots=$$('#galleryDots button');if(!cards.length)return;
  galleryIndex=(galleryIndex+cards.length)%cards.length;
  cards.forEach((card,index)=>card.classList.toggle('active',index===galleryIndex));
  dots.forEach((dot,index)=>{dot.classList.toggle('active',index===galleryIndex);dot.setAttribute('aria-current',index===galleryIndex?'true':'false');});
}
function restartGallery(){
  clearInterval(galleryTimer);
  if(galleryCards().length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)galleryTimer=setInterval(()=>goToGallery(galleryIndex+1),5500);
}
function goToGallery(index){galleryIndex=index;updateGallery();restartGallery();}
function buildGallery(items){
  const track=$('#galleryTrack'),dots=$('#galleryDots');
  const cards=items.map((item,index)=>{
    const article=document.createElement('article');article.className=`gallery-card${index===0?' active':''}`;
    const image=document.createElement('img');image.src=imageUrl(item,1800);image.alt=`Ambiente de Carvallo Bodega, foto ${index+1}`;image.loading='lazy';image.decoding='async';article.appendChild(image);return article;
  });
  replaceChildren(track,cards,'Pronto compartiremos nuevas fotos de la bodega.');
  dots.replaceChildren(...items.map((_,index)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`Ver foto ${index+1}`);button.addEventListener('click',()=>goToGallery(index));return button;}));
  galleryIndex=0;updateGallery();restartGallery();
}
$('#galleryPrev')?.addEventListener('click',()=>goToGallery(galleryIndex-1));
$('#galleryNext')?.addEventListener('click',()=>goToGallery(galleryIndex+1));

let lastSignature='',requestInFlight=false;
function payloadSignature(data){return JSON.stringify(['hero','products','promotions','gallery'].map(section=>[section,uniqueItems(data?.[section]).map(item=>[item.id,item.modified])]));}
function renderMedia(data){
  const hero=uniqueItems(data.hero)[0],promotions=uniqueItems(data.promotions),products=uniqueItems(data.products),gallery=uniqueItems(data.gallery);
  if(hero)$('#heroMedia').style.backgroundImage=`url("${imageUrl(hero,2200)}")`;
  replaceChildren($('#promoMediaGrid'),promotions.map((item,index)=>createMediaCard(item,'promo',index)),'No hay promociones publicadas por el momento.');
  replaceChildren($('#productGrid'),products.map((item,index)=>createMediaCard(item,'product',index)),'Estamos actualizando nuestros productos destacados.');
  buildGallery(gallery);
}
async function syncMedia(){
  const endpoint=String(window.CARVALLO_MEDIA_API||'').trim();if(!endpoint||requestInFlight)return;requestInFlight=true;
  try{
    const response=await fetch(`${endpoint}${endpoint.includes('?')?'&':'?'}_=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();if(!data||data.success===false)throw new Error(data?.error||'Respuesta inválida');
    const signature=payloadSignature(data);if(signature!==lastSignature){lastSignature=signature;renderMedia(data);}
  }catch(error){console.warn('No se pudieron actualizar las imágenes:',error.message);$$('.media-placeholder').forEach(item=>item.textContent='Las imágenes se actualizarán en unos instantes.');}
  finally{requestInFlight=false;}
}
syncMedia();
const refreshMs=Math.max(15000,Number(window.CARVALLO_MEDIA_REFRESH_MS)||30000);
if(window.__CARVALLO_MEDIA_SYNC_TIMER__)clearInterval(window.__CARVALLO_MEDIA_SYNC_TIMER__);
window.__CARVALLO_MEDIA_SYNC_TIMER__=setInterval(syncMedia,refreshMs);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncMedia();});
