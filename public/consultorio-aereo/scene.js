const PI = Math.PI;
const $ = id => document.getElementById(id);
(function(){
const T=window.THREE,cv=$('c');let renderer;
try{if(!T)throw 0;renderer=new T.WebGLRenderer({canvas:cv,antialias:true})}catch(e){$('nogl').hidden=false;return}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputEncoding=T.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color(0x041226);scene.fog=new T.Fog(0x041226,34,120);
const cam=new T.PerspectiveCamera(68,1,0.08,200);cam.rotation.order='YXZ';
scene.add(new T.HemisphereLight(0xe6f6ff,0x5a747c,0.78));
const sun=new T.DirectionalLight(0xfff4e2,0.62);sun.position.set(3,19,13);sun.target.position.set(9,0,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-0.0006;sun.shadow.radius=3;Object.assign(sun.shadow.camera,{left:-14,right:14,top:12,bottom:-12,near:1,far:50});scene.add(sun,sun.target);
const world=new T.Group();scene.add(world);let tgt=world;
function grp(fn){const g=new T.Group();world.add(g);const o=tgt;tgt=g;fn();tgt=o;return g}
const mats={},RY={unit:PI,autoclave:-PI/2,xray:PI,bench:-PI/2};
function mat(c,o){const k=c+'/'+(o||1);if(!mats[k])mats[k]=new T.MeshLambertMaterial({color:c,transparent:!!o&&o<1,opacity:o||1,depthWrite:!(o&&o<1)});return mats[k]}
function bx(w,h,d,c,x,y,z,o){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c,o));m.position.set(x,y+h/2,z);m.castShadow=!(o&&o<1);m.receiveShadow=true;tgt.add(m);return m}
function cy(r,h,c,x,y,z,o){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,18),mat(c,o));m.position.set(x,y+h/2,z);m.castShadow=!(o&&o<1);m.receiveShadow=true;tgt.add(m);return m}
const C={wall:0xe2ecec,base:0x082a64,floor:0xbfd0d2,floor2:0xcbd9da,steel:0xb9c6ca,white:0xf5f8f8,dark:0x2a383e,teal:0x1557d6,red:0xd8463d,black:0x1f2629,yellow:0xe9c22e,wood:0xcfae82,blue:0x3f80d2,green:0x3fae6a,glass:0x9fe6ff,amber:0xff671f,lead:0x8894a0};

/* suelo y cuadrícula */
const ground=new T.Mesh(new T.PlaneGeometry(160,160),new T.MeshBasicMaterial({color:0x010918}));ground.rotation.x=-PI/2;ground.position.y=-0.02;scene.add(ground);
const grid=new T.GridHelper(120,120,0x1557d6,0x0b3a8a);grid.position.set(9,0,6);scene.add(grid);
function floor(x0,z0,x1,z1,c,y,o){const m=new T.Mesh(new T.PlaneGeometry(x1-x0,z1-z0),mat(c,o));m.rotation.x=-PI/2;m.position.set((x0+x1)/2,y||0.005,(z0+z1)/2);m.receiveShadow=true;world.add(m);return m}
{const ft=new T.TextureLoader().load('floor.jpg');ft.wrapS=ft.wrapT=T.RepeatWrapping;ft.repeat.set(9,5.9);ft.encoding=T.sRGBEncoding;ft.anisotropy=8;const m=new T.Mesh(new T.PlaneGeometry(18,11.8),new T.MeshLambertMaterial({map:ft,color:0xf2f7f7}));m.rotation.x=-PI/2;m.position.set(9,0.005,5.9);m.receiveShadow=true;world.add(m)}
/* muros */
const COLL=[],WT=0.15,WH=2.7;
function wall(ax,c,a,b,gaps){gaps=(gaps||[]).slice().sort((p,q)=>p[0]-q[0]);let s=a;const segs=[];
  gaps.forEach(g=>{if(g[0]>s)segs.push([s,g[0]]);const m=(g[0]+g[1])/2,l=g[1]-g[0];if(!g[2]){ax==='h'?bx(l,WH-2.1,WT,C.wall,m,2.1,c):bx(WT,WH-2.1,l,C.wall,c,2.1,m)}s=g[1]});
  if(s<b)segs.push([s,b]);
  segs.forEach(g=>{const m=(g[0]+g[1])/2,l=g[1]-g[0];
    if(ax==='h'){bx(l,WH,WT,C.wall,m,0,c);bx(l,0.1,WT+0.06,C.base,m,0,c);COLL.push([g[0],c-WT/2,g[1],c+WT/2])}
    else{bx(WT,WH,l,C.wall,c,0,m);bx(WT+0.06,0.1,l,C.base,c,0,m);COLL.push([c-WT/2,g[0],c+WT/2,g[1]])}})}
