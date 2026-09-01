import csv
import json

with open('data/examples.json', encoding='utf-8') as f:
    examples = json.load(f)
words_with_examples = set(w.lower().strip() for w in examples.keys())

with open('data/朗文3000常用交流词汇.csv', encoding='utf-8') as f:
    reader = csv.reader(f)
    total = 0
    covered = 0
    missing = []
    for row in reader:
        if row and row[0].strip():
            total += 1
            word = row[0].strip()
            if word.lower() in words_with_examples:
                covered += 1
            else:
                missing.append(word)

print(f'Total: {total}')
print(f'Covered: {covered}')
print(f'Missing: {total - covered}')
print(f'Coverage: {covered/total*100:.1f}%')
print(f'\nFirst 50 missing:')
for w in missing[:50]:
    print(f'  {w}')
print(f'\n... and {len(missing) - 50} more')
