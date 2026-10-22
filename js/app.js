import * as THREE from './three.module.min.js';
const VERSION='1.1';
document.getElementById('ver').textContent='El Tirón v'+VERSION;
const $=s=>document.querySelector(s);
const UI=$('#ui');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const eur=n=>n.toLocaleString('es-ES').replace(/,/g,'.')+' €';
function fmtEur(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' €';}

// ---------- ajustes ----------
const DEF={nombre:'Iker',modo:'clasif',respuesta:'escribir',tClasif:5,dific:'normal',voz:true,musica:true,intro:true,min25:true,calidad:'auto',rapidoRival:false};
let A=Object.assign({},DEF,JSON.parse(localStorage.getItem('tiron_ajustes')||'{}'));
const guardaA=()=>localStorage.setItem('tiron_ajustes',JSON.stringify(A));
let EST=Object.assign({bote:50000,programa:1,campeon:{nombre:'Andrés',dinero:12000,programas:3,ia:true,av:2},dineroIker:0},JSON.parse(localStorage.getItem('tiron_estado')||'{}'));
const guardaE=()=>localStorage.setItem('tiron_estado',JSON.stringify(EST));

// ---------- audio ----------
const REAL=['buzz','beep0','chime','outro'];const sndUrl=n=>'snd/'+n+(REAL.includes(n)?'.ogg':'.mp3');const SND={};
['ding','buzz','beep','beep0','chime','tictac','outro','tecla'].forEach(n=>{SND[n]=new Audio(sndUrl(n));SND[n].preload='auto';});
function sfx(n,vol=1){try{const a=SND[n].cloneNode();a.volume=vol;a.play().catch(()=>{});}catch(e){}}
let bed=null;
function musica(n,loop=true){paraMusica();if(!A.musica)return;bed=new Audio(sndUrl(n));bed.loop=loop;bed.volume=.45*(A.volMus??1);bed.play().catch(()=>{});}
function paraMusica(){if(bed){bed.pause();bed=null;}}
let vozActual=null,saltar=false;
const SUB=$('#sub');
function habla(id){return new Promise(res=>{
  const txt=(window.VOZ||{})[id]||'';SUB.textContent='Nacho: '+txt;SUB.classList.remove('oculto');
  const fin=()=>{SUB.classList.add('oculto');vozActual=null;res();};
  if(!A.voz||saltar){setTimeout(fin,saltar?0:Math.min(6000,800+txt.length*45));return;}
  const a=new Audio('voz/'+id+'.mp3');vozActual={a,fin};presenterTalk=true;
  a.onended=()=>{presenterTalk=false;fin();};a.onerror=()=>{presenterTalk=false;setTimeout(fin,1500);};
  a.play().catch(()=>{presenterTalk=false;setTimeout(fin,Math.min(6000,800+txt.length*45));});
});}
function cortaVoz(){if(vozActual){vozActual.a.pause();presenterTalk=false;vozActual.fin();}}

// ---------- 3D ----------
const canvas=$('#c3d');
const lowEnd=(navigator.hardwareConcurrency||4)<=4||Math.min(screen.width,screen.height)<=720;
const renderer=new THREE.WebGLRenderer({canvas,antialias:!lowEnd,powerPreference:'low-power'});
let calidad=()=>A.calidad==='auto'?(lowEnd?'baja':'alta'):A.calidad;
function ajustaTam(){const pr=calidad()==='baja'?Math.min(1,devicePixelRatio)*0.75:Math.min(1.5,devicePixelRatio);renderer.setPixelRatio(pr);renderer.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x05062a);scene.fog=new THREE.Fog(0x05062a,26,48);
const cam=new THREE.PerspectiveCamera(50,1,0.1,100);
addEventListener('resize',ajustaTam);
scene.add(new THREE.AmbientLight(0x8890ff,0.75));
const dl=new THREE.DirectionalLight(0xffffff,0.9);dl.position.set(2,8,8);scene.add(dl);
const lRosa=new THREE.PointLight(0xff2fc8,30,30,1.6);lRosa.position.set(-6,5,2);scene.add(lRosa);
const lCian=new THREE.PointLight(0x36e8ff,30,30,1.6);lCian.position.set(6,5,2);scene.add(lCian);

