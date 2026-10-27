/* Builds blocks automatically from a topic simulator's function list (T.api), so the blocks always match the Python names. */
(function(){
const C=UGOT.C,J=Blockly.JavaScript,Py=Blockly.Python;
const BOOL=new Set(['tag_centred','person_visible','recognised','face_recognised','sign_recognised']);
const VALUE=new Set(['best_match','recognised','scan_code','sign_recognised','body_y','tag_y','tag_centred','lane_offset','tof_distance_cm','person_visible','gyro_pitch','sound_direction','loudness_db','face_recognised','monorail_offset','plate_results','plate_centre_x','read_colour','position','heading']);
const TUPLE=new Set(['best_match','position']);
const TEXTARG=new Set(['colour','name','text','note','kind','joint']);
const DRIVING=/^(drive_|turn_|translate|shift_x|rotate_z|stop)/;
const CAMERA=/^(switch_to_|pan_to|tilt_to|arm_action|set_lane|sound_localisation)/;
function parse(sig){return sig.split(',').map(s=>s.trim()).filter(Boolean).map(s=>{const [n,d]=s.split('=').map(x=>x.trim());return {n,d:d===undefined?undefined:d}})}
const nice=n=>n.replace(/_/g,' ');
function shadowFor(arg){
  const d=arg.d;
  if(TEXTARG.has(arg.n)){const t=d?d.replace(/^["']|["']$/g,''):(arg.n==='colour'?'green':arg.n==='note'?'C':'');return '<shadow type="text"><field name="TEXT">'+t+'</field></shadow>'}
  if(arg.n==='on')return '<shadow type="logic_boolean"><field name="BOOL">TRUE</field></shadow>';
  const v=(d&&d!=='None'&&!isNaN(Number(d)))?d:(arg.n==='angle'?'0':arg.n==='speed'?'30':'1');
  return '<shadow type="math_number"><field name="NUM">'+v+'</field></shadow>';
}
function literal(arg){ // default code if input empty
  if(TEXTARG.has(arg.n))return "''";if(arg.n==='on')return 'true';return arg.d&&arg.d!=='None'&&!isNaN(Number(arg.d))?arg.d:'0'}
const defined={};
function defBlock(type,message,args,json,colour){
  Blockly.defineBlocksWithJsonArray([Object.assign({type,message0:message,args0:args,colour,inputsInline:true},json)]);
}
function argInputs(args){return args.map((a,i)=>({type:'input_value',name:'A'+i}))}
function msgFor(n,args,extra){return nice(n)+args.map((a,i)=>' '+(a.n==='speed'?'speed':a.n)+' %'+(i+1)).join('')+(extra||'')}
function make(T){
  const cats={Driving:[],Sensors:[],'Camera and AI':[],Actions:[]};const seen=new Set();
  for(const a of T.api){
    if(a.hide||a.n==='sleep'||a.n==='time'||seen.has(a.n))continue;seen.add(a.n);
    const args=parse(a.a),isVal=VALUE.has(a.n);
    const hasSec=args.length&&args[args.length-1].n==='seconds'&&args[args.length-1].d==='None';
    const base=hasSec?args.slice(0,-1):args;
    const cat=isVal?'Sensors':DRIVING.test(a.n)?'Driving':CAMERA.test(a.n)?'Camera and AI':'Actions';
    const colour=cat==='Driving'?C.motion:cat==='Sensors'?C.sensor:cat==='Camera and AI'?C.sensing:C.display;
    const variants=hasSec?[{id:a.n,args:base},{id:a.n+'_for',args:args,sec:true}]:[{id:a.n,args:args}];
    for(const v of variants){
      const type='ugot_api_'+v.id;
      if(!defined[type]){defined[type]=1;
        const margs=v.args.map((x,i)=>({type:'input_value',name:'A'+i}));
        const msg=nice(a.n)+(v.sec?'':'')+v.args.filter(x=>!(v.sec&&x.n==='seconds')).map(x=>' '+x.n+' %'+(v.args.indexOf(x)+1)).join('')+(v.sec?' for %'+v.args.length+' seconds':'');
        defBlock(type,msg,margs,isVal?{output:BOOL.has(a.n)?'Boolean':null,tooltip:a.d}:{previousStatement:null,nextStatement:null,tooltip:a.d},colour);
        const code=(b,g,Gn,ord)=>v.args.map((x,i)=>g.valueToCode(b,'A'+i,ord)||(x.n==='seconds'?'1':literal(x)));
        J.forBlock[type]=(b,g)=>{const call='API.'+a.n+'('+code(b,g,0,J.ORDER_NONE).join(',')+')';return isVal?[call,J.ORDER_FUNCTION_CALL]:call+';\n'};
        Py.forBlock[type]=(b,g)=>{const call=a.n+'('+code(b,g,0,Py.ORDER_NONE).join(', ')+')';return isVal?[call,Py.ORDER_FUNCTION_CALL]:call+'\n'};
      }
      const inner=v.args.map((x,i)=>'<value name="A'+i+'">'+shadowFor(x)+'</value>').join('');
      cats[cat].push('<block type="'+type+'">'+inner+'</block>');
    }
    if(TUPLE.has(a.n)){
      const type='ugot_unpack_'+a.n;
      if(!defined[type]){defined[type]=1;
        defBlock(type,'set %1 and %2 to '+nice(a.n),[{type:'field_variable',name:'V1',variable:'item'},{type:'field_variable',name:'V2',variable:'item'}],{previousStatement:null,nextStatement:null,tooltip:a.d+' Stores the two parts in two variables.'},colour);
        const nm=(b,g,f,G,T2)=>G.nameDB_.getName(b.getFieldValue(f),Blockly.Names.NameType.VARIABLE);
        J.forBlock[type]=(b,g)=>{const t=g.nameDB_.getDistinctName('tmp','DEVELOPER_VARIABLE');return 'var '+t+'=API.'+a.n+'();\n'+nm(b,g,'V1',g)+'='+t+'[0];\n'+nm(b,g,'V2',g)+'='+t+'[1];\n'};
        Py.forBlock[type]=(b,g)=>nm(b,g,'V1',g)+', '+nm(b,g,'V2',g)+' = '+a.n+'()\n';
      }
      cats.Sensors.push('<block type="'+type+'"></block>');
    }
  }
  return cats;
}
/* ---- helper blocks used by many examples ---- */
function helpers(){
  if(defined.helpers)return;defined.helpers=1;
  defBlock('ugot_none','none',[],{output:null,tooltip:'Means no value, like a sensor that sees nothing.'},C.operators);
  defBlock('ugot_isnone','%1 is none',[{type:'input_value',name:'V'}],{output:'Boolean',tooltip:'True when the value is none (the sensor saw nothing).'},C.operators);
  defBlock('ugot_in','%1 in %2',[{type:'input_value',name:'A'},{type:'input_value',name:'B'}],{output:'Boolean',tooltip:'True when the first value is found inside the list or text.'},C.operators);
  defBlock('ugot_median_of','median of %1 readings of %2',[{type:'input_value',name:'N',check:'Number'},{type:'input_value',name:'E'}],{output:null,tooltip:'Reads the sensor block N times and gives the middle value. One noisy reading cannot change it.'},C.operators);
  defBlock('ugot_mostcommon_of','most common of %1 readings of %2',[{type:'input_value',name:'N',check:'Number'},{type:'input_value',name:'E'}],{output:null,tooltip:'Reads the sensor block N times and gives the answer that appeared most often.'},C.operators);
  defBlock('ugot_break','stop this loop',[],{previousStatement:null,tooltip:'Leave the loop you are in.'},C.control);
  J.forBlock['ugot_none']=()=>['null',J.ORDER_ATOMIC];Py.forBlock['ugot_none']=()=>['None',Py.ORDER_ATOMIC];
  J.forBlock['ugot_isnone']=(b,g)=>['(('+(g.valueToCode(b,'V',J.ORDER_NONE)||'null')+')==null)',J.ORDER_ATOMIC];
  Py.forBlock['ugot_isnone']=(b,g)=>[(Py.valueToCode(b,'V',Py.ORDER_RELATIONAL)||'None')+' is None',Py.ORDER_RELATIONAL];
  J.forBlock['ugot_in']=(b,g)=>['API.__in('+(g.valueToCode(b,'A',J.ORDER_NONE)||"''")+','+(g.valueToCode(b,'B',J.ORDER_NONE)||"''")+')',J.ORDER_FUNCTION_CALL];
  Py.forBlock['ugot_in']=(b,g)=>[(Py.valueToCode(b,'A',Py.ORDER_RELATIONAL)||"''")+' in '+(Py.valueToCode(b,'B',Py.ORDER_RELATIONAL)||"''"),Py.ORDER_RELATIONAL];
  J.forBlock['ugot_median_of']=(b,g)=>['API.__median('+(g.valueToCode(b,'N',J.ORDER_NONE)||'5')+',function(){return '+(g.valueToCode(b,'E',J.ORDER_NONE)||'0')+'})',J.ORDER_FUNCTION_CALL];
  J.forBlock['ugot_mostcommon_of']=(b,g)=>['API.__mostcommon('+(g.valueToCode(b,'N',J.ORDER_NONE)||'5')+',function(){return '+(g.valueToCode(b,'E',J.ORDER_NONE)||'0')+'})',J.ORDER_FUNCTION_CALL];
  Py.forBlock['ugot_median_of']=(b,g)=>{const fn=Py.provideFunction_('median',['def '+Py.FUNCTION_NAME_PLACEHOLDER_+'(values):','  v = sorted(values)','  n = len(v)','  return v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2']);return [fn+'(['+(Py.valueToCode(b,'E',Py.ORDER_NONE)||'0')+' for _ in range('+(Py.valueToCode(b,'N',Py.ORDER_NONE)||'5')+')])',Py.ORDER_FUNCTION_CALL]};
  Py.forBlock['ugot_mostcommon_of']=(b,g)=>{const fn=Py.provideFunction_('most_common',['def '+Py.FUNCTION_NAME_PLACEHOLDER_+'(values):','  return max(set(values), key=values.count)']);return [fn+'(['+(Py.valueToCode(b,'E',Py.ORDER_NONE)||'0')+' for _ in range('+(Py.valueToCode(b,'N',Py.ORDER_NONE)||'5')+')])',Py.ORDER_FUNCTION_CALL]};
  J.forBlock['text_join']=function(b,g){const n=b.itemCount_;if(!n)return ["''",J.ORDER_ATOMIC];const parts=[];for(let i=0;i<n;i++)parts.push('API.__s('+(g.valueToCode(b,'ADD'+i,J.ORDER_NONE)||"''")+')');return ['['+parts.join(',')+"].join('')",J.ORDER_FUNCTION_CALL]};
  J.forBlock['ugot_break']=()=>'break;\n';Py.forBlock['ugot_break']=()=>'break\n';
  /* lists get the variable colour */
  try{UGOT.theme.blockStyles.list_blocks={colourPrimary:C.variables,colourSecondary:'#d95a1f',colourTertiary:'#b84a18'}}catch(e){}
}
const sh=v=>'<shadow type="math_number"><field name="NUM">'+v+'</field></shadow>';
const val=(n,v)=>'<value name="'+n+'">'+sh(v)+'</value>';
const blk=(t,i)=>'<block type="'+t+'">'+(i||'')+'</block>';
function toolbox(T){
  helpers();const cats=make(T);
  const cat=(name,col,body)=>body.length?'<category name="'+name+'" colour="'+col+'">'+body.join('')+'</category>':'';
  return '<xml>'+
   '<category name="Events" colour="'+C.events+'">'+blk('ugot_when_run')+'</category>'+
   '<category name="Control" colour="'+C.control+'">'+blk('ugot_wait',val('SEC',1))+blk('ugot_wait_until')+blk('controls_repeat_ext',val('TIMES',10))+blk('ugot_forever')+blk('controls_whileUntil')+
     '<block type="controls_for"><value name="FROM">'+sh(0)+'</value><value name="TO">'+sh(7)+'</value><value name="BY">'+sh(1)+'</value></block>'+blk('controls_forEach')+blk('ugot_break')+blk('controls_if')+'<block type="controls_if"><mutation else="1"></mutation></block>'+'<block type="controls_if"><mutation elseif="1" else="1"></mutation></block></category>'+
   '<category name="Operators" colour="'+C.operators+'">'+blk('math_arithmetic','<value name="A">'+sh(1)+'</value><value name="B">'+sh(1)+'</value>')+blk('logic_compare','<value name="A">'+sh(0)+'</value><value name="B">'+sh(0)+'</value>')+blk('logic_operation')+blk('logic_negate')+blk('logic_boolean')+blk('math_number')+blk('math_round','<value name="NUM">'+sh(0)+'</value>')+blk('math_single','<value name="NUM">'+sh(0)+'</value>')+blk('math_modulo','<value name="DIVIDEND">'+sh(10)+'</value><value name="DIVISOR">'+sh(3)+'</value>')+blk('text')+blk('text_join')+blk('ugot_none')+blk('ugot_isnone')+blk('ugot_in')+blk('ugot_median_of','<value name="N">'+sh(5)+'</value>')+blk('ugot_mostcommon_of','<value name="N">'+sh(5)+'</value>')+'</category>'+
   '<category name="Variables" colour="'+C.variables+'" custom="VARIABLE"></category>'+
   '<category name="Lists" colour="'+C.variables+'">'+'<block type="lists_create_with"><mutation items="3"></mutation></block>'+blk('lists_length')+'</category>'+
   '<category name="Functions" colour="'+C.functions+'" custom="PROCEDURE"></category>'+
   cat('Sensors',C.sensor,cats.Sensors.concat(['<block type="ugot_timer"></block>']))+
   cat('Driving',C.motion,cats.Driving)+cat('Camera and AI',C.sensing,cats['Camera and AI'])+cat('Actions',C.display,cats.Actions.concat([blk('ugot_print','<value name="TXT"><shadow type="text"><field name="TEXT">hello</field></shadow></value>')]))+
   '</xml>';
}
/* a table listing every block of the topic */
function table(T){helpers();const out=[];const seen=new Set();
  for(const a of T.api){if(a.hide||seen.has(a.n))continue;seen.add(a.n);out.push('<tr><td><b>'+nice(a.n)+'</b>'+(a.a?' <span class="note">('+a.a.replace(/</g,'&lt;')+')</span>':'')+'</td><td>'+a.d.replace(/</g,'&lt;')+'</td></tr>')}
  return out.join('')}
UGOT.apiToolbox=toolbox;UGOT.apiTable=table;
})();
