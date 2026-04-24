#!/usr/bin/env python3
"""Merge theory blocks from theory_source.json into data/*.json by lesson title."""
import json
import os
import glob

ROOT = os.path.dirname(__file__)
DATA = os.path.join(ROOT, 'data')
THEORY_PATH = os.path.join(ROOT, 'theory_source.json')

with open(THEORY_PATH, encoding='utf-8') as f:
    THEORY = json.load(f)

files = glob.glob(os.path.join(DATA, '*.json'))
updated = 0

for fpath in sorted(files):
    with open(fpath, encoding='utf-8') as f:
        data = json.load(f)
    title = data.get('title', '')
    if title in THEORY:
        data['theory'] = THEORY[title]
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  OK {title}")
        updated += 1
    else:
        print(f"  ? No theory template for: {title}")

print(f"\nUpdated {updated}/{len(files)} files.")
