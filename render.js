document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded successfully');
    
    // DOM Elements
    const productsContainer = document.getElementById('productsContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const filterButtons = document.querySelectorAll('.btn-filter');
    const loadingContainer = document.getElementById('loadingContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const contactForm = document.getElementById('contactForm');
    const formSuccessMessage = document.getElementById('formSuccessMessage');
    
    console.log('DOM Elements found:', {
        productsContainer: !!productsContainer,
        searchInput: !!searchInput,
        searchButton: !!searchButton,
        filterButtons: filterButtons.length,
        loadingContainer: !!loadingContainer,
        loadingSpinner: !!loadingSpinner,
        errorMessage: !!errorMessage,
        noResultsMessage: !!noResultsMessage,
        contactForm: !!contactForm,
        formSuccessMessage: !!formSuccessMessage
    });
    
    // State
    let products = [];
    let filteredProducts = [];
    let activeFilter = 'all';
    let searchTerm = '';
    let isLoading = false;
    
    // Initialize
    init();
    
    // Functions
    async function init() {
        console.log('Initializing app...');
        try {
            showLoading();
            await fetchProducts();
            renderProducts();
            setupEventListeners();
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing the app:', error);
            showError(error);
        } finally {
            hideLoading();
        }
    }
    
    async function fetchProducts() {
        console.log('Fetching products...');
        try {
            const response = await fetch('./products.json');
            console.log('Fetch response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Products data received:', data);
            
            if (!data || !data.products || !Array.isArray(data.products)) {
                throw new Error('Invalid products data format - expected an object with a products array');
            }
            
            if (data.products.length === 0) {
                throw new Error('No products found in the data file');
            }
            
            // Validate product data structure
            const invalidProducts = data.products.filter(product => 
                !product.id || !product.name || !product.type || !product.image
            );
            
            if (invalidProducts.length > 0) {
                console.warn(`Found ${invalidProducts.length} products with missing required fields:`, invalidProducts);
            }
            
            products = data.products.filter(product => 
                product.id && product.name && product.type && product.image
            );
            
            filteredProducts = [...products];
            console.log(`Successfully loaded ${products.length} valid products`);
            
            if (products.length === 0) {
                throw new Error('No valid products found after validation');
            }
            
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }
    
    function renderProducts() {
        console.log('Rendering products:', filteredProducts.length);
        
        // Hide all messages first
        hideError();
        hideNoResults();
        
        if (!filteredProducts.length) {
            console.log('No products to display');
            showNoResults();
            productsContainer.innerHTML = '';
            return;
        }
        
        console.log('Creating product cards...');
        try {
            const cardsHTML = filteredProducts.map(product => createProductCard(product)).join('');
            console.log('Cards HTML created');
            productsContainer.innerHTML = cardsHTML;
            console.log('Products rendered successfully');
        } catch (error) {
            console.error('Error rendering products:', error);
            showError(new Error('Failed to render products'));
        }
    }
    
    function createProductCard(product) {
        console.log('Creating card for product:', product.name);
        
        // Validate required product fields
        if (!product.id || !product.name || !product.type || !product.image) {
            console.warn('Product missing required fields:', product);
            return '';
        }
        
        const typeLabel = getProductTypeLabel(product.type);
        const location = product.location || 'Unknown';
        const description = product.description || 'No description available';
        const url = product.url || '#';
        
        return `
            <div class="col-md-6 col-lg-4 col-xl-3 product-card" data-type="${product.type}" data-location="${location.toLowerCase()}">
                <div class="card h-100 shadow-sm product-item">
                    <div class="card-img-container">
                        <img src="${product.image}" 
                             class="card-img-top" 
                             alt="${product.name}" 
                             loading="lazy"
                             onerror="this.style.opacity='0.7'; this.style.filter='grayscale(100%)'; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="mb-2">
                            <span class="badge bg-danger text-white">${typeLabel}</span>
                            <span class="badge bg-secondary text-white ms-1">${location}</span>
                        </div>
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text flex-grow-1">${description}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <a href="${url}" class="btn btn-danger btn-sm" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-cart-plus me-1"></i> Køb nu
                            </a>
                            <a href="./products/${product.id}.html" class="btn btn-outline-secondary btn-sm">
                                <i class="bi bi-eye me-1"></i> Detaljer
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getProductTypeLabel(type) {
        const typeLabels = {
            'mug': 'Kaffekop',
            'phone-case': 'Mobilcover',
            't-shirt': 'T-shirt',
            'sticker': 'Klistermærke',
            'keychain': 'Nøglering',
            'poster': 'Plakat',
            'postcard': 'Postkort'
        };
        return typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
    }
    
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Search functionality
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', handleSearch);
            searchInput.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    handleSearch();
                }
            });
            console.log('Search event listeners set up');
        }
        
        // Filter functionality
        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    console.log('Filter button clicked:', this.dataset.filter);
                    
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Update filter
                    activeFilter = this.dataset.filter;
                    console.log('Active filter changed to:', activeFilter);
                    filterProducts();
                });
            });
            console.log('Filter event listeners set up');
        }
        
        // Contact form
        if (contactForm) {
            contactForm.addEventListener('submit', function(event) {
                event.preventDefault();
                handleFormSubmit();
            });
            console.log('Contact form event listener set up');
        }
        
        console.log('All event listeners set up successfully');
    }
    
    function handleSearch() {
        if (isLoading) return;
        
        searchTerm = searchInput.value.toLowerCase().trim();
        console.log('Search term:', searchTerm);
        filterProducts();
    }
    
    function filterProducts() {
        console.log('Filtering products...');
        console.log('Active filter:', activeFilter);
        console.log('Search term:', searchTerm);
        
        try {
            filteredProducts = products.filter(product => {
                // Filter by type
                const typeMatch = activeFilter === 'all' || product.type === activeFilter;
                
                // Filter by search term
                const searchMatch = searchTerm === '' || 
                    (product.name && product.name.toLowerCase().includes(searchTerm)) ||
                    (product.location && product.location.toLowerCase().includes(searchTerm)) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.keywords && Array.isArray(product.keywords) && 
                     product.keywords.some(keyword => 
                        keyword && keyword.toLowerCase().includes(searchTerm)
                     ));
                
                return typeMatch && searchMatch;
            });
            
            console.log(`Filtered to ${filteredProducts.length} products`);
            renderProducts();
        } catch (error) {
            console.error('Error filtering products:', error);
            showError(new Error('Failed to filter products'));
        }
    }
    
    function handleFormSubmit() {
        console.log('Form submitted');
        // In a real application, you would send the form data to a server here
        // For this demo, we'll just show a success message
        
        try {
            // Reset form
            contactForm.reset();
            
            // Show success message
            formSuccessMessage.classList.remove('d-none');
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                formSuccessMessage.classList.add('d-none');
            }, 5000);
        } catch (error) {
            console.error('Error handling form submission:', error);
            alert('Der opstod en fejl ved afsendelse af formularen. Prøv venligst igen.');
        }
    }
    
    function showLoading() {
        console.log('Showing loading spinner');
        isLoading = true;
        if (loadingContainer) loadingContainer.classList.remove('d-none');
        if (loadingSpinner) loadingSpinner.classList.remove('d-none');
    }
    
    function hideLoading() {
        console.log('Hiding loading spinner');
        isLoading = false;
        if (loadingContainer) loadingContainer.classList.add('d-none');
        if (loadingSpinner) loadingSpinner.classList.add('d-none');
    }
    
    function showError(error) {
        console.log('Showing error message:', error.message);
        hideLoading();
        hideNoResults();
        if (errorMessage) {
            errorMessage.classList.remove('d-none');
            // Optionally update error message with specific error details
            const errorDetails = errorMessage.querySelector('p');
            if (errorDetails) {
                errorDetails.textContent = error.message || 'Der opstod en ukendt fejl.';
            }
        }
        productsContainer.innerHTML = '';
    }
    
    function hideError() {
        if (errorMessage) errorMessage.classList.add('d-none');
    }
    
    function showNoResults() {
        console.log('Showing no results message');
        hideError();
        if (noResultsMessage) noResultsMessage.classList.remove('d-none');
    }
    
    function hideNoResults() {
        if (noResultsMessage) noResultsMessage.classList.add('d-none');
    }
    
    // Global function to clear search (called from HTML)
    window.clearSearch = function() {
        console.log('Clearing search');
        searchInput.value = '';
        searchTerm = '';
        
        // Reset filter to 'all'
        activeFilter = 'all';
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            }
        });
        
        filterProducts();
    };
    
    // Global function to retry loading (called from HTML)
    window.retryLoading = function() {
        console.log('Retrying to load products');
        init();
    };
});