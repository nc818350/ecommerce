// Data
let products = [];
let cart = [];
let currentProduct = null;
let filteredProducts = [];

const sampleProducts = [
  { id: 1, name: "Wireless Bluetooth Headphones", category: "electronics", price: 79.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", description: "Premium wireless headphones with noise cancellation and 30-hour battery life.", rating: 4.5, reviews: 120, popularity: 95 },
  { id: 2, name: "Smart Fitness Watch", category: "electronics", price: 199.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", description: "Advanced fitness tracking with heart rate monitor and GPS functionality.", rating: 4.7, reviews: 89, popularity: 88 },
  { id: 3, name: "Casual Summer Dress", category: "clothing", price: 49.99, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80", description: "Comfortable and stylish summer dress perfect for casual occasions.", rating: 4.3, reviews: 76, popularity: 82 },
  { id: 4, name: "Professional Laptop Backpack", category: "accessories", price: 39.99, image: "https://images.unsplash.com/photo-1514477917009-389c76a86b68?auto=format&fit=crop&w=600&q=80", description: "Durable backpack with multiple compartments and padded laptop sleeve.", rating: 4.4, reviews: 64, popularity: 81 },
  { id: 5, name: "Wireless Mouse", category: "electronics", price: 24.99, image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=80", description: "Ergonomic wireless mouse with adjustable DPI and silent clicks.", rating: 4.2, reviews: 43, popularity: 79 },
  { id: 6, name: "Men's Slim Fit Shirt", category: "clothing", price: 34.5, image: "https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&w=600&q=80", description: "Breathable cotton shirt suitable for office and casual wear.", rating: 4.1, reviews: 52, popularity: 73 },
  { id: 7, name: "Women's Leather Handbag", category: "accessories", price: 129.0, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80", description: "Classic leather handbag with spacious interior and premium finish.", rating: 4.6, reviews: 98, popularity: 90 },
  { id: 8, name: "Noise Cancelling Earbuds", category: "electronics", price: 99.0, image: "https://images.unsplash.com/photo-1585386959984-a4155223168f?auto=format&fit=crop&w=600&q=80", description: "Compact earbuds with active noise cancellation and clear calls.", rating: 4.4, reviews: 71, popularity: 85 }
];

// Elements
const productsContainer = document.getElementById("productsContainer");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const searchInput = document.getElementById("searchInput");

// Utils
function currency(n) { return `$${Number(n || 0).toFixed(2)}`; }

function toast(msg) {
  const el = document.getElementById("toast");
  const body = document.getElementById("toastBody");
  if (!el || !body) return;
  body.textContent = msg;
  const t = new bootstrap.Toast(el);
  t.show();
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  products = [...sampleProducts];
  filteredProducts = [...products];

  loadProducts();
  loadCartFromStorage();
  setupEventListeners();
  updateAdminNotif();
});

// Build products
function loadProducts() {
  productsContainer.innerHTML = "";
  if (!filteredProducts.length) {
    productsContainer.innerHTML = `<div class="col-12 text-center text-muted py-5">No products found</div>`;
    return;
  }
  filteredProducts.forEach(product => {
    const col = createProductCard(product);
    productsContainer.appendChild(col);
    requestAnimationFrame(() => {
      const card = col.firstElementChild;
      if (card) {
        card.style.opacity = "1";
        card.style.transform = "none";
      }
    });
  });
}

function createProductCard(product) {
  const col = document.createElement("div");
  col.className = "col-lg-4 col-md-6";
  col.innerHTML = `
    <div class="product-card" style="opacity:0; transform: translateY(16px); transition: all .3s ease;">
      <div class="position-relative overflow-hidden">
        <img class="product-image" src="${product.image}" alt="${product.name}" />
        <div class="position-absolute top-0 end-0 p-2">
          <button class="btn btn-sm btn-light rounded-circle" aria-label="Add to wishlist" onclick="toggleWishlist(${product.id}, event)">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <p class="product-category mb-1 text-capitalize">${product.category}</p>
        <h5 class="product-title">${product.name}</h5>
        <div class="d-flex align-items-center mb-2">
          <div class="text-warning me-2">${generateStars(product.rating)}</div>
          <small class="text-muted">${product.reviews}</small>
        </div>
        <p class="product-price">${currency(product.price)}</p>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary flex-fill" onclick="showProductDetails(${product.id})">View Details</button>
          <button class="btn btn-primary btn-add-cart" title="Add to Cart" onclick="addToCart(${product.id})"><i class="fas fa-cart-plus"></i></button>
        </div>
      </div>
    </div>`;
  return col;
}

function generateStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 !== 0;
  let out = "";
  for (let i = 0; i < full; i++) out += '<i class="fas fa-star"></i>';
  if (half) out += '<i class="fas fa-star-half-alt"></i>';
  for (let i = 0; i < 5 - Math.ceil(rating); i++) out += '<i class="far fa-star"></i>';
  return out;
}

// Filters / sort / search
function filterProducts(category, ev) {
  document.querySelectorAll('.btn-outline-primary').forEach(b => b.classList.remove('active'));
  if (ev && ev.target && ev.target.classList.contains('btn')) ev.target.classList.add('active');

  filteredProducts = category === 'all' ? [...products] : products.filter(p => p.category === category);
  loadProducts();
}

function sortProducts(type) {
  switch (type) {
    case 'price-low': filteredProducts.sort((a,b) => a.price - b.price); break;
    case 'price-high': filteredProducts.sort((a,b) => b.price - a.price); break;
    case 'name': filteredProducts.sort((a,b) => a.name.localeCompare(b.name)); break;
    case 'popularity': filteredProducts.sort((a,b) => b.popularity - a.popularity); break;
    default: break;
  }
  loadProducts();
}

function handleSearch(e) {
  const q = (e.target.value || "").toLowerCase();
  filteredProducts = q
    ? products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q))
    : [...products];
  loadProducts();
}

// Smooth scroll for hash links
function setupEventListeners() {
  if (searchInput) searchInput.addEventListener("input", handleSearch);

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        // allow admin link to manage visibility separately
        if (href !== "#admin") e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  const newsletterGroup = document.querySelector(".input-group");
  if (newsletterGroup) {
    const btn = newsletterGroup.querySelector(".btn");
    if (btn) btn.addEventListener("click", handleNewsletterSubscription);
  }

  const contactForm = document.querySelector('#contact form');
  if (contactForm) contactForm.addEventListener("submit", handleContactForm);

  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) checkoutForm.addEventListener("submit", handleCheckoutSubmit);
}

