document.addEventListener("DOMContentLoaded", () => {
const list = document.getElementById("post-list");
const subMenu = document.getElementById("sub-menu");
const params = new URLSearchParams(location.search);
const category = params.get("cat");
const parentParam = params.get("parent");
const subParam = params.get("sub");

// 1. 사진 메뉴 로직 (기존 기능 그대로 유지)
if (category === "photos") {
subMenu.innerHTML = '<a href="index.html?cat=photos" class="active">모든 사진</a><a href="index.html">홈으로</a>';
list.className = "photo-grid";
list.innerHTML = "";
const formats = ["jpg", "jpeg", "png", "webp", "gif"];
for (let i = 1; i <= 300; i++) {
formats.forEach(ext => {
const img = new Image();
img.src = "photos/" + i + "." + ext;
img.onload = () => {
const item = document.createElement("div");
item.className = "photo-card";
item.innerHTML = '<img src="' + img.src + '">';
item.onclick = () => location.href = "viewer.html?img=" + encodeURIComponent(img.src) + "&from=" + encodeURIComponent('index.html?cat=photos');
list.appendChild(item);
};
});
}
return;
}

// 2. 다이어리 및 일반 글 로직 (자동화 버전)
fetch("posts/index.json?v=" + new Date().getTime())
.then(r => r.json())
.then(originalPosts => {
const validPosts = originalPosts.filter(p => p && p.title);
let posts = [...validPosts];

});
