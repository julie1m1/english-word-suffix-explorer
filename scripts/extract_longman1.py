import csv
import json

with open('data/examples.json', encoding='utf-8') as f:
    examples = json.load(f)
words_with_examples = set(w.lower().strip() for w in examples.keys())

with open('data/朗文3000常用交流词汇.csv', encoding='utf-8') as f:
    reader = csv.reader(f)
    missing = []
    for row in reader:
        if row and row[0].strip():
            word = row[0].strip()
            definition = row[1].strip() if len(row) > 1 else ''
            if word.lower() not in words_with_examples:
                missing.append({'word': word, 'def': definition})

print(f'Total missing: {len(missing)}')

batch = missing[:500]
print(f'Processing first {len(batch)} words')

chunk_size = 100
for i in range(0, len(batch), chunk_size):
    chunk = batch[i:i+chunk_size]
    chunk_num = i // chunk_size + 1
    filename = f'scripts/longman1_chunk{chunk_num}.json'
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(chunk, f, ensure_ascii=False, indent=2)
    print(f'Chunk {chunk_num}: {len(chunk)} words -> {filename}')
