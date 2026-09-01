import json

with open('data/examples.json', encoding='utf-8') as f:
    existing = json.load(f)

print(f'Existing examples: {len(existing)}')

new_count = 0
for i in range(1, 6):
    filename = f'scripts/batch1_chunk{i}_examples.json'
    with open(filename, encoding='utf-8') as f:
        chunk = json.load(f)
    for word, data in chunk.items():
        key = word.lower().strip()
        if key not in existing:
            existing[key] = data
            new_count += 1
        else:
            print(f'  Skipped (already exists): {word}')

print(f'New examples added: {new_count}')
print(f'Total examples now: {len(existing)}')

with open('data/examples.json', 'w', encoding='utf-8') as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)

print('Saved to data/examples.json')
