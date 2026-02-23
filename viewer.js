document.addEventListener("DOMContentLoaded", () => {
  if (!sessionStorage.getItem("auth")) {
    location.href = "login.html";
    return;
  }

  const q = new URLSearchParams(location.search);
  const postUrl = q.get("post");
  const img = q.get("img");
  
  let rawPath = q.get("from") || "index.html";
  const fromPath = rawPath.startsWith("?") ? "index.html" + rawPath : rawPath;

  const container = document.getElementById("post");
  const sidebar = document.getElementById("sidebar");

  let backText = "← 돌아가기";
  if (fromPath.includes("cat=photos")) {
    backText = "← Photos로 돌아가기";
  } else if (fromPath.includes("sub=")) {
    const subName = decodeURIComponent(fromPath.split("sub=")[1].split("&")[0]);
    backText = `← ${subName}로 돌아가기`;
  } else if (fromPath.includes("cat=diary")) {
    backText = "← Diary 전체로 돌아가기";
  } else {
    backText = "← Home으로 돌아가기";
  }

  if (img) {
    sidebar.innerHTML = `<a href="${fromPath}" class="active">${backText}</a>`;
    container.innerHTML = `<div class="post-view"><div class="img-wrap"><img src="${img}" class="zoomable"></div><div style="margin-top:20px;"><a class="back-btn" href="${fromPath}">${backText}</a></div></div><div id="imgModal" class="img-modal"><img id="modalImg"></div>`;
    
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");
    document.querySelector(".zoomable").onclick = e => {
      modal.style.display = "flex";
      modalImg.src = e.target.src;
    };
    modal.onclick = () => modal.style.display = "none";
    return;
  }

  if (!postUrl) {
    container.innerHTML = "잘못된 접근입니다.";
    return;
  }

  fetch(postUrl)
    .then(res => res.json())
    .then(p => {
      const images = Array.isArray(p.images) ? p.images.map(i => `<div class="img-wrap"><img src="${i}" class="zoomable"></div>`).join("") : "";
      const loadContent = p.text ? fetch(p.text).then(r => r.text()) : Promise.resolve(p.content || "");

      loadContent.then(txt => {
        const content = txt.replace(/\n/g, "<br>");
        sidebar.innerHTML = `<a href="${fromPath}" class="active">${backText}</a>`;
        
        container.innerHTML = `
          <article class="post-view">
            <h1 class="post-title">${p.title}</h1>
            <div class="meta">${p.date}</div>
            ${images}
            <div class="post-content">${content}</div>
            <div id="series-nav" style="margin-top:40px; display:flex; justify-content:space-between; gap:10px;"></div>
            <div style="margin-top:20px;"><a class="back-btn" href="${fromPath}">${backText}</a></div>
          </article>
          <div id="imgModal" class="img-modal"><img id="modalImg"></div>`;

        fetch("posts/index.json?v=" + Date.now())
          .then(res => res.json())
          .then(allPosts => {
            const hasSub = fromPath.includes("sub=");
            if (!hasSub) return;

            const currentSubFromUrl = decodeURIComponent(fromPath.split("sub=")[1].split("&")[0]).replace(/\s/g, "").toLowerCase();

            // 정렬 로직 수정: 날짜 대신 파일 이름(file) 순으로 정렬
            const seriesPosts = allPosts
              .filter(item => {
                if (!item.sub) return false;
                const itemSubClean = item.sub.replace(/\s/g, "").toLowerCase();
                return itemSubClean.includes(currentSubFromUrl) || currentSubFromUrl.includes(itemSubClean);
              })
              .sort((a, b) => {
                const nameA = (a.file || "").toLowerCase();
                const nameB = (b.file || "").toLowerCase();
                return nameA < nameB ? -1 : (nameA > nameB ? 1 : 0);
              });

            const currentIndex = seriesPosts.findIndex(item => `posts/${item.file}.json` === postUrl);

            const navContainer = document.getElementById("series-nav");
            if (currentIndex !== -1 && seriesPosts.length > 1) {
              const unit = "화"; 
              
              let navHtml = "";
              if (currentIndex > 0) {
                const prev = seriesPosts[currentIndex - 1];
                const prevUrl = `viewer.html?post=posts/${prev.file}.json&from=${encodeURIComponent(q.get("from") || "index.html")}`;
                navHtml += `<a href="${prevUrl}" class="back-btn" style="flex:1; text-align:center;">← 이전 ${unit}</a>`;
              } else {
                navHtml += `<div style="flex:1;"></div>`;
              }

              if (currentIndex < seriesPosts.length - 1) {
                const next = seriesPosts[currentIndex + 1];
                const nextUrl = `viewer.html?post=posts/${next.file}.json&from=${encodeURIComponent(q.get("from") || "index.html")}`;
                navHtml += `<a href="${nextUrl}" class="back-btn" style="flex:1; text-align:center;">다음 ${unit} →</a>`;
              } else {
                navHtml += `<div style="flex:1;"></div>`;
              }
              navContainer.innerHTML = navHtml;
            }
          });

        const modal = document.getElementById("imgModal");
        const modalImg = document.getElementById("modalImg");
        document.querySelectorAll(".zoomable").forEach(imgEl => {
          imgEl.onclick = () => { modal.style.display = "flex"; modalImg.src = imgEl.src; };
        });
        modal.onclick = () => { modal.style.display = "none"; };
      });
    });
});
