'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const banks=require('../questions');
test('every category and era selects its own distinct bank, with synchronized answers and confirmation',{timeout:30000},async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lbd-cats-')),port=15000+Math.floor(Math.random()*8000),p=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,DATA_DIR:dir,PORT:String(port)},stdio:'ignore'});
 async function call(action,session={},extra={}){const res=await fetch(`http://127.0.0.1:${port}/api`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,...session,...extra})});return {status:res.status,...await res.json()}}
 try{for(let i=0;i<100;i++){try{await fetch(`http://127.0.0.1:${port}/`);break}catch{await new Promise(r=>setTimeout(r,25))}}
 for(const [category,era] of [['movie','classic'],['movie','millennial'],['movie','new'],['movie','mixed'],['music','classic'],['music','millennial'],['music','new'],['music','mixed'],['general','mixed']]){
 let first=await call('create',{}, {name:'Host'}),a={room:first.state.code,token:first.token};let second=await call('join',{}, {room:a.room,name:'Guest'}),b={room:a.room,token:second.token};
 assert.equal((await call('ready',a)).status,400);await call('select',a,{category,era});assert.equal((await call('ready',a)).status,400);assert.equal((await call('confirm',a,{confirm:true})).status,400);await call('confirm',b,{confirm:true});await call('ready',a);let start=await call('ready',b);assert.equal(start.state.phase,'question');let seen=new Set();
 for(let i=0;i<10;i++){let state=(await call('state',a)).state,other=(await call('state',b)).state,q=state.question;assert.deepEqual(q,other.question);assert.equal(seen.has(q.prompt),false);seen.add(q.prompt);let bank=category==='movie'?banks.movies:category==='music'?banks.music:banks.general;assert.ok(bank.some(x=>x.prompt===q.prompt&&(category==='general'||era==='mixed'||x.era===era)),`${category}/${era}: ${q.prompt}`);let correct=JSON.parse(fs.readFileSync(path.join(dir,'rooms.json')))[a.room].current.answer;let both=await Promise.all([call('answer',a,{answer:correct}),call('answer',b,{answer:correct})]);assert.deepEqual(both.map(x=>x.status),[200,200]);assert.equal((await call('state',a)).state.phase,'reveal');await call('next',a)}
 assert.equal((await call('state',a)).state.tiebreak,true);
 if(category==='general'){let sawPair=false;for(let j=0;j<45;j++){let st=(await call('state',a)).state,q=st.question;assert.equal(seen.has(q.prompt),false);seen.add(q.prompt);if(q.prompt.startsWith('Double challenge:'))sawPair=true;const ans=JSON.parse(fs.readFileSync(path.join(dir,'rooms.json')))[a.room].current.answer;await Promise.all([call('answer',a,{answer:ans}),call('answer',b,{answer:ans})]);await call('next',a)}assert.equal(sawPair,true)}
 }
 }finally{p.kill();fs.rmSync(dir,{recursive:true,force:true})}
});
test('every bank has four distinct options and an identified correct answer',()=>{for(const bank of [banks.movies,banks.music,banks.general])for(const q of bank){assert.equal(q.options.length,4,q.prompt);assert.equal(new Set(q.options).size,4,q.prompt);assert.ok(q.answer>=0&&q.answer<4)}});
