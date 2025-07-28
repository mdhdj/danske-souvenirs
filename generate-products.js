const fs = require('fs');
const path = require('path');

// قراءة ملف JSON
const rawData = fs.readFileSync('denmark_products.json');
const productsData = JSON.parse(rawData);

// معالجة البيانات
const processedProducts = productsData.map(product => {
    // تحديد نوع المنتج
    let type = 'diverse';
    if (product.url.includes('keychain')) type = 'nøgleringe';
    else if (product.url.includes('poster')) type = 'plakater';
    else if (product.url.includes('sticker')) type = 'klistermærker';
    else if (product.url.includes('t_shirt') || product.url.includes('t-shirt')) type = 't-shirts';
    else if (product.url.includes('postcard')) type = 'postkort';
    
    // استخراج المدينة
    let city = 'Danmark';
    const title = product.title;
    
    if (title.includes('Aalborg')) city = 'Aalborg';
    else if (title.includes('Aarhus')) city = 'Aarhus';
    else if (title.includes('Esbjerg')) city = 'Esbjerg';
    else if (title.includes('Fredericia')) city = 'Fredericia';
    else if (title.includes('Herning')) city = 'Herning';
    else if (title.includes('Hillerød')) city = 'Hillerød';
    else if (title.includes('Hjørring')) city = 'Hjørring';
    else if (title.includes('Hørsholm')) city = 'Hørsholm';
    else if (title.includes('Holstebro')) city = 'Holstebro';
    else if (title.includes('Horsens')) city = 'Horsens';
    else if (title.includes('Køge')) city = 'Køge';
    else if (title.includes('Kolding')) city = 'Kolding';
    else if (title.includes('Næstved')) city = 'Næstved';
    else if (title.includes('Nørresundby')) city = 'Nørresundby';
    else if (title.includes('Nyhavn')) city = 'København';
    else if (title.includes('Odense')) city = 'Odense';
    else if (title.includes('Randers')) city = 'Randers';
    else if (title.includes('Roskilde')) city = 'Roskilde';
    else if (title.includes('Silkeborg')) city = 'Silkeborg';
    else if (title.includes('Slagelse')) city = 'Slagelse';
    else if (title.includes('Sønderborg')) city = 'Sønderborg';
    else if (title.includes('Svendborg')) city = 'Svendborg';
    else if (title.includes('Taastrup')) city = 'Taastrup';
    else if (title.includes('Vejle')) city = 'Vejle';
    else if (title.includes('Viborg')) city = 'Viborg';
    else if (title.includes('Denmark Travel')) city = 'Danmark';
    
    // وصف بالدنماركية
    const description = `Smuk ${type} med motiver fra ${city}. En perfekt souvenir fra denne danske by.`;
    
    // إنشاء معرف فريد
    const typeForId = type.replace(' ', '').replace('-', '').replace('ø', 'o').replace('æ', 'a').replace('å', 'a');
    const cityForId = city.toLowerCase().replace(' ', '').replace('ø', 'o').replace('æ', 'a').replace('å', 'a');
    const id = `${cityForId}-danmark-${typeForId}`;
    
    return {
        id,
        title: product.title,
        type,
        image: product.img,
        url: product.url,
        city,
        description
    };
});

// إنشاء المجلدات
const productsDir = path.join(__dirname, 'products');
if (fs.existsSync(productsDir)) {
    fs.rmSync(productsDir, { recursive: true, force: true });
}
fs.mkdirSync(productsDir);

