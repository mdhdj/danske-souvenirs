const fs = require('fs');

// قراءة ملف المنتجات
let data;
try {
    const rawData = fs.readFileSync('products.json', 'utf8');
    data = JSON.parse(rawData);
    console.log(`✓ تم تحميل ${data.products.length} منتج من ملف JSON`);
} catch (error) {
    console.error('❌ خطأ في قراءة ملف products.json:', error.message);
    process.exit(1);
}

// الأسعار باليورو حسب النوع
const prices = {
    "mug": 19.34,
    "t-shirt": 14.77,
    "sticker": 3.56,
    "keychain": 7.43,
    "poster": 24.83,
    "postcard": 1.26,
    "phone-case": 13.64
};

// تعديل كل منتج (تحديث الأسعار فقط دون تعديل الوصف)
data.products = data.products.map(product => {
    let priceEUR = prices[product.type] || null;
    
    return {
        ...product,
        priceEUR: priceEUR ? priceEUR.toFixed(2) : null,
        priceCurrency: "EUR"
        // لم نعد إضافة أي جملة للوصف
    };
});

// حفظ التعديلات
fs.writeFileSync('products.json', JSON.stringify(data, null, 2), 'utf8');

console.log("✅ تم تحديث المنتجات بأسعار اليورو بنجاح!");
console.log(`📊 تم تحديث ${data.products.length} منتج`);
console.log("💡 ملاحظة: لم تتم إضافة أي جمل جديدة للأوصاف");