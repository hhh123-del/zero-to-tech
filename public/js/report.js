// 左侧悬浮目录大纲：扫描正文标题生成目录，鼠标移到左边缘自动展开。
(function () {
  function initToc() {
    var container = document.querySelector('.markdown-preview');
    if (!container) return;

    var headings = Array.prototype.slice.call(
      container.querySelectorAll('h2, h3, h4')
    );
    if (headings.length === 0) return;

    // 给没有 id 的标题补一个，保证能锚点定位。
    headings.forEach(function (h, i) {
      if (!h.id) h.id = 'rpt-toc-' + i;
    });

    var dock = document.createElement('div');
    dock.className = 'rpt-toc-dock';
    dock.innerHTML =
      '<div class="rpt-toc-panel">' +
        '<div class="rpt-toc-title">目录</div>' +
        '<ul class="rpt-toc-list"></ul>' +
      '</div>' +
      '<div class="rpt-toc-handle" title="目录大纲"></div>';

    var list = dock.querySelector('.rpt-toc-list');
    var links = [];

    headings.forEach(function (h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'rpt-toc-item';
      a.setAttribute('data-level', h.tagName.slice(1));
      a.setAttribute('href', '#' + h.id);
      a.textContent = h.textContent.replace(/\s+/g, ' ').trim();
      a.addEventListener('click', function (e) {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.innerWidth <= 640) {
          dock.classList.remove('rpt-toc-dock--pinned');
        }
      });
      li.appendChild(a);
      list.appendChild(li);
      links.push(a);
    });

    document.body.appendChild(dock);

    // 点击把手可固定展开/收起（触屏也靠它）。
    dock
      .querySelector('.rpt-toc-handle')
      .addEventListener('click', function () {
        dock.classList.toggle('rpt-toc-dock--pinned');
      });

    // scrollspy：滚动时高亮当前章节。
    var linkByHeading = {};
    headings.forEach(function (h, i) {
      linkByHeading[h.id] = links[i];
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.remove('rpt-toc-item--active');
          });
          var link = linkByHeading[entry.target.id];
          if (link) link.classList.add('rpt-toc-item--active');
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    headings.forEach(function (h) {
      observer.observe(h);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToc);
  } else {
    initToc();
  }
})();
