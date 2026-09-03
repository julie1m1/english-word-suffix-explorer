# -*- coding: utf-8 -*-
"""
Vocab Lab Omni（目标项目）语义聚类：
- 读取 data/list.json 里的 54 本词书 CSV，合并去重（小写）
- 短语（含空格/连字符/斜杠/其他标点）→ 归「短语」，不参与聚类
- 单词 → GloVe 100d 向量 → 标准 K-Means（X=100，随机种子固定）
- OOV 单词 → 归「其他」
- 输出 data/clusters.json、data/cluster_report.txt、data/cluster_meta.json
"""
import csv, json, sys, io, os
import numpy as np
from sklearn.cluster import KMeans
from collections import defaultdict

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = r"E:\99\Done upload github\默默单词分类"
GLOVE = os.path.join(BASE, "glove.6B.100d.txt")
X = 100
SEED = 42


def is_phrase(w):
    return (
        (" " in w)
        or ("..." in w)
        or ("-" in w)
        or ("/" in w)
        or any(not c.isalnum() and c not in ".'" for c in w)
    )


# ---- 1. 读词书，合并去重（小写） ----
list_path = os.path.join(BASE, "data", "list.json")
with open(list_path, encoding="utf-8") as f:
    list_data = json.load(f)
csvs = [v for v in list_data["vocabs"] if v.endswith(".csv")]

words_map = {}  # lower -> original（保留首个原形）
for name in csvs:
    p = os.path.join(BASE, "data", name)
    if not os.path.exists(p):
        continue
    with open(p, encoding="utf-8", errors="ignore") as f:
        for row in csv.reader(f):
            if not row:
                continue
            w = row[0].strip()
            if not w:
                continue
            words_map.setdefault(w.lower(), w)

print(f"合并去重后词条数: {len(words_map)}")

# ---- 2. 短语 vs 单词 ----
phrases = {}  # lower -> original
singles = {}  # lower -> original
for lw, ow in words_map.items():
    (phrases if is_phrase(ow) else singles)[lw] = ow
print(f"短语数: {len(phrases)}")
print(f"单词数: {len(singles)}")

# ---- 3. GloVe 匹配单词 ----
def variants(w):
    vs = set()
    vs.add(w)
    low = w.lower()
    vs.add(low)
    no_punct = "".join(ch for ch in low if ch.isalnum())
    if no_punct:
        vs.add(no_punct)
    return vs

need = {}
for lw in singles:
    for v in variants(lw):
        need.setdefault(v, []).append(lw)

vec_map = {}
with open(GLOVE, encoding="utf-8") as f:
    for line in f:
        parts = line.rstrip("\n").split(" ")
        token = parts[0]
        if token in need:
            try:
                vec = np.array([float(x) for x in parts[1:]], dtype=np.float32)
                vec_map[token] = vec
            except Exception:
                pass
print(f"GloVe 命中向量数: {len(vec_map)}")

word_vec = {}  # lower -> vector
oov = []       # lower（OOV 单词）
for lw in singles:
    got = None
    for v in variants(lw):
        if v in vec_map:
            got = vec_map[v]
            break
    if got is not None:
        word_vec[lw] = got
    else:
        oov.append(lw)
print(f"有向量单词数: {len(word_vec)}")
print(f"OOV 单词数: {len(oov)}")

# ---- 4. L2 归一化 ----
keys = list(word_vec.keys())
M = np.vstack([word_vec[k] for k in keys]).astype(np.float32)
norms = np.linalg.norm(M, axis=1, keepdims=True)
norms[norms == 0] = 1.0
M = M / norms
print(f"向量矩阵: {M.shape}")

# ---- 5. K-Means ----
kmeans = KMeans(n_clusters=X, random_state=SEED, n_init=10, max_iter=300)
labels = kmeans.fit_predict(M)
print("K-Means 完成")

# ---- 6. 数量分布 + 代表词 ----
cluster_words = defaultdict(list)
for i, k in enumerate(keys):
    cluster_words[int(labels[i])].append(k)

centers = kmeans.cluster_centers_
centers_norm = centers / (np.linalg.norm(centers, axis=1, keepdims=True) + 1e-9)
sizes = {c: len(cluster_words[c]) for c in range(X)}
print("\n各簇数量（排序）:")
for c in sorted(sizes, key=lambda x: -sizes[x]):
    print(f"  cluster {c:3d}: {sizes[c]} 词")

# ---- 7. clusters.json ----
out = {}
for c in range(X):
    out[c] = {"words": sorted(cluster_words[c])}
with open(os.path.join(BASE, "data", "clusters.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

# ---- 8. 报告（每簇 top-30 代表词）----
def top_words(c, n=30):
    idxs = [i for i in range(len(keys)) if int(labels[i]) == c]
    sub = M[idxs]
    sims = sub @ centers_norm[c]
    order = np.argsort(-sims)
    return [keys[idxs[o]] for o in order[:n]]

with open(os.path.join(BASE, "data", "cluster_report.txt"), "w", encoding="utf-8") as f:
    for c in sorted(sizes, key=lambda x: -sizes[x]):
        f.write(f"\n===== Cluster {c}  ({sizes[c]} 词) =====\n")
        f.write(", ".join(top_words(c, 30)) + "\n")

# ---- 9. 元数据（短语 + OOV 词，供 build_cluster_map 用）----
meta = {
    "phrases": sorted(phrases.keys()),
    "oov": sorted(oov),
}
with open(os.path.join(BASE, "data", "cluster_meta.json"), "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=1)

print("\n已写出 data/clusters.json / cluster_report.txt / cluster_meta.json")
