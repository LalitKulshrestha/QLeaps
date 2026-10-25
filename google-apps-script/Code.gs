/**
 * Quantum Leaps — jobs, applications and enquiries (v2).
 * Replace the existing Code.gs, then update its EXISTING web-app deployment.
 * Run setupQuantumLeaps once from the editor before deploying.
 * Existing Submissions columns A:I are preserved; J:L hold job/reference/request IDs.
 * New resume files are private. Existing shareable files are not changed automatically.
 */
var QL_CONFIG = {
  spreadsheetId: '1r2VMu159qXGBvh51opvg574rQeKKr6vNsJUVuaurb0c',
  resumeFolderName: 'Quantum Leaps Resumes',
  version: 2,
  maxFileBytes: 5 * 1024 * 1024
};
var QL_JOBS_HEADERS = ['Job ID', 'Created', 'Status', 'Company', 'Title', 'Specialism', 'Location', 'Working arrangement', 'Experience', 'Salary range', 'Description', 'Closes', 'Employer name', 'Employer email', 'Request ID', 'JD URL', 'JD filename'];
var QL_APPLICATION_HEADERS = ['Application ID', 'Submitted', 'Job ID', 'Job title', 'Company', 'Name', 'Email', 'Phone', 'City', 'Specialism', 'Experience', 'Portfolio', 'Resume URL', 'Consent', 'Status', 'Request ID', 'LinkedIn', 'Current title / organisation', 'Notice period', 'Relocation', 'Target CTC'];
var QL_SUBMISSION_HEADERS = ['Submitted', 'Form type', 'Name', 'Email', 'Phone', 'City', 'Role', 'Profile / resume', 'Message', 'Job ID', 'Reference', 'Request ID'];
var QL_AREAS = ['Marketing and digital', 'Creative', 'Design and product', 'Technology'];

function qlSpreadsheet_() {
  return SpreadsheetApp.openById(QL_CONFIG.spreadsheetId);
}
function qlSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    // Never overwrite original A:I labels or data in the legacy Submissions tab.
    var start = name === 'Submissions' ? 9 : 0;
    var actual = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    for (var i = start; i < headers.length; i++) {
      if (actual[i] && String(actual[i]) !== headers[i]) {
        throw new Error('Unexpected columns in ' + name + '. Check the setup instructions before proceeding.');
      }
      if (!actual[i]) sheet.getRange(1, i + 1).setValue(headers[i]);
    }
  }
  return sheet;
}
function setupQuantumLeaps() {
  var ss = qlSpreadsheet_();
  qlSheet_(ss, 'Submissions', QL_SUBMISSION_HEADERS);
  var jobs = qlSheet_(ss, 'Jobs', QL_JOBS_HEADERS);
  qlSheet_(ss, 'Applications', QL_APPLICATION_HEADERS);
  jobs.getRange('C2:C').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'Approved', 'Closed', 'Rejected'], true).setAllowInvalid(false).build());
  // Dedicated private folder: do not inherit ANYONE_WITH_LINK access from an old folder.
  var folderId = PropertiesService.getScriptProperties().getProperty('QL_RESUME_FOLDER_ID');
  if (!folderId) {
    var folder = DriveApp.createFolder(QL_CONFIG.resumeFolderName + ' — Private');
    folder.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    PropertiesService.getScriptProperties().setProperty('QL_RESUME_FOLDER_ID', folder.getId());
  }
  if (!PropertiesService.getScriptProperties().getProperty('QL_JD_FOLDER_ID')) {
    var jdFolder = DriveApp.createFolder('Quantum Leaps JDs — Private');
    jdFolder.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    PropertiesService.getScriptProperties().setProperty('QL_JD_FOLDER_ID', jdFolder.getId());
  }
  SpreadsheetApp.flush();
  return 'Ready. Approve rows in Jobs to publish them. Keep the spreadsheet and resume folder private.';
}
function authorizeDrive() { return setupQuantumLeaps(); }

