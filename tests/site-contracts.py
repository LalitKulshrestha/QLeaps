"""Offline checks of the actual built pages, form contracts and publication boundary."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent.parent/'dist'
class Page(HTMLParser):
    def __init__(self):super().__init__();self.ids=[];self.links=[];self.forms={};self.form=None;self.h1=0;self.canonical=None;self.json=False;self.schemas=[]
    def handle_starttag(self,t,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if t=='h1':self.h1+=1
        if t=='form':self.form=a.get('id');self.forms[self.form]=[]
        if self.form and t in ['input','select','textarea']:self.forms[self.form].append(a.get('name'))
        if t=='script' and a.get('type')=='application/ld+json':self.json=True
        if t=='link' and a.get('rel')=='canonical':self.canonical=a['href']
        for key in ['href','src','poster']:
            if a.get(key):self.links.append(a[key])
    def handle_endtag(self,t):
        if t=='form':self.form=None
        if t=='script':self.json=False
    def handle_data(self,d):
        if self.json:self.schemas.append(json.loads(d))
pages={}
for file in ROOT.rglob('*.html'):
    page=Page();page.feed(file.read_text());pages[file.relative_to(ROOT).as_posix()]=page
    assert page.h1==1,(file,'one H1')
    assert len(page.ids)==len(set(page.ids)),(file,'duplicate IDs')
    if file.name!='404.html':assert page.canonical,(file,'canonical')
    for href in page.links:
        u=urlsplit(href)
        if u.scheme or u.netloc:continue
        dest=(ROOT/unquote(u.path).lstrip('/')) if u.path.startswith('/') else file.parent/unquote(u.path) if u.path else file
        if dest.is_dir():dest=dest/'index.html'
        assert dest.exists(),(file,href,'missing local resource')
        if u.fragment and dest.suffix=='.html':
            target=Page();target.feed(dest.read_text());assert u.fragment in target.ids,(file,href,'missing anchor')
job=pages['contact/index.html'].forms['jobForm'];assert set(['name','email','bot-field','company','role','area','city','work_mode','experience','salary','description','closes','jd_file','consent'])<=set(job)
assert 'jobStatus' in pages['contact/index.html'].ids
cv=pages['submit-cv/index.html'].forms['cvForm'];assert set(['name','email','phone','exp','notice','linkedin','current_title','relocation','salary','job_id','link','cv'])<=set(cv)
feedback=pages['blogs/index.html'].forms['feedbackForm'];assert set(['name','email','message','topic','role','bot-field','consent'])<=set(feedback)
assert 'qleaps-social-20261025.png' in (ROOT/'index.html').read_text()
assert 'Fallback / Featured Mandates' not in (ROOT/'roles/index.html').read_text()
assert 'candidate_details' in (ROOT/'script.js').read_text()
assert not (ROOT/'google-apps-script').exists();assert not (ROOT/'tests').exists();assert not list(ROOT.glob('*.md'));assert not (ROOT/'Quantum Leaps Website (3).html').exists()
urls=[e.text for e in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
for file,page in pages.items():
    if file not in ['404.html','privacy.html']:assert page.canonical in urls,(file,'missing from sitemap')
print(f'PASS: {len(pages)} built pages; resources/anchors, metadata/JSON, form contracts, sitemap and clean publish boundary.')
