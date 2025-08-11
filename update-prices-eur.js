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

// الأسعار باليورو حسب النوع (محدثة)
const prices = {
    "mug": 14.66,
    "t-shirt": 14.94,
    "sticker": 3.60,
    "keychain": 7.51,
    "poster": 25.11,
    "postcard": 1.27,
    "phone-case": 24.84
};

// تعديل كل منتج (تحديث الأسعار فقط دون تعديل الوصف)
data.products = data.products.map(product => {
    let priceEUR = prices[product.type] || null;
    
    return {
        ...product,
        priceEUR: priceEUR ? priceEUR.toFixed(2) : null,
        priceCurrency: "EUR"
        // لم نعد إضافة أي جمل للوصف
    };
});

// حفظ التعديلات
fs.writeFileSync('products.json', JSON.stringify(data, null, 2), 'utf8');

console.log("✅ تم تحديث المنتجات بأسعار اليورو الجديدة بنجاح!");
console.log(`📊 تم تحديث ${data.products.length} منتج`);
console.log("💡 ملاحظة: تم تحديث الأسعار حسب القيم الجديدة");