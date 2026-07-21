import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
function sha(p){return createHash('sha256').update(readFileSync(p)).digest('hex')}
function walk(dir){let out=[]; for(const n of readdirSync(dir)){const p=join(dir,n); const s=statSync(p); if(s.isDirectory()) out=out.concat(walk(p)); else if(s.isFile()) out.push(p)} return out}
const errors=[]
const required=['VERSION.json','00-START-HERE.md','32-CUR-20-A04-CANONICAL-INCEPTION-OVERLAY.md','.project-ops/02-CURRENT-STATE.json','atlas/atlas.json','atlas/resource-map.json','atlas/resource-protection-register.json','atlas/legacy-phase-crosswalk.json','working-memory/PumpkinCMS_Chat_Working_Memory_Master_v1.0.0.md','generated/CHAT-PACK.md','generated/CHAT-PACK.manifest.json','package-manifest.json','CHECKSUMS.sha256']
for(const r of required){try{statSync(join(ROOT,r))}catch{errors.push('missing required file: '+r)}}
const parsed={}
for(const p of walk(ROOT).filter(p=>p.endsWith('.json'))){try{parsed[relative(ROOT,p).replaceAll('\\','/')]=JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''))}catch(e){errors.push('JSON parse failed '+relative(ROOT,p)+': '+e.message)}}
if(parsed['VERSION.json']?.packageVersion!=='4.0.0') errors.push('VERSION packageVersion mismatch')
if(parsed['atlas/atlas.json']?.atlasVersion!=='4.0.0') errors.push('atlasVersion mismatch')
const manifest=parsed['package-manifest.json']||{}
if(manifest.version!=='4.0.0') errors.push('manifest version mismatch')
if(manifest.fileCount!==(manifest.files||[]).length) errors.push('manifest fileCount mismatch')
for(const e of manifest.files||[]){const p=join(ROOT,e.path); try{const b=readFileSync(p); if(sha(p)!==e.sha256 || b.length!==e.bytes) errors.push('manifest mismatch: '+e.path)}catch{errors.push('manifest missing: '+e.path)}}
for(const line of readFileSync(join(ROOT,'CHECKSUMS.sha256'),'utf8').split(/\r?\n/).filter(Boolean)){const [d,r]=line.split('  '); const p=join(ROOT,r); try{if(sha(p)!==d) errors.push('checksum mismatch: '+r)}catch{errors.push('checksum missing: '+r)}}
for(const p of walk(ROOT)){const rel=relative(ROOT,p).replaceAll('\\','/').toLowerCase(); if(rel.endsWith('.zip')||rel.includes('__pycache__')||rel.includes('/node_modules/')||rel.includes('/.next/')) errors.push('forbidden artifact: '+rel)}
if(errors.length){console.log('PACKAGE VALIDATION FAILED'); for(const e of errors) console.log('- '+e); process.exit(1)}
console.log('PACKAGE VALIDATION PASSED: '+walk(ROOT).length+' files')