wall('h',0,0,18);wall('h',11.8,0,18,[[2.2,3.8]]);wall('v',0,0,11.8);wall('v',18,0,11.8);
wall('h',4.4,0,18,[[1.6,2.6],[4.9,5.9],[7.9,8.9],[11,12],[13,13.9],[14.5,15.5],[16.4,17.4]]);
[4.2,6.6,10.2,12.8,14.2,15.8].forEach(x=>wall('v',x,0,4.4));
wall('h',6.8,6,18,[[7,8],[10,11],[12.5,13.4],[14.5,15.4],[16.4,17.5]]);
wall('v',6,6.8,11.8,[[8.2,10.6,1]]);[9,12,14,16].forEach(x=>wall('v',x,6.8,11.8));
/* texto sobre lienzo */
function txtTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new T.CanvasTexture(c);t.anisotropy=4;t.encoding=T.sRGBEncoding;t.minFilter=T.LinearFilter;t._c=c;t._g=g;return t}
function decal() {}
function sign() {}
/* señales (imágenes del usuario) */
const SG={"emerg": 1.412, "hoja": 0.708, "derechos": 1.414, "almfinal": 1.414, "bio": 0.854, "com": 1.047, "esp": 0.719, "rutader": 1.778, "rutaizq": 1.778, "libro": 0.708, "cartera": 0.708, "crono": 0.708, "sabes": 0.708, "flujo": 1.412, "roja": 2.0, "limpieza": 1.414, "verde": 2.0, "azul": 2.0, "manos": 0.708, "logo": 4.028},texL=new T.TextureLoader(),texC={};
function stex(){return txtTex(2,2,(g)=>{g.fillStyle='#ffffff';g.fillRect(0,0,2,2)})}
/* ry: 0 mira al sur, PI al norte, PI/2 al este, -PI/2 al oeste */
function poster() {}
/* zócalo de mayólica y rejillas */
const tileT=txtTex(128,128,(g,W,H)=>{g.fillStyle='#f4f7f6';g.fillRect(0,0,W,H);g.strokeStyle='#aebdc1';g.lineWidth=3;g.strokeRect(0,0,W,H)});tileT.wrapS=tileT.wrapT=T.RepeatWrapping;
function zp(len,h,cx,cz,ry){if(len<0.05)return;const hh=h-0.1,t=tileT.clone();t.needsUpdate=true;t.repeat.set(Math.max(1,Math.round(len/0.3)),Math.round(hh/0.35));
  const m=new T.Mesh(new T.PlaneGeometry(len,hh),new T.MeshLambertMaterial({map:t}));m.position.set(cx,0.1+hh/2,cz);m.rotation.y=ry;m.receiveShadow=true;world.add(m);
  const tr=new T.Mesh(new T.PlaneGeometry(len,0.04),mat(0x6f9aa3));tr.position.set(cx+Math.sin(ry)*0.003,h,cz+Math.cos(ry)*0.003);tr.rotation.y=ry;world.add(tr)}
function zocalo(r,h,side,a,b){const o=0.08,x0=r[0]+o,z0=r[1]+o,x1=r[2]-o,z1=r[3]-o,hz=(z0+z1)/2,H=(z,ry,s,e)=>zp(e-s,h,(s+e)/2,z,ry);
  if(side==='n'){H(z0,0,x0,a);H(z0,0,b,x1)}else H(z0,0,x0,x1);
  if(side==='s'){H(z1,PI,x0,a);H(z1,PI,b,x1)}else H(z1,PI,x0,x1);
  zp(z1-z0,h,x0,hz,PI/2);zp(z1-z0,h,x1,hz,-PI/2)}
