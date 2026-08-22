document.getElementById('year').textContent = new Date().getFullYear();

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle?.addEventListener('click',()=>{
  mainNav.classList.toggle('open');
  menuToggle.innerHTML = mainNav.classList.contains('open') ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>mainNav.classList.remove('open')));

const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
}),{threshold:.12});
function observeReveals(){document.querySelectorAll('.reveal:not(.visible)').forEach(el=>observer.observe(el));}
observeReveals();

window.addEventListener('scroll',()=>{
  const y=window.scrollY+160;
  document.querySelectorAll('section[id],header[id],footer[id]').forEach(sec=>{
    const link=document.querySelector(`.nav a[href="#${sec.id}"]`); if(!link)return;
    link.classList.toggle('active',y>=sec.offsetTop && y<sec.offsetTop+sec.offsetHeight);
  });
});

const searchModal=document.getElementById('searchModal'), searchBtn=document.getElementById('searchBtn'), closeSearch=document.getElementById('closeSearch'), searchInput=document.getElementById('searchInput'), searchResult=document.getElementById('searchResult');
searchBtn?.addEventListener('click',()=>{searchModal.classList.add('open');searchModal.setAttribute('aria-hidden','false');searchInput.focus();});
closeSearch?.addEventListener('click',()=>{searchModal.classList.remove('open');searchModal.setAttribute('aria-hidden','true');});
searchModal?.addEventListener('click',e=>{if(e.target===searchModal)closeSearch.click();});
searchInput?.addEventListener('input',()=>{
  const q=searchInput.value.trim().toLowerCase();
  if(!q){searchResult.textContent='Escribí para buscar dentro de la página.';return;}
  const found=[...document.querySelectorAll('h1,h2,h3,p,strong')].find(el=>el.textContent.toLowerCase().includes(q));
  if(found){searchResult.textContent='Encontrado: '+found.textContent.trim();found.scrollIntoView({behavior:'smooth',block:'center'});}else searchResult.textContent='No encontramos coincidencias para “'+q+'”.';
});

function activateTilt(root=document){
  if(!root||!matchMedia('(pointer:fine)').matches)return;
  root.querySelectorAll?.('.tilt-card:not([data-tilt-ready])').forEach(card=>{
    card.dataset.tiltReady='1';
    const strength=Number(card.dataset.tilt||7);
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateX(${-y*strength}deg) rotateY(${x*strength}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave',()=>card.style.transform='');
  });
}
activateTilt();

// ---------- Carrusel de galería dinámico ----------
let galleryCurrent=0, galleryTimer;
function galleryCards(){return [...document.querySelectorAll('.gallery-card')];}
function rebuildGalleryDots(){
  const dots=document.getElementById('galleryDots'); if(!dots)return;
  dots.innerHTML='';
  galleryCards().forEach((_,i)=>{
    const b=document.createElement('button');
    b.setAttribute('aria-label',`Ir a foto ${i+1}`);
    b.addEventListener('click',()=>goGallery(i));
    dots.appendChild(b);
  });
}
function paintGallery(){
  const cards=galleryCards(), dots=document.getElementById('galleryDots');
  if(!cards.length)return;
  galleryCurrent=Math.min(galleryCurrent,cards.length-1);
  cards.forEach((c,i)=>{
    c.classList.remove('active','prev','next');
    if(i===galleryCurrent)c.classList.add('active');
    else if(i===(galleryCurrent-1+cards.length)%cards.length)c.classList.add('prev');
    else if(i===(galleryCurrent+1)%cards.length)c.classList.add('next');
  });
  [...(dots?.children||[])].forEach((d,i)=>d.classList.toggle('active',i===galleryCurrent));
}
function restartGallery(){
  clearInterval(galleryTimer);
  if(galleryCards().length>1)galleryTimer=setInterval(()=>goGallery(galleryCurrent+1),5000);
}
function goGallery(i){const cards=galleryCards();if(!cards.length)return;galleryCurrent=(i+cards.length)%cards.length;paintGallery();restartGallery();}
document.getElementById('galleryPrev')?.addEventListener('click',()=>goGallery(galleryCurrent-1));
document.getElementById('galleryNext')?.addEventListener('click',()=>goGallery(galleryCurrent+1));
rebuildGalleryDots();paintGallery();restartGallery();

// ---------- Google Drive: una sola fuente, sin duplicados ----------
const productCategoryTemplates=[...document.querySelectorAll('#productGrid .category-panel')]
  .map(panel=>panel.cloneNode(true));

function uniqueDriveItems(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).filter(item=>{
    const key=String(item?.id||item?.url||'').trim();
    if(!key||seen.has(key))return false;
    seen.add(key);
    return true;
  });
}

