// Data
let products = [];
let cart = [];
let currentProduct = null;
let filteredProducts = [];

const sampleProducts = [
  { id:1, name:"Wireless Bluetooth Headphones", category:"electronics", price:79.99,
    image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    description:"Premium wireless headphones with noise cancellation and 30-hour battery life.",
    rating:4.5, reviews:120, popularity:95
  },
  { id:2, name:"Smart Fitness Watch", category:"electronics", price:199.99,
    image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    description:"Advanced fitness tracking with heart rate monitor and GPS functionality.",
    rating:4.7, reviews:89, popularity:88
  },
  { id:3, name:"Casual Summer Dress", category:"clothing", price:49.99,
    image:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    description:"Comfortable and stylish summer dress perfect for casual occasions.",
    rating:4.3, reviews:76, popularity:82
  },
  { id:4, name:"Professional Laptop Backpack", category:"accessories", price:39.99,
    image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    description:"Durable laptop backpack with multiple compartments and water resistance.",
    rating:4.2, reviews:154, popularity:91
  },
  { id:5, name:"Vintage Denim Jacket", category:"clothing", price:69.99,
    image:"https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=600&q=80",
    description:"Classic vintage-style denim jacket with a modern fit.",
    rating:4.6, reviews:203, popularity:87
  },
  { id:6, name:"Wireless Phone Charger", category:"electronics", price:24.99,
    image:"https://images.unsplash.com/photo-1609592094537-b14c798a0fb4?auto=format&fit=crop&w=600&q=80",
    description:"Fast wireless charging pad compatible with all Qi-enabled devices.",
    rating:4.1, reviews:67, popularity:79
  },
  { id:7, name:"Leather Crossbody Bag", category:"accessories", price:89.99,
    image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    description:"Elegant leather crossbody bag perfect for everyday use.",
    rating:4.8, reviews:145, popularity:93
  },
  { id:8, name:"Running Sneakers", category:"clothing", price:119.99,
    image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    description:"Comfortable running sneakers with advanced cushioning technology.",
    rating:4.4, reviews:198, popularity:89
  },
  { id:9, name:"Stainless Steel Water Bottle", category:"accessories", price:29.99,
    image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    description:"Insulated bottle keeps drinks cold for 24 hours.",
    rating:4.5, reviews:112, popularity:85
  }
];

// Elements
const productsContainer = document.getElementById('productsContainer');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const searchInput = document.getElementById('searchInput');

// Init
document.addEventListener('DOMContentLoaded', () => {
  products = [...sampleProducts];
  filteredProducts = [...products];
  loadProducts();
  loadCartFromStorage();
  setupEventListeners();
});

// Events
function setupEventListeners() {
  if (searchInput) searchInput.addEventListener('input', handleSearch);

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const newsletterGroup = document.querySelector('.input-group');
  if (newsletterGroup) {
    const btn = newsletterGroup.querySelector('.btn');
    if (btn) btn.addEventListener('click', handleNewsletterSubscription);
  }

  const contactForm = document.querySelector('#contact form');
  if (contactForm) contactForm.addEventListener('submit', handleContactForm);

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);
}

// Render products
function loadProducts() {
  if (!productsContainer) return;
  productsContainer.innerHTML = '';
  filteredProducts.forEach(p => productsContainer.appendChild(createProductCard(p)));

  setTimeout(() => {
    document.querySelectorAll('.product-card').forEach((card, i) => {
      setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, i * 80);
    });
  }, 50);
}