function texLED(w,h,logo){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#1c0f9a');gr.addColorStop(.5,'#2b17d6');gr.addColorStop(1,'#170c80');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.lineCap='round';
  const lin=(x,col,wd)=>{g.strokeStyle=col;g.lineWidth=wd;g.shadowColor=col;g.shadowBlur=wd*3;g.beginPath();g.moveTo(x,h+20);g.lineTo(x+h*0.55,-20);g.stroke();};
  for(let x=-h;x<w;x+=w/5){lin(x,'#ff38d2',w/90);lin(x+w/11,'#4ff3ff',w/160);lin(x+w/16,'#ffffff',w/300);}
  g.shadowBlur=0;
  if(logo){dibujaLogo(g,w/2,h*0.55,h*0.36);}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function dibujaLogo(g,cx,cy,sz){
  g.save();g.textAlign='center';g.textBaseline='middle';g.font=sz+'px Logo, cursive';
  // swoosh blanco con flecha
  g.strokeStyle='#fff';g.lineWidth=sz*0.06;g.shadowColor='#bff';g.shadowBlur=sz*0.2;g.lineCap='round';
  const W=g.measureText('el Tirón').width;
  g.beginPath();g.moveTo(cx-W*0.55,cy+sz*0.55);g.quadraticCurveTo(cx+W*0.1,cy+sz*0.95,cx+W*0.5,cy-sz*0.1);g.lineTo(cx+W*0.42,cy+sz*0.75*0);g.stroke();
  g.beginPath();g.moveTo(cx+W*0.5,cy-sz*0.75);g.lineTo(cx+W*0.5,cy-sz*0.1);g.stroke();
  g.beginPath();g.moveTo(cx+W*0.42,cy-sz*0.6);g.lineTo(cx+W*0.5,cy-sz*0.8);g.lineTo(cx+W*0.58,cy-sz*0.6);g.stroke();
  g.shadowColor='#ff20c0';g.shadowBlur=sz*0.35;g.fillStyle='#ffd6f6';g.fillText('el Tirón',cx-W*0.04,cy);g.shadowBlur=sz*0.12;g.fillText('el Tirón',cx-W*0.04,cy);
  g.lineWidth=sz*0.025;g.strokeStyle='#ff4fd8';g.strokeText('el Tirón',cx-W*0.04,cy);
  g.restore();
}
const setG=new THREE.Group();scene.add(setG);
let wallMats=[];
function construyeSet(){
  setG.clear();wallMats=[];
  // suelo brillante claro
  const fc=document.createElement('canvas');fc.width=fc.height=512;const fg=fc.getContext('2d');
  const r=fg.createRadialGradient(256,256,20,256,256,360);r.addColorStop(0,'#eef0ff');r.addColorStop(.6,'#b9bff0');r.addColorStop(1,'#5a5fb0');fg.fillStyle=r;fg.fillRect(0,0,512,512);
  fg.strokeStyle='rgba(255,60,210,.9)';fg.lineWidth=10;fg.shadowColor='#ff3fd0';fg.shadowBlur=20;fg.beginPath();fg.ellipse(256,256,170,170,0,0,7);fg.stroke();
  fg.strokeStyle='rgba(60,230,255,.8)';fg.lineWidth=5;fg.beginPath();fg.ellipse(256,256,215,215,0,0,7);fg.stroke();
  const ft=new THREE.CanvasTexture(fc);ft.colorSpace=THREE.SRGBColorSpace;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshPhongMaterial({map:ft,shininess:120,specular:0xffffff}));
  floor.rotation.x=-Math.PI/2;setG.add(floor);
  // reflejo falso: tiras de neón en el suelo
  // pared LED central con logo y laterales
  const big=calidad()==='baja'?512:1024;
  const tC=texLED(big*2,big,true);
  const mC=new THREE.MeshBasicMaterial({map:tC});wallMats.push(mC);
  const wC=new THREE.Mesh(new THREE.PlaneGeometry(16,8),mC);wC.position.set(0,4.3,-7);setG.add(wC);
  const tL=texLED(big,big,false);
  for(const s of [-1,1]){const m=new THREE.MeshBasicMaterial({map:tL});wallMats.push(m);const w=new THREE.Mesh(new THREE.PlaneGeometry(9,8),m);w.position.set(s*11.2,4.3,-4.5);w.rotation.y=-s*0.6;setG.add(w);}
  // marcos de neón
  const neon=(c)=>new THREE.MeshBasicMaterial({color:c});
  for(const [y,c] of [[0.25,0xff3fd0],[8.35,0x36f0ff]]){const b=new THREE.Mesh(new THREE.BoxGeometry(16.2,0.12,0.12),neon(c));b.position.set(0,y,-6.95);setG.add(b);}
  for(const x of [-8.05,8.05]){const b=new THREE.Mesh(new THREE.BoxGeometry(0.12,8.2,0.12),neon(0xff3fd0));b.position.set(x,4.3,-6.95);setG.add(b);}
  // tiras de techo
  for(let i=0;i<6;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,14),neon(i%2?0x36f0ff:0xff3fd0));b.position.set(-7.5+i*3,9,-1);b.rotation.y=0.5;setG.add(b);}
}
// atriles transparentes
const cristal=()=>new THREE.MeshPhongMaterial({color:0x9fe8ff,transparent:true,opacity:0.32,shininess:140,specular:0xffffff,side:THREE.DoubleSide,depthWrite:false});
function bordes(geo,col){return new THREE.LineSegments(new THREE.EdgesGeometry(geo,30),new THREE.LineBasicMaterial({color:col}));}
function atrilCurvo(){
  const g=new THREE.Group();
  const geo=new THREE.CylinderGeometry(0.75,0.6,1.15,20,1,true,-Math.PI*0.42,Math.PI*0.84);
  const m=new THREE.Mesh(geo,cristal());m.position.y=0.58;g.add(m);
  const top=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,0.05,20,1,false,-Math.PI*0.45,Math.PI*0.9),cristal());top.position.y=1.17;g.add(top);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.025,6,24,Math.PI*0.84),new THREE.MeshBasicMaterial({color:0x36f0ff}));ring.rotation.x=Math.PI/2;ring.rotation.z=-Math.PI*0.5+Math.PI*0.42-Math.PI*0.42;ring.position.y=0.03;g.add(ring);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,0.03,24),new THREE.MeshBasicMaterial({color:0xff3fd0,transparent:true,opacity:.55}));base.position.y=0.015;g.add(base);
  return g;
}
function banquillo(){
  const g=new THREE.Group();
  const geo=new THREE.BoxGeometry(5.6,1.05,0.6);const m=new THREE.Mesh(geo,cristal());m.position.y=0.55;g.add(m);
  const e=bordes(geo,0x36f0ff);e.position.y=0.55;g.add(e);
  const t=new THREE.Mesh(new THREE.BoxGeometry(5.8,0.05,0.8),cristal());t.position.y=1.1;g.add(t);
  const n=new THREE.Mesh(new THREE.BoxGeometry(5.6,0.05,0.05),new THREE.MeshBasicMaterial({color:0xff3fd0}));n.position.set(0,0.1,0.31);g.add(n);
  return g;
}
const PIEL=[0xf1c9a5,0xe0ac80,0xc68a5c,0xf6d7bf];const PELO=[0x1b1410,0x3b2615,0x6b4a2a,0xb9b4ae,0xd8b86a];
const CAMISA=[0xffffff,0x3a5bc8,0xb02a2a,0x2a7a4a,0x222222,0xd88ab8,0x4a3a8a,0xe8e0c8];
const AVS=[]; // perfiles de aspecto
for(let i=0;i<12;i++)AVS.push({piel:PIEL[i%4],pelo:PELO[(i*3)%5],camisa:CAMISA[(i*5)%8],mujer:i%3===1,barba:i%4===0});
function persona(av,traje=false){
  const g=new THREE.Group();const L=c=>new THREE.MeshLambertMaterial({color:c});
  const piel=L(av.piel),pelo=L(av.pelo),cam=L(av.camisa),pant=L(0x1a1f3a);
  const leg=new THREE.CylinderGeometry(0.1,0.09,0.95,8);
  for(const s of[-1,1]){const l=new THREE.Mesh(leg,pant);l.position.set(s*0.13,0.48,0);g.add(l);}
  const tor=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.22,0.72,10),cam);tor.position.y=1.32;g.add(tor);
  if(traje){const ch=new THREE.Mesh(new THREE.CylinderGeometry(0.275,0.235,0.7,10,1,true,0.5,Math.PI*2-1),L(0x1a2348));ch.position.y=1.33;g.add(ch);}
  const arm=new THREE.CylinderGeometry(0.07,0.06,0.68,6);
  for(const s of[-1,1]){const a=new THREE.Mesh(arm,traje?L(0x1a2348):cam);a.position.set(s*0.32,1.3,0.02);a.rotation.z=s*0.12;g.add(a);const h=new THREE.Mesh(new THREE.SphereGeometry(0.065,6,5),piel);h.position.set(s*0.36,0.95,0.04);g.add(h);}
  const cu=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.08,0.12,6),piel);cu.position.y=1.73;g.add(cu);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(0.17,14,10),piel);hd.scale.set(1,1.18,1.05);hd.position.y=1.93;g.add(hd);g.userData.cabeza=hd;
  const hp=new THREE.Mesh(new THREE.SphereGeometry(0.182,12,8,0,Math.PI*2,0,Math.PI*0.5),pelo);hp.position.set(0,1.97,-0.01);hp.scale.set(1,1.15,1.08);g.add(hp);
  if(av.mujer){const lh=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.21,0.36,10,1,true,Math.PI*0.6,Math.PI*1.8),pelo);lh.position.y=1.82;lh.rotation.y=Math.PI;g.add(lh);}
  if(av.barba){const b=new THREE.Mesh(new THREE.SphereGeometry(0.15,10,6,0,Math.PI*2,Math.PI*0.68,Math.PI*0.32),pelo);b.position.set(0,1.93,0.04);b.scale.set(1.08,1.25,1.12);g.add(b);}
  const ojoM=L(0x111111);for(const s of[-1,1]){const o=new THREE.Mesh(new THREE.SphereGeometry(0.022,5,4),ojoM);o.position.set(s*0.065,1.96,0.165);g.add(o);}
  const boca=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.015,0.01),L(0x8a3030));boca.position.set(0,1.85,0.175);g.add(boca);g.userData.boca=boca;
  return g;
}
let presenter,presAtril,presenterTalk=false;
const grClasif=new THREE.Group(),grFinal=new THREE.Group();scene.add(grClasif,grFinal);
let pClasif=[],pFinal=[];
function construyePersonajes(clasif,final){
  if(presenter)scene.remove(presenter,presAtril);
  presenter=persona({piel:0xf1c9a5,pelo:0x2a1a10,camisa:0xf2f2f2},true);presenter.position.set(4.6,0,-2.6);presenter.rotation.y=-0.5;scene.add(presenter);
  presAtril=new THREE.Group();const pg=new THREE.BoxGeometry(1.1,1.1,0.45);const pm=new THREE.Mesh(pg,cristal());pm.position.y=0.55;presAtril.add(pm);const pe=bordes(pg,0xff3fd0);pe.position.y=0.55;presAtril.add(pe);
  presAtril.position.set(4.5,0,-2.0);presAtril.rotation.y=-0.5;scene.add(presAtril);
  grClasif.clear();pClasif=[];
  const b=banquillo();b.position.set(-1.2,0,0.6);grClasif.add(b);
  clasif.forEach((j,i)=>{const p=persona(AVS[j.av]);p.position.set(-1.2+(i-1)*1.85,0,0.15);grClasif.add(p);pClasif.push(p);});
  grFinal.clear();pFinal=[];
  final.forEach((j,i)=>{const at=atrilCurvo();at.position.set(i?2.2:-2.6,0,0.9);grFinal.add(at);const p=persona(AVS[j.av]);p.position.set(i?2.2:-2.6,0,0.4);grFinal.add(p);pFinal.push(p);});
}
// cámara
const camT={p:new THREE.Vector3(0,4,12),l:new THREE.Vector3(0,2.5,-4)},camC={p:new THREE.Vector3(0,4,12),l:new THREE.Vector3(0,2.5,-4)};
function camara(p,l,inst){camT.p.set(...p);camT.l.set(...l);if(inst){camC.p.copy(camT.p);camC.l.copy(camT.l);}}
const VISTAS={
  general:[[0,3.4,10.5],[0,2.6,-4]],
  presentador:[[2.4,2.2,1.8],[4.6,1.9,-2.6]],
  banquillo:[[-1.2,2.3,6.2],[-1.2,1.6,0]],
  final:[[-0.2,2.6,7.6],[-0.2,2.4,-3]],
  logo:[[0,4.3,4],[0,4.3,-7]],
};
function vista(n,inst){camara(VISTAS[n][0],VISTAS[n][1],inst);}
function primerPlano(i){const p=pFinal[i].position;camara([p.x+(i?-0.45:0.45),1.9,p.z+3.0],[p.x+(i?-0.45:0.45),1.6,p.z],false);}
const s0=()=>performance.now()/1000;let render3D=true,fiesta=false,t0=performance.now(),last=0;
function loop(t){
  requestAnimationFrame(loop);
  const fps=calidad()==='baja'?30:60;if(t-last<1000/fps-2)return;const dt=Math.min(0.1,(t-last)/1000);last=t;
  if(!render3D)return;
  if(orbita){const an=s0()*0.06;camT.p.set(Math.sin(an)*10.5,3.6,Math.cos(an)*10.5);camT.l.set(0,1.8,-1.5);}const k=1-Math.pow(0.04,dt);camC.p.lerp(camT.p,k);camC.l.lerp(camT.l,k);cam.position.copy(camC.p);cam.lookAt(camC.l);
  const s=t/1000;
  if(presenter){presenter.rotation.z=Math.sin(s*1.3)*0.015;presenter.userData.boca.scale.y=presenterTalk?1+3*Math.abs(Math.sin(s*14)):1;}
  [...pClasif,...pFinal].forEach((p,i)=>p.rotation.z=Math.sin(s*1.1+i)*0.012);
  if(fiesta){const h=(s*0.6)%1;lRosa.color.setHSL(h,1,.55);lCian.color.setHSL((h+.5)%1,1,.55);lRosa.intensity=20+25*Math.abs(Math.sin(s*8));lCian.intensity=20+25*Math.abs(Math.cos(s*8));wallMats.forEach((m,i)=>m.color.setHSL(0,0,0.6+0.4*Math.abs(Math.sin(s*6+i))));}
  renderer.render(scene,cam);
}