const rejT=txtTex(128,128,(g,W,H)=>{g.fillStyle='#8d999e';g.fillRect(0,0,W,H);g.fillStyle='#161c1f';for(let i=14;i<W-12;i+=16)g.fillRect(i,12,8,H-24);g.strokeStyle='#e3eaec';g.lineWidth=7;g.strokeRect(3,3,W-6,H-6)});
function sumidero(x,z,s){s=s||0.24;const m=new T.Mesh(new T.PlaneGeometry(s,s),new T.MeshBasicMaterial({map:rejT}));m.rotation.x=-PI/2;m.position.set(x,0.024,z);world.add(m)}
const arrT=txtTex(256,128,(g)=>{g.fillStyle='#1d4ed8';g.beginPath();g.moveTo(20,44);g.lineTo(150,44);g.lineTo(150,14);g.lineTo(240,64);g.lineTo(150,114);g.lineTo(150,84);g.lineTo(20,84);g.closePath();g.fill()});
function arrow() {}
/* mobiliario */
const TK={};TK[C.red]='bio';TK[C.black]='com';TK[C.yellow]='esp';
function tacho(x,z,c,ry){cy(0.17,0.5,c,x,0,z);cy(0.18,0.04,c===C.black?C.dark:c,x,0.5,z);const k=TK[c];if(!k)return;const a=ry||0;
  poster(k,0.2,x+Math.sin(a)*0.176,0.28,z+Math.cos(a)*0.176,a,0);
  const t=new T.Mesh(new T.PlaneGeometry(0.22,0.22/SG[k]),new T.MeshBasicMaterial({map:stex(k)}));t.rotation.x=-PI/2;t.rotation.z=a;t.position.set(x,0.546,z);world.add(t)}
const grifo=(x,y,z)=>{cy(0.016,0.26,C.steel,x,y,z);bx(0.03,0.03,0.17,C.steel,x,y+0.25,z+0.07)};
const poza=(x,y,z,w,d)=>{bx(w,0.012,d,C.steel,x,y,z);bx(w-0.05,0.014,d-0.05,0x4c5b61,x,y+0.002,z)};
function cano(x,y,z,nx,nz){bx(0.05,0.05,0.05,C.steel,x+nx*0.03,y,z+nz*0.03);bx(nx?0.13:0.03,0.03,nz?0.13:0.03,C.steel,x+nx*0.09,y+0.01,z+nz*0.09);const s=new T.Mesh(new T.SphereGeometry(0.03,8,8),mat(C.blue));s.position.set(x+nx*0.04,y+0.09,z+nz*0.04);world.add(s)}
/* cartilla de higiene de manos con jabón y papel toalla a los lados */
function manos(x,y,z,ry){ry=ry||0;poster('manos',0.3,x,y,z,ry);const rx=Math.cos(ry),rz=-Math.sin(ry),nx=Math.sin(ry)*0.04,nz=Math.cos(ry)*0.04;
  bx(rx?0.11:0.09,0.2,rx?0.09:0.11,C.white,x+rx*0.3+nx,y-0.12,z+rz*0.3+nz);bx(rx?0.26:0.1,0.3,rx?0.1:0.26,C.steel,x-rx*0.36+nx,y-0.17,z-rz*0.36+nz)}
