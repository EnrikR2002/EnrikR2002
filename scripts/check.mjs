import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data=JSON.parse(fs.readFileSync(path.join(root,'portfolio.json'),'utf8'));
let checked=0;
const visit=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?visit(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const files=visit(path.join(root,'docs'));
for(const file of files.filter(f=>f.endsWith('.html'))) {
  const source=fs.readFileSync(file,'utf8');
  assert.ok(source.includes('lang="en"')&&source.includes('<meta name="viewport"'));
  assert.ok(!source.includes('undefined'),'Broken placeholder in '+file);
  assert.equal((source.match(/<h1[ >]/g)||[]).length,1);
  const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,'Duplicate element ID in '+file);
  for(const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const ref=match[1].replaceAll('&amp;','&');
    if(/^(?:https?:|mailto:|data:)/.test(ref)) continue;
    const [relative,hash]=ref.split('#');
    let target=relative?path.resolve(path.dirname(file),relative):file;
    if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
    assert.ok(fs.existsSync(target),'Missing target '+ref+' in '+file);
    assert.ok(target.startsWith(path.join(root,'docs')),'Link escapes published directory');
    if(hash&&target.endsWith('.html'))assert.ok(fs.readFileSync(target,'utf8').includes(`id="${hash}"`),'Missing anchor '+ref);
  }
  assert.ok(!/<script[^>]+src="https?:/.test(source),'External script dependency');
  checked++;
}
const homepage=fs.readFileSync(path.join(root,'docs/index.html'),'utf8');
assert.equal((homepage.match(/data-project data-category=/g)||[]).length,26);
assert.equal((homepage.match(/class="feature"/g)||[]).length,6);
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
for(const project of data.projects){
  assert.ok(readme.includes(project.name),'Project missing from profile: '+project.name);
  assert.ok(fs.existsSync(path.join(root,'docs/projects',project.id,'index.html')));
  if(project.sourceVisibility==='Private')assert.equal(project.source,null);
}
assert.ok(!readme.includes('587-500-3305'));
assert.ok(!homepage.includes('docs.google.com/document'));
assert.equal(checked,27);

// Exercise the actual interaction code with a small DOM fixture. No browser is required.
class Element {
  constructor(dataset={}){this.dataset=dataset;this.listeners={};this.attributes={};this.hidden=false;this.value='';this.textContent='';this.tagName='DIV';}
  addEventListener(name,callback){this.listeners[name]=callback;}
  setAttribute(name,value){this.attributes[name]=value;}
  fire(name,event={}){return this.listeners[name]?.(event);}
  focus(){document.activeElement=this;}
}
const search=new Element();search.tagName='INPUT';
const filters=['all','Web app','Mobile app','Automation','Research','Game','Developer tooling','Coursework'].map(value=>new Element({filter:value}));
const cards=data.projects.map(p=>new Element({category:p.category,search:[p.name,p.summary,p.category,p.stage,...p.stack].join(' ').toLowerCase()}));
const counter=new Element(),empty=new Element(),reset=new Element(),copy=new Element({copyDiscord:data.person.discord}),notice=new Element();
const directory=new Element();directory.querySelectorAll=()=>cards;
const selectors={'[data-project-directory]':directory,'#project-search':search,'[data-result-count]':counter,'[data-empty]':empty,'[data-reset]':reset,'[data-copy-discord]':copy,'[data-copy-notice]':notice};
const document={activeElement:new Element(),listeners:{},querySelector:s=>selectors[s]||null,querySelectorAll:s=>s==='[data-filter]'?filters:[],addEventListener(name,callback){this.listeners[name]=callback;}};
let copied='',writtenUrl='';
const context={document,URLSearchParams,location:{search:'?category=Research&q=weather',pathname:'/EnrikR2002/',hash:'#projects'},history:{replaceState(a,b,url){writtenUrl=url;}},navigator:{clipboard:{async writeText(text){copied=text;}}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'site/site.js'),'utf8'),context);
assert.equal(cards.filter(c=>!c.hidden).length,2);
assert.equal(filters.find(f=>f.dataset.filter==='Research').attributes['aria-pressed'],'true');
search.value='';filters.find(f=>f.dataset.filter==='Mobile app').fire('click');
assert.equal(cards.filter(c=>!c.hidden).length,2);
search.value='FiReBaSe';search.fire('input');
assert.equal(cards.filter(c=>!c.hidden).length,1);
assert.equal(counter.textContent,'1 project');
assert.ok(writtenUrl.includes('category=Mobile+app'));
search.value='no-such-project';search.fire('input');
assert.equal(counter.textContent,'0 projects');assert.equal(empty.hidden,false);
reset.fire('click');assert.equal(cards.filter(c=>!c.hidden).length,26);assert.equal(empty.hidden,true);
let prevented=false;document.activeElement=new Element();document.listeners.keydown({key:'/',preventDefault(){prevented=true;}});
assert.equal(prevented,true);assert.equal(document.activeElement,search);
search.value='Next.js';search.fire('input');document.listeners.keydown({key:'Escape'});assert.equal(search.value,'');
await copy.fire('click');assert.equal(copied,data.person.discord);assert.equal(notice.textContent,'Discord username copied.');
console.log(`Checked ${checked} HTML pages, all local links and anchors, profile coverage, private-source boundaries, filters, search, keyboard controls, and Discord copy.`);