function createProductCard(product) {
  const col = document.createElement('div');
  col.className = 'col-lg-4 col-md-6 mb-4';
  col.innerHTML = `
    <div class="product-card" style="opacity:0; transform: translateY(16px); transition: all .3s ease;">
      <div class="position-relative overflow-hidden">
        <img class="product-image" src="${product.image}" alt="${product.name}"/>
        <div class="position-absolute top-0 end-0 p-2">
          <button class="btn btn-sm btn-light rounded-circle" onclick="toggleWishlist(${product.id}, event)"><i class="far fa-heart"></i></button>
        </div>
      </div>
      <div class="product-info">
        <p class="product-category mb-1 text-capitalize">${product.category}</p>
        <h5 class="product-title">${product.name}</h5>
        <div class="d-flex align-items-center mb-2">
          <div class="stars text-warning me-2">${generateStars(product.rating)}</div>
          <small class="text-muted">(${product.reviews})</small>
        </div>
        <p class="product-price">$${product.price.toFixed(2)}</p>
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
  let out = '';
  for (let i=0;i<full;i++) out += '<i class="fas fa-star"></i>';
  if (half) out += '<i class="fas fa-star-half-alt"></i>';
  for (let i=0;i<5-Math.ceil(rating);i++) out += '<i class="far fa-star"></i>';
  return out;
}

// Filter/sort/search
function filterProducts(category, ev) {
  document.querySelectorAll('.btn-outline-primary').forEach(b => b.classList.remove('active'));
  if (ev && ev.target.classList.contains('btn')) ev.target.classList.add('active');
  if (category === 'all') filteredProducts = [...products];
  else filteredProducts = products.filter(p => p.category === category);
  loadProducts();
}

function sortProducts(type) {
  switch (type) {
    case 'price-low': filteredProducts.sort((a,b)=>a.price-b.price); break;
    case 'price-high': filteredProducts.sort((a,b)=>b.price-a.price); break;
    case 'name': filteredProducts.sort((a,b)=>a.name.localeCompare(b.name)); break;
    case 'popularity': filteredProducts.sort((a,b)=>b.popularity-a.popularity); break;
    default: filteredProducts = [...products];
  }
  loadProducts();
}

function handleSearch(e) {
  const q = e.target.value.toLowerCase();
  filteredProducts = q
    ? products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    : [...products];
  loadProducts();
}

// Product detail modal
function showProductDetails(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;
  document.getElementById('modalProductName').textContent = p.name;
  document.getElementById('modalProductImage').src = p.image;
  document.getElementById('modalProductImage').alt = p.name;
  document.getElementById('modalProductCategory').textContent = p.category.toUpperCase()+p.category.slice(1);
  document.getElementById('modalProductPrice').textContent = `$${p.price.toFixed(2)}`;
  document.getElementById('modalProductDescription').textContent = p.description;
  document.getElementById('modalProductRating').innerHTML = generateStars(p.rating);
  document.getElementById('modalQuantity').value = 1;
  new bootstrap.Modal(document.getElementById('productModal')).show();
}

function changeQuantity(delta) {
  const input = document.getElementById('modalQuantity');
  let val = parseInt(input.value||'1',10)+delta;
  if (val < 1) val = 1;
  input.value = val;
}

function addToCartFromModal() {
  const qty = parseInt(document.getElementById('modalQuantity').value||'1',10);
  addToCart(currentProduct.id, qty);
  bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
}

// Cart
function addToCart(id, qty=1) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const exist = cart.find(i => i.id === id);
  if (exist) exist.quantity += qty;
  else cart.push({ id:p.id, name:p.name, price:p.price, image:p.image, quantity: qty });
  updateCartDisplay();
  saveCart();
  toast('Item added to cart');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartDisplay();
  saveCart();
}

function updateCartQuantity(id, qty) {
  const it = cart.find(i => i.id === id);
  if (!it) return;
  if (qty <= 0) return removeFromCart(id);
  it.quantity = qty;
  updateCartDisplay();
  saveCart();
}

function updateCartDisplay() {
  const totalItems = cart.reduce((s,i)=>s+i.quantity,0);
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems > 0 ? 'inline' : 'none';

  cartItems.innerHTML = cart.length ? '' : '<div class="text-center py-4"><p class="text-muted">Your cart is empty</p></div>';

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img class="cart-item-image" src="${item.image}" alt="${item.name}"/>
      <div class="cart-item-info flex-grow-1">
        <div class="cart-item-name fw-semibold">${item.name}</div>
        <div class="cart-item-price text-primary">$${item.price.toFixed(2)}</div>
        <div class="cart-item-quantity mt-1 d-flex align-items-center gap-1">
          <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
          <input type="number" min="1" value="${item.quantity}" onchange="updateCartQuantity(${item.id}, parseInt(this.value||'1',10))"/>
          <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
        </div>
      </div>
      <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
    `;
    cartItems.appendChild(div);
  });

  const total = cart.reduce((s,i)=>s+i.price*i.quantity,0);
  cartTotal.textContent = total.toFixed(2);
}

function toggleCart() {
  cartSidebar.classList.toggle('active');
  cartOverlay.classList.toggle('active');
  document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
}

function saveCart() { localStorage.setItem('modernshop_cart', JSON.stringify(cart)); }
function loadCartFromStorage() {
  const saved = localStorage.getItem('modernshop_cart');
  if (saved) { cart = JSON.parse(saved); updateCartDisplay(); }
}