const sink=(x,z)=>{bx(0.42,0.14,0.5,C.white,x,0.76,z);bx(0.12,0.76,0.12,C.white,x,0,z);bx(0.3,0.012,0.36,0x9aa8ad,x,0.9,z);cy(0.014,0.16,C.steel,x-0.16,0.9,z)};
const toilet=(x,z,dz)=>{bx(0.38,0.4,0.52,C.white,x,0,z);bx(0.42,0.38,0.18,C.white,x,0.38,z+dz*0.3)};
const chair=(x,z,c,dz)=>{bx(0.45,0.06,0.45,c,x,0.42,z);bx(0.45,0.45,0.05,c,x,0.48,z+(dz||0.2)*1);bx(0.04,0.42,0.04,C.steel,x,0,z)};
const desk=(x,z,w,d)=>{bx(w,0.05,d,C.wood,x,0.72,z);bx(0.05,0.72,d,C.wood,x-w/2+0.03,0,z);bx(0.05,0.72,d,C.wood,x+w/2-0.03,0,z)};
const pc=(x,z)=>{bx(0.5,0.32,0.04,C.dark,x,0.9,z);bx(0.06,0.14,0.06,C.dark,x,0.77,z);bx(0.4,0.02,0.14,C.dark,x,0.77,z+0.22)};
const shelf=(x,z,w,d,h,c)=>{bx(w,h,d,c,x,0,z,0.35);for(let y=0.1;y<h;y+=0.42)bx(w,0.03,d,c,x,y,z)};
const person=(x,z,c)=>{cy(0.2,1.25,c,x,0,z,0.45);const s=new T.Mesh(new T.SphereGeometry(0.17,16,12),mat(c,0.6));s.position.set(x,1.5,z);world.add(s)};
const CAB=0xd3dadc,CNT=0xcdd5d7;
const marco=(x,y,z,ry)=>{const m=bx(0.22,0.3,0.02,C.white,x,y,z);m.rotation.y=ry||0;return m};
// Consultorio
const FB={};FB.unit=grp(()=>{bx(0.6,0.4,1.0,C.steel,2.7,0,2.0);bx(0.6,0.12,1.1,C.teal,2.7,0.45,2.1);
{const b=bx(0.56,0.1,0.95,C.teal,2.7,0.78,1.25);b.rotation.x=0.5;bx(0.26,0.08,0.22,C.teal,2.7,1.05,0.78)}
cy(0.03,1.9,C.steel,3.3,0,1.3);bx(0.65,0.04,0.04,C.steel,3.0,1.86,1.3);bx(0.3,0.08,0.2,C.white,2.7,1.78,1.3);
bx(0.42,0.04,0.3,C.steel,2.15,0.85,1.6);cy(0.02,0.85,C.steel,2.15,0,1.6);cy(0.12,0.1,C.white,3.2,0.8,2.0);cy(0.03,0.8,C.steel,3.2,0,2.0);
});
cy(0.18,0.08,C.dark,1.9,0.45,2.6);cy(0.03,0.45,C.steel,1.9,0,2.6);
zp(2.1,1.5,1.13,0.08,0);bx(1.8,0.86,0.56,CNT,1.1,0,0.38);bx(1.84,0.04,0.6,C.white,1.1,0.86,0.38);poza(0.7,0.9,0.42,0.46,0.36);grifo(0.7,0.9,0.2);bx(0.5,0.012,0.36,C.steel,1.25,0.9,0.42);
bx(1.8,0.55,0.32,CAB,1.1,1.85,0.25);manos(1.45,1.42,0.1,0);
bx(0.9,0.02,0.5,C.steel,3.6,0.82,2.2);cy(0.02,0.82,C.steel,3.6,0,2.2);
shelf(3.95,3.2,0.4,1.0,1.8,C.steel);shelf(0.3,2.5,0.4,1.0,1.4,C.white);bx(0.45,0.7,0.45,C.white,0.33,0,1.6);
desk(0.9,3.5,1.2,0.6);pc(0.9,3.4);chair(0.9,4.0,C.blue,0.2);chair(1.5,3.0,C.blue,-0.2);chair(0.5,3.0,C.blue,-0.2);bx(0.3,0.06,0.3,C.steel,0.4,0,3.95);
tacho(3.0,3.95,C.red,PI);tacho(3.4,3.95,C.black,PI);tacho(3.8,3.95,C.yellow,PI);bx(0.18,0.25,0.18,C.yellow,3.95,0.9,2.3);
poster('bio',0.2,3.0,1.1,4.31,PI);poster('com',0.22,3.4,1.1,4.31,PI);poster('esp',0.18,3.8,1.1,4.31,PI);poster('rutader',0.6,3.35,1.75,4.31,PI);
bx(1.4,1.5,0.04,C.glass,1.75,0,2.75,0.25);bx(0.5,0.06,0.04,C.steel,3.9,1.6,4.3);
bx(1.6,0.7,0.06,C.glass,2.9,1.75,0.06,0.5);bx(0.04,0.4,0.5,C.white,4.1,1.3,1.6);bx(0.3,0.24,0.14,C.white,3.5,1.4,0.15);
decal('ENTREVISTA',1.6,0.95,3.2);decal('EXAMEN',1.6,2.7,2.95);arrow(2.55,3.6,PI);
bx(0.7,0.9,0.6,C.dark,-0.55,0,2.0);sign('COMPRESORA AISLADA',1.2,-0.55,1.2,2.31,0,'#082a64','#ff671f');
// Radiología
FB.xray=grp(()=>{bx(0.25,0.3,0.2,C.white,5.6,1.5,0.25);bx(0.9,0.05,0.05,C.steel,5.2,1.6,0.3);bx(0.16,0.16,0.3,C.dark,4.8,1.45,0.5)});
chair(5.0,1.0,C.teal,-0.2);bx(0.5,0.75,0.06,C.lead,6.45,0.9,2.2).rotation.y=PI/2;[3.1,3.4,3.7].forEach(z=>marco(6.5,1.4,z,PI/2));
sign('☢ RADIACIÓN',0.9,5.4,2.35,4.49,0,'#e9c22e','#1f2629');
bx(2.4,2.7,0.03,C.lead,5.4,0,0.09,0.5);
// Esterilización: mesón continuo roja → azul → verde
const EST=[6.6,0,10.2,4.4];zocalo(EST,1.5,'s',7.9,8.9);
floor(6.68,0.08,7.8,4.32,C.red,0.012,0.4);floor(7.8,0.08,9.0,4.32,C.blue,0.012,0.4);floor(9.0,0.08,10.12,4.32,C.green,0.012,0.4);
decal('ROJA · contaminada',1.1,7.24,3.0,'#5a0f0b',0,44);decal('AZUL · limpia',1.1,8.4,3.0,'#0c2f63',0,44);decal('VERDE · estéril',1.1,9.56,3.0,'#0c4a26',0,44);decal('→ → → flujo unidireccional → → →',3.2,8.4,2.2,'#082a64',0,34);
bx(3.3,0.86,0.58,CNT,8.4,0,0.4);bx(3.34,0.04,0.62,C.white,8.4,0.86,0.4);bx(3.3,0.55,0.32,CAB,8.4,1.9,0.25);
bx(0.26,0.1,0.24,C.red,6.92,0.9,0.42);poza(7.2,0.9,0.42,0.36,0.36);poza(7.6,0.9,0.42,0.36,0.36);grifo(7.4,0.9,0.2);
bx(0.3,0.1,0.2,C.white,8.2,0.9,0.4);bx(0.2,0.02,0.14,0x9fd0ff,8.65,0.9,0.44);bx(0.2,0.02,0.14,0x9fd0ff,8.7,0.92,0.4);
FB.autoclave=grp(()=>{bx(0.5,0.42,0.5,C.white,9.45,0.9,0.42)});
poster('roja',0.5,7.3,1.42,0.1,0);poster('azul',0.5,8.4,1.42,0.1,0);poster('verde',0.5,9.55,1.42,0.1,0);manos(6.69,1.42,1.15,PI/2);
shelf(9.92,2.4,0.36,1.1,1.8,C.steel);chair(8.4,1.1,C.dark,0.2);bx(0.02,0.32,0.24,C.wood,10.11,1.35,1.4);
tacho(6.9,4.05,C.red,PI);tacho(7.25,4.05,C.black,PI);tacho(7.6,4.05,C.yellow,PI);
poster('bio',0.2,6.9,1.1,4.3,PI);poster('com',0.22,7.25,1.1,4.3,PI);poster('esp',0.18,7.6,1.1,4.3,PI);poster('rutaizq',0.6,7.25,1.75,4.3,PI);arrow(7.75,3.55,0);
// Laboratorio
zp(2.45,1.5,11.5,0.08,0);bx(2.2,0.86,0.58,CNT,11.5,0,0.4);bx(2.24,0.04,0.62,C.white,11.5,0.86,0.4);poza(12.2,0.9,0.42,0.42,0.36);grifo(12.2,0.9,0.2);bx(0.3,0.25,0.25,C.white,10.8,0.9,0.4);
bx(0.4,0.4,0.06,C.steel,10.9,2.0,0.1);manos(11.5,1.42,0.1,0);chair(11.4,1.1,C.dark,0.2);marco(12.71,1.4,1.2,PI/2);
// SSHH personal
zocalo([12.8,0,14.2,4.4],1.5,'s',13,13.9);toilet(13.5,0.5,-1);sink(13.12,2.3);manos(12.9,1.45,2.3,PI/2);tacho(13.9,2.6,C.red,-PI/2);arrow(13.45,4.55,-PI/2);bx(0.5,0.35,0.06,C.glass,13.5,2.05,0.1,0.5);sumidero(13.6,1.5,0.18);
// Limpieza: poza a nivel de piso + lavadero alto, cada uno con su caño
zocalo([14.2,0,15.8,4.4],1.5,'s',14.5,15.5);
bx(0.7,0.22,0.6,C.white,14.72,0,0.42);bx(0.58,0.02,0.48,0x4c5b61,14.72,0.205,0.42);cano(14.72,0.6,0.09,0,1);
bx(0.62,0.3,0.5,0xe9eded,15.38,0.6,0.36);bx(0.1,0.6,0.1,0xe9eded,15.38,0,0.3);poza(15.38,0.9,0.36,0.52,0.4);cano(15.38,1.12,0.09,0,1);
sumidero(15.0,1.35,0.26);bx(0.5,0.35,0.06,C.glass,15.0,2.1,0.1,0.5);
bx(0.34,1.1,0.9,C.wood,15.55,0.9,2.3);sign('INSUMOS DE LIMPIEZA',0.8,15.375,1.75,2.3,-PI/2,'#082a64','#7fe39a');
bx(0.04,0.06,0.9,C.steel,14.31,1.6,2.0);[1.7,2.0,2.3].forEach((z,i)=>{cy(0.015,1.5,C.wood,14.34,0.05,z);bx(0.06,0.1,0.22,[C.green,C.blue,C.red][i],14.36,0.05,z)});cy(0.16,0.3,C.blue,14.55,0,2.9);
poster('limpieza',0.62,15.0,2.4,4.49,0);
// Residuos sólidos: almacenamiento final
zocalo([15.8,0,18,4.4],1.5,'s',16.4,17.4);
[[C.red,16.3,'bio'],[C.black,16.95,'com'],[C.yellow,17.6,'esp']].forEach(a=>{bx(0.5,0.8,0.6,a[0],a[1],0.02,0.5);bx(0.54,0.06,0.64,a[0]===C.black?C.dark:a[0],a[1],0.82,0.5);
  poster(a[2],0.3,a[1],0.48,0.812,0,0);poster(a[2],0.32,a[1],1.32,0.1,0);
  const t=new T.Mesh(new T.PlaneGeometry(0.3,0.3/SG[a[2]]),new T.MeshBasicMaterial({map:stex(a[2])}));t.rotation.x=-PI/2;t.position.set(a[1],0.885,0.5);world.add(t)});
