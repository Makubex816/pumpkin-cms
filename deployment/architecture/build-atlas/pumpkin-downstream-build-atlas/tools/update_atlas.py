#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import argparse
import json
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
ATLAS = ROOT / 'atlas' / 'atlas.json'
MILESTONES = ROOT / 'atlas' / 'milestone-ledger.json'
CHANGELOG = ROOT / 'atlas' / 'CHANGELOG.md'

parser = argparse.ArgumentParser(description='Append a validated milestone update to the proposed bridge Atlas.')
parser.add_argument('update_json', type=Path)
args = parser.parse_args()
update = json.loads(args.update_json.read_text(encoding='utf-8'))
required = {'milestoneId', 'title', 'buildPath', 'status', 'evidenceRefs', 'nextGate'}
missing = sorted(required - update.keys())
if missing:
    raise SystemExit(f'Missing fields: {missing}')
ledger = json.loads(MILESTONES.read_text(encoding='utf-8'))
items = ledger.setdefault('milestones', [])
for index, item in enumerate(items):
    if item.get('milestoneId') == update['milestoneId']:
        items[index] = {**item, **update}
        break
else:
    items.append(update)
now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
ledger['updatedAt'] = now
MILESTONES.write_text(json.dumps(ledger, indent=2) + '\n', encoding='utf-8', newline='\n')
atlas = json.loads(ATLAS.read_text(encoding='utf-8'))
atlas['generatedAt'] = now
atlas['nextGate'] = update['nextGate']
ATLAS.write_text(json.dumps(atlas, indent=2) + '\n', encoding='utf-8', newline='\n')
with CHANGELOG.open('a', encoding='utf-8', newline='\n') as handle:
    handle.write(f'\n- {now}: `{update["milestoneId"]}` → `{update["status"]}`; next: {update["nextGate"]}\n')
print(f'Updated {update["milestoneId"]}')
