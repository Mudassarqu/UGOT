(function(){
const $=id=>document.getElementById(id);
const id=new URLSearchParams(location.search).get('topic')||'02';
if(id==='04'){location.replace('blocks-04.html');return}
const names={"02":"Climbing","03":"Sound","04":"Rescue","05":"Mecanum","06":"Camera","07":"Line patrol","08":"Plates","09":"Colour sort","10":"Objects","12":"Conveyor","13":"Safe driving","14":"Delivery","15":"Community","lab":"Sandbox"};
$('tsel').innerHTML=Object.keys(names).map(k=>'<a href="'+(k==='04'?'blocks-04.html':'blocks-sim.html?topic='+k)+'"'+(k===id?' class="on"':'')+'>'+(k==='lab'?'🧪 ':'Topic '+k+' · ')+names[k]+'</a>').join('');
/* the Python engine is replaced by a block runner: the simulator physics stays exactly the same */
let callC=null,ws=null,T=null;
const fmt=x=>x===null||x===undefined?'None':x===true?'True':x===false?'False':Array.isArray(x)?'['+x.map(fmt).join(', ')+']':String(x);
function makeApi(){
  const A={},S=()=>UGOT._state().S;
  Object.keys(T.apiMap).forEach(n=>{A[n]=(...a)=>JSON.parse(callC(n,...a.map(x=>x===undefined?null:x)))});
  A.sleep=s=>{callC('sleep',s)};A.now=()=>JSON.parse(callC('time'));
  A.print=x=>S().log(fmt(x));A.__s=fmt;
  A.__in=(a,b)=>Array.isArray(b)?b.includes(a):String(b).includes(String(a));
  const reps=(n,f)=>{const v=[];n=Math.max(1,Math.round(Number(n)||5));for(let i=0;i<n;i++)v.push(f());return v};
  A.__median=(n,f)=>{const v=reps(n,f).sort((a,b)=>a-b),k=v.length;return k%2?v[k>>1]:(v[k/2-1]+v[k/2])/2};
  A.__mostcommon=(n,f)=>{const v=reps(n,f);let best=null,bc=0;v.forEach(x=>{const c=v.filter(y=>y===x).length;if(c>bc){best=x;bc=c}});return best};
  return A;
}
function runBlocks(){
  const g=UGOT.gen(ws,'js');
  if(!g.hats)throw new Error('Add a "when ▶ run is clicked" block to start your program.');
  window.__loops=400000;
  try{new Function('API',g.code)(makeApi())}
  catch(e){const m=String(e&&e.message||e);
    if(m.includes('SIM_LOOP'))throw new Error('A loop repeated too many times without waiting. Put a sensor, wait or move block inside it.');
    throw e}
}
const FAKE={registerJsModule(n,m){callC=m.c},globals:{set(){},get(){return runBlocks}},runPython(){},setStdout(){},setStderr(){}};
UGOT.loadPyodideOnce=ok=>{UGOT._py=FAKE;ok(FAKE)};
const KEY='ugot-blocks-sim-'+id;
const showTopLeft=()=>{try{ws.cleanUp();const bb=ws.getBlocksBoundingBox(),tb=ws.getToolbox(),tw=tb?tb.getWidth():0;ws.scroll(24+tw-bb.left*ws.scale,24-bb.top*ws.scale)}catch(e){}};
const loadXml=x=>{ws.clear();Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x),ws);showTopLeft()};
function pyText(){let r;try{r=UGOT.gen(ws,'py')}catch(e){return '# Could not build Python yet: '+e.message}
  const body=(r.code||'').split('\n').filter(l=>!/^\w+ = None$/.test(l)&&!/^# Describe this function/.test(l)).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  return r.hats?body:'# Add a "when ▶ run is clicked" block to see Python here.'}
function updatePy(){const p=pyText();$('pyout').textContent=p;$('code').value=p}
function save(){try{localStorage.setItem(KEY,Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws)))}catch(e){}}
function applyEx(k){const ex=(BLOCK_EXAMPLES[id]||{})[k];if(!ex)return;loadXml(ex.xml);
  if(ex.opts)for(const [o,v] of Object.entries(ex.opts)){const el=$('opt_'+o);if(!el)continue;if(el.type==='checkbox')el.checked=v;else el.value=v}
  updatePy();save();$('resetBtn').click()}
function init(){
  const s=document.createElement('script');s.src='sim/t'+id+'.js';
  s.onerror=()=>{document.querySelector('main').innerHTML='<p style="padding:20px">Unknown simulator.</p>'};
  s.onload=()=>{
    UGOT.mount(id);T=UGOT._state().T;
    $('apiTable').innerHTML=UGOT.apiTable(T);
    const exs=BLOCK_EXAMPLES[id]||{};
    $('example').innerHTML=Object.entries(exs).map(([k,v])=>'<option value="'+k+'">'+v.label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>').join('');
    $('pystatus').textContent='Your blocks save in this browser as you work.';$('runBtn').disabled=false;
    ws=Blockly.inject('blockly',{toolbox:UGOT.apiToolbox(T),theme:UGOT.theme,renderer:'zelos',media:'blockly/media/',trashcan:true,sounds:false,zoom:{controls:true,wheel:true,startScale:.7,minScale:.4,maxScale:1.6},grid:{spacing:24,length:2,colour:'#e3e9f0',snap:true},move:{scrollbars:true,drag:true,wheel:false}});
    let saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}
    const first=Object.keys(exs)[0];
    if(saved){try{loadXml(saved);updatePy();$('pystatus').textContent='Your last blocks were restored.'}catch(e){saved=null}}
    if(!saved&&first){loadXml(exs[first].xml);updatePy();save()}
    if(first&&!saved){const ex=exs[first];if(ex.opts){for(const [o,v] of Object.entries(ex.opts)){const el=$('opt_'+o);if(el){if(el.type==='checkbox')el.checked=v;else el.value=v}}$('resetBtn').click()}}
    $('example').onchange=()=>applyEx($('example').value);
    ws.addChangeListener(e=>{if(e.isUiEvent)return;updatePy();save()});
    window.addEventListener('resize',()=>Blockly.svgResize(ws));
    $('saveBtn').onclick=()=>{const b=new Blob([Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws))],{type:'text/xml'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='topic-'+id+'-blocks.ugotblocks';a.click()};
    $('openBtn').onclick=()=>$('openFile').click();
    $('openFile').onchange=ev=>{const f=ev.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{loadXml(rd.result);updatePy();save();$('pystatus').textContent='Opened '+f.name}catch(e){$('pystatus').textContent='That file could not be opened.'}};rd.readAsText(f);ev.target.value=''};
    $('copyPy').onclick=()=>{const p=pyText();try{navigator.clipboard.writeText(p).then(()=>{$('pyStatus').textContent='Copied.'},()=>{$('pyStatus').textContent='Copy blocked: select the text and copy it.'})}catch(e){$('pyStatus').textContent='Copy blocked: select the text and copy it.'}};
  };
  document.body.appendChild(s);
}
init();
})();
