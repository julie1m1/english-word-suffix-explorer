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

batch = missing[1000:1500]
print(f'Total missing: {len(missing)}')
print(f'Processing words 1001-1500 ({len(batch)} words)')

chunk_size = 100
for i in range(0, len(batch), chunk_size):
    chunk = batch[i:i+chunk_size]
    chunk_num = i // chunk_size + 1
    filename = f'scripts/batch3_chunk{chunk_num}.json'
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(chunk, f, ensure_ascii=False, indent=2)
    print(f'Chunk {chunk_num}: {len(chunk)} words -> {filename}')
