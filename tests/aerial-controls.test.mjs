import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

// Real Three.js geometry/math; mock GPU and DOM only. Not a visual rendering test.
function setup() {
  const root=new URL('../public/consultorio-aereo/',import.meta.url);
  const events={},elements={};
  const drawing=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  const element=id=>elements[id]??={hidden:true,textContent:'',clientWidth:700,clientHeight:540,
    addEventListener:(name,fn)=>{events[id+':'+name]=fn},setAttribute(){},setPointerCapture(){},focus(){},
    getBoundingClientRect(){return {left:0,top:0,width:700,height:540}}};
  let resize,render,camera;
  const context={console,Math,performance,devicePixelRatio:1,document:{getElementById:element,createElement:()=>({getContext:()=>drawing}),hidden:false},
    matchMedia:()=>({matches:false,addEventListener(){}}),ResizeObserver:class{constructor(fn){resize=fn}observe(){}},IntersectionObserver:class{observe(){}},window:{}};
  vm.createContext(context);
  vm.runInContext(readFileSync(new URL('three.min.js',root),'utf8'),context);
  const T=context.THREE;context.window.THREE=T;
  T.WebGLRenderer=class{shadowMap={};setPixelRatio(){}setSize(){}setAnimationLoop(fn){render=fn}render(s,c){camera=c}};
  T.TextureLoader=class{load(path){assert.ok(existsSync(new URL(path,root)));return new T.Texture()}};
  vm.runInContext(readFileSync(new URL('scene.js',root),'utf8'),context);
  const tick=()=>{render(100);return camera};
  const target=()=>{const c=tick();return c.position.clone().addScaledVector(c.getWorldDirection(new T.Vector3()),-c.position.y/c.getWorldDirection(new T.Vector3()).y)};
  const fire=(name,args={})=>events['c:'+name]({preventDefault(){},pointerType:'mouse',button:0,pointerId:1,clientX:350,clientY:270,...args});
  tick();
  return {element,fire,tick,target,resize:()=>resize()};
}

test('zoom approaches detail while keeping the camera above walls',()=>{
  const v=setup(),initial=v.tick().position.y;
  v.element('zoom-in').onclick();assert.ok(v.tick().position.y<initial);
  for(let i=0;i<80;i++)v.element('zoom-in').onclick();
  assert.ok(v.tick().position.y>=3.4-1e-9);assert.ok(v.tick().position.y<5);
  assert.equal(v.element('zoom-in').disabled,true);
  for(let i=0;i<80;i++)v.element('zoom-out').onclick();
  assert.equal(v.element('zoom-out').disabled,true);
});
test('drag pans the target; orbit and top view never enter rooms',()=>{
  const v=setup(),before=v.target();
  v.fire('pointerdown');v.fire('pointermove',{clientX:420,clientY:300});v.fire('pointerup');
  assert.ok(v.target().distanceTo(before)>1);
  v.element('orbit').onclick();v.fire('pointerdown');v.fire('pointermove',{clientX:450,clientY:900});v.fire('pointerup');
  for(let i=0;i<40;i++)v.element('zoom-in').onclick();
  assert.ok(v.tick().position.y>=3.4-1e-9);
  v.element('top').onclick();assert.ok(v.tick().position.clone().sub(v.target()).normalize().y>.99);
});
test('wheel and pinch zoom; two-finger pan; reset and responsive resize',()=>{
  const v=setup(),initial=v.tick().position.y;
  v.fire('wheel',{deltaY:-120,deltaMode:0});assert.ok(v.tick().position.y<initial);
  v.element('reset').onclick();
  v.fire('pointerdown',{pointerType:'touch',pointerId:1,clientX:200});
  v.fire('pointerdown',{pointerType:'touch',pointerId:2,clientX:400});
  v.fire('pointermove',{pointerType:'touch',pointerId:2,clientX:600});
  assert.ok(v.tick().position.y<initial*.8);
  v.fire('pointercancel',{pointerId:1});v.fire('pointercancel',{pointerId:2});
  const zoomed=v.tick().position.y;
  v.element('c').clientWidth=320;v.resize();assert.equal(v.tick().position.y,zoomed);
  v.element('reset').onclick();assert.ok(Math.abs(v.target().x-9)<1e-6);assert.ok(Math.abs(v.target().z-5.9)<1e-6);
  const before=v.target();v.fire('keydown',{key:'ArrowRight'});assert.ok(v.target().distanceTo(before)>0);
  const height=v.tick().position.y;v.fire('keydown',{key:'+'});assert.ok(v.tick().position.y<height);
});
