const fs = require('fs');
const path = require('path');

// مسارات الملفات
const rootDir = __dirname;
const productsJsonPath = path.join(rootDir, 'products.json');

console.log('🔍 بدء البحث عن الجملة وحذفها...');

// قراءة ملف المنتجات
let productsData;
try {
    const rawData = fs.readFileSync(productsJsonPath, 'utf8');
    productsData = JSON.parse(rawData);
    console.log(`✓ تم تحميل ${productsData.products.length} منتج`);
} catch (error) {
    console.error('❌ خطأ في قراءة ملف products.json:', error.message);
    process.exit(1);
}

// جميع أشكال الجملة المحتملة
const notePatterns = [
    "(Bemærk: Priserne kan være lavere til tider afhængigt af sælgeren)",
    "(Bemærk: Priserne kan være lavere til tider afhængigt af sælgeren) ",
    " (Bemærk: Priserne kan være lavere til tider afhængigt af sælgeren)",
    " (Bemærk: Priserne kan være lavere til tider afhængigt af sælgeren) ",
    "(Bemærk: Priserne kan være lavere til tider afhængigt af sælgeren).",
    "(Bemærk: Priserne kan være lavere til tider afhængigt af sælgeren). ",
    " (Bemærk: Priserne kan være lavere til tider afhængigt af sælgeren).",
    " (Bemærk: Priserne kan være lavere til tider afhængigt af sælgeren). "
];

let removedNotesCount = 0;
let productsWithNotes = 0;

// البحث عن الجملة في جميع المنتجات
console.log('\n🔍 البحث عن الجملة في الأوصاف...');

productsData.products.forEach((product, index) => {
    if (!product.description) return;
    
    let originalDescription = product.description;
    let foundNote = false;
    
    // البحث عن جميع أشكال الجملة
    notePatterns.forEach(pattern => {
        if (product.description.includes(pattern)) {
            // حذف الجملة
            const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            product.description = product.description.replace(regex, '').trim();
            foundNote = true;
        }
    });
    
    // تنظيف المسافات الزائدة بعد الحذف
    product.description = product.description.replace(/\s+/g, ' ').trim();
    
    if (foundNote) {
        productsWithNotes++;
        console.log(`✓ المنتج ${index + 1}: ${product.name}`);
        console.log(`   قبل: "${originalDescription.substring(0, 100)}..."`);
        console.log(`   بعد:  "${product.description.substring(0, 100)}..."`);
        console.log('');
        
        if (originalDescription !== product.description) {
            removedNotesCount++;
        }
    }
});

if (productsWithNotes === 0) {
    console.log('⚠️ لم يتم العثور على الجملة في أي منتج');
    console.log('💡 قد تكون الجملة:');
    console.log('   - غير موجودة أصلاً');
    console.log('   - بصيغة مختلفة');
    console.log('   - محذوفة مسبقاً');
    
    // عرض عينة من الأوصاف للتحقق
    console.log('\n📝 عينة من الأوصاف:');
    for (let i = 0; i < Math.min(5, productsData.products.length); i++) {
        const product = productsData.products[i];
        console.log(`${i + 1}. ${product.name}:`);
        console.log(`   "${product.description}"`);
        console.log('');
    }
} else {
    console.log(`✓ تم العثور على الجملة في ${productsWithNotes} منتج`);
    console.log(`✓ تم حذف الجملة بنجاح من ${removedNotesCount} منتج`);
    
    // حفظ التعديلات
    try {
        fs.writeFileSync(productsJsonPath, JSON.stringify(productsData, null, 2), 'utf8');
        console.log('✓ تم حفظ ملف products.json المحدث');
    } catch (error) {
        console.error('❌ خطأ في حفظ الملف:', error.message);
        process.exit(1);
    }
}

console.log('\n🎉 اكتملت العملية!');