// Modal and product details
function showProductDetails(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;
  document.getElementById("modalProductName").textContent = p.name;
  const img = document.getElementById("modalProductImage");
  img.src = p.image;
  img.alt = p.name;
  document.getElementById("modalProductCategory").textContent = p.category;
  document.getElementById("modalProductPrice").textContent = p.price.toFixed(2);
  document.getElementById("modalProductDescription").textContent = p.description;
  document.getElementById("modalProductRating").innerHTML = generateStars(p.rating);
  document.getElementById("modalQuantity").value = 1;
  new bootstrap.Modal(document.getElementById("productModal")).show();
}

function changeQuantity(delta) {
  const input = document.getElementById("modalQuantity");
  let val = parseInt(input.value || "1", 10) + delta;
  if (val < 1) val = 1;
  input.value = val;
}

function addToCartFromModal() {
  if (!currentProduct) return;
  const qty = parseInt(document.getElementById("modalQuantity").value || "1", 10);
  addToCart(currentProduct.id, qty);
  const m = bootstrap.Modal.getInstance(document.getElementById("productModal"));
  if (m) m.hide();
}

// Cart
function toggleCart() {
  const open = !cartSidebar.classList.contains("active");
  cartSidebar.classList.toggle("active", open);
  cartOverlay.classList.toggle("active", open);
}

function addToCart(id, qty = 1) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const exist = cart.find(i => i.id === id);
  if (exist) exist.quantity += qty;
  else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, quantity: qty });
  updateCartDisplay();
  saveCart();
  toast("Item added to cart");
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartDisplay();
  saveCart();
  toast("Item removed");
}

function updateCartQuantity(id, qty) {
  if (qty < 1 || isNaN(qty)) qty = 1;
  const item = cart.find(i => i.id === id);
  if (item) item.quantity = qty;
  updateCartDisplay();
  saveCart();
}

function clearCart() {
  cart = [];
  updateCartDisplay();
  saveCart();
}

