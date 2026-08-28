# -*- coding: utf-8 -*-
"""
从 data/stardict.db (ECDICT) 生成 data/ipa.json
供 index 前端本地优先显示音标使用。

流程：
1. 收集 data/*.csv 全部词条（排除 Suffix_Ref.csv）
2. 直接命中 stardict 的 phonetic；未命中则用 exchange 列的 "0:" 原形标记回查
3. 把老式 DJ 记法规范化为现代 IPA（ei→eɪ、əu→əʊ、g→ɡ、非重读 i→ɪ、u→ʊ 等）
4. 输出 { "word": "/ipa/" }，键为小写，供前端本地秒查
"""
import csv
import glob
import json
import os
import re
import sqlite3
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")
OUT = os.path.join(DATA, "ipa.json")


def normalize(p: str) -> str:
    """老式 DJ 音标 → 现代 IPA。规则保守，只做几乎无歧义的替换。"""
    p = p.strip().replace(" ", "").replace("/", "")
    if not p:
        return ""
    # 基础字符替换
    p = p.replace("ә", "ə")      # 西里尔 schwa → IPA schwa
    p = p.replace("g", "ɡ")      # ASCII g → IPA ɡ
    p = p.replace(":", "ː")      # 长音符
    p = p.replace("'", "ˈ")      # 主重音
    p = p.replace(".", "ˌ")      # 次重音（DJ 记法用 .）
    # ɔi 前先合并 ɒi（老记法两种拼法都指 ɔɪ）
    p = p.replace("ɒi", "ɔɪ")
    # 双元音（顺序重要：ɑi 在 ai 之前处理）
    for old, new in [
        ("ɑi", "aɪ"), ("ai", "aɪ"),
        ("ei", "eɪ"),
        ("ɔi", "ɔɪ"),
        ("au", "aʊ"),
        ("əu", "əʊ"), ("ou", "əʊ"),
        ("iə", "ɪə"), ("juə", "jʊə"), ("uə", "ʊə"),
        ("eə", "eə"),
    ]:
        p = p.replace(old, new)
    # 长元音 əː 在该记法中一律指 ɜː（bird → bɜːd）
    p = p.replace("əː", "ɜː")
    # 短元音：非重读 i → ɪ（iː 和词尾 i 除外，happy /ˈhæpi/）；u → ʊ（uː 除外）
    p = re.sub(r"i(?!ː)(?!$)", "ɪ", p)
    p = re.sub(r"u(?!ː)(?!$)", "ʊ", p)
    # 去掉重复的相邻重音符
    p = re.sub(r"([ˈˌ])\1+", r"\1", p)
    return p


def main():
    # 1. 收集词表词汇
    words = set()
    for f in glob.glob(os.path.join(DATA, "*.csv")):
        if "Suffix" in os.path.basename(f):
            continue
        try:
            with open(f, encoding="utf-8-sig", errors="ignore") as fh:
                for row in csv.reader(fh):
                    if row and row[0] and row[1]:
                        w = row[0].strip()
                        if w:
                            words.add(w)
        except Exception:
            continue
    print(f"词表去重词条: {len(words)}")

    # 2. 读 stardict
    con = sqlite3.connect(os.path.join(DATA, "stardict.db"))
    ph, ex = {}, {}
    for w, n in con.execute(
        "SELECT word, phonetic FROM stardict "
        "WHERE phonetic IS NOT NULL AND phonetic != ''"
    ):
        ph[w.lower()] = n
    for w, e in con.execute(
        "SELECT word, exchange FROM stardict "
        "WHERE exchange IS NOT NULL AND exchange != ''"
    ):
        ex[w.lower()] = e
    con.close()
    print(f"stardict 带音标词条: {len(ph)}")

    # 3. 生成
    result = {}
    direct = inflect = 0
    for w in words:
        key = w.lower()
        if key in ph:
            p = normalize(ph[key])
            if p:
                result[key] = "/" + p + "/"
                direct += 1
                continue
        # exchange 只认 "0:" 原形标记（p:/d:/i: 等是"该词的屈折形式"，方向相反）
        for part in ex.get(key, "").split("/"):
            if part.startswith("0:"):
                base = part[2:].strip().lower()
                if base and base in ph:
                    p = normalize(ph[base])
                    if p:
                        result[key] = "/" + p + "/"
                        inflect += 1
                break

    print(f"直接命中: {direct}")
    print(f"屈折还原命中: {inflect}")
    print(f"合计写入: {len(result)} / {len(words)} "
          f"({len(result)/len(words)*100:.1f}%)")

    # 4. 输出（紧凑 JSON，键已排序）
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, separators=(",", ":"),
                  sort_keys=True)
    size = os.path.getsize(OUT)
    print(f"输出: {OUT} ({size/1024:.0f} KB)")


if __name__ == "__main__":
    sys.exit(main())
