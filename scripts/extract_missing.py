import csv
import json

with open('data/examples.json', encoding='utf-8') as f:
    examples = json.load(f)

words_with_examples = set(w.lower().strip() for w in examples.keys())

with open('data/剑桥雅思词汇精典.csv', encoding='utf-8') as f:
    reader = csv.reader(f)
    missing = []
    for row in reader:
        if row and row[0].strip():
            word = row[0].strip()
            definition = row[1].strip() if len(row) > 1 else ''
            if word.lower() not in words_with_examples:
                missing.append({'word': word, 'def': definition})

batch = missing[:500]
print(f'Total missing: {len(missing)}')
print(f'Processing first {len(batch)} words')

with open('scripts/batch1_missing.json', 'w', encoding='utf-8') as f:
    json.dump(batch, f, ensure_ascii=False, indent=2)

print('Saved to scripts/batch1_missing.json')
