const fs = require('fs');
const path = require('path');

// مسارات الملفات
const rootDir = __dirname;
const productsJsonPath = path.join(rootDir, 'products.json');
const productsDir = path.join(rootDir, 'products');

// إنشاء مجلد المنتجات إذا لم يكن موجودًا
if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
    console.log('✓ تم إنشاء مجلد المنتجات');
}

// قراءة بيانات المنتجات من ملف JSON
let productsData;
try {
    const rawData = fs.readFileSync(productsJsonPath, 'utf8');
    productsData = JSON.parse(rawData);
    
    if (!productsData.products || !Array.isArray(productsData.products)) {
        throw new Error('ملف JSON يجب أن يحتوي على مصفوفة products');
    }
    
    console.log(`✓ تم تحميل ${productsData.products.length} منتج من ملف JSON`);
} catch (error) {
    console.error('❌ خطأ في قراءة ملف products.json:', error.message);
    process.exit(1);
}

// قوالب HTML
const headerTemplate = `<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{PRODUCT_NAME}} | Danske Souvenirs</title>
    <meta name="description" content="{{PRODUCT_DESCRIPTION}}">
    <meta name="keywords" content="{{PRODUCT_KEYWORDS}}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product">
    <meta property="og:title" content="{{PRODUCT_NAME}} | Danske Souvenirs">
    <meta property="og:description" content="{{PRODUCT_DESCRIPTION}}">
    <meta property="og:image" content="{{PRODUCT_IMAGE}}">
    <meta property="og:url" content="{{PRODUCT_URL}}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="{{PRODUCT_NAME}} | Danske Souvenirs">
    <meta property="twitter:description" content="{{PRODUCT_DESCRIPTION}}">
    <meta property="twitter:image" content="{{PRODUCT_IMAGE}}">
    
    <!-- Favicon -->
    <link rel="icon" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/dk.svg" type="image/svg+xml">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../style.css">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "{{PRODUCT_NAME}}",
      "image": "{{PRODUCT_IMAGE}}",
      "description": "{{PRODUCT_DESCRIPTION}}",
      "brand": {
        "@type": "Brand",
        "name": "Danske Souvenirs"
      },
      "offers": {
        "@type": "Offer",
        "url": "{{PRODUCT_URL}}",
        "priceCurrency": "DKK",
        "availability": "https://schema.org/InStock"
      }
    }
    </script>
</head>
<body>`;

const navTemplate = `    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center" href="../index.html">
                <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/dk.svg" alt="Dansk flag" class="me-2" height="30" width="30">
                <span class="fw-bold">Danske Souvenirs</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="../index.html">Forside</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="../index.html#produkter">Produkter</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="../index.html#om">Om Os</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="../index.html#kontakt">Kontakt</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>`;

const breadcrumbTemplate = `    <!-- Breadcrumb -->
    <div class="container py-3">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="../index.html">Forside</a></li>
                <li class="breadcrumb-item"><a href="../index.html#produkter">Produkter</a></li>
                <li class="breadcrumb-item active" aria-current="page">{{PRODUCT_NAME}}</li>
            </ol>
        </nav>
    </div>`;

const productTemplate = `    <!-- Product Detail Section -->
    <section class="product-detail-section py-5">
        <div class="container">
            <div class="product-detail-container">
                <div class="row g-0">
                    <div class="col-md-6">
                        <div class="product-detail-image">
                            <img src="{{PRODUCT_IMAGE}}" 
                                 class="img-fluid" 
                                 alt="{{PRODUCT_NAME}}"
                                 loading="lazy"
                                 onerror="this.style.opacity='0.7'; this.style.filter='grayscale(100%)'; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'">
                        </div>
                    </div>
                    <div class="col-md-6 product-detail-info">
                        <h1 class="fw-bold text-danger">{{PRODUCT_NAME}}</h1>
                        <div class="mb-3">
                            <span class="badge bg-danger text-white me-2">{{PRODUCT_TYPE_LABEL}}</span>
                            <span class="badge bg-secondary text-white">{{PRODUCT_LOCATION}}</span>
                        </div>
                        <p class="lead">{{PRODUCT_DESCRIPTION}}</p>
                        {{PRODUCT_KEYWORDS_SECTION}}
                        <div class="product-actions d-flex flex-column flex-sm-row gap-3">
                            <a href="{{PRODUCT_URL}}" class="btn btn-danger btn-lg" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-cart-plus me-2"></i> Køb nu
                            </a>
                            <a href="../index.html#produkter" class="btn btn-outline-secondary btn-lg">
                                <i class="bi bi-arrow-left me-2"></i> Tilbage til produkter
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;

const relatedProductsTemplate = `    <!-- Related Products Section -->
    <section class="related-products-section">
        <div class="container">
            <h2 class="text-center mb-5 fw-bold text-danger">Relaterede Produkter</h2>
            <div class="row g-4">
                {{RELATED_PRODUCTS}}
            </div>
        </div>
    </section>`;

const footerTemplate = `    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5>Danske Souvenirs</h5>
                    <p class="mb-0">Unikke danske produkter og gaver fra hele landet</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="mb-0">&copy; 2025 Danske Souvenirs. Alle rettigheder forbeholdes.</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

