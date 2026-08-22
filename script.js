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
  if(!matchMedia('(pointer:fine)').matches)return;
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
function restartGallery(){clearInterval(galleryTimer);galleryTimer=setInterval(()=>goGallery(galleryCurrent+1),5000);}
function goGallery(i){const cards=galleryCards();if(!cards.length)return;galleryCurrent=(i+cards.length)%cards.length;paintGallery();restartGallery();}
document.getElementById('galleryPrev')?.addEventListener('click',()=>goGallery(galleryCurrent-1));
document.getElementById('galleryNext')?.addEventListener('click',()=>goGallery(galleryCurrent+1));
rebuildGalleryDots();paintGallery();restartGallery();

// ---------- Imágenes externas: refresco sin caché visible ----------
function withFreshToken(url){
  if(!url)return url;
  const clean=url.replace(/([?&])cb=\d+/,'$1').replace(/[?&]$/,'');
  return clean + (clean.includes('?')?'&':'?') + 'cb=' + Date.now();
}
function refreshExistingDriveImages(){
  document.querySelectorAll('img[data-drive-refresh], img[src*="drive.google.com/thumbnail"]').forEach(img=>{
    const base=img.dataset.baseSrc || img.src.replace(/([?&])cb=\d+/,'$1').replace(/[?&]$/,'');
    img.dataset.baseSrc=base;
    img.src=withFreshToken(base);
  });
  const hero=document.getElementById('heroMedia');
  if(hero){
    const base=hero.dataset.baseBg || 'https://drive.google.com/thumbnail?id=1Ye_SVczL7ZliPY5fwbm89BAaBVlXOQAq&sz=w2200';
    hero.dataset.baseBg=base;
    hero.style.backgroundImage=`url("${withFreshToken(base)}")`;
  }
}

function mediaCard(url,cls,alt){
  const article=document.createElement('article');
  article.className=cls;
  if(cls.includes('tilt-card'))article.dataset.tilt='7';
  const img=document.createElement('img');
  img.alt=alt||'Carvallo Bodega'; img.loading='eager'; img.decoding='async'; img.dataset.driveRefresh='1'; img.dataset.baseSrc=url; img.src=withFreshToken(url);
  article.appendChild(img);
  return article;
}
function driveThumb(item,size=1800){
  if(item?.url)return item.url.replace(/sz=w\d+/,'sz=w'+size);
  return item?.id?`https://drive.google.com/thumbnail?id=${item.id}&sz=w${size}`:'';
}

function renderMedia(data){
  // Banner: usa la imagen más reciente
  const heroItem=data.hero?.[0];
  if(heroItem){
    const hero=document.getElementById('heroMedia');
    const url=driveThumb(heroItem,2200);
    hero.dataset.baseBg=url; hero.style.backgroundImage=`url("${withFreshToken(url)}")`;
  }

  // Promociones: muestra todos los pósters, sin recortar
  if(Array.isArray(data.promotions) && data.promotions.length){
    const grid=document.getElementById('promoMediaGrid');
    grid.innerHTML='';
    data.promotions.slice(0,12).forEach(item=>grid.appendChild(mediaCard(driveThumb(item,1800),'promo-image-card tilt-card','Promoción Carvallo Bodega')));
    activateTilt(grid);
  }

  // Productos: conserva los paneles de categorías y reemplaza solo las imágenes
  if(Array.isArray(data.products) && data.products.length){
    const grid=document.getElementById('productGrid');
    const categories=[...grid.querySelectorAll('.category-panel')].map(x=>x.cloneNode(true));
    grid.innerHTML='';
    data.products.slice(0,10).forEach(item=>grid.appendChild(mediaCard(driveThumb(item,1600),'product-media tilt-card reveal','Producto Carvallo Bodega')));
    categories.forEach(x=>grid.appendChild(x));
    activateTilt(grid); observeReveals();
  }

  // Galería: agrega automáticamente todas las imágenes nuevas
  if(Array.isArray(data.gallery) && data.gallery.length){
    const track=document.getElementById('galleryTrack');
    track.innerHTML='';
    data.gallery.slice(0,20).forEach((item,i)=>{
      const card=mediaCard(driveThumb(item,1800),'gallery-card'+(i===0?' active':''),'Galería Carvallo Bodega');
      track.appendChild(card);
    });
    galleryCurrent=0; rebuildGalleryDots(); paintGallery(); restartGallery();
  }
}

let lastPayloadSignature='';
async function syncMedia(){
  const endpoint=window.CARVALLO_MEDIA_API;
  if(!endpoint){refreshExistingDriveImages();return;}
  try{
    const url=endpoint + (endpoint.includes('?')?'&':'?') + '_=' + Date.now();
    const res=await fetch(url,{cache:'no-store'});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();
    const signature=JSON.stringify({
      hero:data.hero?.map(x=>[x.id,x.modified]),
      products:data.products?.map(x=>[x.id,x.modified]),
      promotions:data.promotions?.map(x=>[x.id,x.modified]),
      gallery:data.gallery?.map(x=>[x.id,x.modified])
    });
    if(signature!==lastPayloadSignature){lastPayloadSignature=signature;renderMedia(data);}
  }catch(err){
    console.warn('Actualización de imágenes:',err.message);
    refreshExistingDriveImages();
  }
}

syncMedia();
setInterval(syncMedia, Number(window.CARVALLO_MEDIA_REFRESH_MS)||30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncMedia();});
