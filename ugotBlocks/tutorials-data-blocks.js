(function(){
const L=Lab.B,P=L.prog;
const chg=(n,by)=>'<block type="math_change"><field name="VAR" id="'+n+'">'+n+'</field><value name="DELTA"><shadow type="math_number"><field name="NUM">'+by+'</field></shadow></value></block>';
const def=(name,body)=>'<block type="procedures_defnoreturn" x="20" y="240"><mutation></mutation><field name="NAME">'+name+'</field><statement name="STACK">'+body+'</statement></block>';
window.BLOCK_TUTORIALS=[
{id:'01',emoji:'👋',title:'Hello, blocks',mins:4,goal:'Build and run your first block program and see that blocks run from top to bottom.',slides:[
 {h:'Blocks are code you can snap together',say:'Every program starts with a yellow hat block that says when the program begins. Under it you snap blocks that tell the robot what to do. The blocks are read from the top to the bottom, one at a time.',
  bullets:['The hat block starts the program','Blocks snap together like building bricks','The robot reads them top to bottom'],xml:P([],[L.say(L.txt('Hello, UGOT!'))]),tip:'Press Run. The robot screen shows your message.'},
 {h:'Order matters',say:'This program has three print blocks. The robot shows them in the same order that you stacked them. If you drag one block above another, the output swaps too.',
  bullets:['Drag a block up or down to change the order','Try swapping the first and last blocks and run again'],xml:P([],[L.say(L.txt('1. Look')),L.say(L.txt('2. Think')),L.say(L.txt('3. Move'))])},
 {h:'Blocks become Python',say:'Open the Python box under the workspace. Each block becomes one line of Python. When you move to the real UGOT with Python, the thinking is exactly the same, only the words are typed.',
  bullets:['Block coding and Python are two ways to write the same program','Look up the real UGOT Python names before you code the robot'],xml:P([],[L.say(L.txt('Blocks = Python'))])}]},
{id:'02',emoji:'🔢',title:'Variables and maths',mins:5,goal:'Store a number in a variable and use maths blocks to work with it.',slides:[
 {h:'A variable is a named box',say:'A variable remembers a value. Here we make a variable called speed and put 30 in it. Then we show it. Open the Variables category to make your own.',
  bullets:['Use the set block to put a value in a variable','Use the variable block to read the value back'],xml:P(['speed'],[L.set('speed',L.num(30)),L.say(L.join(L.txt('Speed is '),L.get('speed')))])},
 {h:'Do maths with blocks',say:'The green blocks do maths. Every speed unit is 10 millimetres per second, so a car at speed 30 drives 300 mm each second. We keep the answer in a second variable called distance.',
  bullets:['Use the + − × ÷ block from Operators','You can put a variable inside a maths block'],xml:P(['speed','distance'],[L.set('speed',L.num(30)),L.set('distance',L.ar('MULTIPLY',L.get('speed'),L.num(10))),L.say(L.join(L.txt('mm each second: '),L.get('distance')))])},
 {h:'Change a variable',say:'The change block adds to a variable. Counting laps, adding up distances and keeping score all use it.',
  bullets:['change total by 250 means total = total + 250'],xml:P(['total'],[L.set('total',L.num(0)),chg('total',250),chg('total',250),L.say(L.get('total'))])}]},
{id:'03',emoji:'🔀',title:'Decisions',mins:5,goal:'Make the robot choose what to do with if and else blocks.',slides:[
 {h:'If this, then that',say:'An if block checks a condition. If the condition is true, the blocks inside run. If not, they are skipped. Move the pretend distance slider and run again.',
  bullets:['The condition goes in the hexagon slot','Compare blocks give true or false'],xml:P([],[L.ifelse([L.cmp('LT',L.tof(),L.num(400))],[L.say(L.txt('slow'))],L.say(L.txt('fast')))]),sensor:true},
 {h:'More than two choices',say:'Click the blue gear on an if block to add else if parts. The robot checks them from the top. The first one that is true runs and the rest are skipped, so check the smallest distance first.',
  bullets:['Order matters: smallest distance first','Only one part runs'],xml:P([],[L.ifelse([L.cmp('LT',L.tof(),L.num(150)),L.cmp('LT',L.tof(),L.num(400))],[L.say(L.txt('stop')),L.say(L.txt('slow'))],L.say(L.txt('go')))]),sensor:true},
 {h:'Combine conditions',say:'The and block is true only when both sides are true. This is how a robot checks that it is in the SEARCH state and close enough to grip.',
  bullets:['and: both must be true','or: one is enough'],xml:P(['state'],[L.set('state',L.txt('SEARCH')),L.ifelse([L.and(L.cmp('EQ',L.get('state'),L.txt('SEARCH')),L.cmp('LTE',L.tof(),L.num(95)))],[L.say(L.txt('grip now'))],L.say(L.txt('keep looking')))]),sensor:true,tof:90}]},
{id:'04',emoji:'🔁',title:'Loops and waiting',mins:5,goal:'Repeat actions and wait for a sensor.',slides:[
 {h:'Repeat blocks',say:'A repeat block runs the blocks inside it again and again. Four legs of 300 millimetres and four right turns make a square. Notice how little code a loop needs.',
  bullets:['repeat 4 times = four copies of the blocks inside'],xml:P([],[L.rep(4,L.chain([L.move(300,30),L.turn(90,'R')]))])},
 {h:'Wait until',say:'Wait until pauses the program until a condition becomes true. Here the robot drives forward, then waits for the wall to be closer than 100 millimetres, then stops. The pretend wall gets closer by 200 millimetres each second.',
  bullets:['drive keeps going until you stop it','wait until checks the sensor again and again'],xml:P([],[L.drive(30,'F'),L.until(L.cmp('LT',L.tof(),L.num(100))),L.stop()]),wall:true},
 {h:'Loops need a pause',say:'This loop reads the sensor three times and waits half a second between readings. A forever loop never ends, so it always needs a sensor reading or a wait block inside it. If not, the blocks warn you that the loop repeated too many times.',
  bullets:['Every forever loop needs a sensor or wait block inside','Use the Control category for forever'],xml:P([],[L.rep(3,L.chain([L.say(L.join(L.txt('distance: '),L.tof())),L.wait(0.5)]))]),sensor:true}]},
{id:'05',emoji:'🧩',title:'Make your own blocks',mins:4,goal:'Group blocks into a function so a long program is easy to read.',slides:[
 {h:'Functions have names',say:'A function is a group of blocks with a name. Open Functions, press Make a Block and give it a name. Then use the name wherever you need those blocks. The call block runs the whole group.',
  bullets:['Make a Block creates the function','Drag the call block to use it'],xml:P([],[L.call('report'),L.wait(1),L.call('report')],def('report',L.say(L.join(L.txt('Reading: '),L.tof())))),sensor:true},
 {h:'Why use functions',say:'If you need to change what report does, you change it once and every call changes. Real programs use functions to keep the main program short, like release and approach and grip in the rescue lesson.',
  bullets:['Change it once, it changes everywhere','A short main program is easier to test'],xml:P([],[L.call('beep'),L.call('beep'),L.call('beep')],def('beep',L.chain([L.say(L.txt('beep')),L.wait(0.3)])))}]},
{id:'06',emoji:'📏',title:'The TOF sensor',mins:5,goal:'Read the distance sensor and clean up noisy readings with the median block.',slides:[
 {h:'Reading distance',say:'The TOF sensor measures the distance to the nearest object ahead in millimetres. Each reading takes 50 milliseconds. Slide the pretend distance and read it again.',
  bullets:['Range 40 to 2000 mm','Below 40 reads 0, above 2000 reads 2000'],xml:P(['d'],[L.set('d',L.tof()),L.say(L.join(L.txt('distance: '),L.get('d')))]),sensor:true},
 {h:'Noisy readings',say:'Sensors make mistakes. In this pretend run the sensor reads 300 three times and then jumps to 2000 once. A program that grips at the first small reading would close the claw by mistake.',
  bullets:['One spike can trigger the claw'],xml:P(['a','b','c'],[L.set('a',L.tof()),L.set('b',L.tof()),L.set('c',L.tof()),L.say(L.join(L.txt('a, b, c: '),L.join(L.get('a'),L.join(L.txt(', '),L.join(L.get('b'),L.join(L.txt(', '),L.get('c')))))))]),seq:[300,300,2000]},
 {h:'The median ignores spikes',say:'The median block takes several readings and gives the middle one, so one spike cannot change the answer. With the readings 300, 300, 2000, 300, 300 the median is 300.',
  bullets:['Median of 5 is the middle value after sorting','Use it before a decision'],xml:P(['m'],[L.set('m',L.med(5)),L.say(L.join(L.txt('median: '),L.get('m')))]),seq:[300,300,2000,300,300]}]},
{id:'07',emoji:'🦾',title:'Claw and arm',mins:5,goal:'Open, close and lift. Learn why speed matters for gentle grips.',slides:[
 {h:'Claw: 0 is open, 100 is closed',say:'The claw blocks set how far the claw is closed and how fast it moves. A low speed closes slowly, which protects light objects. The program carries on while the claw is moving, so add a wait block when you need it to finish.',
  bullets:['close claw at speed 40 is gentle','The claw keeps moving while later blocks run'],xml:P([],[L.open(),L.wait(1),L.close(40),L.wait(2)])},
 {h:'Lift, carry, lower, release',say:'Lift at least 25 degrees to carry. Lower the arm before the claw opens so the object is not dropped. A negative move distance goes backward.',
  bullets:['Arm 0 = on the table, 80 = fully raised','Always lower before releasing'],xml:P([],[L.arm(40),L.move(-400,30),L.arm(0),L.open()])},
 {h:'Trigger the claw with the sensor',say:'This is the heart of the rescue program. Drive slowly, wait until the median distance is 95 millimetres or less, stop, and then close gently. The pretend object gets closer by 30 millimetres each second.',
  bullets:['Slow near the object','Stop before you close'],xml:P([],[L.drive(20,'F'),L.until(L.cmp('LTE',L.med(5),L.num(95))),L.stop(),L.close(40)]),obj:true}]},
{id:'08',emoji:'🧪',title:'Test on the virtual robot',mins:3,goal:'Move from the pretend robot to the virtual UGOT arena.',slides:[
 {h:'The pretend robot and the virtual UGOT',say:'The pretend robot in these lessons only writes down what your blocks did. The virtual UGOT simulators have a real table, physics, objects to grip and tests that pass or fail. Use them to collect evidence for your Criterion C testing.',
  bullets:['Robot Sandbox: free play with every UGOT block, no marks','Each lesson simulator: tests and evidence for C3'],xml:P([],[L.say(L.txt('Ready for the simulator!'))]),links:true}]}
];
})();
