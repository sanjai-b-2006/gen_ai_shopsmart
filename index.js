
// ShopSmart - Enhanced E-commerce Application
// AI-Generated and Optimized Code

class ShopSmartApp {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.cart = this.loadFromStorage('cart') || [];
    this.wishlist = this.loadFromStorage('wishlist') || [];
    this.compareList = this.loadFromStorage('compareList') || [];
    this.currentPage = 1;
    this.productsPerPage = 12;
    this.searchQuery = '';
    this.filters = {
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      sortBy: 'relevance'
    };
    this.viewMode = 'grid';
    
    this.init();
  }

  async init() {
    await this.loadProducts();
    this.setupEventListeners();
    this.hideLoadingScreen();
    this.renderProducts();
    this.updateCartCount();
    this.updateWishlistCount();
    this.updateCompareCount();
    this.setupIntersectionObserver();
  }

  async loadProducts() {
    try {
      const response = await fetch('products.json');
      if (!response.ok) throw new Error('Failed to load products');
      
      const data = await response.json();
      this.products = data.products || [];
      this.filteredProducts = [...this.products];
      
      // Update statistics
      document.getElementById('products-count').textContent = this.products.length;
      document.getElementById('categories-count').textContent = 
        [...new Set(this.products.map(p => p.category))].length;
      
      this.populateCategoryFilter();
      this.renderAIRecommendations();
    } catch (error) {
      console.error('Error loading products:', error);
      this.showNotification('Failed to load products', 'error');
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 1500);
    }
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.getElementById('search-suggestions');
    
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
      searchInput.addEventListener('focus', () => this.showSearchSuggestions());
      searchInput.addEventListener('blur', () => {
        setTimeout(() => this.hideSearchSuggestions(), 200);
      });
    }

    // Voice search
    const voiceSearchBtn = document.getElementById('voice-search');
    if (voiceSearchBtn) {
      voiceSearchBtn.addEventListener('click', this.handleVoiceSearch.bind(this));
    }

    // AI search
    const aiSearchBtn = document.getElementById('ai-search');
    if (aiSearchBtn) {
      aiSearchBtn.addEventListener('click', this.handleAISearch.bind(this));
    }

    // Navigation
    document.getElementById('cart-btn')?.addEventListener('click', this.toggleCart.bind(this));
    document.getElementById('wishlist-btn')?.addEventListener('click', this.toggleWishlist.bind(this));
    document.getElementById('close-cart')?.addEventListener('click', this.closeCart.bind(this));
    document.getElementById('close-wishlist')?.addEventListener('click', this.closeWishlist.bind(this));

    // Filter controls
    document.getElementById('filter-toggle')?.addEventListener('click', this.toggleFilters.bind(this));
    document.getElementById('category-filter')?.addEventListener('change', this.handleCategoryFilter.bind(this));
    document.getElementById('price-range')?.addEventListener('input', this.handlePriceFilter.bind(this));
    document.getElementById('sort-filter')?.addEventListener('change', this.handleSortFilter.bind(this));
    document.getElementById('clear-filters')?.addEventListener('click', this.clearFilters.bind(this));

    // Rating filter
    const ratingStars = document.querySelectorAll('#rating-filter i');
    ratingStars.forEach((star, index) => {
      star.addEventListener('click', () => this.setRatingFilter(index + 1));
    });

    // View mode toggle
    document.getElementById('grid-view')?.addEventListener('click', () => this.setViewMode('grid'));
    document.getElementById('list-view')?.addEventListener('click', () => this.setViewMode('list'));

    // Load more
    document.getElementById('load-more')?.addEventListener('click', this.loadMoreProducts.bind(this));

    // Cart actions
    document.getElementById('clear-cart')?.addEventListener('click', this.clearCart.bind(this));
    document.getElementById('checkout-btn')?.addEventListener('click', this.handleCheckout.bind(this));

    // Modal close handlers
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeAllModals();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

    // Back to top
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Mobile menu
    document.getElementById('mobile-menu-toggle')?.addEventListener('click', this.toggleMobileMenu.bind(this));

    // Compare button in navbar
    document.getElementById('compare-btn')?.addEventListener('click', this.toggleCompareModal.bind(this));
    document.getElementById('close-compare')?.addEventListener('click', this.closeCompareModal.bind(this));
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  handleSearch(event) {
    this.searchQuery = event.target.value.toLowerCase();
    this.applyFilters();
    this.updateSearchSuggestions();
    this.renderAIRecommendations(); // live update
  }

  updateSearchSuggestions() {
    const suggestions = document.getElementById('search-suggestions');
    if (!suggestions || !this.searchQuery) {
      this.hideSearchSuggestions();
      return;
    }

    const matches = this.products.filter(product =>
      product.title.toLowerCase().includes(this.searchQuery) ||
      product.category.toLowerCase().includes(this.searchQuery) ||
      product.description.toLowerCase().includes(this.searchQuery)
    ).slice(0, 5);

    if (matches.length === 0) {
      this.hideSearchSuggestions();
      return;
    }

    suggestions.innerHTML = matches.map(product => `
      <div class="suggestion-item" data-product-id="${product.id}">
        <i class="fas fa-search suggestion-icon"></i>
        <span>${product.title}</span>
        <small class="text-secondary">${product.category}</small>
      </div>
    `).join('');

    suggestions.classList.remove('hidden');

    // Add click handlers to suggestions
    suggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const productId = parseInt(e.currentTarget.dataset.productId);
        this.showQuickView(productId);
        this.hideSearchSuggestions();
      });
    });
  }

  showSearchSuggestions() {
    if (this.searchQuery) {
      this.updateSearchSuggestions();
    }
  }

  hideSearchSuggestions() {
    const suggestions = document.getElementById('search-suggestions');
    if (suggestions) {
      suggestions.classList.add('hidden');
    }
  }

  handleVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.showNotification('Voice search not supported in this browser', 'warning');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const voiceBtn = document.getElementById('voice-search');
    voiceBtn.classList.add('active');

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript.trim();
      transcript = transcript.replace(/[.。]+$/, ''); // Remove trailing period(s)
      document.getElementById('search-input').value = transcript;
      this.searchQuery = transcript.toLowerCase();
      this.applyFilters();
      voiceBtn.classList.remove('active');
    };

    recognition.onerror = () => {
      this.showNotification('Voice search failed', 'error');
      voiceBtn.classList.remove('active');
    };

    recognition.onend = () => {
      voiceBtn.classList.remove('active');
    };

    recognition.start();
    this.showNotification('Listening...', 'info');
  }

  handleAISearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (!query) {
      this.showNotification('Please enter a search query', 'warning');
      return;
    }

    // AI-powered search enhancement
    const aiKeywords = this.extractAIKeywords(query);
    const smartResults = this.products.filter(product => {
      const productText = `${product.title} ${product.description} ${product.category}`.toLowerCase();
      return aiKeywords.some(keyword => productText.includes(keyword));
    });

    this.filteredProducts = smartResults;
    this.renderProducts();
    this.showNotification(`Found ${smartResults.length} AI-enhanced results`, 'success');
  }

  extractAIKeywords(query) {
    const synonyms = {
      'phone': ['mobile', 'smartphone', 'cell'],
      'laptop': ['computer', 'notebook', 'pc'],
      'headphones': ['earbuds', 'headset', 'earphones'],
      'watch': ['timepiece', 'smartwatch', 'wearable'],
      'camera': ['photography', 'photo', 'lens'],
      'fitness': ['exercise', 'workout', 'health', 'gym'],
      'gaming': ['game', 'gamer', 'play'],
      'wireless': ['bluetooth', 'cordless'],
      'smart': ['intelligent', 'connected', 'iot']
    };

    const keywords = query.toLowerCase().split(/\s+/);
    const expandedKeywords = [...keywords];

    keywords.forEach(keyword => {
      Object.entries(synonyms).forEach(([key, values]) => {
        if (keyword.includes(key) || values.some(v => keyword.includes(v))) {
          expandedKeywords.push(key, ...values);
        }
      });
    });

    return [...new Set(expandedKeywords)];
  }

  populateCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    const categories = [...new Set(this.products.map(p => p.category))];
    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
      categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }

  handleCategoryFilter(event) {
    this.filters.category = event.target.value;
    this.applyFilters();
  }

  handlePriceFilter(event) {
    this.filters.maxPrice = parseInt(event.target.value);
    document.getElementById('max-price-display').textContent = `$${this.filters.maxPrice}`;
    this.applyFilters();
  }

  handleSortFilter(event) {
    this.filters.sortBy = event.target.value;
    this.applyFilters();
  }

  setRatingFilter(rating) {
    this.filters.minRating = rating;
    
    // Update star display
    const stars = document.querySelectorAll('#rating-filter i');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.remove('far');
        star.classList.add('fas', 'active');
      } else {
        star.classList.remove('fas', 'active');
        star.classList.add('far');
      }
    });

    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.products];

    // Search filter
    if (this.searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(this.searchQuery) ||
        product.description.toLowerCase().includes(this.searchQuery) ||
        product.category.toLowerCase().includes(this.searchQuery)
      );
    }

    // Category filter
    if (this.filters.category) {
      filtered = filtered.filter(product => product.category === this.filters.category);
    }

    // Price filter
    filtered = filtered.filter(product =>
      product.price >= this.filters.minPrice && product.price <= this.filters.maxPrice
    );

    // Rating filter
    if (this.filters.minRating > 0) {
      filtered = filtered.filter(product => product.rating >= this.filters.minRating);
    }

    // Sort
    filtered = this.sortProducts(filtered, this.filters.sortBy);

    this.filteredProducts = filtered;
    this.currentPage = 1;
    this.renderProducts();
    this.renderAIRecommendations(); // live update
  }

  sortProducts(products, sortBy) {
    switch (sortBy) {
      case 'price-low':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high':
        return products.sort((a, b) => b.price - a.price);
      case 'rating':
        return products.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'popularity':
        return products.sort((a, b) => b.reviewCount - a.reviewCount);
      default:
        return products;
    }
  }

  clearFilters() {
    this.filters = {
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      sortBy: 'relevance'
    };

    // Reset UI
    document.getElementById('category-filter').value = '';
    document.getElementById('price-range').value = 1000;
    document.getElementById('max-price-display').textContent = '$1000';
    document.getElementById('sort-filter').value = 'relevance';
    
    // Reset rating stars
    document.querySelectorAll('#rating-filter i').forEach(star => {
      star.classList.remove('fas', 'active');
      star.classList.add('far');
    });

    // Reset search
    document.getElementById('search-input').value = '';
    this.searchQuery = '';

    this.applyFilters();
    this.renderAIRecommendations(); // live update
  }

  toggleFilters() {
    const filterControls = document.getElementById('filter-controls');
    if (filterControls) {
      filterControls.classList.toggle('hidden');
    }
  }

  setViewMode(mode) {
    this.viewMode = mode;
    
    // Update button states
    document.getElementById('grid-view').classList.toggle('active', mode === 'grid');
    document.getElementById('list-view').classList.toggle('active', mode === 'list');
    
    // Update container class
    const container = document.getElementById('products-container');
    if (container) {
      container.className = mode === 'grid' ? 'products-grid' : 'products-list';
    }
    
    this.renderProducts();
  }

  renderProducts() {
    const container = document.getElementById('products-container');
    const resultsCount = document.getElementById('results-count');
    
    if (!container) return;

    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    const productsToShow = this.filteredProducts.slice(0, endIndex);

    if (resultsCount) {
      resultsCount.textContent = `${this.filteredProducts.length} products found`;
    }

    if (productsToShow.length === 0) {
      container.innerHTML = `
        <div class="no-products">
          <i class="fas fa-search"></i>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
          <button onclick="app.clearFilters()" class="clear-filters-btn">
            <i class="fas fa-refresh"></i>
            Clear Filters
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = productsToShow.map(product => this.renderProductCard(product)).join('');

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
      loadMoreBtn.classList.toggle('hidden', endIndex >= this.filteredProducts.length);
    }

    // Add event listeners to product cards
    this.attachProductCardListeners();
  }

  renderProductCard(product) {
    const isInCart = this.cart.some(item => item.id === product.id);
    const isInWishlist = this.wishlist.some(item => item.id === product.id);
    const isInCompare = this.compareList.some(item => item.id === product.id);
    const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
          
          <div class="product-badges">
            ${product.isNew ? '<span class="product-badge badge-new">New</span>' : ''}
            ${product.isTrending ? '<span class="product-badge badge-trending">Trending</span>' : ''}
            ${product.isOnSale ? `<span class="product-badge badge-sale">${discountPercent}% Off</span>` : ''}
          </div>
          
          <div class="product-actions">
            <button class="action-btn wishlist-btn ${isInWishlist ? 'active' : ''}" 
                    data-product-id="${product.id}" title="Add to Wishlist">
              <i class="fas fa-heart"></i>
            </button>
            <button class="action-btn compare-btn ${isInCompare ? 'active' : ''}" data-product-id="${product.id}" title="Compare">
              <i class="fas fa-balance-scale"></i>
            </button>
            <button class="action-btn share-btn" data-product-id="${product.id}" title="Share">
              <i class="fas fa-share"></i>
            </button>
          </div>
        </div>
        
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description">${product.description}</p>
          
          <div class="product-rating">
            <div class="stars">
              ${this.renderStars(product.rating)}
            </div>
            <span class="rating-count">(${product.reviewCount})</span>
          </div>
          
          <div class="product-price">
            <div class="price-info">
              <span class="price-current">$${product.price}</span>
              ${product.originalPrice ? `<span class="price-original">$${product.originalPrice}</span>` : ''}
            </div>
            ${product.isOnSale ? `<span class="price-discount">${discountPercent}% OFF</span>` : ''}
          </div>
          
          <div class="product-footer">
            <button class="add-to-cart-btn" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              ${isInCart ? 'In Cart' : 'Add to Cart'}
            </button>
            <button class="quick-view-btn" data-product-id="${product.id}">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return `
      ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
      ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
      ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
    `;
  }

  attachProductCardListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(clone.dataset.productId);
        this.addToCart(productId);
      });
    });

    // Wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(clone.dataset.productId);
        this.toggleWishlistItem(productId);
      });
    });

    // Quick view buttons
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(clone.dataset.productId);
        this.showQuickView(productId);
      });
    });

    // Share buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(clone.dataset.productId);
        this.shareProduct(productId);
      });
    });

    // Compare buttons
    document.querySelectorAll('.compare-btn').forEach(btn => {
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(clone.dataset.productId);
        this.toggleCompareItem(productId);
      });
    });

    // Product card click for quick view
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // If the click is on an action button or inside one, do nothing
        if (e.target.closest('.action-btn')) return;
        const productId = parseInt(card.dataset.productId);
        this.showQuickView(productId);
      });
    });
  }

  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = this.cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }

    this.saveToStorage('cart', this.cart);
    this.updateCartCount();
    this.renderCart();
    this.showNotification(`${product.title} added to cart`, 'success');
    
    // Update button state
    const btn = document.querySelector(`[data-product-id="${productId}"].add-to-cart-btn`);
    if (btn) {
      btn.innerHTML = '<i class="fas fa-check"></i> In Cart';
      btn.classList.add('in-cart');
    }
    this.renderAIRecommendations(); // live update
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveToStorage('cart', this.cart);
    this.updateCartCount();
    this.renderCart();
    this.updateCartSummary();
    
    // Update button state
    const btn = document.querySelector(`[data-product-id="${productId}"].add-to-cart-btn`);
    if (btn) {
      btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
      btn.classList.remove('in-cart');
    }
    this.renderAIRecommendations(); // live update
  }

  updateCartQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    item.quantity = quantity;
    this.saveToStorage('cart', this.cart);
    this.updateCartCount();
    this.renderCart();
    this.updateCartSummary();
  }

  toggleWishlistItem(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = this.wishlist.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
      this.wishlist.splice(existingIndex, 1);
      this.showNotification(`${product.title} removed from wishlist`, 'info');
    } else {
      this.wishlist.push(product);
      this.showNotification(`${product.title} added to wishlist`, 'success');
    }

    this.saveToStorage('wishlist', this.wishlist);
    this.updateWishlistCount();
    this.renderWishlist();
    
    // Update button state
    const btn = document.querySelector(`[data-product-id="${productId}"].wishlist-btn`);
    if (btn) {
      btn.classList.toggle('active');
    }
    this.renderAIRecommendations(); // live update
  }

  showQuickView(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('quick-view-modal');
    const content = document.getElementById('quick-view-content');
    
    if (!modal || !content) return;

    const isInCart = this.cart.some(item => item.id === productId);
    const isInWishlist = this.wishlist.some(item => item.id === productId);

    content.innerHTML = `
      <div class="quick-view-product">
        <div class="quick-view-image">
          <img src="${product.image}" alt="${product.title}">
          <div class="product-badges">
            ${product.isNew ? '<span class="product-badge badge-new">New</span>' : ''}
            ${product.isTrending ? '<span class="product-badge badge-trending">Trending</span>' : ''}
            ${product.isOnSale ? '<span class="product-badge badge-sale">Sale</span>' : ''}
          </div>
        </div>
        
        <div class="quick-view-info">
          <div class="product-category">${product.category}</div>
          <h2 class="product-title">${product.title}</h2>
          <p class="product-description">${product.description}</p>
          
          <div class="product-rating">
            <div class="stars">${this.renderStars(product.rating)}</div>
            <span class="rating-count">(${product.reviewCount} reviews)</span>
          </div>
          
          <div class="product-price">
            <span class="price-current">$${product.price}</span>
            ${product.originalPrice ? `<span class="price-original">$${product.originalPrice}</span>` : ''}
            ${product.isOnSale ? `<span class="price-discount">${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>` : ''}
          </div>
          
          <div class="quick-view-actions">
            <button class="add-to-cart-btn" onclick="app.addToCart(${product.id})">
              <i class="fas fa-shopping-cart"></i>
              ${isInCart ? 'In Cart' : 'Add to Cart'}
            </button>
            <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="app.toggleWishlistItem(${product.id})">
              <i class="fas fa-heart"></i>
              ${isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
          
          <div class="product-details">
            <h4>Product Details</h4>
            <ul>
              <li>Category: ${product.category}</li>
              <li>Rating: ${product.rating}/5 (${product.reviewCount} reviews)</li>
              <li>Availability: ${product.inStock ? 'In Stock' : 'Out of Stock'}</li>
              ${product.isNew ? '<li>Status: New Product</li>' : ''}
              ${product.isTrending ? '<li>Status: Trending</li>' : ''}
            </ul>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  shareProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href + `?product=${productId}`
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.href}?product=${productId}`;
      navigator.clipboard.writeText(url).then(() => {
        this.showNotification('Product link copied to clipboard!', 'success');
      }).catch(() => {
        this.showNotification('Could not copy link', 'error');
      });
    }
  }

  toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
      cartSidebar.classList.toggle('open');
      this.renderCart();
      this.updateCartSummary();
    }
  }

  closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
      cartSidebar.classList.remove('open');
    }
  }

  renderCart() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;

    if (this.cart.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started!</p>
        </div>
      `;
      return;
    }

    cartItems.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.title}</h4>
          <div class="cart-item-price">$${item.price}</div>
          <div class="cart-item-controls">
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity - 1})">
                <i class="fas fa-minus"></i>
              </button>
              <span class="quantity-display">${item.quantity}</span>
              <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity + 1})">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <button class="remove-item-btn" onclick="app.removeFromCart(${item.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  updateCartSummary() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
  }

  clearCart() {
    this.cart = [];
    this.saveToStorage('cart', this.cart);
    this.updateCartCount();
    this.renderCart();
    this.updateCartSummary();
    this.showNotification('Cart cleared', 'info');
    
    // Update all cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
      btn.classList.remove('in-cart');
    });
    this.renderAIRecommendations(); // live update
  }

  handleCheckout() {
    if (this.cart.length === 0) {
      this.showNotification('Your cart is empty', 'warning');
      return;
    }

    // Simulate checkout process
    const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1;
    
    this.showNotification('Processing your order...', 'info');
    
    setTimeout(() => {
      this.showNotification(`Order placed successfully! Total: $${total.toFixed(2)}`, 'success');
      this.clearCart();
      this.closeCart();
    }, 2000);
  }

  toggleWishlist() {
    const wishlistModal = document.getElementById('wishlist-modal');
    if (wishlistModal) {
      wishlistModal.classList.toggle('active');
      this.renderWishlist();
    }
  }

  closeWishlist() {
    const wishlistModal = document.getElementById('wishlist-modal');
    if (wishlistModal) {
      wishlistModal.classList.remove('active');
    }
  }

  renderWishlist() {
    const wishlistContent = document.getElementById('wishlist-content');
    if (!wishlistContent) return;

    if (this.wishlist.length === 0) {
      wishlistContent.innerHTML = `
        <div class="empty-wishlist">
          <i class="fas fa-heart"></i>
          <h3>Your wishlist is empty</h3>
          <p>Save products you love for later!</p>
        </div>
      `;
      return;
    }

    wishlistContent.innerHTML = `
      <div class="wishlist-grid">
        ${this.wishlist.map(item => `
          <div class="wishlist-item">
            <img src="${item.image}" alt="${item.title}" class="wishlist-item-image">
            <div class="wishlist-item-info">
              <h4 class="wishlist-item-title">${item.title}</h4>
              <div class="wishlist-item-price">$${item.price}</div>
              <div class="wishlist-item-actions">
                <button class="btn-primary" onclick="app.addToCart(${item.id})">
                  <i class="fas fa-shopping-cart"></i>
                  Add to Cart
                </button>
                <button class="btn-secondary" onclick="app.toggleWishlistItem(${item.id})">
                  <i class="fas fa-trash"></i>
                  Remove
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  updateCartCount() {
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    }
  }

  updateWishlistCount() {
    const count = this.wishlist.length;
    const badge = document.getElementById('wishlist-count');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    }
  }

  renderAIRecommendations() {
    const container = document.getElementById('ai-products');
    if (!container) return;

    // Gather context
    const cartIds = new Set(this.cart.map(item => item.id));
    const wishlistIds = new Set(this.wishlist.map(item => item.id));
    const search = this.searchQuery;
    const filters = this.filters;

    // Recommend products not in cart/wishlist, matching search/filters, or trending/high-rated
    let recommended = this.products.filter(p =>
      !cartIds.has(p.id) &&
      !wishlistIds.has(p.id)
    );

    // If user is searching or filtering, bias recommendations to those
    if (search || filters.category || filters.minRating > 0 || filters.maxPrice < 1000) {
      recommended = recommended.filter(product => {
        let match = true;
        if (search) {
          const s = search.toLowerCase();
          match = match && (
            product.title.toLowerCase().includes(s) ||
            product.description.toLowerCase().includes(s) ||
            product.category.toLowerCase().includes(s)
          );
        }
        if (filters.category) {
          match = match && product.category === filters.category;
        }
        if (filters.minRating > 0) {
          match = match && product.rating >= filters.minRating;
        }
        if (filters.maxPrice < 1000) {
          match = match && product.price <= filters.maxPrice;
        }
        return match;
      });
    }

    // If not enough, fill with trending/high-rated
    if (recommended.length < 8) {
      const trending = this.products.filter(p =>
        (p.isTrending || p.rating >= 4.5) &&
        !cartIds.has(p.id) &&
        !wishlistIds.has(p.id)
      );
      // Add only new ones
      trending.forEach(p => {
        if (!recommended.some(r => r.id === p.id)) recommended.push(p);
      });
    }

    // Sort by rating, trending, and recency
    recommended = recommended
      .sort((a, b) => {
        if (b.isTrending !== a.isTrending) return b.isTrending - a.isTrending;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 8);

    container.innerHTML = recommended.map(product => this.renderProductCard(product)).join('');
    setTimeout(() => {
      this.attachProductCardListeners();
      // Make clicking a product card in AI recommendations open quick view
      container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.action-btn')) return;
          const productId = parseInt(card.dataset.productId);
          this.showQuickView(productId);
        });
      });
    }, 100);
  }

  loadMoreProducts() {
    this.currentPage++;
    this.renderProducts();
  }

  setupIntersectionObserver() {
    // Back to top button visibility
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          backToTopBtn.classList.remove('show');
        } else {
          backToTopBtn.classList.add('show');
        }
      });
    });

    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      observer.observe(heroSection);
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  handleKeyboardNavigation(event) {
    // Escape key closes modals
    if (event.key === 'Escape') {
      this.closeAllModals();
      this.closeCart();
    }
    
    // Enter key on focused elements
    if (event.key === 'Enter' && event.target.classList.contains('product-card')) {
      const productId = parseInt(event.target.dataset.productId);
      this.showQuickView(productId);
    }
  }

  toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    
    if (navMenu && mobileToggle) {
      navMenu.classList.toggle('mobile-open');
      mobileToggle.classList.toggle('active');
    }
  }

  showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };

    notification.innerHTML = `
      <i class="notification-icon ${icons[type]}"></i>
      <div class="notification-content">
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;

    container.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remove after 5 seconds
    setTimeout(() => this.removeNotification(notification), 5000);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.removeNotification(notification);
    });
  }

  removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  }

  loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Could not load from localStorage:', error);
      return null;
    }
  }

  toggleCompareItem(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    const existingIndex = this.compareList.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      this.compareList.splice(existingIndex, 1);
      this.showNotification(`${product.title} removed from compare`, 'info');
    } else {
      if (this.compareList.length >= 3) {
        this.showNotification('You can only compare up to 3 products.', 'warning');
        return;
      }
      this.compareList.push(product);
      this.showNotification(`${product.title} added to compare`, 'success');
    }
    this.saveToStorage('compareList', this.compareList);
    this.updateCompareCount();
    this.renderProducts();
  }

  updateCompareCount() {
    const count = this.compareList.length;
    const badge = document.getElementById('compare-count');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    }
  }

  toggleCompareModal() {
    const compareModal = document.getElementById('compare-modal');
    if (compareModal) {
      compareModal.classList.toggle('active');
      this.renderCompare();
    }
  }

  closeCompareModal() {
    const compareModal = document.getElementById('compare-modal');
    if (compareModal) {
      compareModal.classList.remove('active');
    }
  }

  renderCompare() {
    const compareContent = document.getElementById('compare-content');
    if (!compareContent) return;
    if (this.compareList.length === 0) {
      compareContent.innerHTML = `<div class="empty-compare"><i class="fas fa-balance-scale"></i><h3>No products selected for comparison</h3><p>Select up to 3 products to compare.</p></div>`;
      return;
    }
    // Build comparison table
    let table = `<div class="compare-table"><div class="compare-row">`;
    this.compareList.forEach(item => {
      table += `<div class="compare-cell"><img src="${item.image}" alt="${item.title}" class="compare-image"><h4>${item.title}</h4><div class="compare-category">${item.category}</div></div>`;
    });
    table += `</div><div class="compare-row">`;
    this.compareList.forEach(item => {
      table += `<div class="compare-cell"><strong>Price:</strong> $${item.price}</div>`;
    });
    table += `</div><div class="compare-row">`;
    this.compareList.forEach(item => {
      table += `<div class="compare-cell"><strong>Rating:</strong> ${item.rating} (${item.reviewCount} reviews)</div>`;
    });
    table += `</div><div class="compare-row">`;
    this.compareList.forEach(item => {
      table += `<div class="compare-cell"><strong>In Stock:</strong> ${item.inStock ? 'Yes' : 'No'}</div>`;
    });
    table += `</div><div class="compare-row">`;
    this.compareList.forEach(item => {
      table += `<div class="compare-cell"><strong>Description:</strong> ${item.description}</div>`;
    });
    table += `</div></div>`;
    compareContent.innerHTML = table;
  }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new ShopSmartApp();
  // AI Chat Bot Widget logic
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotMessages = document.getElementById('chatbot-messages');

  if (chatbotToggle && chatbotWindow) {
    chatbotToggle.addEventListener('click', () => {
      chatbotWindow.classList.toggle('hidden');
      if (!chatbotWindow.classList.contains('hidden')) {
        setTimeout(() => chatbotInput.focus(), 200);
      }
    });
  }
  if (chatbotClose && chatbotWindow) {
    chatbotClose.addEventListener('click', () => {
      chatbotWindow.classList.add('hidden');
    });
  }
  if (chatbotForm && chatbotInput && chatbotMessages) {
    chatbotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userMsg = chatbotInput.value.trim();
      if (!userMsg) return;
      // Add user message
      const userDiv = document.createElement('div');
      userDiv.className = 'chatbot-message user';
      userDiv.textContent = userMsg;
      chatbotMessages.appendChild(userDiv);
      chatbotInput.value = '';
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      // Mock AI response
      setTimeout(() => {
        const responses = [
          "I'm here to help! You can ask about products, orders, or recommendations.",
          "Looking for something specific? Try using the search bar above!",
          "Our trending products are updated daily. Would you like a recommendation?",
          "If you need help with your cart or wishlist, just let me know!",
          "You can filter products by category, price, or rating for a better experience.",
          "For the best deals, check out our sale section!",
          "I'm an AI assistant, but if you need human support, visit our contact page.",
          "Want to know more about a product? Click on it for a quick view!"
        ];
        const botDiv = document.createElement('div');
        botDiv.className = 'chatbot-message bot';
        botDiv.textContent = responses[Math.floor(Math.random() * responses.length)];
        chatbotMessages.appendChild(botDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }, 700);
    });
  }

  // Profile Modal Logic
  const profileBtn = document.getElementById('profile-btn');
  const profileModal = document.getElementById('profile-modal');
  const closeProfile = document.getElementById('close-profile');
  const profileForm = document.getElementById('profile-form');
  const logoutBtn = document.getElementById('logout-btn');
  const orderHistoryList = document.getElementById('order-history-list');
  const addOrderBtn = document.getElementById('add-order-btn');

  // Profile state
  function loadProfile() {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    document.getElementById('profile-name').value = profile.name || '';
    document.getElementById('profile-username').value = profile.username || '';
    document.getElementById('profile-password').value = profile.password || '';
  }
  function saveProfile(e) {
    if (e) e.preventDefault();
    const profile = {
      name: document.getElementById('profile-name').value,
      username: document.getElementById('profile-username').value,
      password: document.getElementById('profile-password').value
    };
    localStorage.setItem('profile', JSON.stringify(profile));
    app.showNotification('Profile saved', 'success');
  }
  function logoutProfile() {
    localStorage.removeItem('profile');
    localStorage.removeItem('orderHistory');
    loadProfile();
    renderOrderHistory();
    app.showNotification('Logged out', 'info');
    profileModal.classList.remove('active');
  }

  // Order history state
  function loadOrderHistory() {
    return JSON.parse(localStorage.getItem('orderHistory') || '[]');
  }
  function saveOrderHistory(history) {
    localStorage.setItem('orderHistory', JSON.stringify(history));
  }
  function renderOrderHistory() {
    const history = loadOrderHistory();
    orderHistoryList.innerHTML = '';
    if (history.length === 0) {
      orderHistoryList.innerHTML = '<div style="color:var(--text-light);">No orders yet.</div>';
      return;
    }
    history.forEach((order, idx) => {
      const div = document.createElement('div');
      div.className = 'order-history-item';
      div.innerHTML = `
        <input type="text" value="${order}" data-idx="${idx}" />
        <div class="order-history-actions">
          <button class="btn-primary" data-action="save" data-idx="${idx}">Save</button>
          <button class="btn-secondary" data-action="delete" data-idx="${idx}">Delete</button>
        </div>
      `;
      orderHistoryList.appendChild(div);
    });
  }

  // Event listeners
  if (profileBtn && profileModal) {
    profileBtn.addEventListener('click', () => {
      profileModal.classList.add('active');
      loadProfile();
      renderOrderHistory();
    });
  }
  if (closeProfile && profileModal) {
    closeProfile.addEventListener('click', () => {
      profileModal.classList.remove('active');
    });
  }
  if (profileForm) {
    profileForm.addEventListener('submit', saveProfile);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutProfile);
  }
  if (addOrderBtn) {
    addOrderBtn.addEventListener('click', () => {
      const history = loadOrderHistory();
      history.push('New Order');
      saveOrderHistory(history);
      renderOrderHistory();
    });
  }
  if (orderHistoryList) {
    orderHistoryList.addEventListener('click', (e) => {
      const idx = e.target.dataset.idx;
      if (e.target.dataset.action === 'delete') {
        const history = loadOrderHistory();
        history.splice(idx, 1);
        saveOrderHistory(history);
        renderOrderHistory();
      } else if (e.target.dataset.action === 'save') {
        const input = orderHistoryList.querySelector(`input[data-idx="${idx}"]`);
        const history = loadOrderHistory();
        history[idx] = input.value;
        saveOrderHistory(history);
        renderOrderHistory();
      }
    });
  }
  if (orderHistoryList) {
    orderHistoryList.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT') {
        e.target.classList.add('edited');
      }
    });
  }
});

// Close modal when clicking outside
document.getElementById('quick-view-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'quick-view-modal') {
    document.getElementById('quick-view-modal').classList.remove('active');
  }
});

document.getElementById('close-quick-view')?.addEventListener('click', () => {
  document.getElementById('quick-view-modal').classList.remove('active');
});
