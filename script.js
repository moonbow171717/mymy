document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn) {
    menuBtn.onclick = () => { sidebar.classList.toggle("open"); };
  }

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const parentParam = params.get("parent");
  const subParam = params.get("sub");

  if (category === "photos") {
    subMenu.innerHTML = `<a href="index.html?cat=photos" class="active">모든 사진</a><a href="index.html">홈으로</a>`;
    list.className = "photo-grid";
    list.innerHTML = "";
    const formats = ["jpg","jpeg","png","webp","gif"];
    for (let i = 1; i <= 300; i++) {
      formats.forEach(ext => {
        const img = new Image();
        img.src = `photos/${i}.${ext}`;
        img.onload = () => {
          const item = document.createElement("div");
          item.className = "photo-card";
          item.innerHTML = `<img src="${img.src}">`;
          item.onclick = () => location.href = `viewer.html?img=${encodeURIComponent(img.src)}&from=${encodeURIComponent('index.html?cat=photos')}`;
          list.appendChild(item);
        };
      });
    }
    return;
  }

  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title);
      let posts = [...validPosts];

      if (category === "diary") {
        // --- 여기서부터 사용자님의 실제 메뉴 구조입니다 ---
        const menuStructure = [
          { name: "냐람", subs: ["연애 포기 각서", "홈 스윗 홈", "러브 콤플렉스", "구원의 구원", "지구 열 바퀴", "NR"] },
          { name: "냐쥬", subs: ["순애보증수표", "대타위기사랑", "NJ"] },
          { name: "쥬얀", subs: ["양의 종말", "시시콜콜한 마음", "JA"] },
          { name: "댠닺", subs: ["Private", "DD"] },
          { name: "글", subs: ["성간운", "5/10", "일상", "카페"] },
          { name: "원작", subs: ["Denied Love"] },
          { name: "끄적끄적", subs: ["잡담"] }
        ];

        let menuHtml = `<a href="index.html?cat=diary" class="${!parentParam && !subParam ? 'active' : ''}">전체 기록</a>`;
        menuStructure.forEach(m => {
          const isParentActive = (parentParam === m.name);
          menuHtml += `
            <div style="margin-top:12px;">
              <div class="menu-toggle" style="font-weight:bold; color:#fff; cursor:pointer;" 
                   onclick="const next = this.nextElementSibling; next.style.display = (next.style.display === 'none' ? 'block' : 'none');">
                ${m.name}
              </div>
              <div class="sub-list" style="display: ${isParentActive ? 'block' : 'none'};">
                ${m.subs.map(s => `
                  <a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}&sub=${encodeURIComponent(s)}" 
                     class="${subParam === s ? 'active' : ''}">${s}</a>
                `).join('')}
              </div>
            </div>`;
        });
        subMenu.innerHTML = menuHtml;
        // ----------------------------------------------
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      if (category) posts = posts.filter(p => p.category === category);
      if (subParam) posts = posts.filter(p => p.sub === subParam);
      else if (parentParam) posts = posts.filter(p => p.parent === parentParam);

      // 파일명(file) 순으로 정렬
      posts.sort((a, b) => (a.file < b.file ? -1 : 1));

      list.innerHTML = "";
      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;
        item.onclick = () => {
          let fromPath = location.search ? `index.html${location.search}` : "index.html";
          location.href = `viewer.html?post=posts/${p.file}.json&from=${encodeURIComponent(fromPath)}`;
        };
        list.appendChild(item);
      });
    });
});