// ---------- preguntas ----------
const PQ=window.PREGUNTAS;const CATS=['General','General','General','Geografía','Geografía','España','Ciencia','Literatura','Arte','Cálculo'];
const porCat={};PQ.forEach((q,i)=>(porCat[q.c]=porCat[q.c]||[]).push(i));
let usadas=new Set(JSON.parse(localStorage.getItem('tiron_usadas')||'[]'));
function nuevaPregunta(){
  for(let k=0;k<50;k++){const c=rnd(CATS);const l=porCat[c];const i=rnd(l);if(!usadas.has(i)){usadas.add(i);if(usadas.size>PQ.length*0.85)usadas=new Set();localStorage.setItem('tiron_usadas',JSON.stringify([...usadas]));return PQ[i];}}
  usadas=new Set();return rnd(PQ);
}
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9ñ ]/g,' ').replace(/\b(el|la|los|las|un|una|de|del|y|e)\b/g,' ').replace(/\s+/g,' ').trim();
function lev(a,b){const m=a.length,n=b.length;let d=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){let p=d[0];d[0]=i;for(let j=1;j<=n;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t;}}return d[n];}
function correcta(resp,q){
  const r=norm(resp);if(!r)return false;
  for(const a of q.a){const n=norm(a);if(!n)continue;
    if(r===n)return true;
    if(/^\d+$/.test(n)||/^\d+$/.test(r)){if(r.replace(/ /g,'')===n.replace(/ /g,''))return true;continue;}
    const tol=n.length>=9?2:n.length>=4?1:0;if(lev(r,n)<=tol)return true;
    const ult=n.split(' ').pop();if(ult.length>=5&&n.includes(' ')&&lev(r,ult)<=(ult.length>=8?1:0)+(ult.length>=6?0:0))return true;
  }
  return false;
}
const opciones=q=>{const o=[q.a[0],...q.o];for(let i=o.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[o[i],o[j]]=[o[j],o[i]];}return o;};

