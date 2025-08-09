const fs = require('fs');
const path = require('path');

// مسارات الملفات
const rootDir = __dirname;
const productsJsonPath = path.join(rootDir, 'products.json');
const sitemapPath = path.join(rootDir, 'sitemap.xml');

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

// الحصول على التاريخ الحالي بصيغة XML
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// إنشاء محتوى sitemap
function generateSitemap() {
    const baseUrl = 'https://mdhdj.github.io/danske-souvenirs';
    const currentDate = getCurrentDate();
    
    // بداية ملف sitemap
    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    
    // إضافة الصفحة الرئيسية
    sitemapContent += `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;
    
    // إضافة صفحات المنتجات
    productsData.products.forEach(product => {
        if (product.id) {
            sitemapContent += `  <url>
    <loc>${baseUrl}/products/${product.id}.html</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.8</priority>
  </url>
`;
        }
    });
    
    // نهاية ملف sitemap
    sitemapContent += `</urlset>`;
    
    return sitemapContent;
}

// كتابة ملف sitemap
try {
    const sitemapContent = generateSitemap();
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
    console.log('✓ تم إنشاء ملف sitemap.xml بنجاح');
    console.log(`📂 تم حفظ الملف في: ${sitemapPath}`);
    console.log('🌐 عدد الصفحات المضافة:', productsData.products.length + 1);
} catch (error) {
    console.error('❌ خطأ في إنشاء ملف sitemap.xml:', error.message);
    process.exit(1);
}