function updateCartDisplay() {
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  cartCount.textContent = String(totalItems);
  cartCount.style.display = totalItems > 0 ? "inline" : "none";

  cartItems.innerHTML = cart.length ? "" : `<div class="text-center py-4"><p class="text-muted mb-0">Your cart is empty</p></div>`;

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img class="cart-item-image" src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info flex-grow-1">
        <div class="cart-item-name fw-semibold">${item.name}</div>
        <div class="cart-item-price text-primary">${currency(item.price)}</div>
        <div class="cart-item-quantity mt-1 d-flex align-items-center gap-1">
          <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" aria-label="Decrease">-</button>
          <input class="form-control form-control-sm text-center" type="number" min="1" value="${item.quantity}" onchange="updateCartQuantity(${item.id}, parseInt(this.value||'1',10))" />
          <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" aria-label="Increase">+</button>
        </div>
      </div>
      <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})" aria-label="Remove"><i class="fas fa-trash"></i></button>`;
    cartItems.appendChild(div);
  });

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  cartTotal.textContent = total.toFixed(2);

  updateCheckoutSummary();
}

// Storage
function saveCart() { localStorage.setItem("modernshop_cart", JSON.stringify(cart)); }
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem("modernshop_cart");
    if (saved) cart = JSON.parse(saved);
  } catch {}
  updateCartDisplay();
}

// Wishlist (demo only)
function toggleWishlist(id, ev) {
  if (ev) ev.preventDefault();
  toast("Wishlist updated");
}

// Navigation between sections
function showHome() {
  document.getElementById("checkout").classList.add("d-none");
  document.getElementById("admin").classList.add("d-none");
  document.getElementById("home").scrollIntoView({ behavior: "smooth" });
}

function proceedToCheckout() {
  toggleCart(); // close if open
  document.getElementById("checkout").classList.remove("d-none");
  document.getElementById("admin").classList.add("d-none");
  document.getElementById("checkout").scrollIntoView({ behavior: "smooth", block: "start" });
  updateCheckoutSummary();
}