sumidero(16.9,1.4,0.28);decal('pendiente 2 % hacia el sumidero',1.5,16.9,1.85,'#082a64',0,30);
cano(15.89,0.55,2.1,1,0);bx(0.5,0.12,0.6,C.white,16.15,0,2.1);bx(0.4,0.02,0.5,0x4c5b61,16.15,0.105,2.1);sign('PUNTO DE AGUA',0.5,15.89,0.95,2.1,PI/2,'#082a64','#12cfe3');
bx(0.55,0.07,0.55,C.steel,17.55,0,2.5);bx(0.05,0.9,0.05,C.steel,17.78,0,2.5);bx(0.16,0.12,0.04,C.dark,17.78,0.9,2.5);
bx(0.5,0.65,0.7,0x4a6a8a,16.22,0.14,3.3);bx(0.54,0.05,0.74,C.dark,16.22,0.79,3.3);[[16.05,3.05],[16.4,3.05],[16.05,3.55],[16.4,3.55]].forEach(p=>cy(0.07,0.06,C.black,p[0],0,p[1]));
bx(0.7,0.4,0.05,0x76858b,16.9,2.05,0.1,0.75);
poster('almfinal',0.72,16.9,2.4,4.49,0);
// Sala de espera: señalética obligatoria en muros
const BENCH=[[1.3,7.45],[1.3,9.0],[4.4,7.45]];FB.bench=grp(()=>BENCH.forEach(p=>{for(let i=-1;i<=1;i++)chair(p[0]+i*0.5,p[1],C.steel,-0.2);bx(1.5,0.04,0.04,C.dark,p[0],0.2,p[1])}));
bx(1.1,0.62,0.05,C.dark,0.12,1.5,7.75).rotation.y=PI/2;
tacho(5.6,7.3,C.black,0);
bx(0.5,0.5,0.06,C.dark,5.3,0.35,10.6);bx(0.5,0.06,0.5,C.dark,5.3,0.48,10.35);cy(0.28,0.04,C.steel,5.0,0.02,10.35).rotation.z=PI/2;cy(0.28,0.04,C.steel,5.6,0.02,10.35).rotation.z=PI/2;
poster('derechos',1.05,0.09,1.6,9.15,PI/2);poster('flujo',0.86,0.09,1.6,10.3,PI/2);poster('sabes',0.5,0.09,1.6,11.2,PI/2);
poster('emerg',0.86,0.62,1.6,11.71,PI);sign('MAPA DE REFERENCIA',0.72,1.62,1.6,11.71,PI,'#ffffff','#082a64');
poster('cartera',0.5,4.2,1.6,11.71,PI);poster('crono',0.5,4.8,1.6,11.71,PI);poster('libro',0.5,5.4,1.6,11.71,PI);
bx(0.4,0.03,0.25,C.wood,5.4,1.0,11.58);bx(0.3,0.04,0.21,C.blue,5.4,1.03,11.58);bx(0.24,0.3,0.16,C.blue,5.82,0.85,11.62);sign('BUZÓN',0.26,5.82,1.24,11.71,PI,'#3f80d2','#ffffff');
bx(0.04,2.1,0.8,C.glass,2.2,0,12.2,0.3);bx(0.05,0.1,0.8,C.amber,2.2,1.0,12.2);bx(0.04,2.1,0.8,C.glass,3.8,0,12.2,0.3);bx(0.05,0.1,0.8,C.amber,3.8,1.0,12.2);
bx(0.04,0.4,2.6,C.glass,0.03,2.15,9.6,0.5);
poster('logo',3.3,3,3.2,11.9,0);poster('logo',3.3,3,3.2,11.86,PI);
// Admisión
bx(0.5,1.05,2.4,C.white,6,0,9.4);bx(0.6,0.04,2.4,C.wood,6,1.05,9.4);COLL.push([5.75,8.2,6.25,10.6]);
bx(0.02,0.7,2.2,0x1557d6,5.74,0.2,9.4);poster('logo',1.8,5.72,0.6,9.4,-PI/2);pc(6.55,9.2);chair(7.0,9.4,C.dark,0.2);tacho(6.4,10.3,C.black,PI/2);bx(0.9,0.7,0.06,C.glass,8.9,1.1,9.6,0.5).rotation.y=PI/2;cy(0.05,0.18,C.white,6.9,1.15,6.92);
// Archivo y documentación
shelf(9.4,9.6,0.4,2.6,2.2,C.steel);shelf(11.6,8.6,0.4,2.2,2.2,C.steel);bx(0.03,0.16,0.12,C.white,11.9,1.75,9.9);
bx(1.8,1.6,0.35,C.steel,10.5,0,11.5,0.35);for(let y=0.15;y<1.5;y+=0.45)for(let i=0;i<8;i++)bx(0.16,0.34,0.26,[C.blue,C.green,C.red,C.yellow][i%4],9.76+i*0.21,y,11.5);
// SSHH públicos
[[12,'HOMBRES'],[14,'MUJERES'],[16,'ACCESIBLE']].forEach(a=>{const x0=a[0],x=x0+1;zocalo([x0,6.8,x0+2,11.8],1.8,'n',a[1]==='ACCESIBLE'?16.4:x0+0.5,a[1]==='ACCESIBLE'?17.5:x0+1.4);
  toilet(x,11.2,1);sink(x0+0.33,8.3);manos(x0+0.1,1.5,8.3,PI/2);tacho(x+0.6,10.9,C.red,PI);arrow(x0+0.95,6.62,PI/2);sumidero(x,9.6,0.18);bx(0.5,0.35,0.06,C.glass,x,2.15,11.7,0.5);
  sign(a[1],0.8,x-0.05,2.35,6.71,PI,'#082a64','#ff8fb8')});
