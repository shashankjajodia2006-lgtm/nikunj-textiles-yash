// Nikunj Textiles (Brand: Yash) - Main Application Logic

// Official Contact & Ordering Details
const YASH_CONTACT = {
  phone: "+91 94151 00235",
  whatsappNumber: "919415100235",
  whatsappUrl: "https://wa.me/919415100235"
};

// Application State
const state = {
  products: typeof YASH_PRODUCTS !== 'undefined' ? YASH_PRODUCTS : [],
  currentCategory: 'all',
  currentSubCategory: 'all',
  searchQuery: '',
  selectedProductSizes: {}, // productId -> selected size string
  cart: JSON.parse(localStorage.getItem('yash_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('yash_wishlist') || '[]'),
  activeCoupon: null,
  appliedCoupons: {
    'YASH10': { discountPercent: 10, minOrder: 500, label: '10% Off on orders above ₹500' },
    'WHOLESALE500': { discountFlat: 500, minOrder: 3000, label: '₹500 Off on bulk orders above ₹3000' },
    'FREESHIP': { freeShipping: true, minOrder: 0, label: 'Free Delivery on any order' }
  },
  modalProduct: null,
  b2bQuantities: {} // productId_size -> qty
};

// Initialize default selected size for each product
function initDefaultSizes() {
  state.products.forEach(p => {
    if (p.sizes && p.sizes.length > 0) {
      state.selectedProductSizes[p.id] = p.sizes[0].size;
    }
  });
}

// Save Cart to LocalStorage
function saveCart() {
  localStorage.setItem('yash_cart', JSON.stringify(state.cart));
  updateCartBadges();
  renderCartDrawer();
}

// Save Wishlist
function saveWishlist() {
  localStorage.setItem('yash_wishlist', JSON.stringify(state.wishlist));
  updateWishlistBadges();
}

// Show Toast Notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-slate-900 text-white border-l-4 border-yash-red' : 
                  type === 'info' ? 'bg-blue-900 text-white border-l-4 border-blue-400' :
                  'bg-red-800 text-white border-l-4 border-red-400';
  
  toast.className = `toast-item px-4 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center justify-between gap-3 max-w-sm ${bgClass}`;
  
  const icon = type === 'success' ? '✓' : 'ℹ';
  toast.innerHTML = `
    <div class="flex items-center gap-2.5">
      <span class="w-5 h-5 rounded-full bg-yash-red text-white flex items-center justify-center text-xs font-bold">${icon}</span>
      <span>${message}</span>
    </div>
    <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-white text-base leading-none">&times;</button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3500);
}

// Calculate Current Price for a Product based on selected size
function getProductPrice(product, selectedSize) {
  if (!product || !product.sizes || product.sizes.length === 0) return 0;
  const sizeObj = product.sizes.find(s => s.size === selectedSize) || product.sizes[0];
  return sizeObj.price;
}

// Get Per-Piece Price
function getPerPiecePrice(product, selectedSize) {
  const packPrice = getProductPrice(product, selectedSize);
  const count = product.packCount || 1;
  return (packPrice / count).toFixed(1);
}

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countDisplay = document.getElementById('results-count');
  if (!grid) return;

  // Filter products
  const filtered = state.products.filter(p => {
    // Category match
    if (state.currentCategory !== 'all') {
      if (state.currentCategory === 'bestsellers') {
        if (!p.isBestseller) return false;
      } else if (state.currentCategory === 'winterwear') {
        if (p.subCategory !== 'winterwear') return false;
      } else if (state.currentCategory === 'undergarments') {
        if (p.subCategory !== 'undergarments') return false;
      } else if (p.category !== state.currentCategory) {
        return false;
      }
    }

    // Subcategory match if set
    if (state.currentSubCategory !== 'all') {
      if (p.subCategory !== state.currentSubCategory && p.itemType.toLowerCase() !== state.currentSubCategory.toLowerCase()) {
        return false;
      }
    }

    // Search query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchType = p.itemType.toLowerCase().includes(q);
      const matchFabric = p.fabric ? p.fabric.toLowerCase().includes(q) : false;
      if (!matchName && !matchBrand && !matchDesc && !matchType && !matchFabric) {
        return false;
      }
    }

    return true;
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} products`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="w-16 h-16 bg-red-50 text-yash-red rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
        <h3 class="text-xl font-bold text-gray-800">No garments found</h3>
        <p class="text-gray-500 mt-1">Try adjusting your filters or search keywords.</p>
        <button onclick="resetFilters()" class="mt-4 px-5 py-2 bg-yash-red text-white text-sm font-semibold rounded-lg hover:bg-yash-red-hover transition shadow">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const selectedSize = state.selectedProductSizes[p.id] || p.sizes[0].size;
    const currentPrice = getProductPrice(p, selectedSize);
    const perPiece = getPerPiecePrice(p, selectedSize);
    const isWished = state.wishlist.includes(p.id);

    return `
      <div class="product-card bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col justify-between group">
        <!-- Top Image Section -->
        <div class="relative product-image-container aspect-[4/5] p-4 flex items-center justify-center bg-gray-50">
          <!-- Badges -->
          <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            ${p.subCategory === 'winterwear' ? 
              `<span class="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-blue-900 text-white rounded-md shadow-sm">❄️ Cottswool Warmth</span>` : 
              `<span class="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded-md shadow-sm">100% Combed Cotton</span>`
            }
            ${p.isBestseller ? 
              `<span class="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-yash-red text-white rounded-md shadow-sm">★ Bestseller</span>` : ''
            }
            <span class="px-2.5 py-1 text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-gray-700 rounded-md border border-gray-200">
              ${p.packSize}
            </span>
          </div>

          <!-- Wishlist Button -->
          <button onclick="toggleWishlist('${p.id}')" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-400 hover:text-yash-red hover:scale-110 transition z-10">
            <svg class="w-5 h-5 ${isWished ? 'fill-yash-red text-yash-red' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>

          <!-- Main Product Image -->
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain mix-blend-multiply drop-shadow-md cursor-pointer" onclick="openProductModal('${p.id}')">

          <!-- Quick View Hover Overlay -->
          <button onclick="openProductModal('${p.id}')" class="absolute bottom-3 inset-x-4 py-2.5 bg-gray-900/90 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg flex items-center justify-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            Quick View & Specs
          </button>
        </div>

        <!-- Product Details -->
        <div class="p-4 flex flex-col justify-between flex-grow">
          <div>
            <!-- Category and Brand -->
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span class="font-bold uppercase tracking-wider text-yash-red">${p.brand}</span>
              <span class="capitalize">${p.category}'s ${p.itemType}</span>
            </div>

            <!-- Product Title -->
            <h4 class="font-heading font-bold text-gray-900 text-base leading-snug line-clamp-2 hover:text-yash-red cursor-pointer transition" onclick="openProductModal('${p.id}')">
              ${p.name}
            </h4>

            <!-- Fabric Tag -->
            <p class="text-xs text-gray-500 mt-1 line-clamp-1">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
              ${p.fabric}
            </p>

            <!-- Size Selector Pills -->
            <div class="mt-3">
              <div class="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
                <span>SELECT SIZE:</span>
                <span class="text-xs text-gray-700 font-bold">${selectedSize}</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${p.sizes.map(s => `
                  <button 
                    onclick="selectProductSize('${p.id}', '${s.size}')"
                    class="size-pill text-xs px-2.5 py-1 rounded-md border font-semibold ${selectedSize === s.size ? 'active' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}">
                    ${s.size}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Bottom Price & Cart Section -->
          <div class="mt-4 pt-3 border-t border-gray-100">
            <div class="flex items-baseline justify-between mb-2">
              <div>
                <span class="text-2xl font-extrabold text-gray-900 font-heading">₹${currentPrice}</span>
                <span class="text-xs text-gray-500 font-medium ml-1">/ ${p.packSize}</span>
              </div>
              ${p.packCount > 1 ? `
                <div class="text-right">
                  <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">₹${perPiece} / pc</span>
                </div>
              ` : ''}
            </div>

            <div class="grid grid-cols-5 gap-2">
              <button 
                onclick="addToCart('${p.id}', 1)"
                class="col-span-4 py-2.5 px-3 bg-yash-red hover:bg-yash-red-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 active:scale-[0.98]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                Add to Bag
              </button>
              <button 
                onclick="orderProductWhatsApp('${p.id}')"
                title="Direct WhatsApp Order"
                class="col-span-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition shadow-md shadow-emerald-600/20">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.97.53 1.766.797 2.796.797 3.182 0 5.768-2.587 5.768-5.766 0-3.18-2.586-5.883-5.768-5.883zm8.01 5.766c0 4.417-3.593 8.01-8.01 8.01-1.396 0-2.709-.364-3.85-1l-4.281 1.121 1.144-4.175c-.714-1.189-1.113-2.576-1.113-4.056 0-4.417 3.593-8.01 8.01-8.01s8.01 3.593 8.01 8.01z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Select Product Size
function selectProductSize(productId, size) {
  state.selectedProductSizes[productId] = size;
  renderProducts();
}

// Reset Filters
function resetFilters() {
  state.currentCategory = 'all';
  state.currentSubCategory = 'all';
  state.searchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  
  // Update active pill UI
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.classList.remove('bg-yash-red', 'text-white');
    btn.classList.add('bg-white', 'text-gray-700');
  });
  const allBtn = document.querySelector('[data-cat="all"]');
  if (allBtn) {
    allBtn.classList.add('bg-yash-red', 'text-white');
    allBtn.classList.remove('bg-white', 'text-gray-700');
  }

  renderProducts();
}