// دالة للحصول على تسمية نوع المنتج
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

// دالة لإنشاء قسم الكلمات المفتاحية
function createKeywordsSection(keywords) {
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) return '';
    
    return `
    <div class="product-keywords">
        <h5>Populære søgeord:</h5>
        <div class="d-flex flex-wrap">
            ${keywords.map(keyword => `<span class="badge">${keyword}</span>`).join('')}
        </div>
    </div>`;
}

// دالة لإنشاء بطاقات المنتجات ذات الصلة
function createRelatedProducts(currentProduct, allProducts) {
    // البحث عن منتجات من نفس الموقع أو نفس النوع (بحد أقصى 3)
    const related = allProducts
        .filter(p => 
            p.id !== currentProduct.id && 
            (p.location === currentProduct.location || p.type === currentProduct.type)
        )
        .slice(0, 3);
    
    if (related.length === 0) return '';
    
    return related.map(product => `
        <div class="col-md-4">
            <div class="related-product-card">
                <div class="card-img-container">
                    <img src="${product.image}" 
                         class="card-img-top" 
                         alt="${product.name}"
                         loading="lazy"
                         onerror="this.style.opacity='0.7'; this.style.filter='grayscale(100%)'; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'">
                </div>
                <div class="card-body">
                    <div class="mb-2">
                        <span class="badge bg-danger text-white me-1">${getProductTypeLabel(product.type)}</span>
                        <span class="badge bg-secondary text-white">${product.location}</span>
                    </div>
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description || 'Ingen beskrivelse tilgængelig'}</p>
                    <a href="${product.id}.html" class="btn btn-outline-danger">Se detaljer</a>
                </div>
            </div>
        </div>
    `).join('');
}

// التحقق من صحة بيانات المنتج
function validateProduct(product) {
    const requiredFields = ['id', 'name', 'type', 'image', 'location', 'description', 'url'];
    const missingFields = requiredFields.filter(field => !product[field]);
    
    if (missingFields.length > 0) {
        console.warn(`⚠️ المنتج "${product.name || 'بدون اسم'}" يفتقر الحقول: ${missingFields.join(', ')}`);
        return false;
    }
    
    return true;
}

// إنشاء صفحات المنتجات
console.log('🚀 بدء إنشاء صفحات المنتجات...');
let createdCount = 0;
let skippedCount = 0;

productsData.products.forEach(product => {
    // التحقق من صحة البيانات
    if (!validateProduct(product)) {
        skippedCount++;
        return;
    }
    
    // استبدال المتغيرات في القوالب
    const header = headerTemplate
        .replace(/{{PRODUCT_NAME}}/g, product.name)
        .replace(/{{PRODUCT_DESCRIPTION}}/g, product.description)
        .replace(/{{PRODUCT_KEYWORDS}}/g, (product.keywords || []).join(', '))
        .replace(/{{PRODUCT_IMAGE}}/g, product.image)
        .replace(/{{PRODUCT_URL}}/g, product.url);
    
    const breadcrumb = breadcrumbTemplate.replace(/{{PRODUCT_NAME}}/g, product.name);
    
    const productSection = productTemplate
        .replace(/{{PRODUCT_NAME}}/g, product.name)
        .replace(/{{PRODUCT_IMAGE}}/g, product.image)
        .replace(/{{PRODUCT_DESCRIPTION}}/g, product.description)
        .replace(/{{PRODUCT_TYPE_LABEL}}/g, getProductTypeLabel(product.type))
        .replace(/{{PRODUCT_LOCATION}}/g, product.location)
        .replace(/{{PRODUCT_URL}}/g, product.url)
        .replace(/{{PRODUCT_KEYWORDS_SECTION}}/g, createKeywordsSection(product.keywords));
    
    const relatedProducts = relatedProductsTemplate
        .replace(/{{RELATED_PRODUCTS}}/g, createRelatedProducts(product, productsData.products));
    
    // تجميع الصفحة الكاملة
    const fullPage = [
        header,
        navTemplate,
        breadcrumb,
        productSection,
        relatedProducts,
        footerTemplate
    ].join('\n');
    
    // كتابة الملف
    const filePath = path.join(productsDir, `${product.id}.html`);
    try {
        fs.writeFileSync(filePath, fullPage, 'utf8');
        createdCount++;
        console.log(`✓ تم إنشاء: ${product.id}.html`);
    } catch (error) {
        console.error(`❌ خطأ في إنشاء ${product.id}.html:`, error.message);
        skippedCount++;
    }
});

console.log(`\n📊 إحصائيات التنفيذ:`);
console.log(`✓ تم إنشاء ${createdCount} صفحة منتج بنجاح`);
console.log(`⚠️ تم تخطي ${skippedCount} منتج (بيانات غير مكتملة)`);
console.log(`📂 تم حفظ الصفحات في مجلد: ${productsDir}`);
console.log('\n🎉 اكتمل إنشاء صفحات المنتجات بنجاح!');