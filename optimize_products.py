import os
import json
from deep_translator import GoogleTranslator

# تحديد المجلد الذي يحتوي على المنتجات
PRODUCTS_DIR = 'products'

# مترجم من الإنجليزية إلى الدنماركية
translator = GoogleTranslator(source='en', target='da')

# توليد كلمات مفتاحية دنماركية بسيطة من العنوان
def generate_keywords(title_da):
    words = title_da.lower().split()
    return list(set(words + [title_da.lower()]))

# التأكد من وجود alt text جيد للصور
def generate_alt_text(title_da):
    return f"Design med teksten: {title_da}"

for filename in os.listdir(PRODUCTS_DIR):
    if filename.endswith('.json'):
        filepath = os.path.join(PRODUCTS_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # ترجمة العنوان والوصف
        title_en = data.get('title', '')
        desc_en = data.get('description', '')

        title_da = translator.translate(title_en)
        desc_da = translator.translate(desc_en)

        # تعديل البيانات
        data['title'] = title_da
        data['description'] = desc_da
        data['meta'] = {
            'title': title_da,
            'description': desc_da,
            'keywords': generate_keywords(title_da)
        }

        # تحديث alt للصور إن وجدت
        if 'image' in data:
            data['image_alt'] = generate_alt_text(title_da)

        # حفظ التغييرات
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"✅ تم تعديل الملف: {filename}")