// ---------- avatares 2D para los paneles ----------
const hex=c=>'#'+c.toString(16).padStart(6,'0');
function avatar2D(cv,av){
  const w=cv.width=240,h=cv.height=320;const g=cv.getContext('2d');
  const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#3a4ee8');bg.addColorStop(1,'#141c86');g.fillStyle=bg;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(255,63,208,.6)';g.lineWidth=6;for(let x=-200;x<w;x+=90){g.beginPath();g.moveTo(x,h);g.lineTo(x+200,0);g.stroke();}
  g.fillStyle=hex(av.camisa);g.beginPath();g.ellipse(w*0.45,h*1.02,w*0.48,h*0.36,0,0,7);g.fill();
  g.fillStyle=hex(av.piel);g.fillRect(w*0.39,h*0.52,w*0.12,h*0.12);
  if(av.mujer){g.fillStyle=hex(av.pelo);g.beginPath();g.ellipse(w*0.45,h*0.47,w*0.2,h*0.22,0,0,7);g.fill();}
  g.fillStyle=hex(av.piel);g.beginPath();g.ellipse(w*0.45,h*0.42,w*0.15,h*0.15,0,0,7);g.fill();
  g.fillStyle=hex(av.pelo);g.beginPath();g.ellipse(w*0.45,h*0.33,w*0.16,h*0.08,0,Math.PI,0);g.fill();g.fillRect(w*0.29,h*0.31,w*0.32,h*0.04);
  if(av.barba){g.beginPath();g.ellipse(w*0.45,h*0.5,w*0.13,h*0.08,0,0,Math.PI);g.fill();}
  g.fillStyle='#111';g.beginPath();g.arc(w*0.4,h*0.41,4,0,7);g.arc(w*0.5,h*0.41,4,0,7);g.fill();
  g.strokeStyle='#7a2a2a';g.lineWidth=3;g.beginPath();g.arc(w*0.45,h*0.46,12,0.2,Math.PI-0.2);g.stroke();
}

// ---------- reloj circular ----------
function relojHTML(cls=''){return `<div class="reloj ${cls}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="7"/><circle class="arc" cx="50" cy="50" r="46" fill="none" stroke="#36f0ff" stroke-width="7" stroke-dasharray="289" stroke-dashoffset="0"/></svg><span class="num">5</span></div>`;}
function setReloj(el,n,frac){el.querySelector('.num').textContent=n;el.querySelector('.arc').style.strokeDashoffset=String(289*(1-frac));}

// ---------- entrada de respuesta ----------
let respCb=null;
function zonaRespuesta(q,cont,humano){window.__q=q;
  cont.innerHTML='';if(!humano)return;
  if(A.respuesta==='opciones'){
    const d=document.createElement('div');d.className='mc';opciones(q).forEach(o=>{const b=document.createElement('button');b.className='btn peq';b.textContent=o;b.onclick=()=>respCb&&respCb({tipo:'resp',txt:o});d.appendChild(b);});
    const p=document.createElement('button');p.className='btn peq rosa';p.textContent='Pasapalabra… ¡digo, PASO!';p.onclick=()=>respCb&&respCb({tipo:'pasa'});d.appendChild(p);cont.appendChild(d);
  }else{
    const d=document.createElement('div');d.className='resp';d.innerHTML='<input id="inp" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escribe tu respuesta"><button class="btn peq">OK</button><button class="btn peq rosa">Paso</button>';
    const i=d.querySelector('input');const env=()=>respCb&&respCb({tipo:'resp',txt:i.value});
    i.onkeydown=e=>{if(e.key==='Enter')env();};d.children[1].onclick=env;d.children[2].onclick=()=>respCb&&respCb({tipo:'pasa'});
    cont.appendChild(d);setTimeout(()=>i.focus(),30);
  }
}
const dific={facil:{c:0.45,f:0.7},normal:{c:0.62,f:0.8},dificil:{c:0.78,f:0.88}};

