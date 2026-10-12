/** Append this as a separate file in the existing Apps Script project.
 * Run polishQuantumLeaps() once from the editor. No web-app redeploy is needed.
 * Keeps all submission records; archives the obsolete Open Roles tab.
 */
function polishQuantumLeaps() {
  var ss = qlSpreadsheet_();
  var specs = [
    {name:'Jobs', count:15, header:'#4F46E5', stripe:'#F1EFFB', statusCol:3},
    {name:'Applications', count:16, header:'#17645D', stripe:'#EDF6F3', statusCol:15},
    {name:'Submissions', count:12, header:'#14213D', stripe:'#F3F5F8', statusCol:0}
  ];
  // Validate first, so incomplete setup does not cause partial cleanup.
  specs.forEach(function(spec){if(!ss.getSheetByName(spec.name))throw new Error('Run setupQuantumLeaps first: missing '+spec.name);});
  var old = ss.getSheetByName('Open Roles');
  if (old) {
    if (old.getLastRow() === 0) ss.deleteSheet(old);
    else {
      var archive='Archive — Open Roles', suffix=1;
      while(ss.getSheetByName(archive))archive='Archive — Open Roles '+suffix++;
      old.setName(archive);
      old.hideSheet();
    }
  }
  // Remove only genuinely empty default/template tabs, never a tab with records.
  ss.getSheets().forEach(function(sheet){
    if (/^(Sheet\d+|Template|Templates)$/i.test(sheet.getName()) && sheet.getLastRow()===0 && ss.getSheets().length>3) ss.deleteSheet(sheet);
  });
  specs.forEach(function(spec,index){
    var sheet=ss.getSheetByName(spec.name);
    sheet.showSheet();ss.setActiveSheet(sheet);ss.moveActiveSheet(index+1);
    sheet.setTabColor(spec.header);sheet.setFrozenRows(1);sheet.setFrozenColumns(1);sheet.setHiddenGridlines(true);
    var rowCount=Math.min(sheet.getMaxRows(),Math.max(60,sheet.getLastRow()));
    var range=sheet.getRange(1,1,rowCount,spec.count);
    range.setFontFamily('Arial').setFontSize(10).setFontColor('#14213D').setVerticalAlignment('middle');
    sheet.getBandings().forEach(function(banding){banding.remove();});
    var bands=range.applyRowBanding();
    bands.setHeaderRowColor(spec.header).setFirstRowColor('#FFFFFF').setSecondRowColor(spec.stripe);
    sheet.getRange(1,1,1,spec.count).setFontColor('#FFFFFF').setFontWeight('bold').setWrap(true);
    sheet.setRowHeight(1,42);
    if(rowCount>1)sheet.setRowHeights(2,rowCount-1,30);
    sheet.setColumnWidths(1,spec.count,155);
    if(!sheet.getFilter())sheet.getRange(1,1,sheet.getMaxRows(),spec.count).createFilter();
    if(spec.name==='Jobs'){
      sheet.setColumnWidth(4,190);sheet.setColumnWidth(5,220);sheet.setColumnWidth(11,380);
      sheet.getRange(2,11,Math.max(1,sheet.getMaxRows()-1),1).setWrap(true);
      sheet.getRange(2,2,Math.max(1,sheet.getMaxRows()-1),1).setNumberFormat('dd mmm yyyy, hh:mm');
      sheet.hideColumns(15);
      sheet.getRange('C2:C').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Pending','Approved','Closed','Rejected'],true).setAllowInvalid(false).build());
    }else if(spec.name==='Applications'){
      sheet.setColumnWidth(4,220);sheet.setColumnWidth(6,190);sheet.setColumnWidth(7,230);sheet.setColumnWidth(12,230);sheet.setColumnWidth(13,230);
      sheet.getRange(2,2,Math.max(1,sheet.getMaxRows()-1),1).setNumberFormat('dd mmm yyyy, hh:mm');
      sheet.hideColumns(16);
      sheet.getRange('O2:O').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['New','Shortlisted','Interview','Offer','Hired','Not proceeding','Withdrawn'],true).setAllowInvalid(true).build());
    }else{
      sheet.setColumnWidth(3,190);sheet.setColumnWidth(4,230);sheet.setColumnWidth(8,240);sheet.setColumnWidth(9,380);
      sheet.getRange(2,9,Math.max(1,sheet.getMaxRows()-1),1).setWrap(true);
      sheet.getRange(2,1,Math.max(1,sheet.getMaxRows()-1),1).setNumberFormat('dd mmm yyyy, hh:mm');
      sheet.hideColumns(12);
    }
    if(spec.statusCol){
      var colors={Pending:['#FFF1D6','#765219'],Approved:['#E1F1E1','#275A31'],Closed:['#ECEEF2','#596170'],Rejected:['#FCE4E1','#922F2D'],New:['#E7E5FA','#4F46E5'],Shortlisted:['#E1F1E1','#275A31'],Interview:['#DEF0F7','#225D73'],Offer:['#FFF1D6','#765219'],Hired:['#CBEACA','#205429'],'Not proceeding':['#FCE4E1','#922F2D'],Withdrawn:['#ECEEF2','#596170']};
      var rules=[];
      Object.keys(colors).forEach(function(status){rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(status).setBackground(colors[status][0]).setFontColor(colors[status][1]).setRanges([sheet.getRange(2,spec.statusCol,sheet.getMaxRows()-1,1)]).build());});
      sheet.setConditionalFormatRules(rules);
    }
  });
  ss.setActiveSheet(ss.getSheetByName('Jobs'));
  SpreadsheetApp.flush();
  ss.toast('Formatted Jobs, Applications and Submissions. Historical Open Roles data is archived, not deleted.','Quantum Leaps',8);
}
