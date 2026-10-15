// 中国传统文化展示 - 路由与主逻辑

const App = {
  currentPage: 'cover',
  historyStack: [], // 页面历史栈：navigate 压栈，goBack 弹栈
  favorites: JSON.parse(localStorage.getItem('trad_favorites') || '[]'),

  init() {
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  isFavorited(workId) {
    return this.favorites.includes(workId);
  },

  toggleFavorite(workId) {
    if (this.isFavorited(workId)) {
      this.favorites = this.favorites.filter(id => id !== workId);
    } else {
      this.favorites.push(workId);
    }
    localStorage.setItem('trad_favorites', JSON.stringify(this.favorites));
  },

  // ===== 详情页收藏切换：同步右上角爱心 + 底部收藏按钮 =====
  toggleDetailFav(workId) {
    this.toggleFavorite(workId);
    const page = document.getElementById('page-detail');
    if (!page) return;
    const fav = this.isFavorited(workId);

    // 右上角爱心
    const topBtn = page.querySelector('.detail-top-right .detail-nav-btn');
    if (topBtn) {
      topBtn.classList.toggle('liked', fav);
      const topSvg = topBtn.querySelector('svg');
      if (topSvg) topSvg.setAttribute('fill', fav ? 'currentColor' : 'none');
    }

    // 底部收藏按钮
    const bottomBtn = page.querySelector('.detail-bottom-bar .bottom-action-btn');
    if (bottomBtn) {
      bottomBtn.classList.toggle('active', fav);
      const span = bottomBtn.querySelector('span');
      if (span) span.textContent = fav ? '取消收藏' : '收藏';
      const svg = bottomBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', fav ? 'currentColor' : 'none');
    }
  },

  route() {
    const hash = window.location.hash || '#cover';
    const parts = hash.replace('#', '').split('/');
    const page = parts[0];

    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    switch (page) {
      case 'cover':
        this.renderCover();
        break;
      case 'categories':
        this.renderCategories();
        break;
      case 'works':
        this.renderWorks(parts[1]);
        break;
      case 'detail':
        this.renderDetail(parts[1], parts[2]);
        break;
      case 'favorites':
        this.renderFavorites();
        break;
      case 'category-list':
        this.renderCategoryList();
        break;
      case 'pick-list':
        this.renderPickList();
        break;
      case 'search':
        this.renderSearch(decodeURIComponent(parts.slice(1).join('/')));
        break;
      default:
        this.renderCover();
    }
  },

  navigate(hash) {
    // 记录当前页到历史栈，用于返回
    const current = window.location.hash || '#cover';
    if (current !== hash) this.historyStack.push(current);
    window.location.hash = hash;
  },

  // ===== 返回上一页（弹栈，栈空则回首页） =====
  goBack() {
    const prev = this.historyStack.pop() || '#categories';
    window.location.hash = prev;
  },

  // ===== 首页 - 封面（Hero + 分类卡片 + 底部导航） =====
  renderCover() {
    let page = document.getElementById('page-cover');
    if (!page) {
      page = document.createElement('div');
      page.id = 'page-cover';
      page.className = 'page page-cover';
      page.innerHTML = `
        <div class="cover-splash" style="background-image: url('images/bg.webp')">
          <!-- 中式底纹 -->
          <div class="cover-pattern"></div>
          <!-- 云纹装饰 -->
          <div class="cover-cloud cover-cloud-1"></div>
          <div class="cover-cloud cover-cloud-2"></div>
          <!-- 主内容 -->
          <div class="cover-content">
            <!-- Logo -->
            <img src="images/logo.webp" alt="" class="cover-logo-img">
            <!-- 名称 -->
            <p class="cover-logo-text">探寻非遗</p>

            <!-- 文案 -->
            <p class="cover-line1">千年匠心 · 一脉相承</p>
            <p class="cover-line2">刺绣 · 风筝 · 剪纸 · 织锦 · 泥塑 · 皮影</p>
            <p class="cover-line3">六大非遗门类 · 尽览东方美学</p>

            <!-- 引导按钮 -->
            <button class="cover-enter-btn" onclick="App.navigate('#categories')">
              <span>开启文化之旅</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <p class="cover-hint">点击进入，探索传统技艺之美</p>
          </div>
        </div>
      `;
      document.getElementById('app').appendChild(page);
    }
    page.classList.add('active');
    this.currentPage = 'cover';
  },

  // ===== 分类目录页（首页） =====
  renderCategories() {
    let page = document.getElementById('page-categories');

    if (!page) {
      // 精选推荐：每个类别取第一个作品
      const pickCards = CATEGORIES.slice(0, 6).map((cat, i) => {
        // 刺绣类取第二个作品（贵妃鱼），其余取第一个
        const w = cat.id === 'embroidery' ? cat.works[1] : cat.works[0];
        const views = ['2.4w', '1.8w', '3.2w', '2.1w', '1.5w', '2.8w'][i];
        return `
          <div class="pick-card" onclick="App.navigate('#detail/${cat.id}/${w.id}')" style="animation-delay: ${i * 0.06}s">
            <div class="pick-card-img" style="background-image: url('${w.image}')"></div>
            <div class="pick-card-body">
              <div class="pick-card-title">${cat.name} · ${w.name}</div>
              <div class="pick-card-desc">${cat.desc}</div>
              <div class="pick-card-data">
                <svg viewBox="0 0 14 14" fill="#E87070"><path d="M7 12l-1-1C3 8.5 1 7 1 5c0-1.4 1.1-2.5 2.5-2.5.9 0 1.7.5 2.2 1.2C6.2 3 7 2.5 7.9 2.5 9.3 2.5 10.4 3.6 10.4 5c0 2-2 3.5-5 6L7 12z"/></svg>
                ${views}
              </div>
            </div>
          </div>`;
      }).join('');

      // 探索更多技艺：所有分类卡片
      const exploreCards = CATEGORIES.map((cat, i) => `
        <div class="explore-card" onclick="App.navigate('#works/${cat.id}')" style="animation-delay: ${i * 0.08}s">
          <div class="explore-card-bg" style="background-image: url('${cat.cover}')"></div>
          <div class="explore-card-info">
            <div class="explore-card-name">${cat.name}</div>
            <div class="explore-card-desc">${cat.desc}</div>
            <span class="explore-card-arrow">&#8250;</span>
          </div>
        </div>
      `).join('');

      page = document.createElement('div');
      page.id = 'page-categories';
      page.className = 'page page-cover';
      page.innerHTML = `
        <!-- ========== Hero 区域 ========== -->
        <div class="hero-section">
          <!-- 搜索按钮 -->
          <button class="hero-search-btn" title="搜索" onclick="App.navigate('#category-list')">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>

          <!-- 中式纹样背景 -->
          <div class="hero-pattern"></div>

          <!-- 右侧风筝大图（溢出） -->

          <!-- 左侧内容 -->
          <div class="hero-left">
            <h1 class="hero-main-title">传统技艺</h1>
            <p class="hero-sub-title">六大门类 · 千年传承</p>
            <div class="hero-features">
              <div class="hf-item">
                <svg viewBox="0 0 22 22" fill="none" stroke="#D9A72E" stroke-width="1.3"><path d="M11 2L13.5 7H19L14.5 10.5L16 16L11 12.5L6 16L7.5 10.5L3 7H8.5L11 2Z"/></svg>
                <span>国家非遗<br><em>匠心传承</em></span>
              </div>
              <div class="hf-item">
                <svg viewBox="0 0 22 22" fill="none" stroke="#D9A72E" stroke-width="1.3"><path d="M11 2L14 6L19 7L15 11L16 17L11 14L6 17L7 11L3 7L8 6Z"/></svg>
                <span>文化瑰宝<br><em>代代相传</em></span>
              </div>
              <div class="hf-item">
                <svg viewBox="0 0 22 22" fill="none" stroke="#D9A72E" stroke-width="1.3"><path d="M11 20C11 20 4 15 4 9a4 4 0 018-2.5A4 4 0 0118 9c0 6-7 11-7 11z"/></svg>
                <span>匠心工艺<br><em>精益求精</em></span>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== 白色内容面板（含Tab） ========== -->
        <div class="content-panel">
          <nav class="tab-bar">
            <a class="tab-pill active">首页</a>
            ${CATEGORIES.map(c => `<a class="tab-pill" onclick="App.navigate('#works/${c.id}')">${c.name}</a>`).join('')}
          </nav>

          <!-- 精选推荐 -->
          <section class="home-section">
            <div class="section-header">
              <h2 class="section-title">精选推荐 <span class="section-icon">&#10022;</span></h2>
              <a class="section-more" onclick="App.navigate('#pick-list')">查看更多 &#8250;</a>
            </div>
            <div class="pick-scroll">${pickCards}</div>
          </section>

          <!-- 探索更多技艺 -->
          <section class="home-section">
            <div class="section-header">
              <h2 class="section-title">探索更多技艺 <span class="section-icon">&#10022;</span></h2>
              <a class="section-more" onclick="App.navigate('#category-list')">查看更多 &#8250;</a>
            </div>
            <div class="explore-grid">${exploreCards}</div>
          </section>
        </div>

        <!-- 底部固定导航栏 -->
        <nav class="bottom-nav">
          <a class="bottom-nav-item active" onclick="App.navigate('#categories')">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span>首页</span>
          </a>
          <a class="bottom-nav-item" onclick="App.navigate('#category-list')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <span>分类</span>
          </a>
          <a class="bottom-nav-item" onclick="App.navigate('#favorites')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>我的收藏</span>
          </a>
        </nav>
      `;
      document.getElementById('app').appendChild(page);
    }

    page.classList.add('active');
    this.currentPage = 'categories';
    window.scrollTo(0, 0);
  },

  // ===== 分类列表页（独立页面，与首页分开） =====
  renderCategoryList() {
    let page = document.getElementById('page-category-list');

    if (!page) {
      const cards = CATEGORIES.map((cat, i) => `
        <div class="category-card-home" onclick="App.navigate('#works/${cat.id}')" style="animation-delay: ${i * 0.08}s">
          <div class="category-card-home-bg" style="background-image: url('${cat.cover}')"></div>
          <div class="category-card-home-info">
            <div class="category-card-home-name">${cat.name}</div>
            <div class="category-card-home-desc">${cat.desc}</div>
            <span class="category-card-home-arrow">&#8250;</span>
          </div>
        </div>
      `).join('');

      page = document.createElement('div');
      page.id = 'page-category-list';
      page.className = 'page page-cover';
      page.innerHTML = `
        <!-- ========== Hero 区域（back.png 背景 + 标题 + 搜索框 + 返回键） ========== -->
        <div class="hero-section" style="background-image: url('images/back.webp')">
          <!-- 左上角返回首页 -->
          <button class="hero-back-btn" onclick="App.navigate('#categories')">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            <span>首页</span>
          </button>
          <!-- 左侧标题 -->
          <div class="hero-left-cat">
            <h1 class="hero-main-title">传承匠心</h1>
            <p class="hero-sub-title">发现非遗之美</p>
            <p class="hero-desc-line">探索传统工艺的文化与故事</p>
          </div>
          <!-- 横条搜索框 -->
          <div class="hero-search-bar">
            <svg class="hero-search-icon" viewBox="0 0 24 24" fill="none" stroke="#B08968" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" id="heroSearchInput" placeholder="搜索传统技艺、非遗项目、工艺大师..." class="hero-search-input" onkeydown="if(event.key==='Enter')App.doSearchFromInput(this.value)">
            <button class="hero-search-submit" onclick="App.doSearchFromInput(document.getElementById('heroSearchInput').value)">搜索</button>
          </div>
        </div>

        <!-- ========== 白色内容面板（含Tab + 分类卡片） ========== -->
        <div class="content-panel">
          <!-- Tab导航（无首页/分类） -->
          <nav class="tab-bar">
            ${CATEGORIES.map(c => `<a class="tab-pill" onclick="App.navigate('#works/${c.id}')">${c.name}</a>`).join('')}
          </nav>

          <!-- 六大分类卡片 -->
          <div class="cover-categories-grid">${cards}</div>
        </div>

        <!-- 底部固定导航栏 -->
        <nav class="bottom-nav">
          <a class="bottom-nav-item" onclick="App.navigate('#categories')">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span>首页</span>
          </a>
          <a class="bottom-nav-item active" onclick="App.navigate('#category-list')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <span>分类</span>
          </a>
          <a class="bottom-nav-item" onclick="App.navigate('#favorites')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>我的收藏</span>
          </a>
        </nav>
      `;
      document.getElementById('app').appendChild(page);
    }

    page.classList.add('active');
    this.currentPage = 'category-list';
    window.scrollTo(0, 0);
  },

  // ===== 精选推荐列表页 =====
  renderPickList() {
    let page = document.getElementById('page-pick-list');
    if (page) page.remove();

    // 每次重新渲染（确保收藏状态实时同步）
    // 收集每个分类的第一个作品，带热度数据
      const pickWorks = CATEGORIES.map((cat, i) => {
        // 刺绣类取第二个作品（贵妃鱼），其余取第一个
        const w = cat.id === 'embroidery' ? cat.works[1] : cat.works[0];
        return {
          ...w,
          categoryName: cat.name,
          categoryId: cat.id,
          views: [3.2, 2.4, 1.8, 2.1, 1.5, 2.8][i] // 按热度排序
        };
      }).sort((a, b) => b.views - a.views);

      const cards = pickWorks.map((w, i) => `
        <div class="pick-list-card" onclick="App.navigate('#detail/${w.categoryId}/${w.id}')" style="animation-delay: ${i * 0.06}s">
          <button class="work-card-fav ${this.isFavorited(w.id) ? 'fav-active' : ''}" onclick="event.stopPropagation();App.toggleFavorite('${w.id}');this.classList.toggle('fav-active');var svg=this.querySelector('svg');svg.setAttribute('fill',this.classList.contains('fav-active')?'currentColor':'none')" title="收藏">
            <svg viewBox="0 0 24 24" fill="${this.isFavorited(w.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <div class="pick-list-img" style="background-image: url('${w.image}')"></div>
          <div class="pick-list-body">
            <div class="pick-list-card-title">${w.categoryName} · ${w.name}</div>
            <div class="pick-list-desc">${w.desc}</div>
            <div class="pick-list-views"><svg viewBox="0 0 16 16" fill="#E8A0A0"><path d="M8 13.6l-1-0.9C3.6 10 1.3 7.9 1.3 5.5 1.3 3.6 2.9 2 4.8 2c1.2 0 2.3.6 3.2 1.5C8.9 2.6 10 2 11.2 2c1.9 0 3.5 1.6 3.5 3.5 0 2.4-2.3 4.5-5.7 7.2L8 13.6z"/></svg> ${w.views}w</div>
          </div>
        </div>
      `).join('');

      page = document.createElement('div');
      page.id = 'page-pick-list';
      page.className = 'page page-cover';
      page.innerHTML = `
        <!-- 页面头部 -->
        <div class="pick-list-header">
          <button class="pick-list-back" onclick="App.navigate('#categories')">
            <span>&#8592;</span> 返回主页
          </button>
          <h1 class="pick-list-title">精选推荐</h1>
        </div>

        <!-- 作品列表 -->
        <div class="pick-list-grid">${cards}</div>

        <!-- 底部固定导航栏 -->
        <nav class="bottom-nav">
          <a class="bottom-nav-item active" onclick="App.navigate('#categories')">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span>首页</span>
          </a>
          <a class="bottom-nav-item" onclick="App.navigate('#category-list')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <span>分类</span>
          </a>
          <a class="bottom-nav-item" onclick="App.navigate('#favorites')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>我的收藏</span>
          </a>
        </nav>
      `;
      document.getElementById('app').appendChild(page);

    page.classList.add('active');
    this.currentPage = 'pick-list';
    window.scrollTo(0, 0);
  },

  // ===== 作品列表页 =====
  renderWorks(categoryId) {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) {
      this.navigate('#categories');
      return;
    }

    // 每次重新渲染（不同分类内容不同）
    let page = document.getElementById('page-works');
    if (page) page.remove();

    const cards = category.works.map((work, i) => `
      <div class="work-card" onclick="App.navigate('#detail/${categoryId}/${work.id}')" style="animation-delay: ${i * 0.08}s">
        <button class="work-card-fav ${this.isFavorited(work.id) ? 'fav-active' : ''}" onclick="event.stopPropagation();App.toggleFavorite('${work.id}');this.classList.toggle('fav-active');var svg=this.querySelector('svg');svg.setAttribute('fill',this.classList.contains('fav-active')?'currentColor':'none')" title="收藏">
          <svg viewBox="0 0 24 24" fill="${this.isFavorited(work.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div class="work-card-image" style="background-image: url('${work.image}')"></div>
        <div class="work-card-body">
          <div class="work-card-title-row">
            <div class="work-card-name">${work.name}</div>
            <span class="work-card-arrow">&#8250;</span>
          </div>
          <div class="work-card-tags">
            ${[work.category && {t: work.category}, work.material && {t: work.material}, work.region && {t: work.region}, work.author && {t: work.author}].filter(Boolean).slice(0, 2).map(item => `<span class="work-tag">${item.t}</span>`).join('')}
          </div>
          <div class="work-card-preview">${work.desc}</div>
        </div>
      </div>
    `).join('');

    page = document.createElement('div');
    page.id = 'page-works';
    page.className = 'page page-works';
    const navTabs = `
      <div class="categories-header-tab">
        <a class="tab-item" onclick="App.navigate('#categories')">首页</a>
        ${CATEGORIES.map(c => `<a class="tab-item ${c.id === categoryId ? 'active' : ''}" onclick="App.navigate('#works/${c.id}')">${c.name}</a>`).join('')}
      </div>
    `;

    page.innerHTML = `
      <div class="works-hero">
        <div class="works-hero-bg" style="background-image: url('${category.cover}')"></div>
        <div class="works-hero-overlay"></div>
        <button class="works-back" onclick="App.goBack()">
          <span>&#8592;</span> 返回
        </button>
        <div class="works-hero-content">
          <h1>${category.name}</h1>
          <p>${category.desc}</p>
        </div>
      </div>
      <div class="works-content-panel">
        ${navTabs}
        <div class="works-grid">
          ${cards}
        </div>
      </div>

      <!-- 底部固定导航栏 -->
      <nav class="bottom-nav">
        <a class="bottom-nav-item" onclick="App.navigate('#categories')">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span>首页</span>
        </a>
        <a class="bottom-nav-item active" onclick="App.navigate('#category-list')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>分类</span>
        </a>
        <a class="bottom-nav-item" onclick="App.navigate('#favorites')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>我的收藏</span>
        </a>
      </nav>
    `;
    document.getElementById('app').appendChild(page);
    page.classList.add('active');
    this.currentPage = 'works';
    this.currentCategory = categoryId;
    window.scrollTo(0, 0);
    // 自动滚动导航栏让激活标签居中显示
    setTimeout(() => {
      const nav = page.querySelector('.categories-header-tab');
      const activeTab = nav ? nav.querySelector('.tab-item.active') : null;
      if (nav && activeTab) {
        const navWidth = nav.clientWidth;
        const tabLeft = activeTab.offsetLeft;
        const tabWidth = activeTab.offsetWidth;
        nav.scrollLeft = tabLeft - (navWidth / 2) + (tabWidth / 2);
      }
    }, 50);
  },

  // ===== 作品详情页 =====
  renderDetail(categoryId, workId) {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) {
      this.navigate('#categories');
      return;
    }
    const work = category.works.find(w => w.id === workId);
    if (!work) {
      this.navigate('#works/' + categoryId);
      return;
    }

    let page = document.getElementById('page-detail');
    if (page) page.remove();

    page = document.createElement('div');
    page.id = 'page-detail';
    page.className = 'page page-detail';
    page.innerHTML = `
      <div class="detail-top-bar">
        <button class="detail-nav-btn" onclick="App.goBack()" title="返回">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="detail-top-right">
          <button class="detail-nav-btn ${this.isFavorited(workId) ? 'liked' : ''}" onclick="App.toggleDetailFav('${workId}')" title="收藏">
            <svg viewBox="0 0 24 24" fill="${this.isFavorited(workId) ? 'currentColor' : 'none'}" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="detail-nav-btn detail-share-btn" title="分享" onclick="App.shareWork('${workId}','${categoryId}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </div>
      <div class="detail-image-wrap">
        <div class="detail-image"><img src="${work.image}" alt="${work.name}" /></div>
      </div>
      <div class="detail-content">
        <h1 class="detail-name">${work.name}</h1>
        <div class="detail-meta-row">
          ${work.author ? `<span><em>作者</em>${work.author}</span>` : ''}
          ${work.category ? `<span><em>类别</em>${work.category}</span>` : ''}
          ${work.material ? `<span><em>材质</em>${work.material}</span>` : ''}
          ${work.year ? `<span><em>创作年代</em>${work.year}</span>` : ''}
          ${work.region ? `<span><em>来源地区</em>${work.region}</span>` : ''}
        </div>

        <div class="detail-tabs">
          <button class="detail-tab active" data-tab="intro" onclick="App.switchDetailTab(this)">简介</button>
          <button class="detail-tab" data-tab="craft" onclick="App.switchDetailTab(this)">工艺特点</button>
          <button class="detail-tab" data-tab="value" onclick="App.switchDetailTab(this)">艺术价值</button>
          <button class="detail-tab" data-tab="bg" onclick="App.switchDetailTab(this)">创作背景</button>
        </div>

        <div class="detail-desc-wrap" id="descWrap">
          <p class="detail-desc" data-content="intro">${work.desc}</p>
          <p class="detail-desc" data-content="craft" style="display:none">${category.intro || '<span class="detail-desc-empty">暂无相关介绍</span>'}</p>
          <p class="detail-desc" data-content="value" style="display:none"><span class="detail-desc-empty">暂无相关介绍</span></p>
          <p class="detail-desc" data-content="bg" style="display:none"><span class="detail-desc-empty">暂无相关介绍</span></p>
          <button class="detail-expand-btn" onclick="var p=this.parentElement;p.classList.toggle('expanded');this.textContent=p.classList.contains('expanded')?'收起':'展开全部 &#8744;'">展开全部 &#8744;</button>
        </div>

        ${category.works.filter(w => w.id !== workId).length > 0 ? `
        <div class="related-section">
          <div class="related-header">
            <span>相关推荐</span>
            <a onclick="App.navigate('#works/${categoryId}')" class="related-more">查看更多 &#8250;</a>
          </div>
          <div class="related-grid">
            ${category.works.filter(w => w.id !== workId).slice(0, 3).map(w => `
              <div class="related-card" onclick="App.navigate('#detail/${categoryId}/${w.id}')">
                <div class="related-img" style="background-image: url('${w.image}')"></div>
                <div class="related-name">${w.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="detail-bottom-bar">
          <button class="bottom-action-btn ${this.isFavorited(workId) ? 'active' : ''}" onclick="App.toggleDetailFav('${workId}')">
            <svg viewBox="0 0 24 24" fill="${this.isFavorited(workId) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>${this.isFavorited(workId) ? '取消收藏' : '收藏'}</span>
          </button>
          <button class="bottom-action-btn bottom-cta" onclick="App.navigate('#works/${categoryId}')">
            了解${category.name}
          </button>
        </div>
      </div>
    `;
    document.getElementById('app').appendChild(page);
    page.classList.add('active');
    this.currentPage = 'detail';
    window.scrollTo(0, 0);

    // 如果简介内容不够长，完全展示不折叠
    setTimeout(() => {
      const descEl = page.querySelector('.detail-desc');
      const btnEl = page.querySelector('.detail-expand-btn');
      const wrapEl = page.querySelector('.detail-desc-wrap');
      if (!descEl || !btnEl || !wrapEl) return;
      const text = (descEl.textContent || '').trim();
      if (!text || descEl.scrollHeight <= descEl.clientHeight + 5) {
        btnEl.style.display = 'none';
        wrapEl.classList.add('no-limit');
      }
    }, 100);
  },

  // ===== 我的收藏页 =====
  renderFavorites() {
    let page = document.getElementById('page-favorites');
    if (!page) {
      page = document.createElement('div');
      page.id = 'page-favorites';
      page.className = 'page page-cover';

      const favIds = this.favorites;
      // 收集所有收藏的作品
      const favWorks = [];
      CATEGORIES.forEach(cat => {
        cat.works.forEach(w => {
          if (favIds.includes(w.id)) {
            favWorks.push({ ...w, categoryName: cat.name, categoryId: cat.id });
          }
        });
      });

      let contentHtml;
      if (favWorks.length === 0) {
        contentHtml = `
          <div class="favorites-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <p>还没有收藏作品</p>
            <p class="favorites-empty-sub">去发现你喜欢的传统技艺吧</p>
          </div>`;
      } else {
        contentHtml = `
          <div class="favorites-header">
            <h1>我的收藏</h1>
            <p class="favorites-count">${favWorks.length} 件作品</p>
          </div>
          <div class="favorites-list">
            ${favWorks.map((w, i) => `
              <div class="work-card" onclick="App.navigate('#detail/${w.categoryId}/${w.id}')" style="animation-delay: ${i * 0.06}s">
                <button class="work-card-fav ${this.isFavorited(w.id) ? 'fav-active' : ''}" onclick="event.stopPropagation();App.toggleFavFromFavorites('${w.id}')" title="取消收藏">
                  <svg viewBox="0 0 24 24" fill="${this.isFavorited(w.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
                <div class="work-card-image" style="background-image: url('${w.image}')"></div>
                <div class="work-card-body">
                  <div class="work-card-title-row">
                    <div class="work-card-name">${w.name}</div>
                    <span class="work-card-arrow">&#8250;</span>
                  </div>
                  <div class="work-card-tags">
                    ${[w.categoryName && {t: w.categoryName}, w.material && {t: w.material}, w.region && {t: w.region}, w.author && {t: w.author}].filter(Boolean).slice(0, 2).map(item => `<span class="work-tag">${item.t}</span>`).join('')}
                  </div>
                  <div class="work-card-preview">${w.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>`;
      }

      page.innerHTML = `
        <!-- 底部固定导航栏 -->
        <nav class="bottom-nav">
          <a class="bottom-nav-item" onclick="App.navigate('#categories')">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span>首页</span>
          </a>
          <a class="bottom-nav-item" onclick="App.navigate('#category-list')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <span>分类</span>
          </a>
          <a class="bottom-nav-item active" onclick="App.navigate('#favorites')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>我的收藏</span>
          </a>
        </nav>
        <div style="padding-top:16px;max-width:480px;margin:0 auto;">${contentHtml}</div>
      `;
      document.getElementById('app').appendChild(page);
    } else {
      // 每次进入刷新列表（收藏可能变化）
      this.refreshFavoritesList(page);
    }

    page.classList.add('active');
    this.currentPage = 'favorites';
    window.scrollTo(0, 0);
  },

  refreshFavoritesList(page) {
    const favIds = this.favorites;
    const favWorks = [];
    CATEGORIES.forEach(cat => {
      cat.works.forEach(w => {
        if (favIds.includes(w.id)) {
          favWorks.push({ ...w, categoryName: cat.name, categoryId: cat.id });
        }
      });
    });

    const container = page.querySelector('[style*="padding-top"]');
    if (!container) return;

    if (favWorks.length === 0) {
      container.innerHTML = `
        <div class="favorites-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <p>还没有收藏作品</p>
          <p class="favorites-empty-sub">去发现你喜欢的传统技艺吧</p>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="favorites-header">
          <h1>我的收藏</h1>
          <p class="favorites-count">${favWorks.length} 件作品</p>
        </div>
        <div class="favorites-list">
          ${favWorks.map((w, i) => `
            <div class="work-card" onclick="App.navigate('#detail/${w.categoryId}/${w.id}')" style="animation-delay: ${i * 0.06}s">
              <button class="work-card-fav ${this.isFavorited(w.id) ? 'fav-active' : ''}" onclick="event.stopPropagation();App.toggleFavFromFavorites('${w.id}')" title="取消收藏">
                <svg viewBox="0 0 24 24" fill="${this.isFavorited(w.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div class="work-card-image" style="background-image: url('${w.image}')"></div>
              <div class="work-card-body">
                <div class="work-card-title-row">
                  <div class="work-card-name">${w.name}</div>
                  <span class="work-card-arrow">&#8250;</span>
                </div>
                <div class="work-card-tags">
                  ${[w.categoryName && {t: w.categoryName}, w.material && {t: w.material}, w.region && {t: w.region}, w.author && {t: w.author}].filter(Boolean).slice(0, 2).map(item => `<span class="work-tag">${item.t}</span>`).join('')}
                </div>
                <div class="work-card-preview">${w.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>`;
    }
  },

  // ===== 我的收藏页内取消收藏：切换后实时刷新列表 =====
  toggleFavFromFavorites(workId) {
    this.toggleFavorite(workId);
    const page = document.getElementById('page-favorites');
    if (page) this.refreshFavoritesList(page);
  },

  // ===== 详情页分享：优先调系统分享，降级复制链接 =====
  shareWork(workId, categoryId) {
    const category = CATEGORIES.find(c => c.id === categoryId);
    const work = category ? category.works.find(w => w.id === workId) : null;
    const title = '探寻非遗';
    const text = work ? `向你推荐非遗作品《${work.name}》` : '向你推荐非遗文化';
    const url = window.location.href;
    // 仅在安全上下文（https）下调系统分享；file:// 等环境下调用会导致浏览器崩溃
    const isHttpUrl = /^https?:/.test(url);
    const canSystemShare = isHttpUrl && window.isSecureContext && navigator.share
      && (!navigator.canShare || navigator.canShare({ title, text, url }));
    if (canSystemShare) {
      navigator.share({ title, text, url }).catch(() => {});
    } else {
      this.copyShareLink(url);
    }
  },

  // ===== 复制链接：clipboard API 优先，失败降级 execCommand =====
  copyShareLink(text) {
    const copyViaExec = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e) {
        return false;
      }
    };
    if (window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => this.showToast('链接已复制，去分享吧'))
        .catch(() => {
          if (copyViaExec()) this.showToast('链接已复制，去分享吧');
          else this.showToast('复制失败，请手动复制地址栏链接');
        });
    } else if (copyViaExec()) {
      this.showToast('链接已复制，去分享吧');
    } else {
      this.showToast('复制失败，请手动复制地址栏链接');
    }
  },

  // ===== 轻提示 =====
  showToast(msg) {
    let t = document.getElementById('app-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'app-toast';
      t.className = 'app-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    // 强制重排以便重复触发动画
    void t.offsetWidth;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  },

  // ===== 搜索：从分类页搜索框发起 =====
  doSearchFromInput(raw) {
    const q = (raw || '').trim();
    if (!q) {
      this.navigate('#category-list');
      return;
    }
    this.navigate('#search/' + encodeURIComponent(q));
  },

  // ===== 搜索结果页 =====
  renderSearch(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      this.navigate('#category-list');
      return;
    }
    const results = [];
    CATEGORIES.forEach(cat => {
      cat.works.forEach(w => {
        const haystack = [w.name, cat.name, w.author, w.category, w.region, w.material, w.desc]
          .filter(Boolean).join(' ').toLowerCase();
        if (haystack.includes(q)) {
          results.push({ ...w, categoryName: cat.name, categoryId: cat.id });
        }
      });
    });

    let page = document.getElementById('page-search');
    if (page) page.remove();

    const cards = results.map((w, i) => `
      <div class="work-card" onclick="App.navigate('#detail/${w.categoryId}/${w.id}')" style="animation-delay: ${i * 0.06}s">
        <button class="work-card-fav ${this.isFavorited(w.id) ? 'fav-active' : ''}" onclick="event.stopPropagation();App.toggleFavorite('${w.id}');this.classList.toggle('fav-active');var svg=this.querySelector('svg');svg.setAttribute('fill',this.classList.contains('fav-active')?'currentColor':'none')" title="收藏">
          <svg viewBox="0 0 24 24" fill="${this.isFavorited(w.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div class="work-card-image" style="background-image: url('${w.image}')"></div>
        <div class="work-card-body">
          <div class="work-card-title-row">
            <div class="work-card-name">${w.name}</div>
            <span class="work-card-arrow">&#8250;</span>
          </div>
          <div class="work-card-tags">
            ${[w.categoryName && {t: w.categoryName}, w.material && {t: w.material}, w.region && {t: w.region}, w.author && {t: w.author}].filter(Boolean).slice(0, 2).map(item => `<span class="work-tag">${item.t}</span>`).join('')}
          </div>
          <div class="work-card-preview">${w.desc}</div>
        </div>
      </div>`).join('');

    const summary = results.length > 0
      ? `找到 <b>${results.length}</b> 件与"${query}"相关的作品`
      : `没有找到与"${query}"相关的作品，换个关键词试试`;

    page = document.createElement('div');
    page.id = 'page-search';
    page.className = 'page page-works';
    page.innerHTML = `
      <div class="works-hero">
        <div class="works-hero-bg" style="background-image: url('images/back.webp')"></div>
        <div class="works-hero-overlay"></div>
        <button class="works-back" onclick="App.navigate('#category-list')">
          <span>&#8592;</span> 返回
        </button>
        <div class="works-hero-content">
          <h1>搜索结果</h1>
          <p>${summary}</p>
        </div>
      </div>
      <div class="works-content-panel">
        <div class="works-grid">
          ${cards}
        </div>
      </div>
      <nav class="bottom-nav">
        <a class="bottom-nav-item" onclick="App.navigate('#categories')">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span>首页</span>
        </a>
        <a class="bottom-nav-item active" onclick="App.navigate('#category-list')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>分类</span>
        </a>
        <a class="bottom-nav-item" onclick="App.navigate('#favorites')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>我的收藏</span>
        </a>
      </nav>
    `;
    document.getElementById('app').appendChild(page);
    page.classList.add('active');
    this.currentPage = 'search';
    window.scrollTo(0, 0);
  },

  // ===== 详情页 Tab 切换（真实数据驱动） =====
  switchDetailTab(btn) {
    const tabs = btn.parentElement;
    const wrap = tabs.nextElementSibling;
    const key = btn.dataset.tab;
    tabs.querySelectorAll('.detail-tab').forEach(t => t.classList.toggle('active', t === btn));
    wrap.querySelectorAll('.detail-desc').forEach(p => {
      p.style.display = (p.dataset.content === key) ? '' : 'none';
    });
    // 根据当前 Tab 内容更新折叠状态：装得下就完整展示（去掉遮罩），超出才显示展开按钮
    setTimeout(() => {
      const activeP = wrap.querySelector('.detail-desc[data-content="' + key + '"]');
      const btnEl = wrap.querySelector('.detail-expand-btn');
      if (!activeP || !btnEl) return;
      wrap.classList.remove('no-limit'); // 先恢复限高，才能测出真实是否溢出
      const hasText = (activeP.textContent || '').trim().length > 0;
      const fits = !hasText || activeP.scrollHeight <= activeP.clientHeight + 5;
      if (fits) {
        wrap.classList.add('no-limit');
        btnEl.style.display = 'none';
      } else {
        btnEl.style.display = 'block';
        btnEl.textContent = '展开全部 \u2228';
      }
    }, 0);
  }
};

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());
