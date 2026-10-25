// Static publish allowlist. Internal notes, Apps Script, tests and old exports stay private.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),output=path.join(root,'dist');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
for(const item of ['index.html','privacy.html','404.html','styles.css','script.js','robots.txt','sitemap.xml','assets','blogs','careers','contact','how-we-work','roles','specialisms','submit-cv']){
  fs.cpSync(path.join(root,item),path.join(output,item),{recursive:true,filter:source=>!source.endsWith('/assets/video/handshake-offer.mp4')});
}
console.log('Static site built in dist/; internal source and documentation excluded.');
