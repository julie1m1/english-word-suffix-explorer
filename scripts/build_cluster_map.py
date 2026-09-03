# -*- coding: utf-8 -*-
"""把簇号 + 簇名 + 词 + 短语 + OOV 合并成前端可直接消费的 cluster_map.json"""
import json, sys, io, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = r"E:\99\Done upload github\默默单词分类"

with open(os.path.join(BASE, "data", "clusters.json"), encoding="utf-8") as f:
    clusters = json.load(f)  # { "0": {"words": [...]}, ... }
with open(os.path.join(BASE, "data", "cluster_names.json"), encoding="utf-8") as f:
    names = json.load(f)  # { "0": "xxx", ... }
with open(os.path.join(BASE, "data", "cluster_meta.json"), encoding="utf-8") as f:
    meta = json.load(f)  # { "phrases": [...], "oov": [...] }

# 词 -> {cluster, name}
word_map = {}

# 1. 语义簇（单词，0..99）
for c, obj in clusters.items():
    name = names.get(c, f"分类{c}")
    for w in obj["words"]:
        word_map[w] = {"cluster": int(c), "name": name}

# 2. OOV 单词 -> 其他(-1)
for w in meta["oov"]:
    word_map[w] = {"cluster": -1, "name": "其他"}

# 3. 短语 -> 短语(-2)
for w in meta["phrases"]:
    word_map[w] = {"cluster": -2, "name": "短语"}

# 簇列表（供前端渲染标签）
cluster_list = []
for c in sorted(clusters.keys(), key=lambda x: int(x)):
    cluster_list.append({
        "id": int(c),
        "name": names.get(c, f"分类{c}"),
        "count": len(clusters[c]["words"]),
    })

# 按数量降序（主题更显眼）
cluster_list.sort(key=lambda x: -x["count"])

# 短语 / 其他 放最后
cluster_list.append({"id": -2, "name": "短语", "count": len(meta["phrases"])})
cluster_list.append({"id": -1, "name": "其他", "count": len(meta["oov"])})

out = {
    "wordMap": word_map,
    "clusters": cluster_list,
}
with open(os.path.join(BASE, "data", "cluster_map.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)

print(f"词映射数: {len(word_map)}")
print(f"簇数: {len(cluster_list)}")
print("\n簇列表（按数量降序，前 25）:")
for c in cluster_list[:25]:
    print(f"  [{c['id']:3d}] {c['name']:<14} {c['count']} 词")
