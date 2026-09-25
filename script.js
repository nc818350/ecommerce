/* =========================================================================
   ModernShop — Application Script
   ========================================================================= */
(function () {
  'use strict';

  /* ----------------------------- Data ----------------------------- */
  const CATEGORIES = [
    { id: 'all',         label: 'All Products' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'clothing',    label: 'Clothing' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const SAMPLE_PRODUCTS = [
    { id: 1, name: 'Wireless Bluetooth Headphones', category: 'electronics', price: 79.99, oldPrice: 119.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life. Bluetooth 5.2, USB-C fast charge, plush memory-foam earcups.', rating: 4.5, reviews: 120, popularity: 95, stock: 12, sku: 'ELEC-HP-001' },
    { id: 2, name: 'Smart Fitness Watch', category: 'electronics', price: 199.99, oldPrice: 249.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', description: 'Advanced fitness tracking with heart-rate monitor, GPS, SpO2 sensor and 7-day battery. Water resistant to 50m.', rating: 4.7, reviews: 89, popularity: 88, stock: 8, sku: 'ELEC-WT-002' },
    { id: 3, name: 'Casual Summer Dress', category: 'clothing', price: 49.99, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80', description: 'Comfortable and stylish summer dress perfect for casual occasions. Lightweight breathable fabric.', rating: 4.3, reviews: 76, popularity: 82, stock: 25, sku: 'CLTH-DR-003' },
    { id: 4, name: 'Professional Laptop Backpack', category: 'accessories', price: 39.99, oldPrice: 59.99, image: 'https://images.unsplash.com/photo-1514477917009-389c76a86b68?auto=format&fit=crop&w=800&q=80', description: 'Durable water-resistant backpack with multiple compartments and padded 15.6" laptop sleeve.', rating: 4.4, reviews: 64, popularity: 81, stock: 40, sku: 'ACCS-BP-004' },
    { id: 5, name: 'Wireless Mouse', category: 'electronics', price: 24.99, image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80', description: 'Ergonomic wireless mouse with adjustable DPI (800–2400) and silent click switches.', rating: 4.2, reviews: 43, popularity: 79, stock: 60, sku: 'ELEC-MS-005' },
    { id: 6, name: "Men's Slim Fit Shirt", category: 'clothing', price: 34.50, image: 'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&w=800&q=80', description: 'Breathable 100% cotton shirt suitable for office and casual wear. Slim fit, wrinkle resistant.', rating: 4.1, reviews: 52, popularity: 73, stock: 18, sku: 'CLTH-SH-006' },
    { id: 7, name: "Women's Leather Handbag", category: 'accessories', price: 129.00, oldPrice: 179.00, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', description: 'Classic genuine leather handbag with spacious interior, gold-tone hardware and detachable strap.', rating: 4.6, reviews: 98, popularity: 90, stock: 6, sku: 'ACCS-HB-007' },
    { id: 8, name: 'Noise Cancelling Earbuds', category: 'electronics', price: 99.00, image: 'https://images.unsplash.com/photo-1585386959984-a4155223168f?auto=format&fit=crop&w=800&q=80', description: 'Compact true-wireless earbuds with hybrid ANC, transparency mode and crystal-clear calls.', rating: 4.4, reviews: 71, popularity: 85, stock: 0, sku: 'ELEC-EB-008' },
  ];

  /* ----------------------------- Storage ----------------------------- */
  const Storage = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    },
    remove(key) { try { localStorage.removeItem(key); } catch {} },
  };

  const KEYS = {
    CART: 'modernshop_cart_v2',
    WISHLIST: 'modernshop_wishlist_v2',
    ORDERS: 'modernshop_orders_v2',
    USER: 'modernshop_user_v2',
    COUPON: 'modernshop_coupon_v2',
  };

  /* ----------------------------- State ----------------------------- */
  const State = {
    cart: Storage.get(KEYS.CART, []),
    wishlist: Storage.get(KEYS.WISHLIST, []),
    orders: Storage.get(KEYS.ORDERS, []),
    user: Storage.get(KEYS.USER, null),
    coupon: Storage.get(KEYS.COUPON, null),
    filters: { category: 'all', query: '', sort: 'popularity', min: null, max: null, minRating: 0 },
    currentProductId: null,
    checkoutStep: 1,

    saveCart() { Storage.set(KEYS.CART, this.cart); },
    saveWishlist() { Storage.set(KEYS.WISHLIST, this.wishlist); },
    saveOrders() { Storage.set(KEYS.ORDERS, this.orders); },
    saveUser() { Storage.set(KEYS.USER, this.user); },
    saveCoupon() { Storage.set(KEYS.COUPON, this.coupon); },
  };

  /* Coupons */
  const COUPONS = {
    SAVE10: { code: 'SAVE10', type: 'percent', value: 10, label: '10% off' },
    FLAT5:  { code: 'FLAT5',  type: 'fixed',   value: 5,  label: '$5 off' },
  };

  /* ----------------------------- Utils ----------------------------- */
  const Utils = {
    currency(n) { return `$${Number(n || 0).toFixed(2)}`; },
    escape(str) {
      return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
      }[c]));
    },
    stars(rating) {
      const full = Math.floor(rating);
      const half = rating % 1 >= 0.5;
      let html = '';
      for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
      if (half) html += '<i class="fas fa-star-half-alt"></i>';
      for (let i = 0; i < 5 - full - (half ? 1 : 0); i++) html += '<i class="far fa-star"></i>';
      return html;
    },
    debounce(fn, wait = 200) {
      let t;
      return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
    },
    byId(id) { return document.getElementById(id); },
    qs(sel, root = document) { return root.querySelector(sel); },
    qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); },
    formatDate(iso) { return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); },
  };

  /* ----------------------------- Toast ----------------------------- */
  const Toast = {
    el: null,
    instance: null,
    init() {
      const container = Utils.byId('toastContainer');
      if (!container) return;
      // Reuse a single toast element
      this.el = document.createElement('div');
      this.el.className = 'toast align-items-center text-white border-0';
      this.el.setAttribute('role', 'alert');
      this.el.setAttribute('aria-live', 'polite');
      this.el.setAttribute('aria-atomic', 'true');
      this.el.innerHTML = `
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="toast-icon fas fa-check-circle"></i>
            <span class="toast-msg">Message</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>`;
      container.appendChild(this.el);
      this.instance = new bootstrap.Toast(this.el, { delay: 2600 });
    },
    show(msg, type = 'success') {
      if (!this.instance) this.init();
      if (!this.instance) return;
      const colors = { success: 'bg-success', danger: 'bg-danger', warning: 'bg-warning', info: 'bg-primary' };
      const icons  = { success: 'fa-check-circle', danger: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
      this.el.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-primary');
      this.el.classList.add(colors[type] || colors.success);
      Utils.qs('.toast-icon', this.el).className = `toast-icon fas ${icons[type] || icons.success}`;
      Utils.qs('.toast-msg', this.el).textContent = msg;
      this.instance.show();
    },
  };

  /* ----------------------------- Products ----------------------------- */
  const Products = {
    all() { return SAMPLE_PRODUCTS; },
    find(id) { return SAMPLE_PRODUCTS.find(p => p.id === Number(id)); },
    categories() { return CATEGORIES; },

    applyFilters() {
      const f = State.filters;
      let list = SAMPLE_PRODUCTS.slice();

      if (f.category && f.category !== 'all') list = list.filter(p => p.category === f.category);
      if (f.query) {
        const q = f.query.toLowerCase();
        list = list.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
        );
      }
      if (f.min != null) list = list.filter(p => p.price >= f.min);
      if (f.max != null) list = list.filter(p => p.price <= f.max);
      if (f.minRating) list = list.filter(p => p.rating >= f.minRating);

      switch (f.sort) {
        case 'price-low':  list.sort((a, b) => a.price - b.price); break;
        case 'price-high': list.sort((a, b) => b.price - a.price); break;
        case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
        case 'name':       list.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'popularity':
        default:           list.sort((a, b) => b.popularity - a.popularity);
      }
      return list;
    },
  };

  /* ----------------------------- Cart ----------------------------- */
  const Cart = {
    subtotal() { return State.cart.reduce((s, i) => s + i.price * i.quantity, 0); },
    count() { return State.cart.reduce((s, i) => s + i.quantity, 0); },
    discount() {
      if (!State.coupon) return 0;
      const c = State.coupon;
      const sub = this.subtotal();
      return c.type === 'percent' ? sub * c.value / 100 : Math.min(c.value, sub);
    },
    tax() { return (this.subtotal() - this.discount()) * 0.08; },
    shipping() { return (this.subtotal() > 0 && this.subtotal() < 75) ? 5.99 : 0; },
    total() { return Math.max(0, this.subtotal() - this.discount() + this.tax() + this.shipping()); },

    add(productId, qty = 1) {
      const p = Products.find(productId);
      if (!p) return;
      if (p.stock <= 0) { Toast.show('Product is out of stock', 'danger'); return; }
      const existing = State.cart.find(i => i.id === p.id);
      const newQty = (existing?.quantity || 0) + qty;
      if (newQty > p.stock) { Toast.show(`Only ${p.stock} in stock`, 'warning'); return; }
      if (existing) existing.quantity = newQty;
      else State.cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, quantity: qty });
      State.saveCart();
      this.render();
      this.bumpBadge();
      Toast.show('Added to cart', 'success');
    },
    remove(id) {
      State.cart = State.cart.filter(i => i.id !== id);
      State.saveCart();
      this.render();
    },
    updateQty(id, qty) {
      qty = Math.max(1, parseInt(qty, 10) || 1);
      const item = State.cart.find(i => i.id === id);
      if (!item) return;
      const p = Products.find(id);
      if (p && qty > p.stock) { qty = p.stock; Toast.show(`Only ${p.stock} in stock`, 'warning'); }
      item.quantity = qty;
      State.saveCart();
      this.render();
    },
    clear() {
      State.cart = [];
      State.coupon = null;
      State.saveCart();
      State.saveCoupon();
      this.render();
      Toast.show('Cart cleared', 'info');
    },
    bumpBadge() {
      const badge = Utils.byId('cartCount');
      if (!badge) return;
      badge.classList.remove('cart-bump');
      void badge.offsetWidth;
      badge.classList.add('cart-bump');
    },
    render() {
      const count = this.count();
      const badge = Utils.byId('cartCount');
      if (badge) {
        badge.textContent = String(count);
        badge.hidden = count === 0;
      }
      const container = Utils.byId('cartItems');
      if (!container) return;
      if (!State.cart.length) {
        container.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-shopping-bag fa-3x text-muted mb-3 opacity-25"></i>
            <p class="text-muted mb-3">Your cart is empty</p>
            <a href="#/shop" class="btn btn-primary btn-sm" id="emptyCartShop">Continue Shopping</a>
          </div>`;
        const btn = Utils.byId('emptyCartShop');
        if (btn) btn.addEventListener('click', () => this.close());
      } else {
        container.innerHTML = State.cart.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <img class="cart-item-image" src="${Utils.escape(item.image)}" alt="${Utils.escape(item.name)}" loading="lazy" />
            <div class="flex-grow-1 min-w-0">
              <div class="cart-item-name">${Utils.escape(item.name)}</div>
              <div class="cart-item-price">${Utils.currency(item.price)}</div>
              <div class="d-flex align-items-center justify-content-between mt-2">
                <div class="qty-stepper">
                  <button type="button" data-act="dec" aria-label="Decrease">−</button>
                  <input type="number" min="1" value="${item.quantity}" aria-label="Quantity" />
                  <button type="button" data-act="inc" aria-label="Increase">+</button>
                </div>
                <button class="btn btn-sm btn-link text-danger p-0" data-act="remove" aria-label="Remove item">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('');

        Utils.qsa('.cart-item', container).forEach(row => {
          const id = Number(row.dataset.id);
          row.addEventListener('click', e => {
            const btn = e.target.closest('[data-act]');
            if (!btn) return;
            const act = btn.dataset.act;
            const item = State.cart.find(i => i.id === id);
            if (!item) return;
            if (act === 'inc') this.updateQty(id, item.quantity + 1);
            if (act === 'dec') this.updateQty(id, item.quantity - 1);
            if (act === 'remove') this.remove(id);
          });
          const input = row.querySelector('input[type="number"]');
          input?.addEventListener('change', () => this.updateQty(id, input.value));
        });
      }
      const totalEl = Utils.byId('cartTotal');
      if (totalEl) totalEl.textContent = Utils.currency(this.total());
      // If we're on checkout page, re-render summary too
      if (Router.current === 'checkout') Views.renderCheckout();
    },
    open() {
      const sidebar = Utils.byId('cartSidebar');
      const overlay = Utils.byId('cartOverlay');
      if (!sidebar) return;
      sidebar.classList.add('active');
      sidebar.setAttribute('aria-hidden', 'false');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    },
    close() {
      const sidebar = Utils.byId('cartSidebar');
      const overlay = Utils.byId('cartOverlay');
      if (!sidebar) return;
      sidebar.classList.remove('active');
      sidebar.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    },
    toggle() {
      const sidebar = Utils.byId('cartSidebar');
      if (sidebar?.classList.contains('active')) this.close(); else this.open();
    },
  };

  /* ----------------------------- Wishlist ----------------------------- */
  const Wishlist = {
    has(id) { return State.wishlist.includes(Number(id)); },
    toggle(id) {
      id = Number(id);
      const idx = State.wishlist.indexOf(id);
      if (idx >= 0) {
        State.wishlist.splice(idx, 1);
        Toast.show('Removed from wishlist', 'info');
      } else {
        State.wishlist.push(id);
        Toast.show('Added to wishlist', 'success');
      }
      State.saveWishlist();
      this.renderBadge();
      // Sync heart icons in the DOM
      Utils.qsa(`[data-wishlist-id="${id}"]`).forEach(el => el.classList.toggle('active', this.has(id)));
      Utils.qsa(`[data-wishlist-id="${id}"] i`).forEach(i => {
        i.className = this.has(id) ? 'fas fa-heart' : 'far fa-heart';
      });
      if (Router.current === 'wishlist') Views.renderWishlist();
    },
    items() { return State.wishlist.map(id => Products.find(id)).filter(Boolean); },
    renderBadge() {
      const badge = Utils.byId('wishlistCount');
      if (!badge) return;
      const n = State.wishlist.length;
      badge.textContent = String(n);
      badge.hidden = n === 0;
    },
  };

  /* ----------------------------- Auth ----------------------------- */
  const Auth = {
    isLoggedIn() { return !!State.user; },
    login(email, password) {
      // Demo auth — replace with backend call.
      if (!email || password.length < 6) throw new Error('Invalid credentials');
      State.user = { name: email.split('@')[0], email, joined: new Date().toISOString() };
      State.saveUser();
      this.renderMenu();
    },
    register({ name, email, password }) {
      if (!name || !email || password.length < 6) throw new Error('Please fill all fields (password ≥ 6 chars)');
      State.user = { name, email, joined: new Date().toISOString() };
      State.saveUser();
      this.renderMenu();
    },
    logout() {
      State.user = null;
      State.saveUser();
      this.renderMenu();
      Toast.show('Signed out', 'info');
      Router.go('/');
    },
    renderMenu() {
      const guestIds = ['menuGuest', 'menuGuest2'];
      const userIds = ['menuUser', 'menuUser2', 'menuUser3', 'menuUser4', 'menuUser5'];
      const loggedIn = this.isLoggedIn();
      guestIds.forEach(id => { const el = Utils.byId(id); if (el) el.hidden = loggedIn; });
      userIds.forEach(id => { const el = Utils.byId(id); if (el) el.hidden = !loggedIn; });
      const nameEl = Utils.byId('menuUserName');
      if (nameEl && State.user) nameEl.textContent = State.user.name;
    },
  };

  /* ----------------------------- Orders ----------------------------- */
  const Orders = {
    all() { return State.orders.slice(); },
    find(id) { return State.orders.find(o => o.id === id); },
    create(order) {
      State.orders.unshift(order);
      State.saveOrders();
      Admin.updateNotif();
      return order;
    },
    update(id, patch) {
      const o = State.orders.find(x => x.id === id);
      if (o) Object.assign(o, patch);
      State.saveOrders();
      Admin.updateNotif();
    },
    remove(id) {
      State.orders = State.orders.filter(o => o.id !== id);
      State.saveOrders();
      Admin.updateNotif();
    },
  };

  /* ----------------------------- Admin ----------------------------- */
  const Admin = {
    filter: 'all',
    search: '',
    updateNotif() {
      const badge = Utils.byId('adminNotif');
      if (!badge) return;
      // (badge was in original nav; kept as optional)
      const n = State.orders.filter(o => o.unread).length;
      badge.textContent = String(n);
      badge.style.display = n > 0 ? 'inline-block' : 'none';
    },
    render() {
      const tbody = Utils.byId('ordersTableBody');
      if (!tbody) return;
      let rows = Orders.all();
      if (this.filter === 'unread') rows = rows.filter(o => o.unread);
      if (this.filter === 'fulfilled') rows = rows.filter(o => o.status === 'fulfilled');
      if (this.search) {
        const q = this.search.toLowerCase();
        rows = rows.filter(o =>
          o.id.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q)
        );
      }
      if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No orders</td></tr>`;
        return;
      }
      tbody.innerHTML = rows.map(o => `
        <tr>
          <td class="fw-semibold">${Utils.escape(o.id)}</td>
          <td>${Utils.escape(o.customer.firstName)} ${Utils.escape(o.customer.lastName)}</td>
          <td class="small">${Utils.escape(o.customer.email)}</td>
          <td class="fw-semibold">${Utils.currency(o.total)}</td>
          <td>
            <span class="badge ${o.status === 'fulfilled' ? 'bg-success' : 'bg-secondary'}">${Utils.escape(o.status)}</span>
            ${o.unread ? '<span class="badge bg-danger ms-1">new</span>' : ''}
          </td>
          <td class="small text-muted">${Utils.formatDate(o.createdAt)}</td>
          <td>
            <div class="d-flex gap-1">
              ${o.unread ? `<button class="btn btn-sm btn-outline-primary" data-act="read" data-id="${o.id}">Mark read</button>` : ''}
              ${o.status !== 'fulfilled' ? `<button class="btn btn-sm btn-outline-success" data-act="fulfill" data-id="${o.id}">Fulfill</button>` : ''}
              <button class="btn btn-sm btn-outline-danger" data-act="delete" data-id="${o.id}" aria-label="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>`).join('');

      Utils.qsa('button[data-act]', tbody).forEach(btn => {
        btn.addEventListener('click', () => {
          const { act, id } = btn.dataset;
          if (act === 'read')    Orders.update(id, { unread: false });
          if (act === 'fulfill') Orders.update(id, { status: 'fulfilled', unread: false });
          if (act === 'delete') { Orders.remove(id); Toast.show('Order deleted', 'info'); }
          this.render();
        });
      });
    },
  };

  /* ----------------------------- Views ----------------------------- */
  const Views = {
    /* -------- Product card -------- */
    productCard(p) {
      const inWishlist = Wishlist.has(p.id);
      const outOfStock = p.stock <= 0;
      const onSale = p.oldPrice && p.oldPrice > p.price;
      return `
        <div class="col-sm-6 col-lg-4 col-xl-3 fade-in">
          <article class="product-card" aria-label="${Utils.escape(p.name)}">
            <div class="product-image-wrap">
              <a href="#/product/${p.id}" aria-label="View ${Utils.escape(p.name)}">
                <img class="product-image" src="${Utils.escape(p.image)}" alt="${Utils.escape(p.name)}" loading="lazy" />
              </a>
              ${onSale ? '<span class="product-badge sale">Sale</span>' : ''}
              ${outOfStock ? '<span class="product-badge" style="background:var(--secondary)">Sold Out</span>' : ''}
              <button class="product-wishlist ${inWishlist ? 'active' : ''}"
                      data-wishlist-id="${p.id}" aria-label="Toggle wishlist" type="button">
                <i class="${inWishlist ? 'fas' : 'far'} fa-heart"></i>
              </button>
            </div>
            <div class="product-info">
              <div class="product-category">${Utils.escape(p.category)}</div>
              <h3 class="product-title"><a href="#/product/${p.id}">${Utils.escape(p.name)}</a></h3>
              <div class="product-rating">
                <span class="stars">${Utils.stars(p.rating)}</span>
                <span class="text-muted ms-1 small">(${p.reviews})</span>
              </div>
              <div class="product-price-row">
                <span class="product-price">${Utils.currency(p.price)}</span>
                ${onSale ? `<span class="product-price-old">${Utils.currency(p.oldPrice)}</span>` : ''}
              </div>
              <div class="product-actions">
                <button class="btn btn-sm btn-outline-primary flex-fill" data-quickview="${p.id}" type="button">
                  Quick View
                </button>
                <button class="btn btn-sm btn-primary btn-icon-only" data-add="${p.id}" type="button"
                        ${outOfStock ? 'disabled' : ''} aria-label="Add to cart">
                  <i class="fas fa-cart-plus"></i>
                </button>
              </div>
            </div>
          </article>
        </div>`;
    },

    /* -------- Home -------- */
    renderHome() {
      const container = Utils.byId('homeProducts');
      if (!container) return;
      const featured = SAMPLE_PRODUCTS.slice().sort((a, b) => b.popularity - a.popularity).slice(0, 4);
      container.innerHTML = featured.map(p => this.productCard(p)).join('');
      this.bindProductGrid(container);
    },

    /* -------- Shop -------- */
    renderShop() {
      const grid = Utils.byId('shopProducts');
      const catEl = Utils.byId('categoryFilters');
      const ratingEl = Utils.byId('ratingFilters');
      const countEl = Utils.byId('resultsCount');

      // Show skeletons briefly
      grid.innerHTML = Array.from({ length: 8 }).map(() => `
        <div class="col-sm-6 col-lg-4 col-xl-3">
          <div class="skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line short"></div>
          </div>
        </div>`).join('');

      // Category filter list
      catEl.innerHTML = CATEGORIES.map(c => {
        const count = c.id === 'all' ? SAMPLE_PRODUCTS.length : SAMPLE_PRODUCTS.filter(p => p.category === c.id).length;
        return `<button class="list-group-item ${State.filters.category === c.id ? 'active' : ''}"
                        data-category="${c.id}" type="button">
                  <span>${c.label}</span><span class="count">${count}</span>
                </button>`;
      }).join('');
      Utils.qsa('button[data-category]', catEl).forEach(b => {
        b.addEventListener('click', () => {
          State.filters.category = b.dataset.category;
          this.renderShop();
        });
      });

      // Rating filter
      ratingEl.innerHTML = [4, 3, 0].map(r => `
        <div class="form-check">
          <input class="form-check-input" type="radio" name="ratingFilter" id="rate${r}" value="${r}" ${State.filters.minRating === r ? 'checked' : ''}>
          <label class="form-check-label small" for="rate${r}">
            ${r ? `${Utils.stars(r)} & up` : 'Any rating'}
          </label>
        </div>`).join('');
      Utils.qsa('input[name="ratingFilter"]', ratingEl).forEach(inp => {
        inp.addEventListener('change', () => {
          State.filters.minRating = Number(inp.value);
          this.renderShop();
        });
      });

      // Sort select
      const sortSel = Utils.byId('sortSelect');
      if (sortSel) {
        sortSel.value = State.filters.sort;
        if (!sortSel.dataset.bound) {
          sortSel.addEventListener('change', () => {
            State.filters.sort = sortSel.value;
            this.renderShop();
          });
          sortSel.dataset.bound = '1';
        }
      }

      // Apply results
      requestAnimationFrame(() => {
        const results = Products.applyFilters();
        countEl.textContent = `${results.length} product${results.length === 1 ? '' : 's'}`;
        if (!results.length) {
          grid.innerHTML = `
            <div class="col-12 text-center py-5">
              <i class="fas fa-search fa-3x text-muted mb-3 opacity-25"></i>
              <h5>No products found</h5>
              <p class="text-muted">Try adjusting your filters or search.</p>
              <button class="btn btn-outline-primary" id="resetFilters">Reset Filters</button>
            </div>`;
          Utils.byId('resetFilters')?.addEventListener('click', () => {
            State.filters = { category: 'all', query: '', sort: 'popularity', min: null, max: null, minRating: 0 };
            this.renderShop();
          });
        } else {
          grid.innerHTML = results.map(p => this.productCard(p)).join('');
          this.bindProductGrid(grid);
        }
      });
    },

    bindProductGrid(grid) {
      Utils.qsa('[data-add]', grid).forEach(btn => {
        btn.addEventListener('click', () => Cart.add(Number(btn.dataset.add)));
      });
      Utils.qsa('[data-quickview]', grid).forEach(btn => {
        btn.addEventListener('click', () => Views.openQuickView(Number(btn.dataset.quickview)));
      });
      Utils.qsa('[data-wishlist-id]', grid).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault(); e.stopPropagation();
          Wishlist.toggle(Number(btn.dataset.wishlistId));
        });
      });
    },

    /* -------- Quick view modal -------- */
    openQuickView(id) {
      const p = Products.find(id);
      if (!p) return;
      State.currentProductId = id;
      Utils.byId('modalProductName').textContent = p.name;
      const img = Utils.byId('modalProductImage');
      img.src = p.image; img.alt = p.name;
      Utils.byId('modalProductCategory').textContent = p.category;
      Utils.byId('modalProductPrice').textContent = Utils.currency(p.price);
      Utils.byId('modalProductDescription').textContent = p.description;
      Utils.byId('modalProductRating').innerHTML = Utils.stars(p.rating) + ` <span class="text-muted small ms-1">(${p.reviews} reviews)</span>`;
      Utils.byId('modalQuantity').value = 1;
      bootstrap.Modal.getOrCreateInstance(Utils.byId('productModal')).show();
    },

    /* -------- Product detail -------- */
    renderProduct(id) {
      const p = Products.find(id);
      const container = Utils.byId('productDetail');
      if (!p) { Router.go('/404'); return; }
      State.currentProductId = p.id;

      Utils.byId('productBreadcrumb').innerHTML = `
        <li class="breadcrumb-item"><a href="#/">Home</a></li>
        <li class="breadcrumb-item"><a href="#/shop">Shop</a></li>
        <li class="breadcrumb-item"><a href="#/shop" data-category="${p.category}">${Utils.escape(p.category)}</a></li>
        <li class="breadcrumb-item active">${Utils.escape(p.name)}</li>`;

      const inWishlist = Wishlist.has(p.id);
      const outOfStock = p.stock <= 0;
      const onSale = p.oldPrice && p.oldPrice > p.price;

      container.innerHTML = `
        <div class="col-md-6">
          <div class="product-image-wrap rounded" style="aspect-ratio:1;">
            <img class="product-image" src="${Utils.escape(p.image)}" alt="${Utils.escape(p.name)}" />
          </div>
        </div>
        <div class="col-md-6">
          <div class="product-category mb-1">${Utils.escape(p.category)}</div>
          <h1 class="h3 mb-2">${Utils.escape(p.name)}</h1>
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="text-warning">${Utils.stars(p.rating)}</span>
            <span class="text-muted small">${p.reviews} reviews</span>
            <span class="text-muted small">• SKU: ${Utils.escape(p.sku)}</span>
          </div>
          <div class="d-flex align-items-baseline gap-2 mb-3">
            <span class="h3 text-primary mb-0">${Utils.currency(p.price)}</span>
            ${onSale ? `<span class="text-muted text-decoration-line-through">${Utils.currency(p.oldPrice)}</span>` : ''}
            ${onSale ? `<span class="badge bg-danger">Save ${Utils.currency(p.oldPrice - p.price)}</span>` : ''}
          </div>
          <p class="text-muted">${Utils.escape(p.description)}</p>
          <div class="mb-3">
            ${outOfStock
              ? '<span class="badge bg-secondary">Out of stock</span>'
              : `<span class="badge bg-success">In stock (${p.stock})</span>`}
          </div>
          <div class="d-flex align-items-center gap-2 mb-3">
            <label class="form-label mb-0" for="detailQty">Qty</label>
            <div class="qty-stepper">
              <button type="button" id="qtyDec" aria-label="Decrease">−</button>
              <input id="detailQty" type="number" min="1" max="${p.stock}" value="1" />
              <button type="button" id="qtyInc" aria-label="Increase">+</button>
            </div>
          </div>
          <div class="d-flex gap-2 mb-4 flex-wrap">
            <button class="btn btn-primary btn-lg" id="detailAdd" ${outOfStock ? 'disabled' : ''}>
              <i class="fas fa-cart-plus me-2"></i>Add to Cart
            </button>
            <button class="btn btn-outline-primary btn-lg" id="detailWishlist" data-wishlist-id="${p.id}">
              <i class="${inWishlist ? 'fas' : 'far'} fa-heart me-2"></i>Wishlist
            </button>
          </div>
          <div class="row g-3 text-muted small">
            <div class="col-6"><i class="fas fa-truck me-2"></i>Free shipping over $75</div>
            <div class="col-6"><i class="fas fa-undo me-2"></i>30-day returns</div>
            <div class="col-6"><i class="fas fa-shield-alt me-2"></i>2-year warranty</div>
            <div class="col-6"><i class="fas fa-lock me-2"></i>Secure checkout</div>
          </div>
        </div>`;

      const qtyEl = Utils.byId('detailQty');
      Utils.byId('qtyInc').addEventListener('click', () => { qtyEl.value = Math.min(p.stock, (+qtyEl.value || 1) + 1); });
      Utils.byId('qtyDec').addEventListener('click', () => { qtyEl.value = Math.max(1, (+qtyEl.value || 1) - 1); });
      Utils.byId('detailAdd').addEventListener('click', () => Cart.add(p.id, +qtyEl.value || 1));
      const wlBtn = Utils.byId('detailWishlist');
      wlBtn.addEventListener('click', () => {
        Wishlist.toggle(p.id);
        const active = Wishlist.has(p.id);
        wlBtn.querySelector('i').className = active ? 'fas fa-heart me-2' : 'far fa-heart me-2';
      });

      // Breadcrumb category link
      const catLink = Utils.qs('#productBreadcrumb [data-category]');
      catLink?.addEventListener('click', (e) => {
        e.preventDefault();
        State.filters.category = catLink.dataset.category;
        Router.go('/shop');
      });

      // Related products
      const related = SAMPLE_PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
      Utils.byId('relatedProducts').innerHTML = related.length
        ? related.map(r => this.productCard(r)).join('')
        : `<div class="col-12 text-muted">No related products.</div>`;
      this.bindProductGrid(Utils.byId('relatedProducts'));
    },

    /* -------- Checkout -------- */
    renderCheckout() {
      // Summary list
      const summary = Utils.byId('checkoutSummary');
      if (summary) {
        if (!State.cart.length) {
          summary.innerHTML = `<div class="text-muted small">No items in cart. <a href="#/shop">Shop now</a></div>`;
        } else {
          summary.innerHTML = State.cart.map(item => `
            <div class="d-flex align-items-center gap-3">
              <img src="${Utils.escape(item.image)}" alt="${Utils.escape(item.name)}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;" loading="lazy" />
              <div class="flex-grow-1 min-w-0">
                <div class="fw-semibold small text-truncate">${Utils.escape(item.name)}</div>
                <div class="text-muted small">Qty ${item.quantity}</div>
              </div>
              <div class="fw-semibold small">${Utils.currency(item.price * item.quantity)}</div>
            </div>`).join('');
        }
      }

      // Totals
      const subtotal = Cart.subtotal();
      const discount = Cart.discount();
      const tax = Cart.tax();
      const shipping = Cart.shipping();
      const total = Cart.total();
      const setText = (id, v) => { const el = Utils.byId(id); if (el) el.textContent = v; };
      setText('summarySubtotal', Utils.currency(subtotal));
      setText('summaryDiscount', `-${Utils.currency(discount)}`);
      setText('summaryTax', Utils.currency(tax));
      setText('summaryShipping', shipping === 0 ? 'Free' : Utils.currency(shipping));
      setText('summaryTotal', Utils.currency(total));

      // Review block (step 3)
      const review = Utils.byId('reviewBlock');
      if (review) {
        const data = this._collectForm();
        review.innerHTML = `
          <div class="alert alert-light border small">
            <div class="fw-semibold mb-2">Ship to</div>
            <div>${Utils.escape(data.firstName)} ${Utils.escape(data.lastName)}</div>
            <div>${Utils.escape(data.address)}, ${Utils.escape(data.city)} ${Utils.escape(data.zip)}, ${Utils.escape(data.country)}</div>
            <div>${Utils.escape(data.email)} · ${Utils.escape(data.tel)}</div>
          </div>
          <div class="alert alert-light border small mb-0">
            <div class="fw-semibold mb-2">Payment</div>
            <div>${data.payMethod === 'cod' ? 'Cash on Delivery' : 'Card ending in ' + (data.cardNumber || '').replace(/\s/g,'').slice(-4)}</div>
          </div>`;
      }
    },

    _collectForm() {
      const form = Utils.byId('checkoutForm');
      if (!form) return {};
      const fd = new FormData(form);
      const obj = {};
      for (const [k, v] of fd.entries()) obj[k] = v;
      return obj;
    },

    goToStep(n) {
      State.checkoutStep = n;
      Utils.qsa('.checkout-step').forEach(el => {
        el.classList.toggle('d-none', Number(el.dataset.step) !== n);
      });
      Utils.qsa('.checkout-steps .step').forEach(el => {
        const s = Number(el.dataset.step);
        el.classList.toggle('active', s === n);
        el.classList.toggle('done', s < n);
      });
      if (n === 3) this.renderCheckout();
    },

    /* -------- Confirmation -------- */
    renderConfirmation(orderId) {
      const o = Orders.find(orderId);
      const container = Utils.byId('confirmationContent');
      if (!o || !container) { container.innerHTML = '<p class="text-center text-muted">Order not found.</p>'; return; }
      container.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between mb-3">
              <div>
                <div class="text-muted small">Order Number</div>
                <div class="fw-bold">${Utils.escape(o.id)}</div>
              </div>
              <div class="text-end">
                <div class="text-muted small">Date</div>
                <div>${Utils.formatDate(o.createdAt)}</div>
              </div>
            </div>
            <hr />
            <h6>Items</h6>
            ${o.items.map(i => `
              <div class="d-flex justify-content-between small py-1">
                <span>${Utils.escape(i.name)} × ${i.qty}</span>
                <span>${Utils.currency(i.price * i.qty)}</span>
              </div>`).join('')}
            <hr />
            <div class="d-flex justify-content-between small"><span>Subtotal</span><span>${Utils.currency(o.subtotal)}</span></div>
            <div class="d-flex justify-content-between small"><span>Tax</span><span>${Utils.currency(o.tax)}</span></div>
            <div class="d-flex justify-content-between small"><span>Shipping</span><span>${o.shipping ? Utils.currency(o.shipping) : 'Free'}</span></div>
            <hr />
            <div class="d-flex justify-content-between fw-bold"><span>Total</span><span>${Utils.currency(o.total)}</span></div>
            <hr />
            <div class="small text-muted">
              <div class="fw-semibold">Shipping to</div>
              ${Utils.escape(o.customer.firstName)} ${Utils.escape(o.customer.lastName)}<br />
              ${Utils.escape(o.customer.address)}, ${Utils.escape(o.customer.city)} ${Utils.escape(o.customer.zip)}<br />
              ${Utils.escape(o.customer.country)}
            </div>
            <div class="d-flex gap-2 mt-4">
              <a href="#/orders" class="btn btn-outline-primary flex-fill">View All Orders</a>
              <a href="#/shop" class="btn btn-primary flex-fill">Continue Shopping</a>
            </div>
          </div>
        </div>`;
    },

    /* -------- Wishlist -------- */
    renderWishlist() {
      const el = Utils.byId('wishlistContent');
      if (!el) return;
      const items = Wishlist.items();
      if (!items.length) {
        el.innerHTML = `
          <div class="text-center py-5">
            <i class="far fa-heart fa-3x text-muted mb-3 opacity-25"></i>
            <h5>Your wishlist is empty</h5>
            <p class="text-muted">Save products you love and find them here.</p>
            <a href="#/shop" class="btn btn-primary">Browse Products</a>
          </div>`;
        return;
      }
      el.innerHTML = `<div class="row g-4">${items.map(p => this.productCard(p)).join('')}</div>`;
      this.bindProductGrid(el);
    },

    /* -------- My Orders -------- */
    renderOrders() {
      const el = Utils.byId('ordersContent');
      if (!el) return;
      if (!Auth.isLoggedIn()) {
        el.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-user-lock fa-3x text-muted mb-3 opacity-25"></i>
            <h5>Sign in to view your orders</h5>
            <a href="#/login" class="btn btn-primary">Sign In</a>
          </div>`;
        return;
      }
      const myOrders = State.orders.filter(o => o.customer.email === State.user.email);
      if (!myOrders.length) {
        el.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-box-open fa-3x text-muted mb-3 opacity-25"></i>
            <h5>No orders yet</h5>
            <p class="text-muted">Start shopping to see orders here.</p>
            <a href="#/shop" class="btn btn-primary">Shop Now</a>
          </div>`;
        return;
      }
      el.innerHTML = myOrders.map(o => `
        <div class="card shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex flex-wrap justify-content-between gap-2 mb-3">
              <div><span class="fw-bold">${Utils.escape(o.id)}</span><span class="text-muted small ms-2">${Utils.formatDate(o.createdAt)}</span></div>
              <span class="badge ${o.status === 'fulfilled' ? 'bg-success' : 'bg-secondary'} align-self-start">${o.status}</span>
            </div>
            ${o.items.map(i => `
              <div class="d-flex justify-content-between small py-1">
                <span>${Utils.escape(i.name)} × ${i.qty}</span>
                <span>${Utils.currency(i.price * i.qty)}</span>
              </div>`).join('')}
            <hr class="my-2" />
            <div class="d-flex justify-content-between fw-bold"><span>Total</span><span>${Utils.currency(o.total)}</span></div>
          </div>
        </div>`).join('');
    },

    /* -------- Account -------- */
    renderAccount() {
      const el = Utils.byId('accountContent');
      if (!el) return;
      if (!Auth.isLoggedIn()) {
        el.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-user fa-3x text-muted mb-3 opacity-25"></i>
            <h5>Please sign in</h5>
            <a href="#/login" class="btn btn-primary">Sign In</a>
          </div>`;
        return;
      }
      const u = State.user;
      const myOrders = State.orders.filter(o => o.customer.email === u.email);
      el.innerHTML = `
        <div class="row g-4">
          <div class="col-md-4">
            <div class="card shadow-sm">
              <div class="card-body text-center">
                <div class="display-6 mb-2"><i class="fas fa-user-circle text-primary"></i></div>
                <h5 class="mb-0">${Utils.escape(u.name)}</h5>
                <p class="text-muted small mb-0">${Utils.escape(u.email)}</p>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div class="row g-3">
              <div class="col-sm-6">
                <div class="card shadow-sm h-100"><div class="card-body">
                  <div class="text-muted small">Total Orders</div>
                  <div class="h3 mb-0">${myOrders.length}</div>
                </div></div>
              </div>
              <div class="col-sm-6">
                <div class="card shadow-sm h-100"><div class="card-body">
                  <div class="text-muted small">Wishlist Items</div>
                  <div class="h3 mb-0">${State.wishlist.length}</div>
                </div></div>
              </div>
              <div class="col-12">
                <div class="card shadow-sm"><div class="card-body">
                  <a href="#/orders" class="btn btn-outline-primary btn-sm me-2"><i class="fas fa-box me-1"></i>My Orders</a>
                  <a href="#/wishlist" class="btn btn-outline-primary btn-sm"><i class="far fa-heart me-1"></i>Wishlist</a>
                </div></div>
              </div>
            </div>
          </div>
        </div>`;
    },
  };

  /* ----------------------------- Router ----------------------------- */
  const Router = {
    current: null,
    routes: ['home', 'shop', 'product', 'wishlist', 'checkout', 'confirmation', 'orders', 'login', 'register', 'account', 'about', 'contact', 'faq', 'admin', '404'],
    titles: {
      home: 'ModernShop — Premium Online Store',
      shop: 'Shop All Products — ModernShop',
      product: 'Product — ModernShop',
      wishlist: 'My Wishlist — ModernShop',
      checkout: 'Checkout — ModernShop',
      confirmation: 'Order Confirmed — ModernShop',
      orders: 'My Orders — ModernShop',
      login: 'Sign In — ModernShop',
      register: 'Create Account — ModernShop',
      account: 'My Account — ModernShop',
      about: 'About — ModernShop',
      contact: 'Contact — ModernShop',
      faq: 'FAQ — ModernShop',
      admin: 'Admin — ModernShop',
      404: 'Not Found — ModernShop',
    },
    parse(hash) {
      const raw = (hash || '#/').replace(/^#\/?/, '');
      const parts = raw.split('/').filter(Boolean);
      if (!parts.length) return { name: 'home' };
      const [head, ...rest] = parts;
      if (head === 'product' && rest[0]) return { name: 'product', id: rest[0] };
      if (this.routes.includes(head)) return { name: head };
      return { name: '404' };
    },
    go(path) {
      const clean = path.startsWith('#') ? path : `#${path.startsWith('/') ? '' : '/'}${path}`;
      if (location.hash === clean) this.handle();
      else location.hash = clean;
    },
    handle() {
      const { name, id } = this.parse(location.hash);
      this.current = name;
      document.title = this.titles[name] || 'ModernShop';

      // Hide all pages, show one
      Utils.qsa('.page').forEach(p => p.classList.add('d-none'));
      const el = Utils.byId(`page-${name}`);
      if (el) el.classList.remove('d-none');
      else Utils.byId('page-404')?.classList.remove('d-none');

      // Close cart on navigation
      Cart.close();

      // Render
      if (name === 'home') Views.renderHome();
      if (name === 'shop') Views.renderShop();
      if (name === 'product') Views.renderProduct(id);
      if (name === 'wishlist') Views.renderWishlist();
      if (name === 'checkout') { Views.goToStep(1); Views.renderCheckout(); }
      if (name === 'orders') Views.renderOrders();
      if (name === 'account') Views.renderAccount();
      if (name === 'admin') Admin.render();

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update active nav links
      Utils.qsa('.navbar-nav .nav-link').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === location.hash);
      });
    },
    init() {
      window.addEventListener('hashchange', () => this.handle());
      this.handle();
    },
  };

  /* ----------------------------- Init & bindings ----------------------------- */
  function init() {
    Utils.byId('year').textContent = new Date().getFullYear();

    Toast.init();
    Auth.renderMenu();
    Cart.render();
    Wishlist.renderBadge();
    Admin.updateNotif();

    // Navbar buttons
    Utils.byId('cartBtn')?.addEventListener('click', () => Cart.open());
    Utils.byId('closeCartBtn')?.addEventListener('click', () => Cart.close());
    Utils.byId('cartOverlay')?.addEventListener('click', () => Cart.close());
    Utils.byId('checkoutBtn')?.addEventListener('click', () => {
      if (!State.cart.length) { Toast.show('Cart is empty', 'warning'); return; }
      Cart.close();
      Router.go('/checkout');
    });
    Utils.byId('clearCartBtn')?.addEventListener('click', () => Cart.clear());
    Utils.byId('wishlistBtn')?.addEventListener('click', () => Router.go('/wishlist'));
    Utils.byId('logoutBtn')?.addEventListener('click', () => Auth.logout());

    // Search
    const searchInput = Utils.byId('searchInput');
    searchInput?.addEventListener('input', Utils.debounce(e => {
      State.filters.query = e.target.value.trim();
      if (Router.current !== 'shop') Router.go('/shop');
      else Views.renderShop();
    }, 250));

    // Category dropdown items
    Utils.qsa('.dropdown-menu [data-category], .footer-link[data-category]').forEach(el => {
      el.addEventListener('click', () => {
        State.filters.category = el.dataset.category;
        State.filters.query = '';
        Router.go('/shop');
      });
    });

    // Filter panel - price
    Utils.byId('applyPrice')?.addEventListener('click', () => {
      const min = parseFloat(Utils.byId('priceMin').value);
      const max = parseFloat(Utils.byId('priceMax').value);
      State.filters.min = isNaN(min) ? null : min;
      State.filters.max = isNaN(max) ? null : max;
      Views.renderShop();
    });

    Utils.byId('clearFilters')?.addEventListener('click', () => {
      State.filters = { category: 'all', query: '', sort: 'popularity', min: null, max: null, minRating: 0 };
      Utils.byId('priceMin').value = '';
      Utils.byId('priceMax').value = '';
      Utils.byId('searchInput').value = '';
      Views.renderShop();
    });

    // Modal buttons
    Utils.byId('modalAddToCart')?.addEventListener('click', () => {
      const id = State.currentProductId;
      const qty = parseInt(Utils.byId('modalQuantity').value, 10) || 1;
      if (id) Cart.add(id, qty);
      bootstrap.Modal.getInstance(Utils.byId('productModal'))?.hide();
    });
    Utils.byId('modalViewFull')?.addEventListener('click', () => {
      const id = State.currentProductId;
      bootstrap.Modal.getInstance(Utils.byId('productModal'))?.hide();
      if (id) Router.go(`/product/${id}`);
    });

    // Newsletter
    Utils.byId('newsletterForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const email = e.target.email.value.trim();
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) { Toast.show('Enter a valid email', 'danger'); return; }
      Toast.show('Subscribed successfully', 'success');
      e.target.reset();
    });

    // Contact
    Utils.byId('contactForm')?.addEventListener('submit', e => {
      e.preventDefault();
      Toast.show('Message sent — we will reply soon', 'success');
      e.target.reset();
    });

    // Login
    Utils.byId('loginForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        Auth.login(fd.get('email'), fd.get('password'));
        Toast.show('Signed in', 'success');
        Router.go('/account');
      } catch (err) { Toast.show(err.message, 'danger'); }
    });

    // Register
    Utils.byId('registerForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        Auth.register({
          name: fd.get('name'), email: fd.get('email'), password: fd.get('password'),
        });
        Toast.show('Account created', 'success');
        Router.go('/account');
      } catch (err) { Toast.show(err.message, 'danger'); }
    });

    // Checkout wizard navigation
    Utils.qsa('#checkoutForm [data-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = Number(btn.dataset.next);
        if (step === 2) {
          const form = Utils.byId('checkoutForm');
          // Validate only step-1 required fields
          const required = ['firstName','lastName','email','tel','address','city','zip'];
          const missing = required.filter(name => !form.elements[name]?.value.trim());
          if (missing.length) { Toast.show('Please fill all shipping fields', 'danger'); return; }
        }
        Views.goToStep(step);
      });
    });
    Utils.qsa('#checkoutForm [data-prev]').forEach(btn => {
      btn.addEventListener('click', () => Views.goToStep(Number(btn.dataset.prev)));
    });

    // Payment method toggle
    Utils.qsa('input[name="payMethod"]').forEach(r => {
      r.addEventListener('change', () => {
        Utils.byId('cardFields').style.display = r.value === 'cod' && r.checked ? 'none' : '';
      });
    });
    // Hide card fields initially if COD is pre-checked (it isn't, so leave visible)

    // Coupon
    Utils.byId('applyCoupon')?.addEventListener('click', () => {
      const code = (Utils.byId('couponInput').value || '').trim().toUpperCase();
      const coupon = COUPONS[code];
      if (!coupon) { Toast.show('Invalid coupon code', 'danger'); return; }
      State.coupon = coupon;
      State.saveCoupon();
      Toast.show(`Coupon "${code}" applied — ${coupon.label}`, 'success');
      Views.renderCheckout();
    });

    // Checkout submit
    Utils.byId('checkoutForm')?.addEventListener('submit', e => {
      e.preventDefault();
      if (!State.cart.length) { Toast.show('Cart is empty', 'warning'); return; }

      const data = Views._collectForm();

      // Validate card if paying by card
      if (data.payMethod === 'card') {
        if (!/^\d{12,19}$/.test((data.cardNumber || '').replace(/\s/g, ''))) {
          Toast.show('Enter a valid card number', 'danger'); return;
        }
        if (!/^\d{2}\/\d{2}$/.test(data.expiry || '')) { Toast.show('Invalid expiry (MM/YY)', 'danger'); return; }
        if (!/^\d{3,4}$/.test(data.cvv || '')) { Toast.show('Invalid CVV', 'danger'); return; }
      }

      const placeBtn = Utils.byId('placeOrderBtn');
      placeBtn.disabled = true;
      placeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing…';

      // Simulate async payment (replace with real gateway call)
      setTimeout(() => {
        // NOTE: In production, this order creation MUST happen on the server
        // AFTER a verified payment callback/webhook. Never trust the client.
        const subtotal = Cart.subtotal();
        const discount = Cart.discount();
        const tax = Cart.tax();
        const shipping = Cart.shipping();
        const total = Cart.total();

        const order = Orders.create({
          id: 'ORD-' + Date.now().toString().slice(-8),
          customer: {
            firstName: data.firstName, lastName: data.lastName, email: data.email,
            tel: data.tel, address: data.address, city: data.city,
            zip: data.zip, country: data.country,
          },
          items: State.cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity })),
          subtotal: Number(subtotal.toFixed(2)),
          discount: Number(discount.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          shipping: Number(shipping.toFixed(2)),
          total: Number(total.toFixed(2)),
          payMethod: data.payMethod,
          status: 'processing',
          paymentStatus: data.payMethod === 'cod' ? 'pending' : 'paid',
          unread: true,
          createdAt: new Date().toISOString(),
        });

        // Clear cart
        State.cart = [];
        State.coupon = null;
        State.saveCart();
        State.saveCoupon();
        Cart.render();
        placeBtn.disabled = false;
        placeBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Place Order';

        Toast.show('Order placed successfully', 'success');
        Router.go(`/confirmation?order=${order.id}`);
      }, 900);
    });

    // Admin filters
    Utils.qsa('#orderFilterGroup button').forEach(b => {
      b.addEventListener('click', () => {
        Utils.qsa('#orderFilterGroup button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        Admin.filter = b.dataset.filter;
        Admin.render();
      });
    });
    Utils.byId('orderSearch')?.addEventListener('input', Utils.debounce(e => {
      Admin.search = e.target.value.trim();
      Admin.render();
    }, 200));

    // Handle ?order= in confirmation
    window.addEventListener('hashchange', () => {
      const m = location.hash.match(/\/confirmation\?order=([^&]+)/);
      if (m) Views.renderConfirmation(decodeURIComponent(m[1]));
    });
    const initial = location.hash.match(/\/confirmation\?order=([^&]+)/);
    if (initial) Views.renderConfirmation(decodeURIComponent(initial[1]));

    // Escape closes cart
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') Cart.close();
    });

    // Cross-tab sync
    window.addEventListener('storage', e => {
      if (e.key === KEYS.CART) { State.cart = Storage.get(KEYS.CART, []); Cart.render(); }
      if (e.key === KEYS.WISHLIST) { State.wishlist = Storage.get(KEYS.WISHLIST, []); Wishlist.renderBadge(); }
    });

    // Router last
    Router.init();
  }

  // Expose minimal API for inline handlers (changeQty uses it)
  window.App = {
    changeQty(delta) {
      const input = Utils.byId('modalQuantity');
      if (!input) return;
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
    },
  };

  // Run
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();