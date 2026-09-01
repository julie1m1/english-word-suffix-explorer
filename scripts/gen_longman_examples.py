"""
Batch generate daily-life examples for Longman 3000 missing words.
Reads: data/longman3000_missing.json
Output: data/longman3000_new_examples.json (merge-safe)

Usage:
  python scripts/gen_longman_examples.py --batch 0     # generate batch 0 (words 1-50)
  python scripts/gen_longman_examples.py --batch 1     # words 51-100
  python scripts/gen_longman_examples.py --all         # generate all batches
  python scripts/gen_longman_examples.py --merge       # merge into examples.json
"""

import json
import os
import sys
import time
import argparse

BATCH_SIZE = 50
OUTPUT_FILE = "data/longman3000_new_examples.json"

SYSTEM_PROMPT = """You are a helpful English teacher creating example sentences for Chinese learners.

CRITICAL RULES:
1. These are DAILY LIFE / COMMUNICATION examples, NOT academic or IELTS style
2. Spoken: casual, first-person, everyday scenes (shopping, chatting, cooking, asking directions, texting friends). Max 12 words.
3. Written: email/social media/note style, NOT essays or academic papers. Max 18 words.
4. Do NOT use words harder than the target word itself
5. Each sentence should be natural and something a real person would actually say/write
6. The target word must be used in its most common everyday meaning

OUTPUT FORMAT (strict JSON):
{
  "word1": {"spoken": ["sentence"], "written": ["sentence"]},
  "word2": {"spoken": ["sentence"], "written": ["sentence"]},
  ...
}"""


def load_missing():
    with open("data/longman3000_missing.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return [w["word"] for w in data["words"]]


def load_existing_output():
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_output(data):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_batch(words, batch_idx):
    start = batch_idx * BATCH_SIZE
    end = min(start + BATCH_SIZE, len(words))
    return words[start:end]


def make_prompt(batch_words):
    word_list = ", ".join(batch_words)
    return f"""Generate 1 spoken + 1 written example sentence for each of these {len(batch_words)} words.

Words: {word_list}

Remember: DAILY LIFE style, casual, simple vocabulary in the sentences. Not academic."""


def merge_into_examples():
    """Merge longman3000_new_examples.json into examples.json"""
    with open("data/examples.json", "r", encoding="utf-8") as f:
        main = json.load(f)

    if not os.path.exists(OUTPUT_FILE):
        print("No new examples file found. Run generation first.")
        return

    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        new_data = json.load(f)

    added = 0
    for word, ex in new_data.items():
        key = word.lower()
        if key not in main:
            main[key] = ex
            added += 1
        else:
            # Merge: add new examples that don't already exist
            for source in ["spoken", "written"]:
                if source in ex:
                    if source not in main[key]:
                        main[key][source] = []
                    for sentence in ex[source]:
                        if sentence not in main[key][source]:
                            main[key][source].append(sentence)
                            added += 1

    with open("data/examples.json", "w", encoding="utf-8") as f:
        json.dump(main, f, ensure_ascii=False, indent=2)

    print("Merged %d new entries into examples.json (total: %d words)" % (added, len(main)))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, help="Batch index (0-based)")
    parser.add_argument("--all", action="store_true", help="Print all batch prompts")
    parser.add_argument("--merge", action="store_true", help="Merge into examples.json")
    parser.add_argument("--status", action="store_true", help="Show generation status")
    args = parser.parse_args()

    words = load_missing()

    if args.merge:
        merge_into_examples()
    elif args.status:
        existing = load_existing_output()
        total_batches = (len(words) + BATCH_SIZE - 1) // BATCH_SIZE
        print("Total missing words: %d" % len(words))
        print("Total batches: %d" % total_batches)
        print("Words generated so far: %d" % len(existing))
        print("Progress: %.1f%%" % (len(existing) / len(words) * 100))
    elif args.all:
        total_batches = (len(words) + BATCH_SIZE - 1) // BATCH_SIZE
        for i in range(total_batches):
            batch = get_batch(words, i)
            print("=== Batch %d (%d-%d) ===" % (i, i*BATCH_SIZE+1, min((i+1)*BATCH_SIZE, len(words))))
            print("Words: %s" % ", ".join(batch))
            print()
    elif args.batch is not None:
        batch = get_batch(words, args.batch)
        print("=== Batch %d: %d words ===" % (args.batch, len(batch)))
        print()
        print("SYSTEM PROMPT:")
        print(SYSTEM_PROMPT)
        print()
        print("USER PROMPT:")
        print(make_prompt(batch))
        print()
        print("Word list: %s" % ", ".join(batch))
    else:
        parser.print_help()
