/* Shared helpers for the Playground and Tutorials pages: a tiny pretend robot that runs your blocks and records what happened. */
(function(){
const Lab={};
/* Run the blocks in ws on a pretend robot. o.tof = number | array (readings in order) | function(t,i) ; o.button = function(t)->bool */
Lab.run=function(ws,o){
  o=o||{};const gen=UGOT.gen(ws,'js');
  const res={out:[],vars:{},actions:[],err:null,t:0,hats:gen.hats,code:gen.code};
  if(!gen.hats){res.err='Add a "when ▶ run is clicked" block to start your program.';return res}
  let t=0,i=0,odo=0;const tv=o.tof===undefined?500:o.tof;
  const act=(n,txt,a)=>{res.actions.push({t:+t.toFixed(2),n,a:a||[]});res.out.push('['+t.toFixed(1)+' s] '+txt);res.hasAct=true};
  const clamp=v=>Math.max(0,Math.min(2000,v));
  const API={
    tof_read_mm(){t+=.05;const k=i++;let v=Array.isArray(tv)?tv[Math.min(k,tv.length-1)]:(typeof tv==='function'?tv(t,k):tv);return v<40?0:Math.round(clamp(v))},
    median(n){n=Math.max(1,Math.round(Number(n)||5));const v=[];for(let k=0;k<n;k++)v.push(API.tof_read_mm());v.sort((a,b)=>a-b);return v[n>>1]},
    print(x){res.out.push(String(x));res.prints=(res.prints||0)+1},
    sleep(s){t+=Number(s)||0;if(t>300)throw new Error('SIM_TIME: The program ran for more than 300 s of robot time. Check your wait blocks.')},
    now:()=>+t.toFixed(2),
    button_pressed:()=>!!(o.button&&o.button(t)),
    odometer_mm:()=>odo,
    gripper_set(p,s){act('claw','claw to '+p+'% at speed '+s+'%',[p,s])},
    arm_set(a){t+=.5;act('arm','arm to '+a+'°',[a])},
    drive(s,d){act('drive','drive '+(d>0?'forward':'backward')+' at speed '+s+'%',[s,d])},
    stop(){act('stop','stop',[])},
    move_mm(mm,s){odo+=mm;t+=Math.abs(mm)/Math.max(5,s*4);act('move','move '+mm+' mm at speed '+s+'%',[mm,s])},
    turn(deg,d){t+=Math.abs(deg)/90;act('turn','turn '+(d>0?'right':'left')+' '+deg+'°',[deg,d])}
  };
  window.__loops=200000;
  try{
    const m=/^var ([^;]+);/m.exec(gen.code),names=m?m[1].split(',').map(s=>s.trim()):[];
    res.vars=new Function('API',gen.code+'\nreturn {'+names.map(n=>JSON.stringify(n)+':'+n).join(',')+'}')(API)||{};
  }catch(e){res.err=friendly(e)}
  res.t=+t.toFixed(2);return res;
};
function friendly(e){const m=String(e&&e.message||e);
  if(m.includes('SIM_LOOP'))return 'A loop repeated too many times without waiting. Put a sensor or wait block inside it.';
  if(m.includes('SIM_TIME'))return m.replace('SIM_TIME: ','');
  return m}
Lab.friendly=friendly;
Lab.fresh=x=>x;
/* Blockly helpers */
Lab.inject=function(el,opts){
  opts=opts||{};
  const ws=Blockly.inject(el,{toolbox:opts.toolbox||UGOT.toolbox(),theme:UGOT.theme,renderer:'zelos',media:'blockly/media/',trashcan:true,sounds:false,
    zoom:{controls:true,wheel:true,startScale:opts.scale||.8,minScale:.4,maxScale:1.6},grid:{spacing:24,length:2,colour:'#e3e9f0',snap:true},move:{scrollbars:true,drag:true,wheel:false}});
  window.addEventListener('resize',()=>Blockly.svgResize(ws));
  return ws;
};
Lab.showTopLeft=function(ws){try{ws.cleanUp();const bb=ws.getBlocksBoundingBox(),tb=ws.getToolbox(),tw=tb?tb.getWidth():0;ws.scroll(24+tw-bb.left*ws.scale,24-bb.top*ws.scale)}catch(e){}};
Lab.loadXml=function(ws,xml){ws.clear();Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml),ws);Lab.showTopLeft(ws)};
Lab.py=function(ws){let r;try{r=UGOT.gen(ws,'py')}catch(e){return '# Could not build Python yet: '+e.message}
  const body=(r.code||'').split('\n').filter(l=>!/^\w+ = None$/.test(l)&&!/^# Describe this function/.test(l)).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  return r.hats?body:'# Add a "when ▶ run is clicked" block to see Python here.'};
/* Short builders (same helpers the lesson page uses) */
const X=UGOT.X,B=X.b,N=v=>X.n(v);
Lab.B={
  cmp:(op,a,b)=>B('logic_compare',{f:{OP:op},v:{A:a,B:b}}),
  and:(a,b)=>B('logic_operation',{f:{OP:'AND'},v:{A:a,B:b}}),
  ar:(op,a,b)=>B('math_arithmetic',{f:{OP:op},v:{A:a,B:b}}),
  set:(n,v)=>X.vset(n,v),get:X.vget,num:X.num,txt:X.txt,
  say:t=>B('ugot_print',{v:{TXT:t}}),
  join:(a,b)=>B('text_join',{mut:'<mutation items="2"></mutation>',v:{ADD0:a,ADD1:b}}),
  rep:(n,body)=>B('controls_repeat_ext',{v:{TIMES:N(n)},s:{DO:body}}),
  ifelse:(conds,dos,els)=>B('controls_if',{mut:'<mutation'+(conds.length>1?' elseif="'+(conds.length-1)+'"':'')+(els?' else="1"':'')+'></mutation>',v:Object.fromEntries(conds.map((c,i)=>['IF'+i,c])),s:Object.assign(Object.fromEntries(dos.map((d,i)=>['DO'+i,d])),els?{ELSE:els}:{})}),
  chain:X.chain,call:X.call,tof:()=>B('ugot_tof'),med:n=>B('ugot_tof_median',{v:{N:N(n)}}),
  wait:s=>B('ugot_wait',{v:{SEC:N(s)}}),until:c=>B('ugot_wait_until',{v:{COND:c}}),
  drive:(s,d)=>B('ugot_drive',{f:{DIR:d||'F'},v:{SPD:N(s)}}),stop:()=>B('ugot_stop'),
  move:(mm,s)=>B('ugot_move',{v:{MM:N(mm),SPD:N(s)}}),turn:(d,dir)=>B('ugot_turn',{f:{DIR:dir||'R'},v:{DEG:N(d)}}),
  close:s=>B('ugot_claw_close',{v:{SPD:N(s)}}),open:()=>B('ugot_claw_open'),arm:a=>B('ugot_arm',{v:{ANG:N(a)}}),
  button:()=>B('ugot_button'),timer:()=>B('ugot_timer'),
  prog:(vars,steps,extra)=>'<xml>'+(vars&&vars.length?X.vars(vars):'')+X.hat(steps.length?X.chain(steps):'',20,20).replace('<next></next>','')+(extra||'')+'</xml>'
};
window.Lab=Lab;
})();
