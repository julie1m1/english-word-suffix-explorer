import json

with open('data/examples.json', encoding='utf-8') as f:
    data = json.load(f)

samples = ['abolish', 'accommodate', 'anticipate', 'advocate', 'arouse', 'assert', 'attain', 'adhere']
for w in samples:
    if w in data:
        spoken = data[w]['spoken'][0]
        written = data[w]['written'][0]
        print(f'[{w}]')
        print(f'  spoken: {spoken}')
        print(f'  written: {written}')
        print()
