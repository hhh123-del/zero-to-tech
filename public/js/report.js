// 左侧悬浮目录大纲：扫描正文标题生成目录，左下角按钮点击展开抽屉式目录。
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

    // 切换按钮
    var toggle = document.createElement('button');
    toggle.className = 'rpt-toc-toggle';
    toggle.textContent = '☰';
    toggle.setAttribute('aria-label', '目录');

    // 遮罩层
    var overlay = document.createElement('div');
    overlay.className = 'rpt-toc-overlay';

    // 抽屉式目录
    var dock = document.createElement('div');
    dock.className = 'rpt-toc-dock';
    dock.innerHTML =
      '<div class="rpt-toc-panel">' +
        '<div class="rpt-toc-header">' +
          '<span class="rpt-toc-title">目录</span>' +
          '<button class="rpt-toc-close">✕</button>' +
        '</div>' +
        '<ul class="rpt-toc-list"></ul>' +
      '</div>';

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
        closeDock();
      });
      li.appendChild(a);
      list.appendChild(li);
      links.push(a);
    });

    document.body.appendChild(toggle);
    document.body.appendChild(overlay);
    document.body.appendChild(dock);

    function openDock() {
      dock.classList.add('open');
      overlay.classList.add('open');
      toggle.textContent = '✕';
    }

    function closeDock() {
      dock.classList.remove('open');
      overlay.classList.remove('open');
      toggle.textContent = '☰';
    }

    toggle.addEventListener('click', function () {
      if (dock.classList.contains('open')) {
        closeDock();
      } else {
        openDock();
      }
    });

    overlay.addEventListener('click', closeDock);
    dock.querySelector('.rpt-toc-close').addEventListener('click', closeDock);

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