bx(0.3,0.5,0.25,C.white,13.72,0.5,9.6);bx(0.05,0.05,0.8,C.steel,17.5,0.85,11.2);bx(0.05,0.05,0.8,C.steel,16.5,0.85,11.2);
// Corredor: ruta de transporte de residuos hacia el almacenamiento final
cy(0.07,0.42,C.red,13.7,0.9,6.68);sign('EXTINTOR',0.5,13.7,1.7,6.71,PI,'#d8463d','#ffffff');
sign('SALIDA',0.7,6.0,2.4,6.2,-PI/2,'#2f9e5c','#ffffff');bx(0.3,0.12,0.08,C.white,9.3,2.35,6.7);
bx(0.08,0.9,0.6,C.steel,17.9,1.0,5.0);sign('⚡ TABLERO',0.6,17.84,2.1,5.0,-PI/2,'#e9c22e','#1f2629');
person(0.7,5.15,0x12cfe3);person(0.7,6.05,0xb8a2ff);
decal('◂ 2.40 m ancho mínimo ▸',2.4,5.2,5.9,'#082a64',PI/2,40);
[3.7,9.9,12.5,15.95].forEach(x=>poster('rutader',0.62,x,1.75,4.49,0));[9.0,11.75].forEach(x=>poster('rutaizq',0.62,x,1.75,6.71,PI));poster('rutaizq',0.56,14.15,2.1,6.71,PI);
arrow(2.1,4.55,-PI/2);arrow(8.4,4.55,-PI/2);for(let x=3.0;x<16.5;x+=1.5)arrow(x,5.05,0);arrow(16.9,4.85,PI/2);
/* modelos 3D generados con Magnific; si no cargan, quedan los volúmenes simples */
function model(file,size,places,fb){if(!T.GLTFLoader)return;new T.GLTFLoader().load(file,g=>{const o=g.scene,b=new T.Box3().setFromObject(o),sz=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3()),k=size/Math.max(sz.x,sz.y,sz.z);
  o.position.set(-c.x,-b.min.y,-c.z);o.traverse(n=>{if(n.isMesh){n.castShadow=n.receiveShadow=true;if(n.material){n.material.metalness=Math.min(n.material.metalness,0.15);n.material.metalnessMap=null;n.material.needsUpdate=true}}});
  places.forEach((p,i)=>{const w=new T.Group();w.add(i?o.clone():o);w.scale.setScalar(k);w.position.set(p[0],p[1],p[2]);w.rotation.y=p[3]||0;world.add(w)});if(fb)fb.visible=false},undefined,()=>{})}