// إنشاء ملف index.html
const indexContent = `<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Danske Souvenirs | Unikke Gaver fra Danmark</title>
    <meta name="description" content="Udforsk vores bred vifte af danske souvenirs og gaver inspireret af danske byer og kultur. Perfekte som souvenir eller gave.">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div class="container">
            <a class="navbar-brand" href="#">
                <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/dk.svg" width="30" height="20" class="me-2" alt="Dansk flag">
                Danske Souvenirs
            </a>
        </div>
    </nav>

    <section class="py-5 bg-light">
        <div class="container">
            <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
                <button class="btn btn-filter active" data-filter="all">Alle Produkter</button>
                <button class="btn btn-filter" data-filter="t-shirts">T-shirts</button>
                <button class="btn btn-filter" data-filter="klistermærker">Klistermærker</button>
                <button class="btn btn-filter" data-filter="plakater">Plakater</button>
                <button class="btn btn-filter" data-filter="nøgleringe">Nøgleringe</button>
                <button class="btn btn-filter" data-filter="postkort">Postkort</button>
            </div>
            
            <div class="input-group mb-4">
                <input type="text" class="form-control" id="searchInput" placeholder="Søg efter produkter...">
            </div>
            
            <div class="row g-4" id="productGrid">
                ${processedProducts.map(product => `
                <div class="col-md-4 col-lg-3 product-item" data-type="${product.type}">
                    <div class="card h-100">
                        <img src="${product.image}" class="card-img-top" alt="${product.title}">
                        <div class="card-body">
                            <h3 class="card-title">${product.title}</h3>
                            <p class="card-text text-muted">${product.type} | ${product.city}</p>
                            <a href="products/${product.id}.html" class="btn btn-primary">Se produkt</a>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
            
            <div class="text-center mt-5" id="noResults" style="display: none;">
                <div class="p-5 bg-light rounded">
                    <h4 class="text-muted">Ingen produkter fundet</h4>
                    <p class="text-muted">Prøv at søge efter et andet ord eller fjern nogle filtre.</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p>&copy; ${new Date().getFullYear()} Danske Souvenirs. Alle rettigheder forbeholdes.</p>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const productItems = document.querySelectorAll('.product-item');
            const filterButtons = document.querySelectorAll('.btn-filter');
            const searchInput = document.getElementById('searchInput');
            const noResults = document.getElementById('noResults');
            
            // وظيفة التصفية
            function filterProducts(filter) {
                filterButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === filter);
                });
                
                let hasResults = false;
                
                productItems.forEach(item => {
                    const matchesType = filter === 'all' || item.dataset.type === filter;
                    const matchesSearch = !searchInput.value || 
                        item.querySelector('.card-title').textContent.toLowerCase().includes(
                            searchInput.value.toLowerCase()
                        );
                    
                    if (matchesType && matchesSearch) {
                        item.style.display = 'block';
                        hasResults = true;
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                noResults.style.display = hasResults ? 'none' : 'block';
            }
            
            // معالجة أحداث الضغط على الأزرار
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterProducts(button.dataset.filter);
                });
            });
            
            // معالجة البحث
            searchInput.addEventListener('input', () => {
                const activeFilter = document.querySelector('.btn-filter.active').dataset.filter;
                filterProducts(activeFilter);
            });
            
            // بدء مع عرض جميع المنتجات
            filterProducts('all');
        });
    </script>
</body>
</html>`;

fs.writeFileSync('index.html', indexContent);

// إنشاء ملفات المنتجات
processedProducts.forEach((product, index) => {
    const productContent = `<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.title} | Danske Souvenirs</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div class="container">
            <a class="navbar-brand" href="../index.html">
                <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/dk.svg" width="30" height="20" class="me-2" alt="Dansk flag">
                Danske Souvenirs
            </a>
        </div>
    </nav>

    <section class="py-5">
        <div class="container">
            <div class="row">
                <div class="col-md-6 mb-4">
                    <img src="${product.image}" class="img-fluid rounded" alt="${product.title}">
                </div>
                <div class="col-md-6">
                    <h1>${product.title}</h1>
                    <p class="text-muted">${product.type} | ${product.city}</p>
                    
                    <div class="mb-4">
                        <h2 class="h4">Beskrivelse</h2>
                        <p>${product.description}</p>
                    </div>
                    
                    <a href="${product.url}" target="_blank" class="btn btn-primary btn-lg">Køb nu</a>
                    <a href="../index.html" class="btn btn-outline-secondary ms-2">Tilbage til alle produkter</a>
                </div>
            </div>
        </div>
    </section>
    
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p>&copy; ${new Date().getFullYear()} Danske Souvenirs. Alle rettigheder forbeholdes.</p>
        </div>
    </footer>
</body>
</html>`;

    fs.writeFileSync(path.join(productsDir, `${product.id}.html`), productContent);
});

// إنشاء ملف CSS بسيط
const cssContent = `
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f8f9fa;
}

.btn-filter {
    background-color: white;
    border: 1px solid #dee2e6;
    border-radius: 30px;
    padding: 8px 16px;
    margin: 5px;
}

.btn-filter.active {
    background-color: #c60c30;
    color: white;
    border-color: #c60c30;
}

.card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.card:hover {
    transform: translateY(-5px);
}

.card-img-top {
    height: 200px;
    object-fit: cover;
    border-radius: 8px 8px 0 0;
}`;

fs.mkdirSync('css', { recursive: true });
fs.writeFileSync('css/style.css', cssContent);

console.log('تم إنشاء الموقع بنجاح!');
console.log('الخطوات التالية:');
console.log('1. قم بتشغيل خادم محلي: python -m http.server 8000');
console.log('2. افتح المتصفح وانتقل إلى: http://localhost:8000');