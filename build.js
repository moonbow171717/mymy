const fs = require("fs");
const path = require("path");

const postsDir = path.join(__dirname, "posts");

// 폴더가 없으면 생성
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);

const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith(".json") && file !== "index.json");

const index = [];

files.forEach(file => {
  const fullPath = path.join(postsDir, file);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

  index.push({
    title: data.title,
    date: data.date,
    category: data.category,
    sub: data.sub || "잡담",
    excerpt: data.excerpt || "내용 보기",
    file: file.replace(".json", "") // 파일명 저장
  });
});

// 파일명 순 정렬
index.sort((a, b) => (a.file < b.file ? -1 : 1));

fs.writeFileSync(
  path.join(postsDir, "index.json"),
  JSON.stringify(index, null, 2)
);

console.log("index.json generated successfully!");
