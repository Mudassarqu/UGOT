/* UGOT block coding library (Blockly). Shared by every lesson page in this folder.
   Block names, categories and colours follow the uCode editor the students use on the real robot. */
(function(){
const C={events:'#F2B01E',control:'#F29A1F',operators:'#3DB86A',sensing:'#35B5E5',variables:'#F2682A',functions:'#E5546B',motion:'#8E5CD9',sensor:'#2F6FD6',display:'#6C7AE0'};
const J=Blockly.JavaScript,Py=Blockly.Python;
const num=(b,n,d,g,o)=>{const v=g.valueToCode(b,n,o)||d;return v};
function def(type,msg,args,opts){
  const json=Object.assign({type,message0:msg,args0:args||[],colour:opts.colour,inputsInline:true},opts.json||{});
  Blockly.defineBlocksWithJsonArray([json]);
}
const N=(name,v)=>({type:'input_value',name,check:'Number'});
/* ---- Events ---- */
Blockly.Blocks['ugot_when_run']={init(){this.appendDummyInput().appendField('when ▶ run is clicked');this.setNextStatement(true);this.setColour(C.events);this.hat='cap';this.setTooltip('Your program starts here.')}};
/* ---- Control ---- */
def('ugot_wait','wait %1 seconds',[N('SEC')],{colour:C.control,json:{previousStatement:null,nextStatement:null,tooltip:'Pause the program. The robot keeps doing its last command.'}});
def('ugot_wait_until','wait until %1',[{type:'input_value',name:'COND',check:'Boolean'}],{colour:C.control,json:{previousStatement:null,nextStatement:null,tooltip:'Pause until the condition is true.'}});
Blockly.Blocks['ugot_forever']={init(){this.appendDummyInput().appendField('forever');this.appendStatementInput('DO');this.setPreviousStatement(true);this.setColour(C.control);this.setTooltip('Repeat the blocks inside again and again.')}};
/* ---- Sensor (TOF) ---- */
def('ugot_tof','distance (mm) from TOF sensor',[],{colour:C.sensor,json:{output:'Number',tooltip:'Distance to the nearest object ahead. 40 to 2000 mm. Each reading takes 50 ms.'}});
def('ugot_tof_median','median of %1 distance readings (mm)',[N('N')],{colour:C.sensor,json:{output:'Number',tooltip:'Takes several readings and gives the middle one. Ignores noisy readings.'}});
def('ugot_button','RELEASE button pressed?',[],{colour:C.sensor,json:{output:'Boolean',tooltip:'True while the operator holds the RELEASE button.'}});
def('ugot_timer','robot timer (s)',[],{colour:C.sensor,json:{output:'Number',tooltip:'Seconds of robot time since the program started.'}});
def('ugot_odometer','odometer (mm)',[],{colour:C.sensor,json:{output:'Number',tooltip:'Net distance driven along the heading since the start (wheel encoder).'}});
/* ---- Motion: claw and arm ---- */
def('ugot_claw','set claw to %1 % at speed %2 %',[N('POS'),N('SPD')],{colour:C.motion,json:{previousStatement:null,nextStatement:null,tooltip:'0 = open, 100 = closed. The claw starts moving and the program carries on.'}});
def('ugot_claw_open','open claw',[],{colour:C.motion,json:{previousStatement:null,nextStatement:null,tooltip:'Open the claw to 0% at full speed.'}});
def('ugot_claw_close','close claw at speed %1 %',[N('SPD')],{colour:C.motion,json:{previousStatement:null,nextStatement:null,tooltip:'Close the claw to 100%. Slow speeds protect light objects.'}});
def('ugot_arm','set arm angle to %1 °',[N('ANG')],{colour:C.motion,json:{previousStatement:null,nextStatement:null,tooltip:'0 = claw on the table, up to 80 = fully raised. Waits until it arrives.'}});
/* ---- Motion: driving ---- */
def('ugot_drive','drive %1 at speed %2 %',[{type:'field_dropdown',name:'DIR',options:[['forward','F'],['backward','B']]},N('SPD')],{colour:C.motion,json:{previousStatement:null,nextStatement:null,tooltip:'Keep driving until you stop. Only with operator assist off.'}});
def('ugot_stop','stop driving',[],{colour:C.motion,json:{previousStatement:null,nextStatement:null,tooltip:'Stop the wheels.'}});
def('ugot_move','move %1 mm at speed %2 %',[N('MM'),N('SPD')],{colour:C.motion,json:{previousStatement:null,nextStatement:null,tooltip:'Drive an exact distance (negative = backward) and wait.'}});
def('ugot_turn','turn %1 %2 °',[{type:'field_dropdown',name:'DIR',options:[['left','L'],['right','R']]},N('DEG')],{colour:C.motion,json:{previousStatement:null,nextStatement:null,tooltip:'Turn on the spot and wait.'}});
/* ---- Display ---- */
def('ugot_print','show on screen %1',[{type:'input_value',name:'TXT'}],{colour:C.display,json:{previousStatement:null,nextStatement:null,tooltip:'Write a message in the console with the robot time.'}});

/* ---- JavaScript generators (run on the virtual UGOT) ---- */
const jv=(b,n,d,g)=>g.valueToCode(b,n,J.ORDER_NONE)||d;
const jf=J.forBlock;
jf['ugot_when_run']=()=>'';
jf['ugot_wait']=(b,g)=>'API.sleep('+jv(b,'SEC','0',g)+');\n';
jf['ugot_wait_until']=(b,g)=>'while(!('+jv(b,'COND','false',g)+')){API.sleep(0.05);}\n';
jf['ugot_forever']=(b,g)=>'while(true){\n'+g.addLoopTrap(g.statementToCode(b,'DO'),b)+'}\n';
jf['ugot_tof']=()=>['API.tof_read_mm()',J.ORDER_FUNCTION_CALL];
jf['ugot_tof_median']=(b,g)=>['API.median('+jv(b,'N','5',g)+')',J.ORDER_FUNCTION_CALL];
jf['ugot_button']=()=>['API.button_pressed()',J.ORDER_FUNCTION_CALL];
jf['ugot_timer']=()=>['API.now()',J.ORDER_FUNCTION_CALL];
jf['ugot_odometer']=()=>['API.odometer_mm()',J.ORDER_FUNCTION_CALL];
jf['ugot_claw']=(b,g)=>'API.gripper_set('+jv(b,'POS','0',g)+','+jv(b,'SPD','100',g)+');\n';
jf['ugot_claw_open']=()=>'API.gripper_set(0,100);\n';
jf['ugot_claw_close']=(b,g)=>'API.gripper_set(100,'+jv(b,'SPD','100',g)+');\n';
jf['ugot_arm']=(b,g)=>'API.arm_set('+jv(b,'ANG','0',g)+');\n';
jf['ugot_drive']=(b,g)=>'API.drive('+jv(b,'SPD','40',g)+','+(b.getFieldValue('DIR')==='F'?1:-1)+');\n';
jf['ugot_stop']=()=>'API.stop();\n';
jf['ugot_move']=(b,g)=>'API.move_mm('+jv(b,'MM','0',g)+','+jv(b,'SPD','40',g)+');\n';
jf['ugot_turn']=(b,g)=>'API.turn('+jv(b,'DEG','0',g)+','+(b.getFieldValue('DIR')==='L'?-1:1)+');\n';
jf['ugot_print']=(b,g)=>'API.print('+jv(b,'TXT',"''",g)+');\n';

/* ---- Python generators (the same program as UGOT Python code) ---- */
const pv=(b,n,d,g)=>g.valueToCode(b,n,Py.ORDER_NONE)||d;
const pf=Py.forBlock;
const needTime=()=>{Py.definitions_['import_time']='import time'};
pf['ugot_when_run']=()=>'';
pf['ugot_wait']=(b,g)=>{needTime();return 'time.sleep('+pv(b,'SEC','0',g)+')\n'};
pf['ugot_wait_until']=(b,g)=>{needTime();return 'while not ('+pv(b,'COND','False',g)+'):\n  time.sleep(0.05)\n'};
pf['ugot_forever']=(b,g)=>'while True:\n'+(g.statementToCode(b,'DO')||g.PASS);
pf['ugot_tof']=()=>['tof_read_mm()',Py.ORDER_FUNCTION_CALL];
pf['ugot_tof_median']=(b,g)=>{const fn=g.provideFunction_('median_distance',['def '+g.FUNCTION_NAME_PLACEHOLDER_+'(n):','  values = sorted(tof_read_mm() for _ in range(n))','  return values[n // 2]']);return [fn+'('+pv(b,'N','5',g)+')',Py.ORDER_FUNCTION_CALL]};
pf['ugot_button']=()=>['button_pressed()',Py.ORDER_FUNCTION_CALL];
pf['ugot_timer']=()=>{needTime();return ['time.time()',Py.ORDER_FUNCTION_CALL]};
pf['ugot_odometer']=()=>['odometer_mm()',Py.ORDER_FUNCTION_CALL];
pf['ugot_claw']=(b,g)=>'gripper_set('+pv(b,'POS','0',g)+', '+pv(b,'SPD','100',g)+')\n';
pf['ugot_claw_open']=()=>'gripper_set(0, 100)\n';
pf['ugot_claw_close']=(b,g)=>'gripper_set(100, '+pv(b,'SPD','100',g)+')\n';
pf['ugot_arm']=(b,g)=>'arm_set('+pv(b,'ANG','0',g)+')\n';
pf['ugot_drive']=(b,g)=>(b.getFieldValue('DIR')==='F'?'drive_forward(':'drive_backward(')+pv(b,'SPD','40',g)+')\n';
pf['ugot_stop']=()=>'drive_stop()\n';
pf['ugot_move']=(b,g)=>'move_mm('+pv(b,'MM','0',g)+', '+pv(b,'SPD','40',g)+')\n';
pf['ugot_turn']=(b,g)=>(b.getFieldValue('DIR')==='L'?'turn_left(':'turn_right(')+pv(b,'DEG','0',g)+')\n';
pf['ugot_print']=(b,g)=>'print('+pv(b,'TXT',"''",g)+')\n';

/* ---- Theme: built-in blocks take the uCode category colours ---- */
const theme=Blockly.Theme.defineTheme('ugot',{base:Blockly.Themes.Zelos,name:'ugot',
  blockStyles:{
    logic_blocks:{colourPrimary:C.control,colourSecondary:'#d98a1c',colourTertiary:'#b87414'},
    loop_blocks:{colourPrimary:C.control,colourSecondary:'#d98a1c',colourTertiary:'#b87414'},
    math_blocks:{colourPrimary:C.operators,colourSecondary:'#2fa05a',colourTertiary:'#26834a'},
    text_blocks:{colourPrimary:C.operators,colourSecondary:'#2fa05a',colourTertiary:'#26834a'},
    variable_blocks:{colourPrimary:C.variables,colourSecondary:'#d95a1f',colourTertiary:'#b84a18'},
    variable_dynamic_blocks:{colourPrimary:C.variables,colourSecondary:'#d95a1f',colourTertiary:'#b84a18'},
    procedure_blocks:{colourPrimary:C.functions,colourSecondary:'#d1445c',colourTertiary:'#b0374c'}},
  componentStyles:{workspaceBackgroundColour:'#f7f9fc',toolboxBackgroundColour:'#ffffff',flyoutBackgroundColour:'#eef2f7',flyoutOpacity:1,scrollbarColour:'#9aa8b8'},
  fontStyle:{family:'system-ui, Segoe UI, Roboto, sans-serif',weight:'600',size:11}});

/* ---- Toolbox ---- */
const sh=(t,v)=>'<shadow type="math_number"><field name="NUM">'+v+'</field></shadow>';
const val=(n,v)=>'<value name="'+n+'">'+sh('',v)+'</value>';
const blk=(t,inner)=>'<block type="'+t+'">'+(inner||'')+'</block>';
function toolbox(opts){
  opts=opts||{};
  const free=opts.free!==false;
  return '<xml>'+
  '<category name="Events" colour="'+C.events+'">'+blk('ugot_when_run')+'</category>'+
  '<category name="Control" colour="'+C.control+'">'+blk('ugot_wait',val('SEC',1))+blk('ugot_wait_until')+blk('controls_repeat_ext',val('TIMES',10))+blk('ugot_forever')+blk('controls_whileUntil')+blk('controls_if')+'<block type="controls_if"><mutation else="1"></mutation></block>'+'</category>'+
  '<category name="Operators" colour="'+C.operators+'">'+blk('math_arithmetic','<value name="A">'+sh('',1)+'</value><value name="B">'+sh('',1)+'</value>')+blk('logic_compare','<value name="A">'+sh('',0)+'</value><value name="B">'+sh('',0)+'</value>')+blk('logic_operation')+blk('logic_negate')+blk('logic_boolean')+blk('math_number')+blk('math_single','<value name="NUM">'+sh('',0)+'</value>')+blk('math_round','<value name="NUM">'+sh('',0)+'</value>')+blk('math_modulo','<value name="DIVIDEND">'+sh('',10)+'</value><value name="DIVISOR">'+sh('',3)+'</value>')+blk('text')+blk('text_join')+'</category>'+
  '<category name="Variables" colour="'+C.variables+'" custom="VARIABLE"></category>'+
  '<category name="Functions" colour="'+C.functions+'" custom="PROCEDURE"></category>'+
  '<category name="Sensor" colour="'+C.sensor+'">'+blk('ugot_tof')+blk('ugot_tof_median',val('N',5))+blk('ugot_button')+blk('ugot_timer')+blk('ugot_odometer')+'</category>'+
  '<category name="Claw and arm" colour="'+C.motion+'">'+blk('ugot_claw_open')+blk('ugot_claw_close',val('SPD',40))+blk('ugot_claw',val('POS',50)+val('SPD',100))+blk('ugot_arm',val('ANG',40))+'</category>'+
  '<category name="Driving" colour="'+C.motion+'">'+blk('ugot_drive',val('SPD',40))+blk('ugot_stop')+blk('ugot_move',val('MM',100)+val('SPD',40))+blk('ugot_turn',val('DEG',90))+'</category>'+
  '<category name="Display screen" colour="'+C.display+'">'+blk('ugot_print','<value name="TXT"><shadow type="text"><field name="TEXT">hello</field></shadow></value>')+'</category>'+
  '</xml>';
}

/* ---- Code generation for a workspace ---- */
function strayOff(ws){
  const off=[];
  ws.getTopBlocks(false).forEach(b=>{
    if(b.type==='ugot_when_run'||b.type==='procedures_defnoreturn'||b.type==='procedures_defreturn')return;
    if(b.isEnabled()){b.setEnabled(false);off.push(b)}});
  return off;
}
function gen(ws,which){
  const off=strayOff(ws);
  try{
    const hats=ws.getTopBlocks(false).filter(b=>b.type==='ugot_when_run');
    const g=which==='py'?Py:J;
    if(which==='js'){g.INFINITE_LOOP_TRAP='if(--window.__loops<0)throw new Error("SIM_LOOP");\n'}
    else g.INFINITE_LOOP_TRAP=null;
    const code=g.workspaceToCode(ws);
    return {code,hats:hats.length};
  }finally{off.forEach(b=>b.setEnabled(true))}
}

/* ---- Tiny XML builder so example programs are easy to read ---- */
const X={
  b(type,o){o=o||{};let s='<block type="'+type+'">';
    if(o.mut)s+=o.mut;
    for(const k in (o.f||{}))s+='<field name="'+k+'">'+o.f[k]+'</field>';
    for(const k in (o.v||{}))s+='<value name="'+k+'">'+o.v[k]+'</value>';
    for(const k in (o.s||{}))s+='<statement name="'+k+'">'+o.s[k]+'</statement>';
    if(o.next)s+='<next>'+o.next+'</next>';
    return s+'</block>'},
  n(v){return '<shadow type="math_number"><field name="NUM">'+v+'</field></shadow>'},
  num(v){return X.b('math_number',{f:{NUM:v}})},
  txt(v){return X.b('text',{f:{TEXT:v}})},
  vget(name){return X.b('variables_get',{f:{VAR:'<!--v-->'+name}}).replace('<!--v-->','')},
  seq(list){let s='';for(let i=list.length-1;i>=0;i--){s=list[i].replace(/<\/block>$/,(s?'<next>'+s+'</next>':'')+'</block>')}return s}
};
/* fix variable field to carry id, and set blocks */
X.vget=name=>'<block type="variables_get"><field name="VAR" id="'+name+'">'+name+'</field></block>';
X.vset=(name,value,next)=>'<block type="variables_set"><field name="VAR" id="'+name+'">'+name+'</field><value name="VALUE">'+value+'</value>'+(next?'<next>'+next+'</next>':'')+'</block>';
X.vars=list=>'<variables>'+list.map(n=>'<variable id="'+n+'">'+n+'</variable>').join('')+'</variables>';
X.call=name=>'<block type="procedures_callnoreturn"><mutation name="'+name+'"></mutation></block>';
X.def=(name,body,x,y)=>'<block type="procedures_defnoreturn" x="'+x+'" y="'+y+'"><mutation></mutation><field name="NAME">'+name+'</field><statement name="STACK">'+body+'</statement></block>';
X.hat=(body,x,y)=>'<block type="ugot_when_run" x="'+x+'" y="'+y+'"><next>'+body+'</next></block>';
X.chain=list=>{let s='';for(let i=list.length-1;i>=0;i--){const b=list[i];s=s?b.replace(/<\/block>$/,'<next>'+s+'</next></block>'):b}return s};

try{Blockly.libraryBlocks.loops.loopTypes.add('ugot_forever')}catch(e){}
window.UGOT=Object.assign(window.UGOT||{},{C,theme,toolbox,gen,X});
})();