// Filter by Category
function setCategory(category) {
  state.currentCategory = category;
  state.currentSubCategory = 'all';

  document.querySelectorAll('.cat-pill').forEach(btn => {
    if (btn.dataset.cat === category) {
      btn.classList.add('bg-yash-red', 'text-white', 'shadow-md');
      btn.classList.remove('bg-white', 'text-gray-700');
    } else {
      btn.classList.remove('bg-yash-red', 'text-white', 'shadow-md');
      btn.classList.add('bg-white', 'text-gray-700');
    }
  });

  renderProducts();
}

// Add to Cart
function addToCart(productId, quantity = 1, explicitSize = null) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const chosenSize = explicitSize || state.selectedProductSizes[productId] || product.sizes[0].size;
  const unitPrice = getProductPrice(product, chosenSize);

  // Check if item already exists in cart with the same size
  const existingIdx = state.cart.findIndex(item => item.id === productId && item.size === chosenSize);

  if (existingIdx > -1) {
    state.cart[existingIdx].quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      itemType: product.itemType,
      size: chosenSize,
      price: unitPrice,
      packSize: product.packSize,
      packCount: product.packCount,
      image: product.image,
      quantity: quantity
    });
  }

  saveCart();
  showToast(`Added ${quantity}x ${product.name} (Size: ${chosenSize}) to bag!`);

  // Animate bag icon
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.classList.remove('badge-pop');
    void badge.offsetWidth;
    badge.classList.add('badge-pop');
  }
}

