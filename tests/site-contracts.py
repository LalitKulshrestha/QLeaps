"""Offline checks of the actual built pages, form contracts and publication boundary."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent.parent/'dist'
class Page(HTMLParser):
    def __init__(self):super().__init__();self.ids=[];self.links=[];self.forms={};self.form=None;self.h1=0;self.canonical=None;self.json=False;self.schemas=[];self.uploads=[]
    def handle_starttag(self,t,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if t=='h1':self.h1+=1
        if t=='form':self.form=a.get('id');self.forms[self.form]=[]
        if self.form and t=='input' and a.get('type')=='file':self.uploads.append(self.form)
        if self.form and t in ['input','select','textarea']:self.forms[self.form].append(a.get('name'))
        if t=='script' and a.get('type')=='application/ld+json':self.json=True
        if t=='link' and a.get('rel')=='canonical':self.canonical=a['href']
        for key in ['href','src','poster']:
            if a.get(key):self.links.append(a[key])
    def handle_endtag(self,t):
        if t=='form':self.form=None
        if t=='script':self.json=False
    def handle_data(self,d):
        if self.json:
            schema=json.loads(d);assert schema.get('@context')=='https://schema.org';self.schemas.append(schema)
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
assert 'candidate_details' in ''.join(file.read_text() for file in (ROOT/'_astro').glob('*.js'))
assert not (ROOT/'google-apps-script').exists();assert not (ROOT/'tests').exists();assert not list(ROOT.glob('*.md'));assert not (ROOT/'Quantum Leaps Website (3).html').exists()
urls=[e.text for e in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
for file,page in pages.items():
    if file not in ['404.html','privacy.html']:assert page.canonical in urls,(file,'missing from sitemap')
print(f'PASS: {len(pages)} built pages; resources/anchors, metadata/JSON, form contracts, sitemap and clean publish boundary.')

assert 'service' in pages['contact/index.html'].forms['msgForm']
assert 'msgForm' not in pages['contact/index.html'].uploads
for slug in ['recruitment','people-setup','hiring-support','founder-voice','career-prep','services','knowledge']:
    assert slug+'/index.html' in pages
for route in ['index.html','career-prep/index.html','contact/index.html']:
    content=(ROOT/route).read_text();assert all(term in content for term in ['₹3,999','₹5,999','one-time package','Limited-period offer']),(route,'career offer')
assert not any('₹5,000' in (ROOT/file).read_text() for file in pages)
assert not (ROOT/'src').exists() and not (ROOT/'package.json').exists()
print('PASS: five service lines, service enquiry, candidate package and internal-source boundary.')

assert 'id="motionToggle"' not in (ROOT/'index.html').read_text()
assert 'id="motionToggle"' not in (ROOT/'recruitment/index.html').read_text()
assert '/assets/video/recruitment-indian-meeting-20261028.mp4' in (ROOT/'recruitment/index.html').read_text()
assert '/assets/video/handshake-offer-20261025.mp4' in (ROOT/'index.html').read_text()
print('PASS: distinct homepage/recruitment films and removed pause controls.')

# Page-specific CSS must not change shared navigation/footer or theme tokens.
import re
source=ROOT.parent/'src'
for file in (source/'styles/pages').glob('*.css'):
    for selector in re.findall(r'([^{}]+)\{',file.read_text()):
        selector=re.sub(r'/\*.*?\*/','',selector,flags=re.S).strip()
        if selector.startswith('@'):continue
        assert all(part.strip().startswith('main') for part in selector.split(',')),(file,selector,'unscoped page style')
for route in ['index.html','services/index.html']:
    content=(ROOT/route).read_text()
    assert 'Institutional Track Record' not in content
    assert 'Median First Shortlist' not in content
    assert ('id="diagnostic"' in content) == (route == 'services/index.html')
    assert 'id="case-deconstructions"' in content
    assert 'not client case studies' in content
assert not re.search(r'--(?:forest|olive|brand-green)\s*:',(source/'styles/base.css').read_text())
print('PASS: page CSS containment, blue theme tokens and approved-content boundaries.')

assert 'data-service-explorer' not in (ROOT/'index.html').read_text()
assert 'data-service-explorer' in (ROOT/'services/index.html').read_text()
assert 'href="#services"' not in (ROOT/'index.html').read_text()
print('PASS: clean homepage, service explorer retained on Services, no stale hero anchor.')

assert 'name="team"' not in (ROOT/'index.html').read_text()
assert 'name="posh"' in (ROOT/'services/index.html').read_text()
print('PASS: HR self-check limited to Services; homepage stays clean.')

assert not any('lifetime' in (ROOT/file).read_text().lower() for file in pages)
print('PASS: no lifetime offer wording in public pages.')

assert 'for-candidates/index.html' in pages
assert 'working-examples/index.html' in pages
for slug in ['interview-scorecard','onboarding-checklist','people-health-check','founder-voice-brief']:
    assert 'working-examples/'+slug+'/index.html' in pages
    template=ROOT/'working-examples'/f'{slug}.txt'
    assert template.exists() and 'QUANTUM LEAPS' in template.read_text()
    assert 'Illustrative working sample' in (ROOT/'working-examples'/slug/'index.html').read_text()
assert 'data-hr-slider' in (ROOT/'services/index.html').read_text()
assert 'Buying preparation is not a condition' in (ROOT/'for-candidates/index.html').read_text()
print('PASS: candidate journey, downloadable sample library and guided HR check controls.')

for route in ['people-setup/index.html','hiring-support/index.html']:
    assert 'id="diagnostic"' not in (ROOT/route).read_text()
for route in ['services/index.html','knowledge/index.html','for-candidates/index.html']:
    assert 'data-ambient-motion' in (ROOT/route).read_text()
print('PASS: diagnostic discoverability and distinct animated hub backgrounds.')

# Readiness stays a transparent three-band planning aid, available on Services only.
services_html=(ROOT/'services/index.html').read_text()
assert services_html.count('data-hr-question=') == 4
assert 'data-mobile-progress' in services_html
assert 'How this readiness score works' in services_html
for claim in ['100% protection','risk insulation','THE 15% GOVERNANCE GAP','Internal peak','86–100','4-Minute Interactive Audit']:
    assert claim not in services_html,claim
assert not any('id="diagnostic"' in (ROOT/file).read_text() for file in pages if file!='services/index.html')
print('PASS: four-question diagnostic, mobile feedback, honest scoring and Services-only placement.')
