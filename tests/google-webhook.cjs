// Offline behavioural checks for the Apps Script source. No Google calls are made.
const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
class Sheet {
  constructor(name) { this.name=name;this.rows=[];this.failWrite=false; }
  getLastRow(){return this.rows.length} getMaxColumns(){return 26} setFrozenRows(){}
  getRange(row,col,numRows=1,numCols=1){
    if(typeof row==='string')return {setDataValidation(){}};
    const sheet=this;
    return {getValues(){return Array.from({length:numRows},(_,i)=>Array.from({length:numCols},(_,j)=>sheet.rows[row+i-1]?.[col+j-1]??''))},
      setValues(values){if(sheet.failWrite)throw new Error('Simulated sheet outage');values.forEach((cells,i)=>{sheet.rows[row+i-1]??=[];cells.forEach((v,j)=>sheet.rows[row+i-1][col+j-1]=v)});return this},
      setValue(value){return this.setValues([[value]])}};
  }
  appendRow(row){if(this.failWrite)throw new Error('Simulated sheet outage');this.rows.push(row)}
}
const sheets=new Map();const props=new Map();const cache=new Map();const files=[];const folders=[];
const ss={getSheetByName:name=>sheets.get(name),insertSheet(name){const sheet=new Sheet(name);sheets.set(name,sheet);return sheet}};
let acquired=0,released=0;
const ctx={Date,console:{error(){}},
  SpreadsheetApp:{openById:()=>ss,flush(){},newDataValidation(){return {requireValueInList(){return this},setAllowInvalid(){return this},build(){return {}}}}},
  PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)})},
  CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},
  LockService:{getScriptLock:()=>({waitLock(){acquired++},releaseLock(){released++}})},
  Utilities:{getUuid:()=>crypto.randomUUID(),formatDate:(date,tz)=>new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(date),base64Decode:s=>[...Buffer.from(s,'base64')],newBlob:(bytes,mime,name)=>({bytes,mime,name})},
  DriveApp:{Access:{PRIVATE:'private'},Permission:{NONE:'none'},createFolder(name){const f={name,id:'folder-'+folders.length,setSharing(a,p){this.sharing=[a,p]},getId(){return this.id}};folders.push(f);return f},getFolderById(id){assert.ok(folders.some(f=>f.id===id));return {createFile(blob){const file={blob,id:files.length,setSharing(a,p){this.sharing=[a,p]},getUrl(){return 'https://drive.google.com/file/d/mock-'+this.id},setTrashed(v){this.trashed=v}};files.push(file);return file}}}},
  ContentService:{MimeType:{JSON:'json',JAVASCRIPT:'javascript'},createTextOutput(text){return {text,setMimeType(type){this.mime=type;return this}}}}
};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('google-apps-script/Code.gs','utf8'),ctx);
const original=new Sheet('Submissions');original.rows=[['Date','Type','Name','Email','Phone','City','Role','URL','Message'],['Old','Candidate Application','Historical','old@example.com','9999999999','','','','']];sheets.set('Submissions',original);
ctx.setupQuantumLeaps();assert.equal(original.rows[1][2],'Historical');assert.equal(original.rows[0][0],'Date');assert.equal(original.rows[0][9],'Job ID');assert.equal(folders[0].sharing[0],'private');
function parse(out){return JSON.parse(out.text)}
function post(p){return parse(ctx.doPost({parameter:p}))}
const base={name:'Test employer',email:'test@example.com',consent:'yes'};
const job={...base,action:'post_job',company:'Example agency',role:'Copywriter',area:'Creative',city:'Mumbai',work_mode:'Hybrid',experience:'3–5 years',description:'Write campaigns and collaborate with designers and client teams.',request_id:'a'.repeat(32)};
const first=post(job);assert.equal(first.status,'success');const jobSheet=sheets.get('Jobs');assert.equal(jobSheet.rows[1][2],'Pending');assert.equal(parse(ctx.doGet({parameter:{action:'jobs'}})).jobs.length,0);
post(job);assert.equal(jobSheet.rows.length,2,'same request must not create duplicate job');
jobSheet.rows[1][2]='Approved';let publicJobs=parse(ctx.doGet({parameter:{action:'jobs'}})).jobs;assert.equal(publicJobs.length,1);assert.equal(publicJobs[0].id,first.reference);assert.ok(!JSON.stringify(publicJobs).includes('test@example.com'));assert.ok(!('email' in publicJobs[0]));
const app={name:'Test candidate',email:'candidate@example.com',consent:'yes',action:'apply',job_id:first.reference,role:'tampered title',phone:'+91 9999999999',area:'Creative',experience:'3–5 years',file_data:Buffer.from('%PDF-test').toString('base64'),file_name:'test.pdf',request_id:'b'.repeat(32)};
const application=post(app);assert.equal(application.status,'success');let apps=sheets.get('Applications');assert.equal(apps.rows[1][2],first.reference);assert.equal(apps.rows[1][3],'Copywriter');assert.equal(apps.rows[1][4],'Example agency');assert.equal(files[0].sharing[0],'private');assert.equal(files[0].sharing[1],'none');
post(app);assert.equal(apps.rows.length,2);assert.equal(files.length,1,'retry must not upload twice');
const second=post({...job,role:'Designer',request_id:'c'.repeat(32)});jobSheet.rows[2][2]='Approved';post({...app,job_id:second.reference,request_id:'d'.repeat(32)});assert.equal(apps.rows.length,3,'same candidate can apply to two jobs');
const updated=post({...app,request_id:'e'.repeat(32)});assert.equal(updated.reference,application.reference);assert.equal(apps.rows.length,3);
const receipt=parse(ctx.doGet({parameter:{action:'receipt',request_id:'e'.repeat(32)}}));assert.equal(receipt.reference,application.reference);assert.ok(!JSON.stringify(receipt).includes('candidate@example.com'));assert.ok(!JSON.stringify(receipt).includes('drive.google.com'));
jobSheet.rows[1][2]='Closed';assert.equal(post({...app,request_id:'f'.repeat(32)}).status,'error');assert.equal(files.length,3,'closed role must reject before uploading');
jobSheet.rows[1][2]='Approved';jobSheet.rows[1][11]='2000-01-01';assert.equal(parse(ctx.doGet({parameter:{action:'jobs'}})).jobs.length,1,'expired roles must disappear');assert.equal(post({...app,request_id:'1'.repeat(32)}).status,'error');
assert.equal(post({...job,request_id:'2'.repeat(32),consent:'no'}).status,'error');assert.equal(post({...job,request_id:'3'.repeat(32),'bot-field':'bot'}).status,'error');assert.equal(post({...job,request_id:'bad'}).status,'error');
const badFile=post({...app,job_id:second.reference,request_id:'4'.repeat(32),file_data:Buffer.from('not a pdf').toString('base64')});assert.equal(badFile.status,'error');
assert.equal(post({...app,job_id:second.reference,request_id:'5'.repeat(32),file_name:'test.exe'}).status,'error');
assert.equal(post({...app,job_id:second.reference,request_id:'6'.repeat(32),link:'javascript:alert(1)'}).status,'error');
const formula=post({...job,company:'=IMPORTXML("x")',request_id:'7'.repeat(32)});assert.equal(formula.status,'success');assert.ok(jobSheet.rows[3][3].startsWith("'="));
const contact=post({...base,form_type:'Contact Inquiry',message:'Discuss our search',request_id:'8'.repeat(32)});assert.equal(contact.status,'success');assert.equal(original.rows[1][2],'Historical');assert.equal(original.rows[2][8],'Discuss our search');
assert.equal(ctx.doGet({parameter:{callback:'alert(1)'}}).mime,'json');assert.equal(ctx.doGet({parameter:{action:'jobs',callback:'ql_ab123'}}).mime,'javascript');
apps.failWrite=true;const before=files.length;assert.equal(post({...app,job_id:second.reference,request_id:'9'.repeat(32)}).status,'error');assert.equal(files[before].trashed,true,'failed sheet write must trash the newly uploaded CV');
const jdRequest={...job,request_id:'0'.repeat(32),jd_data:Buffer.from('%PDF-test JD').toString('base64'),jd_name:'role.pdf',jd_type:'application/pdf'};
const jdResult=post(jdRequest);assert.equal(jdResult.status,'success');const jdRow=jobSheet.rows.find(r=>r[0]===jdResult.reference);assert.equal(jdRow[16],'role.pdf');assert.ok(jdRow[15].includes('drive.google.com'));assert.equal(files.at(-1).sharing[0],'private');
jobSheet.failWrite=true;const failedJdIndex=files.length;assert.equal(post({...jdRequest,request_id:'ab'.repeat(16)}).status,'error');assert.equal(files[failedJdIndex].trashed,true);jobSheet.failWrite=false;
const feed=parse(ctx.doGet({parameter:{action:'jobs'}}));assert.equal(feed.jd_attachments,true);assert.ok(!JSON.stringify(feed.jobs).includes('drive.google.com'));
assert.equal(acquired,released,'all acquired locks must be released');
console.log('PASS: legacy data preservation, approval/expiry, linked applications, per-job deduplication, idempotent retries, private CVs, receipt privacy, input validation, formula neutralisation and upload cleanup.');