// Update Cart Quantity
function updateCartQty(index, delta) {
  if (state.cart[index]) {
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
      showToast('Item removed from cart', 'info');
    }
    saveCart();
  }
}

// Remove Item from Cart
function removeCartItem(index) {
  if (state.cart[index]) {
    state.cart.splice(index, 1);
    saveCart();
    showToast('Item removed from cart', 'info');
  }
}

// Clear Cart
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    state.cart = [];
    saveCart();
    showToast('Cart has been cleared', 'info');
  }
}

// Calculate Cart Totals
function getCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discount = 0;

  if (state.activeCoupon) {
    const coupon = state.appliedCoupons[state.activeCoupon];
    if (coupon) {
      if (coupon.discountPercent) {
        discount = Math.round((subtotal * coupon.discountPercent) / 100);
      } else if (coupon.discountFlat) {
        discount = coupon.discountFlat;
      }
    }
  }

  // Free shipping threshold: ₹999 or coupon
  const isFreeShip = subtotal >= 999 || (state.activeCoupon && state.appliedCoupons[state.activeCoupon]?.freeShipping);
  const shipping = (subtotal === 0 || isFreeShip) ? 0 : 70;
  
  // Garment GST in India (5% on garments below ₹1000 per pc)
  const gst = Math.round((subtotal - discount) * 0.05);
  const grandTotal = Math.max(0, subtotal - discount + shipping + gst);

  return { subtotal, discount, shipping, gst, grandTotal, isFreeShip };
}

// Update Cart Badges
function updateCartBadges() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const { subtotal } = getCartTotals();

  document.querySelectorAll('.cart-count-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });

  const subtotalDisplay = document.getElementById('header-cart-subtotal');
  if (subtotalDisplay) {
    subtotalDisplay.textContent = `₹${subtotal}`;
  }
}