/* Checkout summary */
function updateCheckoutSummary() {
  const summary = document.getElementById("checkoutSummary");
  const subtotalEl = document.getElementById("summarySubtotal");
  const taxEl = document.getElementById("summaryTax");
  const shippingEl = document.getElementById("summaryShipping");
  const totalEl = document.getElementById("summaryTotal");
  if (!summary || !subtotalEl || !taxEl || !shippingEl || !totalEl) return;

  summary.innerHTML = "";

  if (!cart.length) {
    summary.innerHTML = `<div class="text-muted">No items in cart</div>`;
  } else {
    cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "d-flex justify-content-between align-items-center";
      row.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <img src="${item.image}" alt="${item.name}" style="width:42px;height:42px;object-fit:cover;border-radius:.25rem;" />
          <div>
            <div class="fw-semibold">${item.name}</div>
            <div class="text-muted small">Qty: ${item.quantity}</div>
          </div>
        </div>
        <div class="fw-semibold">${currency(item.price * item.quantity)}</div>
      `;
      summary.appendChild(row);
    });
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = cart.length ? 5.99 : 0;
  const total = subtotal + tax + shipping;

  subtotalEl.textContent = currency(subtotal);
  taxEl.textContent = currency(tax);
  shippingEl.textContent = currency(shipping);
  totalEl.textContent = currency(total);
}

/* Checkout form handling */
function handleCheckoutSubmit(e) {
  e.preventDefault();
  if (!cart.length) { toast("Cart is empty"); return; }

  const form = e.target;
  const data = new FormData(form);

  // Build order
  const order = {
    id: "ORD-" + Date.now().toString().slice(-8),
    customer: {
      firstName: data.get("firstName") || "",
      lastName: data.get("lastName") || "",
      email: data.get("email") || "",
      tel: data.get("tel") || "",
      address: data.get("address") || "",
      city: data.get("city") || "",
      zip: data.get("zip") || "",
      country: data.get("country") || ""
    },
    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity })),
    subtotal: Number(cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)),
    tax: 0,
    shipping: 0,
    total: 0,
    status: "new",
    unread: true,
    createdAt: new Date().toISOString()
  };
  order.tax = Number((order.subtotal * 0.08).toFixed(2));
  order.shipping = cart.length ? 5.99 : 0;
  order.total = Number((order.subtotal + order.tax + order.shipping).toFixed(2));

  // Persist order
  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders);

  // Clear cart
  cart = [];
  saveCart();
  updateCartDisplay();

  toast("Order placed successfully");
  showAdmin(); // jump to admin to view
}

/* Admin section */
function showAdmin(ev) {
  if (ev) ev.preventDefault();
  document.getElementById("checkout").classList.add("d-none");
  document.getElementById("admin").classList.remove("d-none");
  renderOrdersTable();
  document.getElementById("admin").scrollIntoView({ behavior: "smooth", block: "start" });
}

function filterOrders(type, ev) {
  document.querySelectorAll('#admin .btn-group .btn').forEach(b => b.classList.remove('active'));
  if (ev && ev.target) ev.target.classList.add('active');
  renderOrdersTable({ filter: type });
}

function renderOrdersTable(opts = {}) {
  const { filter = "all" } = opts;
  const tbody = document.getElementById("ordersTableBody");
  const search = (document.getElementById("orderSearch")?.value || "").toLowerCase();
  if (!tbody) return;

  let rows = loadOrders();

  if (filter === "unread") rows = rows.filter(o => o.unread);
  if (filter === "fulfilled") rows = rows.filter(o => o.status === "fulfilled");

  if (search) {
    rows = rows.filter(o =>
      o.id.toLowerCase().includes(search) ||
      (o.customer.email || "").toLowerCase().includes(search) ||
      ((o.customer.firstName + " " + o.customer.lastName).toLowerCase()).includes(search)
    );
  }

  tbody.innerHTML = rows.length ? "" : `<tr><td colspan="7" class="text-center text-muted">No orders</td></tr>`;

  rows.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="fw-semibold">${o.id}</td>
      <td>${o.customer.firstName} ${o.customer.lastName}</td>
      <td>${o.customer.email}</td>
      <td>${currency(o.total)}</td>
      <td>
        <span class="badge ${o.status === 'fulfilled' ? 'bg-success' : 'bg-secondary'}">${o.status}</span>
        ${o.unread ? '<span class="badge bg-danger ms-1">new</span>' : ''}
      </td>
      <td>${new Date(o.createdAt).toLocaleString()}</td>
      <td class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-primary">Mark read</button>
        <button class="btn btn-sm btn-outline-success">Fulfill</button>
        <button class="btn btn-sm btn-outline-danger">Delete</button>
      </td>
    `;

    const [btnRead, btnFulfill, btnDelete] = tr.querySelectorAll("button");

    btnRead.addEventListener("click", () => {
      o.unread = false;
      saveOrders(rowsUpdate(o));
      renderOrdersTable({ filter });
    });

    btnFulfill.addEventListener("click", () => {
      o.status = "fulfilled";
      o.unread = false;
      saveOrders(rowsUpdate(o));
      renderOrdersTable({ filter });
    });

    btnDelete.addEventListener("click", () => {
      const all = loadOrders().filter(x => x.id !== o.id);
      saveOrders(all);
      renderOrdersTable({ filter });
    });

    tbody.appendChild(tr);
  });

  // helper to persist an updated order within the whole list
  function rowsUpdate(updated) {
    const all = loadOrders();
    const i = all.findIndex(x => x.id === updated.id);
    if (i >= 0) all[i] = updated;
    return all;
  }
}

/* Orders storage + admin badge */
function loadOrders() {
  try { return JSON.parse(localStorage.getItem("modernshop_orders") || "[]"); }
  catch { return []; }
}

function saveOrders(orders) {
  localStorage.setItem("modernshop_orders", JSON.stringify(orders));
  updateAdminNotif();
}

function updateAdminNotif() {
  const badge = document.getElementById("adminNotif");
  if (!badge) return;
  const unread = loadOrders().filter(o => o.unread).length;
  if (unread > 0) {
    badge.textContent = String(unread);
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

/* Newsletter + contact (demo behaviors) */
function handleNewsletterSubscription() {
  toast("Subscribed successfully");
}

function handleContactForm(e) {
  e.preventDefault();
  toast("Message sent");
}

/* Additional helpers */
function scrollToProducts() {
  const el = document.getElementById("products");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Expose needed functions for inline handlers */
window.filterProducts = filterProducts;
window.sortProducts = sortProducts;
window.showProductDetails = showProductDetails;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleCart = toggleCart;
window.proceedToCheckout = proceedToCheckout;
window.changeQuantity = changeQuantity;
window.addToCartFromModal = addToCartFromModal;
window.toggleWishlist = toggleWishlist;
window.showAdmin = showAdmin;
window.filterOrders = filterOrders;

