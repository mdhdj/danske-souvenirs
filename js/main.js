document.addEventListener('DOMContentLoaded', function() {
    // Funktion til at generere produkter på forsiden
    function renderProducts(filter = 'all') {
        const productGrid = document.getElementById('product-grid');
        productGrid.innerHTML = '';
        
        const filteredProducts = filter === 'all' 
            ? products 
            : products.filter(product => product.type === filter);
            
        if (filteredProducts.length === 0) {
            document.getElementById('no-results').classList.remove('d-none');
            return;
        }
        
        document.getElementById('no-results').classList.add('d-none');
        
        filteredProducts.forEach((product, index) => {
            // تأخير بسيط لإنشاء تأثير تدريجي
            setTimeout(() => {
                const productCard = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4 product-item" data-type="${product.type}" data-city="${product.city.toLowerCase()}">
                    <div class="product-card h-100">
                        <a href="products/${product.id}.html">
                            <img 
                                src="${product.image}" 
                                class="product-img lazyload" 
                                alt="${product.title} - ${product.city}" 
                                loading="lazy">
                        </a>
                        <div class="product-content d-flex flex-column">
                            <h2 class="product-title flex-grow-1">
                                <a href="products/${product.id}.html" class="text-decoration-none text-dark">${product.title}</a>
                            </h2>
                            <p class="product-type">${product.type.charAt(0).toUpperCase() + product.type.slice(1)}</p>
                            <a href="products/${product.id}.html" class="btn btn-sm btn-outline-primary mt-auto">Se produkt</a>
                        </div>
                    </div>
                </div>
                `;
                
                productGrid.innerHTML += productCard;
                
                // تحقق من وجود صور جديدة لتطبيق lazy loading
                const newImages = productGrid.querySelectorAll('.lazyload:not(.lazyloaded)');
                initLazyLoading(newImages);
            }, index * 50); // تأخير تدريجي لكل عنصر
        });
    }
    
    // تهيئة Lazy Loading
    function initLazyLoading(images) {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('lazyloaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    // Søgefunktion
    function setupSearch() {
        const searchInput = document.getElementById('main-search');
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            if (searchTerm === '') {
                renderProducts(document.querySelector('.filter-btn.active').dataset.filter);
                return;
            }
            
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            
            const filteredProducts = products.filter(product => {
                return (
                    product.title.toLowerCase().includes(searchTerm) ||
                    product.city.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm)
                ) && (activeFilter === 'all' || product.type === activeFilter);
            });
            
            renderFilteredProducts(filteredProducts);
        });
    }
    
    // Funktion til at vise filtrerede produkter
    function renderFilteredProducts(productsList) {
        const productGrid = document.getElementById('product-grid');
        productGrid.innerHTML = '';
        
        if (productsList.length === 0) {
            document.getElementById('no-results').classList.remove('d-none');
            return;
        }
        
        document.getElementById('no-results').classList.add('d-none');
        
        productsList.forEach((product, index) => {
            setTimeout(() => {
                const productCard = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4 product-item" data-type="${product.type}" data-city="${product.city.toLowerCase()}">
                    <div class="product-card h-100">
                        <a href="products/${product.id}.html">
                            <img 
                                src="${product.image}" 
                                class="product-img lazyload" 
                                alt="${product.title} - ${product.city}" 
                                loading="lazy">
                        </a>
                        <div class="product-content d-flex flex-column">
                            <h2 class="product-title flex-grow-1">
                                <a href="products/${product.id}.html" class="text-decoration-none text-dark">${product.title}</a>
                            </h2>
                            <p class="product-type">${product.type.charAt(0).toUpperCase() + product.type.slice(1)}</p>
                            <a href="products/${product.id}.html" class="btn btn-sm btn-outline-primary mt-auto">Se produkt</a>
                        </div>
                    </div>
                </div>
                `;
                
                productGrid.innerHTML += productCard;
                
                // تحقق من وجود صور جديدة لتطبيق lazy loading
                const newImages = productGrid.querySelectorAll('.lazyload:not(.lazyloaded)');
                initLazyLoading(newImages);
            }, index * 50);
        });
    }
    
    // Filterfunktion
    function setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Opdater aktive knap
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filtre produkter
                const filter = this.dataset.filter;
                renderProducts(filter);
            });
        });
    }
    
    // Initialiser alt
    renderProducts();
    setupFilters();
    setupSearch();
    
    // تحقق من وجود صور لتطبيق lazy loading عند التحميل
    const lazyImages = document.querySelectorAll('.lazyload');
    initLazyLoading(lazyImages);
});