// Render Cart Drawer
function renderCartDrawer() {
  const itemsContainer = document.getElementById('cart-drawer-items');
  const footerContainer = document.getElementById('cart-drawer-footer');
  if (!itemsContainer || !footerContainer) return;

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
        <div class="w-20 h-20 rounded-full bg-red-50 text-yash-red flex items-center justify-center mb-4">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <h4 class="text-lg font-bold text-gray-900">Your bag is empty</h4>
        <p class="text-sm text-gray-500 mt-1 max-w-xs">Explore Nikunj Textiles' Yash innerwear and winter cottswool collections.</p>
        <button onclick="toggleCartDrawer(false)" class="mt-5 px-6 py-2.5 bg-yash-red text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-yash-red-hover transition shadow-md">
          Start Shopping
        </button>
      </div>
    `;
    footerContainer.style.display = 'none';
    return;
  }

  footerContainer.style.display = 'block';

  // Render items
  itemsContainer.innerHTML = state.cart.map((item, idx) => `
    <div class="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex gap-3.5 items-center">
      <div class="w-16 h-20 bg-gray-50 rounded-lg p-1 flex-shrink-0 flex items-center justify-center">
        <img src="${item.image}" alt="${item.name}" class="max-h-full max-w-full object-contain">
      </div>
      <div class="flex-grow min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h5 class="text-xs font-bold text-gray-900 truncate leading-tight">${item.name}</h5>
          <button onclick="removeCartItem(${idx})" class="text-gray-400 hover:text-yash-red transition text-xs p-1">
            ✕
          </button>
        </div>
        <div class="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
          <span class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-semibold">Size: ${item.size}</span>
          <span>${item.packSize}</span>
        </div>
        <div class="flex items-center justify-between mt-2.5">
          <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <button onclick="updateCartQty(${idx}, -1)" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-sm font-bold">-</button>
            <span class="w-8 text-center text-xs font-bold text-gray-900">${item.quantity}</span>
            <button onclick="updateCartQty(${idx}, 1)" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-sm font-bold">+</button>
          </div>
          <div class="text-right">
            <span class="text-xs text-gray-400 block line-through">₹${item.price * item.quantity + 40}</span>
            <span class="text-sm font-extrabold text-gray-900 font-heading">₹${item.price * item.quantity}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Update Free Shipping Progress
  const { subtotal, discount, shipping, gst, grandTotal, isFreeShip } = getCartTotals();
  const freeShipBar = document.getElementById('free-shipping-bar');
  const freeShipText = document.getElementById('free-shipping-text');
  if (freeShipBar && freeShipText) {
    if (isFreeShip) {
      freeShipBar.style.width = '100%';
      freeShipBar.classList.replace('bg-yash-red', 'bg-emerald-500');
      freeShipText.innerHTML = `🎉 <span class="font-bold text-emerald-700">Congratulations!</span> You unlocked FREE Delivery!`;
    } else {
      const remaining = 999 - subtotal;
      const pct = Math.min(100, Math.round((subtotal / 999) * 100));
      freeShipBar.style.width = `${pct}%`;
      freeShipBar.classList.add('bg-yash-red');
      freeShipText.innerHTML = `Add <span class="font-bold text-yash-red">₹${remaining}</span> more for <span class="font-bold text-gray-800">FREE Express Delivery</span>`;
    }
  }

  // Update Footnote & Summaries
  document.getElementById('cart-subtotal-val').textContent = `₹${subtotal}`;
  document.getElementById('cart-discount-val').textContent = discount > 0 ? `-₹${discount}` : `₹0`;
  document.getElementById('cart-shipping-val').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
  document.getElementById('cart-gst-val').textContent = `₹${gst}`;
  document.getElementById('cart-grandtotal-val').textContent = `₹${grandTotal}`;
}

// Toggle Cart Drawer
function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (!drawer || !backdrop) return;

  if (open) {
    drawer.classList.remove('translate-x-full');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    renderCartDrawer();
  } else {
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
  }
}

// Apply Coupon Code
function applyCouponCode() {
  const input = document.getElementById('coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (!code) {
    showToast('Please enter a coupon code', 'info');
    return;
  }

  const coupon = state.appliedCoupons[code];
  if (!coupon) {
    showToast('Invalid coupon code. Try YASH10 or WHOLESALE500', 'error');
    return;
  }

  const { subtotal } = getCartTotals();
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    showToast(`Order value must be at least ₹${coupon.minOrder} to use this coupon`, 'error');
    return;
  }

  state.activeCoupon = code;
  renderCartDrawer();
  showToast(`Coupon '${code}' applied successfully! 🎉`);
}

// Wishlist Toggle
function toggleWishlist(productId) {
  const idx = state.wishlist.indexOf(productId);
  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    showToast('Removed from wishlist', 'info');
  } else {
    state.wishlist.push(productId);
    showToast('Saved to wishlist ❤️');
  }
  saveWishlist();
  renderProducts();
}