// ---------- pantallas ----------
function logoHTML(sz){return `<div class="logo" style="font-size:${sz}">el Tirón<svg class="sw" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M2 8 Q50 34 92 6" fill="none" stroke="#fff" stroke-width="2.4" style="filter:drop-shadow(0 0 2px #bff)"/><path d="M86 9 L93 3 L96 12" fill="none" stroke="#fff" stroke-width="2.2"/></svg></div>`;}
// ===== Menú: misma estructura que ¡Ahora Caigo! (título → menú principal → submenús) =====
let orbita=false,menuEl=null,yaTitulo=false;
function logoCanvas(cls){const c=document.createElement('canvas');c.width=560;c.height=500;c.className=cls;const g=c.getContext('2d');dibujaLogo(g,280,270,150);return c;}
function mbtn(t,s,cls,fn){const b=document.createElement('button');b.className='mbtn '+cls;b.innerHTML=`<span class="fp"></span><span>${t}${s?`<small>${s}</small>`:''}</span>`;b.onclick=e=>{e.stopPropagation();sfx('tecla',.7);fn();};return b;}
function volverB(a){const b=document.createElement('button');b.className='tbtn back';b.innerHTML='⟵ Volver';b.onclick=e=>{e.stopPropagation();sfx('tecla',.7);Lt(a);};return b;}
function h2(t){const e=document.createElement('h2');e.textContent=t;return e;}
function fila(lbl,...els){const r=document.createElement('div');r.className='orow';const l=document.createElement('label');l.textContent=lbl;r.append(l,...els);return r;}
function siNo(k,cb){const b=document.createElement('button');const p=()=>{b.className='tbtn'+(A[k]?' sel':'');b.textContent=A[k]?'Sí':'No';};b.onclick=e=>{e.stopPropagation();A[k]=!A[k];guardaA();p();sfx('tecla',.7);cb&&cb();};p();return b;}
function elige(k,ops,cb){return ops.map(([v,t])=>{const b=document.createElement('button');b.className='tbtn'+(String(A[k])===String(v)?' sel':'');b.textContent=t;b.onclick=e=>{e.stopPropagation();A[k]=v;guardaA();sfx('tecla',.7);b.parentElement.querySelectorAll('.tbtn').forEach(x=>x.classList.toggle('sel',x===b));cb&&cb();};return b;});}
function entrarMenu(){fiesta=false;restaurarLuces();render3D=true;grFinal.visible=true;grClasif.visible=false;orbita=true;UI.innerHTML='';if(!bed||bed.dataset.n!=='menu'){musica('outro');if(bed){bed.volume=.3*(A.volMus??1);bed.dataset.n='menu';}}}
function menu(){Lt(yaTitulo?'main':'title');}
function Lt(a='main'){
  entrarMenu();
  if(!menuEl){menuEl=document.createElement('div');menuEl.id='menu';document.body.appendChild(menuEl);}
  const e=menuEl;e.classList.remove('oculto');$('#ver').style.display='none';e.innerHTML='';
  if(a==='title'){
    const u=document.createElement('div');u.className='title';const d=document.createElement('div');d.className='tsub';d.textContent='El juego';const f=document.createElement('div');f.className='ttap';f.textContent='Toca para empezar';
    u.append(logoCanvas('tlogo'),d,f);e.appendChild(u);
    const p=v=>{v.stopPropagation();e.removeEventListener('pointerup',p);removeEventListener('keydown',p);yaTitulo=true;sfx('chime',.6);entrarMenu();Lt('main');};
    e.addEventListener('pointerup',p);addEventListener('keydown',p);return;
  }
  const n=document.createElement('div');n.className='mbox';
  const i=document.createElement('div');i.className='logo';i.appendChild(logoCanvas('mlogo'));
  const o=document.createElement('div');o.className='mtag';o.textContent='EL JUEGO · 3D';i.appendChild(o);
  const r=document.createElement('div');r.className='col ui';
  if(a==='main'){
    r.append(mbtn('Jugar','Clasificación con 3 aspirantes y final contra el campeón, o directo a la final','gold',()=>Lt('play')),
      mbtn('Opciones','Tu nombre, forma de responder, sonido, voz, calidad gráfica','',()=>Lt('options')),
      mbtn('La historia de El Tirón','Nacho Tirado te cuenta la historia del programa','hist',()=>{salirMenu();historia(true);}),
      mbtn('Cómo se juega','Las reglas del concurso','',()=>Lt('help')),
      mbtn('Créditos','','',()=>Lt('credits')));
  }else if(a==='play'){
    r.append(h2(`Programa ${EST.programa} · Bote ${fmtEur(EST.bote)}`),
      mbtn('Programa completo','Fase de clasificación (5 segundos, rebote, 7 aciertos) y final con tirones contra el campeón','gold',()=>{A.modo='clasif';guardaA();salirMenu();jugar();}),
      mbtn('Directo a la final','150 segundos cada uno: 12 aciertos seguidos y te llevas el bote','',()=>{A.modo='final';guardaA();salirMenu();jugar();}),
      mbtn('Historia del programa','La versión larga, con chistes','hist',()=>{salirMenu();historia(true);}),
      h2('Campeón actual'));
    const t=document.createElement('div');t.className='mtext';t.innerHTML=`<p><b>${EST.campeon.nombre}</b> · ${EST.campeon.programas} programa(s) · ${fmtEur(EST.campeon.dinero||0)}</p>`;r.append(t,volverB('main'));
  }else if(a==='options'){
    r.appendChild(h2('Opciones'));
    const nom=document.createElement('input');nom.className='otext';nom.value=A.nombre;nom.maxLength=14;nom.onclick=e=>e.stopPropagation();nom.oninput=()=>{A.nombre=nom.value.trim()||'Iker';guardaA();};
    const vol=document.createElement('input');vol.type='range';vol.min=0;vol.max=100;vol.value=Math.round((A.volMus??1)*100);vol.oninput=()=>{A.volMus=vol.value/100;guardaA();if(bed)bed.volume=.3*A.volMus;};
    r.append(fila('👤 Tu nombre',nom),
      fila('🌐 Idioma',...elige('idioma',[['es','Español']])),
      fila('🎵 Música',siNo('musica',()=>{if(!A.musica)paraMusica();else entrarMenu();}),vol),
      fila('🎤 Voz del presentador',siNo('voz')),
      fila('😄 Historia corta al empezar',siNo('intro')),
      fila('✍️ Responder',...elige('respuesta',[['escribir','Escribir'],['opciones','Elegir entre 4']])),
      fila('⏱ Segundos (clasificación)',...elige('tClasif',[[5,'5'],[8,'8'],[12,'12']])),
      fila('🤖 Nivel de los rivales',...elige('dific',[['facil','Fácil'],['normal','Normal'],['dificil','Difícil']])),
      fila('🎯 Mínimo 25 aciertos',siNo('min25')),
      fila('✨ Calidad gráfica',...elige('calidad',[['auto','Auto'],['baja','Baja'],['alta','Alta']],()=>{ajustaTam();construyeSet();})));
    const rs=document.createElement('button');rs.className='tbtn';rs.textContent='Reiniciar';rs.onclick=e=>{e.stopPropagation();EST={bote:50000,programa:1,campeon:{nombre:'Andrés',dinero:12000,programas:3,ia:true,av:2},dineroIker:0};guardaE();Lt('options');};
    r.append(fila(`💰 Bote (${fmtEur(EST.bote)}) y campeón`,rs));
    const x=document.createElement('p');x.className='mtext';x.textContent='Si el juego va lento en tu móvil, elige calidad «Baja».';r.append(x,volverB('main'));
  }else if(a==='help'){
    r.classList.add('text');r.append(volverB('main'),h2('Cómo se juega'));const u=document.createElement('div');u.className='mtext';
    u.innerHTML=`<p><b>Clasificación:</b> tres aspirantes en el banquillo. El presentador pregunta y tienes <b>5 segundos</b>. Si fallas o pasas, la pregunta rebota al siguiente. El primero en llegar a <b>7 aciertos</b> gana 500 € y pasa a la final.</p><p><b>La final:</b> contra el campeón. Cada uno tiene <b>150 segundos</b>. Contestas seguido (un «tirón»): cada acierto enciende un escalón. Si fallas o pasas, la escalera vuelve a cero, tu reloj se para y le toca al otro.</p><p><b>El bote:</b> con <b>12 aciertos seguidos</b> te lo llevas. Si nadie lo consigue, gana quien tenga más aciertos (1.000 €) y vuelve al día siguiente. Opcional: mínimo de 25 aciertos.</p><p>Puedes escribir la respuesta (no importan tildes ni pequeñas erratas) o elegir entre 4 en Opciones.</p>`;r.append(u);
  }else if(a==='credits'){
    r.classList.add('text');r.append(volverB('main'),h2('Créditos'));const u=document.createElement('div');u.className='mtext';
    u.innerHTML=`<p><b>Idea y dirección</b><br>Iker (Ikeriano)</p><p><b>Presentador virtual</b><br>Nacho Tirado (voz sintética Piper, español de España)</p><p><b>Música y sonidos</b><br>Originales, sintetizados para el juego</p><p class="small">Versión ${VERSION}. Juego de fans sin ánimo de lucro inspirado en «El Tirón» (Telecinco, 2019-2020); no está afiliado a ninguna cadena. El presentador es un personaje inventado.</p>`;r.append(u);
  }
  const l=document.createElement('div');l.className='mver';l.textContent='v'+VERSION;n.appendChild(l);n.append(i,r);e.appendChild(n);
}
function salirMenu(){orbita=false;$('#ver').style.display='';if(menuEl)menuEl.classList.add('oculto');paraMusica();}
function botonSaltar(txt='Saltar ⏭'){const b=document.createElement('button');b.className='btn peq rosa';b.textContent=txt;const e=document.createElement('div');e.className='esq';e.appendChild(b);UI.appendChild(e);return b;}
async function historia(volver){
  render3D=true;UI.innerHTML='';saltar=false;const b=botonSaltar();b.onclick=()=>{saltar=true;cortaVoz();};
  const planos=['presentador','logo','general','final','banquillo','presentador','general'];
  for(let i=1;i<=7&&!saltar;i++){vista(planos[i-1]);await habla('hist'+i);await sleep(300);}
  saltar=false;if(volver)menu();
}
// ---------- partida ----------
let partida;const MUJ=['Concha','Marta','Lucía','Elena','Carmen','Nuria'];
async function jugar(){
  UI.innerHTML='';saltar=false;
  const nombres=['Rafa','Concha','Antonio','Marta','Javier','Lucía','Paco','Elena','Sergio','Carmen','Óscar','Nuria'].filter(n=>n!==EST.campeon.nombre&&n!==A.nombre);
  const iker={nombre:A.nombre,humano:true,av:0};
  const camp=EST.campeon;const campeon=camp.ia?{nombre:camp.nombre,humano:false,av:camp.av??2,dinero:camp.dinero}:{...iker,dinero:EST.dineroIker};
  const rivales=[];const usados=new Set();while(rivales.length<3){const n=rnd(nombres);if(!usados.has(n)){usados.add(n);const muj=MUJ.includes(n);const cands=AVS.map((a,i)=>i).filter(i=>i>0&&i!==2&&AVS[i].mujer===muj&&!rivales.some(r=>r.av===i));rivales.push({nombre:n,humano:false,av:rnd(cands)});}}
  let aspirantes=camp.ia?[iker,rivales[0],rivales[1]]:[rivales[0],rivales[1],rivales[2]];
  aspirantes.forEach(a=>a.dinero=a.humano?EST.dineroIker:0);
  construyePersonajes(aspirantes,[aspirantes[0],campeon]);grFinal.visible=false;grClasif.visible=true;
  vista('general',true);vista('presentador');
  const b=botonSaltar();b.onclick=()=>{saltar=true;cortaVoz();};
  await habla('bienvenida');if(A.intro&&!saltar){vista('logo');await habla('intro_corta');}
  saltar=false;
  let finalista;
  if(A.modo==='clasif'||!camp.ia){
    finalista=await clasificacion(aspirantes);
    if(!finalista)return;
  }else{finalista=iker;}
  await final(finalista,campeon);
}
async function clasificacion(jug){
  UI.innerHTML='';vista('banquillo');await habla('clasif');
  render3D=false;
  UI.innerHTML=`<div class="clasif">${jug.map((j,i)=>`<div class="cp" id="cp${i}"><canvas></canvas><div class="pills">${'<div class="pill"></div>'.repeat(7)}</div><div class="nom">${j.nombre}</div></div>`).join('')}</div>${relojHTML()}<div class="pregunta"><div id="ptxt"></div><div id="pz" style="width:100%"></div></div>`;
  const rel=UI.querySelector('.reloj');rel.style.left='50%';rel.style.transform='translateX(-50%)';rel.style.bottom='calc(17vh)';
  jug.forEach((j,i)=>{avatar2D($('#cp'+i+' canvas'),AVS[j.av]);j.ac=0;});
  const pills=i=>[...$('#cp'+i).querySelectorAll('.pill')];
  let turno=0;
  if(A.musica)musica('tictac');
  while(true){
    const q=nuevaPregunta();let resuelta=false;
    for(let k=0;k<3&&!resuelta;k++){
      const p=(turno+k)%3,j=jug[p];
      jug.forEach((_,i)=>$('#cp'+i).classList.toggle('activo',i===p));
      $('#ptxt').innerHTML=`<b style="color:#7ff6ff">${j.nombre}${k?' (rebote)':''}:</b> ${q.q}`;
      zonaRespuesta(q,$('#pz'),j.humano);
      const r=await esperaRespuesta(q,j,A.tClasif*1000,rel,true);
      if(r.ok){sfx('ding');j.ac++;pills(p)[j.ac-1].classList.add('ok');resuelta=true;$('#pz').innerHTML=`<div class="solucion">✔ ${q.a[0]}</div>`;turno=(p+1)%3;
        if(j.ac>=7){paraMusica();sfx('chime');await sleep(900);render3D=true;UI.innerHTML='';vista('banquillo');
          await habla('siete');j.dinero=(j.dinero||0)+500;if(j.humano){EST.dineroIker+=500;guardaE();}
          if(!j.humano){UI.innerHTML=`<div class="fin"><div class="grande">${j.nombre} gana la clasificación</div><div>Esta vez no ha podido ser, ${A.nombre}.</div><button class="btn" id="rv">Revancha</button><button class="btn peq" id="mn">Menú</button></div>`;$('#rv').onclick=jugar;$('#mn').onclick=menu;return null;}
          return j;}
        await sleep(900);
      }else{
        sfx('buzz');const pl=pills(p)[j.ac];if(pl){pl.classList.add('ko');setTimeout(()=>pl.classList.remove('ko'),700);}
        $('#pz').innerHTML=`<div class="solucion" style="color:#ff9a9a">${r.tipo==='pasa'?'Pasa':r.tipo==='tiempo'?'¡Tiempo!':'✘ '+(r.txt||'')} → ¡Rebote!</div>`;await sleep(900);
        if(k===2){$('#pz').innerHTML=`<div class="solucion">La respuesta era: ${q.a[0]}</div>`;await sleep(1500);turno=(turno+1)%3;}
      }
    }
  }
}
function esperaRespuesta(q,j,limite,relEl,beeps,velocidad=1){
  return new Promise(res=>{
    const ini=performance.now();let hecho=false,ultSeg=null;
    const fin=r=>{if(hecho)return;hecho=true;clearInterval(iv);clearTimeout(ia);respCb=null;r.ms=performance.now()-ini;res(r);};
    respCb=r=>{if(r.tipo==='pasa')fin({ok:false,tipo:'pasa'});else fin({ok:correcta(r.txt,q),tipo:'resp',txt:r.txt});};
    const iv=setInterval(()=>{const t=(performance.now()-ini)*velocidad;const rest=Math.max(0,limite-t);
      if(relEl&&limite<60000){const s=Math.ceil(rest/1000);setReloj(relEl,Math.max(s,0),rest/limite);if(beeps&&s!==ultSeg&&s>0){ultSeg=s;sfx('beep',.6);}}
      if(onTick)onTick(t);
      if(rest<=0){if(beeps)sfx('beep0');fin({ok:false,tipo:'tiempo'});}},60);
    let ia;
    if(!j.humano){const d=dific[A.dific];const enFinal=limite>=60000;const p=enFinal?d.f:d.c;const ok=Math.random()<p;
      const t=enFinal?(1600+Math.random()*2600):(1200+Math.random()*(limite*0.75));
      ia=setTimeout(()=>fin(ok?{ok:true,tipo:'resp',txt:q.a[0]}:(Math.random()<0.5?{ok:false,tipo:'pasa'}:{ok:false,tipo:'resp',txt:rnd(q.o)})),t/velocidad);}
  });
}
let onTick=null;
async function final(fin,camp){
  const J=[fin,camp];J.forEach(j=>{j.banco=150;j.total=0;j.mejor=0;});
  grClasif.visible=false;construyePersonajes([],J);grFinal.visible=true;render3D=true;UI.innerHTML='';
  vista('final');await habla('final');
  let p=0,bote=false;
  while(J.some(j=>j.banco>0)&&!bote){
    if(J[p].banco<=0){p=1-p;continue;}
    await comparativa(J,`Tirón de ${J[p].nombre}`);
    bote=await tiron(J,p);
    if(!bote&&J[1-p].banco>0)p=1-p;
  }
  paraMusica();if(!bote)await comparativa(J,'Resultado final',2600);
  await desenlace(J,bote);
}
async function comparativa(J,tit,ms=2400){
  render3D=false;
  UI.innerHTML=`<div class="comp"><div class="titulo">${tit}</div>${J.map(j=>`<div class="met"><div>${j.nombre}</div><div class="c">${j.total}</div><div class="s">${Math.ceil(j.banco)} s</div></div>`).join('')}</div>`;
  await sleep(ms);
}
async function tiron(J,p){
  const j=J[p];render3D=true;primerPlano(p);
  const lado=p?'left:4vw':'right:4vw';
  UI.innerHTML=`<div class="bote">${fmtEur(EST.bote)}</div><div class="escalera" style="${lado}">${Array.from({length:12},(_,i)=>`<div class="e">${i+1}</div>`).join('')}</div>${relojHTML()}<div class="barra"><span>${j.nombre}</span><span id="dn">${fmtEur(j.dinero||0)}</span></div><div class="pregunta" style="bottom:12vh;left:22vw;right:22vw"><div id="ptxt"></div><div id="pz" style="width:100%"></div></div>`;
  const rel=UI.querySelector('.reloj');rel.style.left='3vw';rel.style.bottom='3vh';rel.querySelector('.arc').style.stroke='#ff3fd0';
  if(p===0)rel.style.left='auto',rel.style.right='3vw';
  const esc=[...UI.querySelectorAll('.escalera .e')];
  let vel=1;if(!j.humano){const b=botonSaltar('Acelerar rival ⏩');b.parentElement.style.top='auto';b.parentElement.style.bottom='12vh';b.onclick=()=>{vel=vel===1?4:1;b.textContent=vel===1?'Acelerar rival ⏩':'Velocidad normal ▶';};}
  if(j.humano)await habla('turno');
  if(A.musica)musica('tictac');
  let racha=0;const ini=j.banco;
  while(j.banco>0){
    const q=nuevaPregunta();$('#ptxt').textContent=q.q;zonaRespuesta(q,$('#pz'),j.humano);
    const base=j.banco;
    onTick=t=>{j.banco=Math.max(0,base-t/1000);setReloj(rel,Math.ceil(j.banco),j.banco/150);};
    const r=await esperaRespuestaFinal(q,j,base*1000,()=>vel);
    onTick=null;
    if(r.ok){sfx('ding');j.total++;racha++;j.mejor=Math.max(j.mejor,racha);esc[racha-1].classList.add('ok');$('#pz').innerHTML=`<div class="solucion">✔ ${q.a[0]}</div>`;
      if(racha>=12){paraMusica();return true;}
      await sleep(350/vel);
    }else{
      paraMusica();sfx(r.tipo==='tiempo'?'beep0':'buzz');if(esc[racha])esc[racha].classList.add('ko');
      $('#pz').innerHTML=`<div class="solucion" style="color:#ff9a9a">${r.tipo==='pasa'?'Pasa':r.tipo==='tiempo'?'¡Se acabó el tiempo!':'✘ No'} · Respuesta: ${q.a[0]}</div>`;
      if(r.tipo==='tiempo')await habla('tiempo');
      await sleep(1600);esc.forEach(e=>e.classList.remove('ok','ko'));return false;
    }
  }
  paraMusica();return false;
}
function esperaRespuestaFinal(q,j,limite,velF){
  return new Promise(res=>{
    let t=0,prev=performance.now(),hecho=false;
    const fin=r=>{if(hecho)return;hecho=true;clearInterval(iv);respCb=null;res(r);};
    respCb=r=>{if(r.tipo==='pasa')fin({ok:false,tipo:'pasa'});else fin({ok:correcta(r.txt,q),tipo:'resp',txt:r.txt});};
    let aiT=null,aiR=null;
    if(!j.humano){const d=dific[A.dific];const ok=Math.random()<d.f;aiT=1500+Math.random()*2500;aiR=ok?{ok:true,tipo:'resp'}:(Math.random()<0.5?{ok:false,tipo:'pasa'}:{ok:false,tipo:'resp'});}
    const iv=setInterval(()=>{const now=performance.now();t+=(now-prev)*velF();prev=now;if(onTick)onTick(t);
      if(aiT!==null&&t>=aiT)fin(aiR);
      if(t>=limite)fin({ok:false,tipo:'tiempo'});},50);
  });
}
async function desenlace(J,bote){
  paraMusica();render3D=true;UI.innerHTML='';vista('final');
  let gan;let premio=0;let msg;
  if(bote){gan=J.find(j=>j.mejor>=12);premio=EST.bote;sfx('chime');await habla('bote');msg=`¡${gan.nombre} se lleva el bote de ${fmtEur(EST.bote)}!`;}
  else{
    const [a,c]=J;gan=a.total>c.total?a:c; // empate: sigue el campeón
    sfx('chime');
    if(A.min25&&gan.total<25){msg=`${gan.nombre} gana con ${gan.total} aciertos, pero no llega a 25: sin premio.`;await habla('min25');gan=null;}
    else{premio=1000;msg=`¡${gan.nombre} gana con ${gan.total} aciertos y se lleva 1.000 €!`;await habla('gana');}
  }
  if(gan){gan.dinero=(gan.dinero||0)+premio;}
  const iker=J.find(j=>j.humano);
  if(iker&&gan===iker){EST.dineroIker=(EST.dineroIker||0)+premio;EST.campeon={nombre:iker.nombre,ia:false,dinero:EST.dineroIker,programas:(EST.campeon.ia?0:EST.campeon.programas)+1};}
  else if(gan){EST.campeon={nombre:gan.nombre,ia:true,av:gan.av,dinero:gan.dinero,programas:(EST.campeon.nombre===gan.nombre?EST.campeon.programas:0)+1};}
  else{EST.campeon={nombre:'Andrés',dinero:0,programas:0,ia:true,av:2};}
  if(iker&&iker!==gan&&iker.dinero!==undefined){}
  EST.bote=bote?50000:EST.bote+5000;EST.programa++;guardaE();
  fiesta=true;musica('outro',true);vista('general');
  UI.innerHTML=`<div class="fin"><div style="position:absolute;top:3vh">${logoHTML('min(12vw,15vh)')}</div><div class="grande">${gan?'🏆 '+gan.nombre:'Sin campeón'}</div><div>${msg}</div><div>Próximo bote: <b style="color:#ff8fe6">${fmtEur(EST.bote)}</b></div><div style="display:flex;gap:3vw"><button class="btn peq" id="sg">Siguiente programa</button><button class="btn peq rosa" id="mn">Menú</button></div></div>`;
  $('#sg').onclick=()=>{fiesta=false;restaurarLuces();jugar();};$('#mn').onclick=()=>{fiesta=false;restaurarLuces();menu();};
  await habla(bote?'proximo_bote':'proximo');
}
function restaurarLuces(){lRosa.color.set(0xff2fc8);lCian.color.set(0x36e8ff);lRosa.intensity=lCian.intensity=30;wallMats.forEach(m=>m.color.set(0xffffff));}
// arranque
window.__tiron={jugar,menu,historia,clasificacion,final,comparativa,EST,A,vista,construyePersonajes,desenlace};
document.fonts.load('40px Logo').catch(()=>{}).finally(()=>{ajustaTam();construyeSet();construyePersonajes([{av:1},{av:4},{av:7}],[{av:0},{av:2}]);grFinal.visible=false;requestAnimationFrame(loop);menu();});
