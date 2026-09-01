import json
import os

for i in range(1, 6):
    f = f'scripts/longman1_chunk{i}_examples.json'
    if os.path.exists(f):
        data = json.load(open(f, encoding='utf-8'))
        print(f'chunk{i}: {len(data)} words')
    else:
        print(f'chunk{i}: NOT FOUND')