function updateWishlistBadges() {
  const count = state.wishlist.length;
  document.querySelectorAll('.wishlist-count-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Open Product Quick View Modal
function openProductModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  state.modalProduct = product;

  const modal = document.getElementById('product-modal');
  if (!modal) return;

  const currentSize = state.selectedProductSizes[product.id] || product.sizes[0].size;
  const currentPrice = getProductPrice(product, currentSize);
  const perPiece = getPerPiecePrice(product, currentSize);

  document.getElementById('modal-img').src = product.image;
  document.getElementById('modal-img').alt = product.name;
  document.getElementById('modal-brand').textContent = `${product.brand} • ${product.series}`;
  document.getElementById('modal-title').textContent = product.name;
  document.getElementById('modal-desc').textContent = product.description;
  document.getElementById('modal-fabric').textContent = product.fabric;
  document.getElementById('modal-pack').textContent = product.packSize;
  document.getElementById('modal-elastic').textContent = product.elasticType;
  document.getElementById('modal-price').textContent = `₹${currentPrice}`;
  document.getElementById('modal-perpiece').textContent = product.packCount > 1 ? `(₹${perPiece} / piece)` : '';
  
  // Render Size Options in Modal
  const sizeContainer = document.getElementById('modal-sizes');
  if (sizeContainer) {
    sizeContainer.innerHTML = product.sizes.map(s => `
      <button 
        onclick="updateModalSize('${s.size}')"
        class="modal-size-btn px-4 py-2 text-xs font-bold rounded-xl border transition ${s.size === currentSize ? 'bg-yash-red text-white border-yash-red shadow-md' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'}">
        ${s.size} <span class="opacity-75 font-normal">(${s.label})</span>
      </button>
    `).join('');
  }

  // Render Colors
  const colorsContainer = document.getElementById('modal-colors');
  if (colorsContainer && product.colors) {
    colorsContainer.innerHTML = product.colors.map(c => `
      <span class="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
        ${c}
      </span>
    `).join('');
  }

  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.querySelector('.modal-content-box').classList.remove('scale-95', 'opacity-0');
  }, 10);
}

// Update Modal Size Selection
function updateModalSize(newSize) {
  if (!state.modalProduct) return;
  state.selectedProductSizes[state.modalProduct.id] = newSize;
  openProductModal(state.modalProduct.id);
  renderProducts(); // Keep grid in sync
}

// Close Product Modal
function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  modal.querySelector('.modal-content-box').classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
    state.modalProduct = null;
  }, 200);
}

// Add From Modal to Cart
function addModalToCart() {
  if (!state.modalProduct) return;
  const qtyInput = document.getElementById('modal-qty');
  const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
  const currentSize = state.selectedProductSizes[state.modalProduct.id] || state.modalProduct.sizes[0].size;
  addToCart(state.modalProduct.id, qty, currentSize);
  closeProductModal();
}

// Order directly on WhatsApp
function orderProductWhatsApp(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  const size = state.selectedProductSizes[productId] || product.sizes[0].size;
  const price = getProductPrice(product, size);

  const text = `Hello Nikunj Textiles (Brand Yash),%0A%0AI would like to order the following garment:%0A*Product:* ${encodeURIComponent(product.name)}%0A*Brand:* ${encodeURIComponent(product.brand)}%0A*Pack:* ${encodeURIComponent(product.packSize)}%0A*Selected Size:* ${encodeURIComponent(size)}%0A*Price:* ₹${price}%0A%0APlease let me know delivery and payment steps.`;
  window.open(`${YASH_CONTACT.whatsappUrl}?text=${text}`, '_blank');
}

// Order full Cart via WhatsApp
function checkoutViaWhatsApp() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty', 'info');
    return;
  }

  const { subtotal, discount, shipping, gst, grandTotal } = getCartTotals();
  let itemsList = state.cart.map((item, i) => 
    `${i+1}. ${item.name} | Size: ${item.size} | Qty: ${item.quantity} | ₹${item.price * item.quantity}`
  ).join('%0A');

  const text = `*NEW ORDER - NIKUNJ TEXTILES (YASH ONLINE STORE)*%0A%0A*Items:*%0A${itemsList}%0A%0A*Subtotal:* ₹${subtotal}%0A*Discount:* ₹${discount}%0A*Garment GST (5%):* ₹${gst}%0A*Delivery:* ${shipping === 0 ? 'FREE' : '₹' + shipping}%0A*GRAND TOTAL:* ₹${grandTotal}%0A%0APlease confirm my order and share dispatch tracking!`;

  window.open(`${YASH_CONTACT.whatsappUrl}?text=${text}`, '_blank');
}