function qlText_(value, max) { return String(value == null ? '' : value).trim().slice(0, max); }
function qlCell_(value) {
  var text = String(value == null ? '' : value);
  // Prevent user-provided values from becoming spreadsheet formulas.
  return /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
}
function qlEmail_(value) {
  var email = qlText_(value, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
  return email;
}
function qlPhone_(value) { return String(value || '').replace(/\D/g, '').slice(-10); }
function qlReference_(prefix) { return prefix + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase(); }
function qlRows_(sheet, width) {
  return sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues() : [];
}
function qlAppend_(sheet, row) {
  sheet.appendRow(row.map(function (value) { return value instanceof Date ? value : qlCell_(value); }));
}
function qlWrite_(sheet, index, row) {
  sheet.getRange(index, 1, 1, row.length).setValues([row.map(function (value) { return value instanceof Date ? value : qlCell_(value); })]);
}
function qlResponse_(data, callback) {
  var json = JSON.stringify(data).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  if (callback) {
    if (!/^ql_[a-f0-9_]+$/.test(callback)) {
      return ContentService.createTextOutput('{"status":"error","message":"Invalid callback"}').setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
function qlIsOpen_(row) {
  if (String(row[2]).toLowerCase() !== 'approved') return false;
  if (!row[11]) return true;
  var date = row[11] instanceof Date ? row[11] : new Date(String(row[11]) + 'T00:00:00+05:30');
  if (isNaN(date.getTime())) return false;
  // Treat the closing date as inclusive in India time, regardless of project timezone.
  var day = Utilities.formatDate(date, 'Asia/Kolkata', 'yyyy-MM-dd');
  return day >= Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
}
function qlPublicJobs_(ss) {
  var sheet = ss.getSheetByName('Jobs');
  if (!sheet) return [];
  return qlRows_(sheet, QL_JOBS_HEADERS.length).filter(qlIsOpen_).map(function (r) {
    return { id: String(r[0]), company: String(r[3]), title: String(r[4]), area: String(r[5]),
      location: String(r[6]), work_mode: String(r[7]), experience: String(r[8]), salary: String(r[9]),
      description: String(r[10]), closes: r[11] ? (r[11] instanceof Date ? Utilities.formatDate(r[11], 'Asia/Kolkata', 'yyyy-MM-dd') : String(r[11])) : '' };
  });
}
function qlReceipt_(ss, requestId) {
  // Only non-personal status/reference data is returned. Never return CV links or email.
  var layouts = [
    ['Jobs', QL_JOBS_HEADERS.length, 14, 0],
    ['Applications', QL_APPLICATION_HEADERS.length, 15, 0],
    ['Submissions', QL_SUBMISSION_HEADERS.length, 11, 10]
  ];
  for (var n = 0; n < layouts.length; n++) {
    var layout = layouts[n];
    var sheet = ss.getSheetByName(layout[0]);
    if (!sheet) continue;
    var rows = qlRows_(sheet, layout[1]);
    for (var i = rows.length - 1; i >= 0; i--) {
      if (String(rows[i][layout[2]]) === requestId) return {status:'success', reference:String(rows[i][layout[3]]), version:2};
    }
  }
  var cached = CacheService.getScriptCache().get('ql_receipt_' + requestId);
  return cached ? JSON.parse(cached) : {status:'pending', version:2};
}
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'jobs') return qlResponse_({status:'success', version:2, jd_attachments:true, candidate_details:true, jobs:qlPublicJobs_(qlSpreadsheet_())}, p.callback);
    if (p.action === 'receipt') {
      if (!/^[a-f0-9]{32}$/.test(String(p.request_id || ''))) throw new Error('Invalid reference token.');
      return qlResponse_(qlReceipt_(qlSpreadsheet_(), p.request_id), p.callback);
    }
    return qlResponse_({status:'active', service:'Quantum Leaps Webhook', version:2}, p.callback);
  } catch (err) {
    console.error(err);
    return qlResponse_({status:'error', version:2, message:'The service is temporarily unavailable. Please contact our team.'}, p.callback);
  }
}
function qlSaveResume_(p, name, folderProperty) {
  if (!p.file_data || !p.file_name) throw new Error('Please attach your CV.');
  var filename = qlText_(p.file_name, 160).replace(/[^a-zA-Z0-9._ -]/g, '_');
  var ext = (filename.match(/\.(pdf|doc|docx)$/i) || [])[1];
  if (!ext || String(p.file_data).length > Math.ceil(QL_CONFIG.maxFileBytes / 3) * 4 + 4) throw new Error('Attach a PDF or Word CV up to 5 MB.');
  var bytes = Utilities.base64Decode(String(p.file_data));
  if (!bytes.length || bytes.length > QL_CONFIG.maxFileBytes) throw new Error('Attach a PDF or Word CV up to 5 MB.');
  var signature = bytes.slice(0, 8).map(function (b) { return (b + 256) % 256; });
  ext = ext.toLowerCase();
  var valid = ext === 'pdf' ? signature.slice(0, 5).join(',') === '37,80,68,70,45' :
    ext === 'docx' ? signature.slice(0, 4).join(',') === '80,75,3,4' : signature.join(',') === '208,207,17,224,161,177,26,225';
  if (!valid) throw new Error('The CV file does not match its PDF or Word format.');
  var folderId = PropertiesService.getScriptProperties().getProperty(folderProperty || 'QL_RESUME_FOLDER_ID');
  if (!folderId) throw new Error('Please contact our team to complete your application.');
  var mime = {pdf:'application/pdf', doc:'application/msword', docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}[ext];
  var file = DriveApp.getFolderById(folderId).createFile(Utilities.newBlob(bytes, mime, name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + filename));
  file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
  return file;
}
function qlJob_(ss, p, name, email, requestId) {
  var company = qlText_(p.company,200), title=qlText_(p.role,200), area=qlText_(p.area,100), city=qlText_(p.city,100);
  var mode=qlText_(p.work_mode,20), exp=qlText_(p.experience,100), desc=qlText_(p.description,6000), closes=qlText_(p.closes,10);
  if (!company || !title || !city || !exp || desc.length < 30 || QL_AREAS.indexOf(area) < 0 || ['On-site','Hybrid','Remote'].indexOf(mode) < 0) throw new Error('Please complete the required job details.');
  if (closes && (!/^\d{4}-\d{2}-\d{2}$/.test(closes) || isNaN(new Date(closes).getTime()) || new Date(closes).toISOString().slice(0,10) !== closes || closes < Utilities.formatDate(new Date(),'Asia/Kolkata','yyyy-MM-dd'))) throw new Error('Choose a valid closing date in the future.');
  var ref=qlReference_('QLJ');
  var jdFile = null;
  if (p.jd_data || p.jd_name) {
    try { jdFile = qlSaveResume_({file_data:p.jd_data,file_name:p.jd_name,file_type:p.jd_type}, 'JD_' + company, 'QL_JD_FOLDER_ID'); }
    catch (err) { throw new Error(String(err.message).replace(/CV/g, 'JD')); }
  }
  try {
    qlAppend_(qlSheet_(ss,'Jobs',QL_JOBS_HEADERS), [ref,new Date(),'Pending',company,title,area,city,mode,exp,qlText_(p.salary,100),desc,closes,name,email,requestId,jdFile ? jdFile.getUrl() : '',jdFile ? qlText_(p.jd_name,160) : '']);
    SpreadsheetApp.flush();
  } catch (err) { if (jdFile) jdFile.setTrashed(true); throw err; }
  return {status:'success',reference:ref,message:'Your job is saved for review.',version:2};
}
function qlApplication_(ss,p,name,email,requestId) {
  var jobId=qlText_(p.job_id,40), title=qlText_(p.role,200), company='';
  if (jobId) {
    var jobSheet=ss.getSheetByName('Jobs');
    var job=jobSheet && qlRows_(jobSheet,QL_JOBS_HEADERS.length).filter(function(r){return String(r[0])===jobId;})[0];
    if (!job || !qlIsOpen_(job)) throw new Error('This role is no longer accepting applications. Please choose another role.');
    title=String(job[4]);company=String(job[3]);
  }
  var phone=qlText_(p.phone,30), area=qlText_(p.area,100), portfolio=qlText_(p.link,500), linkedin=qlText_(p.linkedin,500);
  if (linkedin && !/^https?:\/\/[^\s]+$/i.test(linkedin)) throw new Error('Please use a valid LinkedIn URL.');
  if (qlPhone_(phone).length !== 10 || QL_AREAS.indexOf(area)<0) throw new Error('Please check your phone number and specialism.');
  if (portfolio && !/^https?:\/\/[^\s]+$/i.test(portfolio)) throw new Error('Please use a valid portfolio URL.');
  var sheet=qlSheet_(ss,'Applications',QL_APPLICATION_HEADERS), rows=qlRows_(sheet,QL_APPLICATION_HEADERS.length);
  var existing=-1;
  for(var i=0;i<rows.length;i++) {
    // One record per candidate PER JOB; a general application is a separate record.
    if(String(rows[i][2])===jobId && String(rows[i][6]).toLowerCase()===email && qlPhone_(rows[i][7])===qlPhone_(phone)) {existing=i;break;}
  }
  var ref=existing>=0 ? String(rows[existing][0]) : qlReference_('QLA');
  var resume=qlSaveResume_(p,name);
  try {
    // Cached older clients must not erase newly captured optional details on reapply.
    function detail(key,max,column) { return Object.prototype.hasOwnProperty.call(p,key) ? qlText_(p[key],max) : existing>=0 ? rows[existing][column] : ''; }
    var row=[ref,new Date(),jobId,title,company,name,email,phone,qlText_(p.city,100),area,qlText_(p.experience,100),portfolio,resume.getUrl(),'yes',existing>=0 ? rows[existing][14] : 'New',requestId,detail('linkedin',500,16),detail('current_title',200,17),detail('notice',100,18),detail('relocation',150,19),detail('salary',100,20)];
    if(existing>=0) qlWrite_(sheet,existing+2,row); else qlAppend_(sheet,row);
    SpreadsheetApp.flush();
  } catch(err) {resume.setTrashed(true);throw err;}
  return {status:'success',reference:ref,message:'Your application is saved.',version:2};
}
function qlLegacy_(ss,p,name,email,requestId) {
  // Contacts remain in the existing tab. Legacy general candidate requests route
  // to Applications as well, so old website clients continue to be accepted.
  if (p.form_type === 'Candidate Application') {
    p.area=p.area || ((String(p.message||'').match(/Specialism: ([^|]+)/)||[])[1]||'').trim();
    p.experience=p.experience || ((String(p.message||'').match(/Experience: (.*)/)||[])[1]||'').trim();
    return qlApplication_(ss,p,name,email,requestId);
  }
  var sheet=qlSheet_(ss,'Submissions',QL_SUBMISSION_HEADERS), ref=qlReference_('QLC');
  var message=qlText_(p.message,3000);
  if(!message) throw new Error('Please add your enquiry.');
  qlAppend_(sheet,[new Date(),p.form_type === 'Editorial Feedback' ? 'Editorial Feedback' : 'Contact Inquiry',name,email,qlText_(p.phone,30),qlText_(p.city,100),qlText_(p.role,200),qlText_(p.link,500),message,'',ref,requestId]);
  return {status:'success',reference:ref,version:2};
}
function doPost(e) {
  var p=(e && e.parameter)||{};
  if(e && e.postData && e.postData.contents && /^application\/json/.test(e.postData.type||'')) {
    try {p=JSON.parse(e.postData.contents);} catch(err){return qlResponse_({status:'error',message:'Invalid request.'});}
  }
  var requestId=String(p.request_id||'');
  if(!requestId) requestId=Utilities.getUuid().replace(/-/g,'');
  if(!/^[a-f0-9]{32}$/.test(requestId)) return qlResponse_({status:'error',message:'Invalid request token.'});
  var lock=LockService.getScriptLock(), locked=false, result;
  try {
    if(p['bot-field']) throw new Error('Unable to accept this submission.');
    if(p.consent!=='yes') throw new Error('Please agree to be contacted before submitting.');
    var name=qlText_(p.name,100), email=qlEmail_(p.email);
    if(!name) throw new Error('Please enter your name.');
    lock.waitLock(30000);locked=true;
    var ss=qlSpreadsheet_();
    var previous=qlReceipt_(ss,requestId);
    if(previous.status==='success') return qlResponse_(previous);
    if(p.action==='post_job') result=qlJob_(ss,p,name,email,requestId);
    else if(p.action==='apply') result=qlApplication_(ss,p,name,email,requestId);
    else if(!p.action || p.action==='contact') result=qlLegacy_(ss,p,name,email,requestId);
    else throw new Error('Unknown submission type.');
    SpreadsheetApp.flush();
  } catch(err) {
    console.error(err);
    // Only explicit validation messages are returned; never expose Drive/Sheet internals.
    var safeMessages=['Please','Attach','The CV','This role','Choose','Unknown','Unable'];
    var message=String(err.message||'');
    result={status:'error',version:2,message:safeMessages.some(function(prefix){return message.indexOf(prefix)===0;}) ? message : 'We couldn’t save the submission. Please try again or contact our team.'};
  } finally {if(locked) lock.releaseLock();}
  CacheService.getScriptCache().put('ql_receipt_'+requestId,JSON.stringify(result),1800);
  return qlResponse_(result);
}