COLL.push([2.3,0.85,3.25,2.7]);BENCH.forEach(p=>COLL.push([p[0]-0.8,p[1]-0.3,p[0]+0.8,p[1]+0.3]));
model('unit.json',2.0,[[2.7,0,1.75,RY.unit]],FB.unit);model('autoclave.json',0.6,[[9.45,0.9,0.42,RY.autoclave]],FB.autoclave);model('xray.json',1.35,[[5.3,0.95,0.8,RY.xray]],FB.xray);model('bench.json',1.65,BENCH.map(p=>[p[0],0,p[1],RY.bench]),FB.bench);

/* Aerial showcase only: no walk mode, labels, assessment data or room selection. */
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let angle=.45,elevation=.62,drag=null,playing=!motion.matches,visible=true,previous=0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function resize(){const w=cv.clientWidth,h=cv.clientHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
new ResizeObserver(resize).observe(cv);resize();
function updateCamera(){const radius=Math.max(22,18/cam.aspect);cam.position.set(9+radius*Math.sin(elevation)*Math.sin(angle),radius*Math.cos(elevation),5.9+radius*Math.sin(elevation)*Math.cos(angle));cam.lookAt(9,0,5.9)}
function syncPlay(){$('play').textContent=playing?'Pausar giro':'Girar vista';$('play').setAttribute('aria-pressed',String(playing))}
$('play').onclick=()=>{playing=!playing;syncPlay()};
$('reset').onclick=()=>{angle=.45;elevation=.62};
cv.addEventListener('pointerdown',e=>{if(e.button!==0)return;cv.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};playing=false;syncPlay()});
cv.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;angle-=(e.clientX-drag.x)*.006;elevation=clamp(elevation-(e.clientY-drag.y)*.004,.15,.8);drag.x=e.clientX;drag.y=e.clientY});
['pointerup','pointercancel','lostpointercapture'].forEach(name=>cv.addEventListener(name,()=>{drag=null}));
cv.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();playing=false;syncPlay();if(e.key==='ArrowLeft')angle-=.12;if(e.key==='ArrowRight')angle+=.12;if(e.key==='ArrowUp')elevation-=.05;if(e.key==='ArrowDown')elevation+=.05;elevation=clamp(elevation,.15,.8)});
motion.addEventListener('change',()=>{if(motion.matches){playing=false;syncPlay()}});
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting}).observe(cv);
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();$('nogl').hidden=false});
syncPlay();
renderer.setAnimationLoop(now=>{const dt=Math.min(.05,(now-(previous||now))/1000);previous=now;if(document.hidden||!visible)return;if(playing&&!drag)angle+=dt*.09;updateCamera();renderer.render(scene,cam)});
})();