// B2B Wholesale Matrix Rendering
function renderB2BMatrix() {
  const tbody = document.getElementById('b2b-matrix-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.products.map((p, pIdx) => {
    // Generate size inputs
    const sizeCells = p.sizes.map(s => {
      const key = `${p.id}_${s.size}`;
      const qty = state.b2bQuantities[key] || '';
      return `
        <td class="p-2 border text-center bg-gray-50/50">
          <div class="text-[11px] font-bold text-gray-700 mb-1">₹${s.price}</div>
          <input 
            type="number" 
            min="0" 
            step="1" 
            placeholder="0"
            value="${qty}" 
            onchange="updateB2BQty('${p.id}', '${s.size}', this.value)"
            class="matrix-input w-16 text-center py-1 px-1 text-xs border border-gray-300 rounded font-bold bg-white text-gray-900 focus:bg-red-50">
          <div class="text-[9px] text-gray-400 mt-0.5">${p.packSize}</div>
        </td>
      `;
    }).join('');

    return `
      <tr class="border-b hover:bg-red-50/30 transition text-xs">
        <td class="p-3 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${p.subCategory === 'winterwear' ? 'bg-blue-600' : 'bg-yash-red'}"></span>
            <div>
              <div class="font-bold text-gray-900">${p.name}</div>
              <div class="text-[10px] text-gray-500 font-normal">${p.brand} • ${p.packSize}</div>
            </div>
          </div>
        </td>
        <td class="p-2.5 text-center text-gray-600 font-medium border-r capitalize">${p.category}</td>
        ${sizeCells}
      </tr>
    `;
  }).join('');

  updateB2BSummary();
}

// Update B2B Quantity
function updateB2BQty(productId, size, val) {
  const qty = parseInt(val) || 0;
  const key = `${productId}_${size}`;
  if (qty > 0) {
    state.b2bQuantities[key] = qty;
  } else {
    delete state.b2bQuantities[key];
  }
  updateB2BSummary();
}

// Update B2B Summary
function updateB2BSummary() {
  let totalPacks = 0;
  let totalAmount = 0;

  for (const [key, qty] of Object.entries(state.b2bQuantities)) {
    const parts = key.split('_');
    const prodId = parts[0];
    const size = parts.slice(1).join('_');
    const product = state.products.find(p => p.id === prodId);
    if (product) {
      const price = getProductPrice(product, size);
      totalPacks += qty;
      totalAmount += price * qty;
    }
  }

  const packsEl = document.getElementById('b2b-total-packs');
  const amountEl = document.getElementById('b2b-total-amount');
  if (packsEl) packsEl.textContent = totalPacks;
  if (amountEl) amountEl.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
}

// Add All B2B Items to Cart
function addB2BToCart() {
  let count = 0;
  for (const [key, qty] of Object.entries(state.b2bQuantities)) {
    if (qty > 0) {
      const parts = key.split('_');
      const prodId = parts[0];
      const size = parts.slice(1).join('_');
      addToCart(prodId, qty, size);
      count++;
    }
  }

  if (count > 0) {
    showToast(`Added ${count} bulk items directly to your bag!`);
    state.b2bQuantities = {};
    renderB2BMatrix();
    toggleCartDrawer(true);
  } else {
    showToast('Please enter quantities in the order sheet first', 'info');
  }
}

// Send B2B Order Sheet via WhatsApp
function sendB2BWhatsApp() {
  let count = 0;
  let totalAmount = 0;
  let lines = [];

  for (const [key, qty] of Object.entries(state.b2bQuantities)) {
    if (qty > 0) {
      const parts = key.split('_');
      const prodId = parts[0];
      const size = parts.slice(1).join('_');
      const p = state.products.find(item => item.id === prodId);
      if (p) {
        const price = getProductPrice(p, size);
        const lineTotal = price * qty;
        totalAmount += lineTotal;
        count++;
        lines.push(`• ${p.name} [Size: ${size}] - ${qty} ${p.packSize} @ ₹${price} = ₹${lineTotal}`);
      }
    }
  }

  if (count === 0) {
    showToast('Please fill in quantity for at least one item', 'info');
    return;
  }

  const text = `*NIKUNJ TEXTILES - B2B WHOLESALE ORDER INQUIRY*%0A%0A*Dealer PO Items:*%0A${lines.join('%0A')}%0A%0A*Total Items:* ${count} lines%0A*Total Order Value:* ₹${totalAmount.toLocaleString('en-IN')}%0A%0APlease quote wholesale GST invoice & dispatch time to our transport godown.`;
  window.open(`${YASH_CONTACT.whatsappUrl}?text=${text}`, '_blank');
}

