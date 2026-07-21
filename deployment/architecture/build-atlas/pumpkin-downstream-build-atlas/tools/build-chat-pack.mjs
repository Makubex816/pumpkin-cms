import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const out=join(ROOT,'generated/CHAT-PACK.md')
const manifest=join(ROOT,'generated/CHAT-PACK.manifest.json')
const sources=['00-START-HERE.md','32-CUR-20-A04-CANONICAL-INCEPTION-OVERLAY.md','.project-ops/00-OPERATING-CONTRACT.md','.project-ops/01-PROJECT-ARCHITECTURE.md','.project-ops/02-CURRENT-STATE.json','.project-ops/03-CURRENT-PHASE.yaml','.project-ops/04-EVIDENCE-INDEX.json','.project-ops/05-RESUMPTION-CAPSULE.md','.project-ops/08-VALIDATION-MATRIX.yaml','.project-ops/11-NEXT-PHASE-MAP.md','atlas/ATLAS.md','atlas/atlas.json','atlas/resource-protection-register.json','atlas/upstream-intake-state.json','atlas/lanes.json','working-memory/PumpkinCMS_Chat_Working_Memory_Master_v1.0.0.md']
function sha(b){return createHash('sha256').update(b).digest('hex')}
let text='# PumpkinCMS Current-System Chat Pack v4.0.0\n\nStartup protocol: read this pack before acting. Report `READY`, `READY_WITH_WARNINGS`, or `BLOCKED`; then name active authority, hard stops, preserved dirty-worktree boundary, latest runtime/read-only evidence, successor lanes, and first safe gate.\n\nThis pack is generated from the canonical Build Atlas v4.0.0 and does not authorize runtime mutations.\n\n---\n'
const entries=[]
for(const rel of sources){const b=readFileSync(join(ROOT,rel)); entries.push({path:rel,sha256:sha(b),bytes:b.length}); text+='\n# SOURCE: `'+rel+'`\n\n'+b.toString('utf8')+'\n---\n'}
mkdirSync(dirname(out),{recursive:true}); writeFileSync(out,text,'utf8')
const outBuf=readFileSync(out)
writeFileSync(manifest,JSON.stringify({packVersion:'4.0.0',generatedAt:'2026-07-21T03:05:00Z',status:'CUR20_A04_CANONICAL_ATLAS_CHAT_PACK',sources:entries,output:{path:'generated/CHAT-PACK.md',sha256:sha(outBuf),bytes:statSync(out).size}},null,2)+'\n','utf8')
console.log(out)
