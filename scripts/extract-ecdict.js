/**
 * ECDICT 例句提取脚本
 * 提取 definition 字段中 > 标记的例句
 */

const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/stardict.db");
const LIST_PATH = path.join(__dirname, "../data/list.json");
const OUTPUT_PATH = path.join(__dirname, "../data/ecdict-examples.json");

function getAllWords() {
  const list = JSON.parse(fs.readFileSync(LIST_PATH, "utf8"));
  const words = new Set();
  const csvFiles = list.vocabs.filter((n) => n.endsWith(".csv"));
  for (const file of csvFiles) {
    const csvPath = path.join(__dirname, "../data", file);
    if (!fs.existsSync(csvPath)) continue;
    const lines = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
    for (const line of lines) {
      const word = line.split(",")[0]?.trim().toLowerCase();
      if (word && /^[a-z]/.test(word)) words.add(word);
    }
  }
  return [...words];
}

async function extractExamples() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ 找不到 ${DB_PATH}`);
    process.exit(1);
  }

  console.log("📖 正在读取词库列表...");
  const words = getAllWords();
  console.log(`   共 ${words.length} 个单词`);

  console.log("📦 正在加载 ECDICT 数据库...");
  const SQL = await initSqlJs();
  const dbBuffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(dbBuffer);

  const results = {};
  let found = 0;

  const BATCH = 500;
  for (let i = 0; i < words.length; i += BATCH) {
    const batch = words.slice(i, i + BATCH);
    const placeholders = batch.map(() => "?").join(",");
    const stmt = db.prepare(
      `SELECT word, definition FROM stardict WHERE word IN (${placeholders})`
    );
    stmt.bind(batch);

    while (stmt.step()) {
      const row = stmt.getAsObject();
      const w = row.word?.toLowerCase();
      const def = row.definition || "";

      // 提取 > 开头的例句
      const examples = [];
      const lines = def.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith(">")) {
          const ex = trimmed.replace(/^>\s*/, "").trim();
          if (ex.length > 10 && ex.length < 200) {
            examples.push(ex);
          }
        }
      }

      if (examples.length > 0) {
        results[w] = { ec: examples.slice(0, 3) };
        found++;
      }
    }
    stmt.free();
    process.stdout.write(`   已处理 ${Math.min(i + BATCH, words.length)}/${words.length}\r`);
  }

  db.close();

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf8");
  console.log(`\n✅ 完成！`);
  console.log(`   总单词: ${words.length}`);
  console.log(`   有例句: ${found} (${((found / words.length) * 100).toFixed(1)}%)`);
  console.log(`   输出: ${OUTPUT_PATH}`);
}

extractExamples().catch((err) => {
  console.error("❌ 错误:", err.message);
  process.exit(1);
});