// Checkout Modal Handling
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Your bag is empty', 'info');
    return;
  }
  toggleCartDrawer(false);

  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  const { subtotal, discount, shipping, gst, grandTotal } = getCartTotals();
  document.getElementById('checkout-summary-subtotal').textContent = `₹${subtotal}`;
  document.getElementById('checkout-summary-discount').textContent = `-₹${discount}`;
  document.getElementById('checkout-summary-shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
  document.getElementById('checkout-summary-gst').textContent = `₹${gst}`;
  document.getElementById('checkout-summary-total').textContent = `₹${grandTotal}`;

  modal.classList.remove('hidden');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('hidden');
}

// Select Payment Method Tab in Checkout
function selectPaymentMethod(method) {
  document.querySelectorAll('.payment-method-btn').forEach(btn => {
    if (btn.dataset.method === method) {
      btn.classList.add('border-yash-red', 'bg-red-50/50', 'text-yash-red');
      btn.classList.remove('border-gray-200', 'bg-white', 'text-gray-700');
    } else {
      btn.classList.remove('border-yash-red', 'bg-red-50/50', 'text-yash-red');
      btn.classList.add('border-gray-200', 'bg-white', 'text-gray-700');
    }
  });

  const upiBox = document.getElementById('upi-qr-box');
  const codBox = document.getElementById('cod-info-box');
  const cardBox = document.getElementById('card-info-box');

  if (method === 'upi') {
    if (upiBox) upiBox.classList.remove('hidden');
    if (codBox) codBox.classList.add('hidden');
    if (cardBox) cardBox.classList.add('hidden');
    generateUPIQR();
  } else if (method === 'cod') {
    if (upiBox) upiBox.classList.add('hidden');
    if (codBox) codBox.classList.remove('hidden');
    if (cardBox) cardBox.classList.add('hidden');
  } else {
    if (upiBox) upiBox.classList.add('hidden');
    if (codBox) codBox.classList.add('hidden');
    if (cardBox) cardBox.classList.remove('hidden');
  }
}

// Generate UPI QR Code
function generateUPIQR() {
  const { grandTotal } = getCartTotals();
  const upiString = `upi://pay?pa=nikunjtextiles@okaxis&pn=Nikunj%20Textiles%20Yash&am=${grandTotal}&cu=INR&tn=Yash%20Innerwear%20Order`;
  const qrImg = document.getElementById('upi-qr-image');
  if (qrImg) {
    // Generate QR using reliable public chart API
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiString)}`;
  }
}

// Confirm and Submit Order
function processOrderSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const city = document.getElementById('cust-city').value.trim();
  const stateVal = document.getElementById('cust-state').value.trim();
  const pincode = document.getElementById('cust-pincode').value.trim();
  const orderType = document.querySelector('input[name="order_type"]:checked')?.value || 'Retail';

  if (!name || !phone || !address || !city || !pincode) {
    showToast('Please fill all mandatory address fields', 'error');
    return;
  }

  const orderId = 'NKJ-' + Math.floor(100000 + Math.random() * 900000);
  const { subtotal, discount, shipping, gst, grandTotal } = getCartTotals();

  // Create Order Record
  const orderRecord = {
    orderId,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    customer: { name, phone, address, city, state: stateVal, pincode, orderType },
    items: [...state.cart],
    financials: { subtotal, discount, shipping, gst, grandTotal }
  };

  // Render Printable Invoice
  renderInvoice(orderRecord);

  // Clear Cart
  state.cart = [];
  saveCart();

  // Close Checkout Modal & Open Order Success Modal
  closeCheckoutModal();
  const successModal = document.getElementById('order-success-modal');
  if (successModal) {
    document.getElementById('success-order-id').textContent = orderId;
    successModal.classList.remove('hidden');
  }

  showToast(`Order #${orderId} confirmed successfully! 🎉`);
}