function withVersionToken(url,version){
  if(!url)return '';
  const clean=url
    .replace(/([?&])(cb|v)=[^&]*/g,'$1')
    .replace(/\?&/g,'?')
    .replace(/&&+/g,'&')
    .replace(/[?&]$/,'');
  const token=encodeURIComponent(String(version||'actual'));
  return clean+(clean.includes('?')?'&':'?')+'v='+token;
}

function driveThumb(item,size=1800){
  let url=item?.url||'';
  if(url)url=/[?&]sz=w\d+/.test(url)
    ?url.replace(/sz=w\d+/,'sz=w'+size)
    :url+(url.includes('?')?'&':'?')+'sz=w'+size;
  else if(item?.id)url=`https://drive.google.com/thumbnail?id=${item.id}&sz=w${size}`;
  return withVersionToken(url,item?.modified||item?.id);
}

function mediaCard(item,cls,alt,size){
  const article=document.createElement('article');
  article.className=cls;
  article.dataset.driveId=String(item?.id||'');
  if(cls.includes('tilt-card'))article.dataset.tilt='7';

  const img=document.createElement('img');
  img.alt=item?.name?`${alt}: ${item.name}`:alt;
  img.loading='lazy';
  img.decoding='async';
  img.src=driveThumb(item,size);
  img.addEventListener('load',()=>article.classList.add('media-loaded'),{once:true});
  img.addEventListener('error',()=>article.classList.add('media-error'),{once:true});
  article.appendChild(img);
  return article;
}

function replaceMediaChildren(container,nodes){
  if(!container)return;
  const fragment=document.createDocumentFragment();
  nodes.forEach(node=>fragment.appendChild(node));
  container.replaceChildren(fragment);
  container.setAttribute('aria-busy','false');
}

function renderMedia(data){
  const heroItems=uniqueDriveItems(data.hero);
  const productItems=uniqueDriveItems(data.products);
  const promotionItems=uniqueDriveItems(data.promotions);
  const galleryItems=uniqueDriveItems(data.gallery);

  const hero=document.getElementById('heroMedia');
  const heroItem=heroItems[0];
  if(hero&&heroItem){
    hero.style.backgroundImage=`url("${driveThumb(heroItem,2200)}")`;
    hero.dataset.driveId=String(heroItem.id||'');
    hero.classList.add('media-ready');
  }

  const promoGrid=document.getElementById('promoMediaGrid');
  replaceMediaChildren(
    promoGrid,
    promotionItems.map(item=>mediaCard(item,'promo-image-card tilt-card','Promoción Carvallo Bodega',1800))
  );
  activateTilt(promoGrid);

  const productGrid=document.getElementById('productGrid');
  const productCards=productItems.map(item=>mediaCard(item,'product-media tilt-card reveal','Producto Carvallo Bodega',1600));
  productCategoryTemplates.forEach(panel=>productCards.push(panel.cloneNode(true)));
  replaceMediaChildren(productGrid,productCards);
  activateTilt(productGrid);
  observeReveals();

  const galleryTrack=document.getElementById('galleryTrack');
  replaceMediaChildren(
    galleryTrack,
    galleryItems.map((item,index)=>mediaCard(item,'gallery-card'+(index===0?' active':''),'Galería Carvallo Bodega',1800))
  );
  galleryCurrent=0;
  rebuildGalleryDots();
  paintGallery();
  restartGallery();
}

function payloadSignature(data){
  const sections=['hero','products','promotions','gallery'];
  return JSON.stringify(sections.map(section=>[
    section,
    uniqueDriveItems(data[section]).map(item=>[item.id,item.modified])
  ]));
}

let lastPayloadSignature='';
let mediaSyncInFlight=false;
async function syncMedia(){
  const endpoint=String(window.CARVALLO_MEDIA_API||'').trim();
  if(!endpoint||mediaSyncInFlight)return;
  mediaSyncInFlight=true;
  try{
    const url=endpoint+(endpoint.includes('?')?'&':'?')+'_='+Date.now();
    const res=await fetch(url,{cache:'no-store'});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();
    if(!data||data.success===false)throw new Error(data?.error||'Respuesta inválida');
    const signature=payloadSignature(data);
    if(signature!==lastPayloadSignature){
      lastPayloadSignature=signature;
      renderMedia(data);
    }
  }catch(err){
    console.warn('Actualización de imágenes:',err.message);
  }finally{
    mediaSyncInFlight=false;
  }
}

if(window.__CARVALLO_MEDIA_SYNC_TIMER__)clearInterval(window.__CARVALLO_MEDIA_SYNC_TIMER__);
syncMedia();
window.__CARVALLO_MEDIA_SYNC_TIMER__=setInterval(syncMedia,Number(window.CARVALLO_MEDIA_REFRESH_MS)||30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncMedia();});
