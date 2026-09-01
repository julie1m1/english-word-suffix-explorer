import csv
import json

with open('data/examples.json', encoding='utf-8') as f:
    examples = json.load(f)

words_with_examples = set(w.lower().strip() for w in examples.keys())

with open('data/剑桥雅思词汇精典.csv', encoding='utf-8') as f:
    reader = csv.reader(f)
    csv_words = []
    for row in reader:
        if row and row[0].strip():
            csv_words.append(row[0].strip())

total = len(csv_words)
covered = sum(1 for w in csv_words if w.lower() in words_with_examples)
missing = [w for w in csv_words if w.lower() not in words_with_examples]

print(f'Total words in CSV: {total}')
print(f'Words with examples: {covered}')
print(f'Words without examples: {total - covered}')
print(f'Coverage: {covered/total*100:.1f}%')
print(f'\nFirst 50 missing words:')
for w in missing[:50]:
    print(f'  {w}')
print(f'\n... and {len(missing) - 50} more')