// Render Printable Invoice
function renderInvoice(order) {
  const container = document.getElementById('printable-invoice');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-3xl mx-auto p-8 bg-white border border-gray-200 rounded-xl shadow-lg">
      <!-- Invoice Header -->
      <div class="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 bg-yash-red text-white font-extrabold text-xl tracking-wider rounded">YASH</span>
            <span class="text-xs text-gray-500 font-bold uppercase">Nikunj Textiles</span>
          </div>
          <h2 class="text-xl font-bold text-gray-900">Tax Invoice / Order Slip</h2>
          <p class="text-xs text-gray-500">Mfrs of Premium Men's, Women's & Kids Innerwear</p>
          <p class="text-xs text-gray-500">GSTIN: 24AAACN1234F1Z9 | Ahmedabad, Gujarat, India</p>
        </div>
        <div class="text-right">
          <div class="text-sm font-bold text-yash-red">Order ID: #${order.orderId}</div>
          <div class="text-xs text-gray-500">Date: ${order.date}</div>
          <div class="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded inline-block mt-1">Confirmed</div>
        </div>
      </div>

      <!-- Customer Details -->
      <div class="grid grid-cols-2 gap-6 mb-6 text-xs bg-gray-50 p-4 rounded-lg">
        <div>
          <h4 class="font-bold text-gray-700 uppercase mb-1">Delivered To:</h4>
          <p class="font-bold text-gray-900">${order.customer.name}</p>
          <p class="text-gray-600">${order.customer.address}</p>
          <p class="text-gray-600">${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}</p>
          <p class="text-gray-600">Phone: ${order.customer.phone}</p>
        </div>
        <div class="text-right">
          <h4 class="font-bold text-gray-700 uppercase mb-1">Order Particulars:</h4>
          <p class="text-gray-600">Order Channel: Nikunj Yash Online Portal</p>
          <p class="text-gray-600">Category: ${order.customer.orderType} Buyer</p>
          <p class="text-gray-600">Payment: Verified at Delivery / UPI</p>
        </div>
      </div>

      <!-- Item Table -->
      <table class="w-full text-xs mb-6 border">
        <thead>
          <tr class="bg-gray-100 border-b text-gray-700 font-bold">
            <th class="p-2 text-left">Item Description</th>
            <th class="p-2 text-center">Size</th>
            <th class="p-2 text-center">Pack</th>
            <th class="p-2 text-center">Qty</th>
            <th class="p-2 text-right">Unit Price</th>
            <th class="p-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr class="border-b">
              <td class="p-2 font-medium text-gray-900">${item.name} (${item.brand})</td>
              <td class="p-2 text-center font-bold text-gray-700">${item.size}</td>
              <td class="p-2 text-center text-gray-500">${item.packSize}</td>
              <td class="p-2 text-center font-bold">${item.quantity}</td>
              <td class="p-2 text-right">₹${item.price}</td>
              <td class="p-2 text-right font-bold">₹${item.price * item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Financial Totals -->
      <div class="w-64 ml-auto text-xs space-y-1.5 border-t pt-3">
        <div class="flex justify-between text-gray-600">
          <span>Subtotal:</span>
          <span>₹${order.financials.subtotal}</span>
        </div>
        ${order.financials.discount > 0 ? `
          <div class="flex justify-between text-emerald-600 font-medium">
            <span>Special Discount:</span>
            <span>-₹${order.financials.discount}</span>
          </div>
        ` : ''}
        <div class="flex justify-between text-gray-600">
          <span>Shipping:</span>
          <span>${order.financials.shipping === 0 ? 'FREE' : '₹' + order.financials.shipping}</span>
        </div>
        <div class="flex justify-between text-gray-600">
          <span>Garment GST (5%):</span>
          <span>₹${order.financials.gst}</span>
        </div>
        <div class="flex justify-between text-base font-extrabold text-gray-900 border-t pt-2 mt-2">
          <span>Grand Total:</span>
          <span class="text-yash-red">₹${order.financials.grandTotal}</span>
        </div>
      </div>

      <!-- Footer Notes -->
      <div class="mt-8 pt-4 border-t text-[11px] text-gray-400 text-center">
        Thank you for choosing Nikunj Textiles (Yash)! For dispatch assistance, call ${YASH_CONTACT.phone}.
      </div>
    </div>
  `;
}

// Print Current Invoice
function printInvoice() {
  window.print();
}

// Open Price List PDF Modal
function openPriceListModal() {
  const modal = document.getElementById('pricelist-modal');
  if (modal) modal.classList.remove('hidden');
}

function closePriceListModal() {
  const modal = document.getElementById('pricelist-modal');
  if (modal) modal.classList.add('hidden');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initDefaultSizes();
  renderProducts();
  updateCartBadges();
  updateWishlistBadges();
  renderB2BMatrix();

  // Search input live handler
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Close modals on clicking backdrop
  window.addEventListener('click', (e) => {
    const productModal = document.getElementById('product-modal');
    if (e.target === productModal) closeProductModal();

    const checkoutModal = document.getElementById('checkout-modal');
    if (e.target === checkoutModal) closeCheckoutModal();

    const priceListModal = document.getElementById('pricelist-modal');
    if (e.target === priceListModal) closePriceListModal();
  });
});