// Checkout
function proceedToCheckout() {
  if (!cart.length) return alert('Your cart is empty!');
  toggleCart();
  ['home','products','about','contact'].forEach(id => document.getElementById(id).style.display='none');
  document.querySelector('footer').style.display='none';
  document.querySelector('.py-5.bg-primary').style.display='none';
  const section = document.getElementById('checkout');
  section.style.display='block';
  updateCheckoutSummary();
  section.scrollIntoView({ behavior:'smooth' });
}

function updateCheckoutSummary() {
  const items = document.getElementById('checkoutItems');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const taxEl = document.getElementById('checkoutTax');
  const totalEl = document.getElementById('checkoutTotal');

  items.innerHTML = '';
  cart.forEach(i => {
    const row = document.createElement('div');
    row.className = 'd-flex justify-content-between align-items-center mb-2';
    row.innerHTML = `<div><small>${i.name}</small><br/><small class="text-muted">Qty: ${i.quantity}</small></div><small>$${(i.price*i.quantity).toFixed(2)}</small>`;
    items.appendChild(row);
  });

  const subtotal = cart.reduce((s,i)=>s+i.price*i.quantity,0);
  const shipping = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;
  let ok = true;
  form.querySelectorAll('[required]').forEach(f=>{
    if(!f.value.trim()){ f.classList.add('is-invalid'); ok=false; } else { f.classList.remove('is-invalid'); }
  });
  if (!ok) return alert('Please fill in all required fields.');
  placeOrder();
}

function placeOrder() {
  const btn = document.querySelector('#checkout .btn-success');
  const txt = btn.textContent;
  btn.disabled = true;
  btn.innerHTML = '<span class="loading me-2"></span>Processing...';
  setTimeout(()=>{
    alert('Order placed successfully! Thank you.');
    cart = [];
    updateCartDisplay();
    saveCart();
    showHome();
    btn.disabled = false;
    btn.textContent = txt;
  }, 1500);
}

function showHome() {
  ['home','products','about','contact'].forEach(id => document.getElementById(id).style.display='block');
  document.querySelector('.py-5.bg-primary').style.display='block';
  document.querySelector('footer').style.display='block';
  document.getElementById('checkout').style.display='none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Newsletter/Contact
function handleNewsletterSubscription(e) {
  e.preventDefault();
  const email = e.target.parentElement.querySelector('input[type="email"]').value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Enter a valid email.');
  const btn = e.target; const txt = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '<span class="loading me-2"></span>Subscribing...';
  setTimeout(()=>{ alert('Subscribed!'); e.target.parentElement.querySelector('input').value=''; btn.disabled=false; btn.innerHTML=txt; }, 900);
}

function handleContactForm(e) {
  e.preventDefault();
  const form = e.target;
  let ok = true;
  form.querySelectorAll('[required]').forEach(f=>{
    if(!f.value.trim()){ f.classList.add('is-invalid'); ok=false; } else { f.classList.remove('is-invalid'); }
  });
  if (!ok) return alert('Please fill in all required fields.');
  const btn = form.querySelector('button[type="submit"]');
  const txt = btn.textContent;
  btn.disabled = true; btn.innerHTML = '<span class="loading me-2"></span>Sending...';
  setTimeout(()=>{ alert("Thanks! We'll get back soon."); form.reset(); btn.disabled=false; btn.textContent=txt; }, 1200);
}

function toggleWishlist(id, ev) {
  const icon = ev.currentTarget.querySelector('i');
  const isOff = icon.classList.contains('far');
  icon.classList.toggle('far', !isOff);
  icon.classList.toggle('fas', isOff);
  icon.style.color = isOff ? '#dc3545' : '';
}

function scrollToProducts(){ document.getElementById('products').scrollIntoView({ behavior:'smooth' }); }

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'alert alert-success position-fixed';
  el.style.cssText = 'top: 20px; right: 20px; z-index: 9999; opacity:0; transition: all .3s ease;';
  el.innerHTML = `<i class="fas fa-check me-2"></i>${msg}`;
  document.body.appendChild(el);
  requestAnimationFrame(()=>{ el.style.opacity='1'; });
  setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(), 300); }, 1800);
}

// Expose
window.filterProducts = filterProducts;
window.sortProducts = sortProducts;
window.showProductDetails = showProductDetails;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleCart = toggleCart;
window.proceedToCheckout = proceedToCheckout;
window.placeOrder = placeOrder;
window.scrollToProducts = scrollToProducts;
window.toggleWishlist = toggleWishlist;
window.changeQuantity = changeQuantity;
window.addToCartFromModal = addToCartFromModal;
