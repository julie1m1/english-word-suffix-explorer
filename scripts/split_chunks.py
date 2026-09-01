import json

with open('scripts/batch1_missing.json', encoding='utf-8') as f:
    words = json.load(f)

chunk_size = 100
for i in range(0, len(words), chunk_size):
    chunk = words[i:i+chunk_size]
    chunk_num = i // chunk_size + 1
    filename = f'scripts/batch1_chunk{chunk_num}.json'
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(chunk, f, ensure_ascii=False, indent=2)
    print(f'Chunk {chunk_num}: {len(chunk)} words -> {filename}')
