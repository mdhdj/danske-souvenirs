import os
import re
import json

# إعدادات عامة
PRODUCTS_DIR = 'products'
SITE_URL = 'https://danske-souvenirs.dk/products/'
AUTHOR = 'Danske Souvenirs'

# قالب السيو (meta/schema) مع متغيرات وكلمات مفتاحية ديناميكية
SEO_TEMPLATE = '''<title>{title}</title>
<meta name="description" content="{description}">
<meta name="keywords" content="{keywords}">
<meta name="author" content="{author}">
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{og_description}" />
<meta property="og:type" content="product" />
<meta property="og:url" content="{url}" />
<meta property="og:image" content="{image}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{og_description}" />
<meta name="twitter:image" content="{image}" />
<link rel="canonical" href="{url}" />
<script type="application/ld+json">
{{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "{title}",
  "image": [
    "{image}"
  ],
  "description": "{description}",
  "brand": {{
    "@type": "Brand",
    "name": "{author}"
  }}
}}
</script>'''

# استخراج اسم المدينة ونوع المنتج من اسم الملف
PRODUCT_TYPES = {
    'tshirts': 'T-shirt',
    'plakater': 'plakat',
    'klistermarker': 'klistermærke',
    'nogleringe': 'nøglering',
    'postkort': 'postkort',
}


# كلمات مفتاحية ديناميكية لكل نوع منتج
KEYWORDS_EXTRA = {
    'tshirts': [
        't-shirt med print', 'by t-shirt', 'unik t-shirt', 'gave til ham', 'gave til hende', 'moderne tøj', 'dansk by t-shirt', 'personlig t-shirt', 't-shirt med motiv', 't-shirt gaveidé', 't-shirt til samler', 't-shirt design', 't-shirt souvenir', 't-shirt vægkunst'
    ],
    'plakater': [
        'plakat til stuen', 'retro plakat', 'byplakat', 'vægdekoration', 'kunstplakat', 'gave til familie', 'dansk kunst', 'indretning', 'plakat design', 'plakat gaveidé', 'plakat til hjemmet', 'plakat samling', 'plakat vægkunst', 'unik plakat'
    ],
    'klistermarker': [
        'klistermærke til bil', 'klistermærke til laptop', 'by klistermærke', 'personlig klistermærke', 'gave til børn', 'klistermærke design', 'klistermærke samling', 'klistermærke vægkunst', 'unik klistermærke', 'sjov klistermærke', 'klistermærke dekoration', 'dansk klistermærke'
    ],
    'nogleringe': [
        'nøglering til bil', 'personlig nøglering', 'gave til ven', 'by nøglering', 'unik nøglering', 'nøglering design', 'nøglering samling', 'nøglering souvenir', 'dansk nøglering', 'nøglering gaveidé', 'nøglering til tasken', 'nøglering dekoration'
    ],
    'postkort': [
        'postkort til samling', 'retro postkort', 'by postkort', 'personlig postkort', 'gave til ven', 'postkort design', 'postkort souvenir', 'dansk postkort', 'postkort gaveidé', 'postkort til familie', 'postkort dekoration', 'unik postkort'
    ],
}

def get_image_url(html):
    # ابحث عن أول صورة حقيقية (ليست علم أو صورة افتراضية) داخل القسم الرئيسي للمنتج
    # استخرج كل الصور
    imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', html)
    for img in imgs:
        if not is_placeholder_image(img):
            return img
    return ''

def generate_keywords(city, product_type, prod_key):
    base = [
        f"{city} {product_type}",
        f"{product_type} med {city}",
        f"souvenir {product_type} {city}",
        f"gave fra {city}",
        f"dansk design {product_type}",
        f"{city} motiv {product_type}",
        f"{product_type} online",
        f"{city} souvenir shop"
    ]
    extra = KEYWORDS_EXTRA.get(prod_key, [])
    return ', '.join(base + extra)

def generate_title(city, product_type):
    return f"{city} {product_type} | Unik Souvenir – {product_type} med {city} motiv"

def generate_description(city, product_type):
    return f"Opdag vores {product_type} med motiv fra {city}. Perfekt som gave, dekoration eller minde fra denne danske by. Find din favorit online."

def generate_og_description(city, product_type):
    return f"Unik {product_type} inspireret af {city}. Perfekt som gave eller dekoration fra Danmark."

def get_related_products(city, current_filename):
    related = []
    for fname in os.listdir(PRODUCTS_DIR):
        if fname == current_filename or not fname.endswith('.html'):
            continue
        parts = fname.replace('.html', '').split('-danmark-')
        if len(parts) != 2:
            continue
        if parts[0].lower() == city.lower():
            related.append(fname)
    return related

def is_placeholder_image(img_url):
    # استبعاد صور العلم أو أي صورة افتراضية معروفة
    placeholders = ['flag.png', 'denmark-flag.png', 'dk-flag.png', 'danmark-flag.png']
    return any(ph in img_url.lower() for ph in placeholders)

def build_related_html(related_files, current_filename):
    cards = []
    for fname in related_files:
        path = os.path.join(PRODUCTS_DIR, fname)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            # حذف الفوتر من محتوى المنتج المرتبط (حتى لا يظهر في منتصف الصفحة)
            footer_pattern = r'(<(div|footer)[^>]*>\s*© 2025 Danske Souvenirs\. Alle rettigheder forbeholdes\.[\s\S]*?</\2>)'
            content = re.sub(footer_pattern, '', content, flags=re.IGNORECASE)
            # ابحث عن أول صورة حقيقية داخل القسم الرئيسي للمنتج (section أو div)
            main_section = re.search(r'<section[\s\S]*?</section>', content)
            section_html = main_section.group(0) if main_section else content
            img = get_image_url(section_html)
            if not img or img.strip() == '' or is_placeholder_image(img):
                continue  # تجاهل المنتجات بدون صورة أو بصورة افتراضية
            title = re.search(r'<title>(.*?)</title>', content)
            title = title.group(1) if title else fname.replace('.html', '')
            cards.append(f'''<div class="col-6 col-md-3 mb-3"><a href="{fname}" style="text-decoration:none"><div class="card h-100"><img src="{img}" class="card-img-top" alt="{title}" style="max-height:120px;object-fit:contain;"><div class="card-body p-2"><div class="card-title" style="font-size:1rem">{title}</div></div></div></a></div>''')
        except Exception:
            continue
    if not cards:
        return ''
    html = '\n<div class="container my-5"><h3>Relaterede produkter</h3><div class="row">' + ''.join(cards) + '</div></div>'
    return html

# قسم الكلمات المفتاحية كسحابة كلمات مرئية
def build_keywords_html(keywords):
    if not keywords:
        return ''
    tags = ''
    for kw in keywords.split(','):
        kw = kw.strip()
        if not kw:
            continue
        tags += f'<span class="badge bg-light text-dark border me-1 mb-1" style="font-size:1rem;">{kw}</span>'
    html = f'''\n<div class="container my-4"><h4 style="font-size:1.1rem;">Populære søgeord</h4><div>{tags}</div></div>'''
    return html

def update_seo_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    # حذف أي عنصر سعر (DKK أو kr أو price أو Pris:) من الصفحة (يغطي كل الحالات)
    html = re.sub(r'<[^>]*>(\s*\d+[.,]?\d*\s*(DKK|kr|dkk|kr\.|kr:|kr,|kr;|kr\s|kr$))\s*</[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<[^>]*>\s*Pris:.*?</[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'\d+[.,]?\d*\s*(DKK|kr|dkk|kr\.|kr:|kr,|kr;|kr\s|kr$)', '', html, flags=re.IGNORECASE)
    html = re.sub(r'Pris:.*?(<|\n)', '', html, flags=re.IGNORECASE)
    html = re.sub(r'price[^\n<]*', '', html, flags=re.IGNORECASE)
    html = re.sub(r'\d+[.,]?\d*\s*kr', '', html, flags=re.IGNORECASE)
    html = re.sub(r'\d+[.,]?\d*\s*dkk', '', html, flags=re.IGNORECASE)
    filename = os.path.basename(filepath)
    parts = filename.replace('.html', '').split('-danmark-')
    # معالجة الملفات غير القياسية (التي لا تتبع النمط)
    if len(parts) != 2:
        # محاولة استخراج city وproduct_type من العنوان أو اسم الملف
        title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        title = title_match.group(1) if title_match else filename.replace('.html', '')
        city = title.split()[0].capitalize() if title else 'Danmark'
        prod_key = 'tshirts' if 't-shirt' in title.lower() else 'plakater' if 'plakat' in title.lower() else 'produkt'
        product_type = PRODUCT_TYPES.get(prod_key, prod_key)
    else:
        city = parts[0].capitalize()
        prod_key = parts[1].replace('.html', '')
        product_type = PRODUCT_TYPES.get(prod_key, prod_key)
    url = SITE_URL + filename
    image = get_image_url(html)
    # إذا لم توجد صورة حقيقية، ابحث في كل الصفحة عن أي صورة غير افتراضية
    if not image:
        imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', html)
        for img in imgs:
            if not is_placeholder_image(img):
                image = img
                break
    # إذا لم توجد صورة حقيقية، ضع صورة افتراضية مخصصة للمنتج
    if not image:
        image = 'https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/dk.svg'
    # حذف الأقسام القديمة (related/keywords) قبل إضافة الجديدة
    html = re.sub(r'<!--related-->[\s\S]*?<!--/related-->', '', html)
    html = re.sub(r'<!--keywords-->[\s\S]*?<!--/keywords-->', '', html)
    # حذف جميع meta description وmeta keywords القديمة
    html = re.sub(r'<meta name="description"[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<meta name="keywords"[^>]*>', '', html, flags=re.IGNORECASE)
    # تحقق إذا كان السيو محدث مسبقًا (بدون سعر)
    if '<meta name="keywords"' in html and '<script type="application/ld+json">' in html and '"price":' not in html:
        pass  # نكمل التحديث لأننا حذفنا الأقسام القديمة
    # بناء السيو الجديد
    keywords_str = generate_keywords(city, product_type, prod_key)
    seo_block = SEO_TEMPLATE.format(
        title=generate_title(city, product_type),
        description=generate_description(city, product_type),
        keywords=keywords_str,
        author=AUTHOR,
        url=url,
        image=image,
        og_description=generate_og_description(city, product_type)
    )
    # استبدال الوسوم القديمة أو إدراج الجديد بعد <head>
    html_new = re.sub(r'(<head>)(.*?)(<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>)',
                     r'\1\n' + seo_block + r'\n\3', html, flags=re.DOTALL)

    # بناء قسم الكلمات المفتاحية كسحابة كلمات
    keywords_html = build_keywords_html(keywords_str)
    if keywords_html:
        keywords_html = '<!--keywords-->' + keywords_html + '<!--/keywords-->'

    # إضافة قسم المنتجات ذات الصلة فوق الفوتر مباشرةً مع الحفاظ على الفوتر في مكانه
    related_files = get_related_products(city, filename)
    related_html = build_related_html(related_files, filename)
    if related_html:
        related_html = '<!--related-->' + related_html + '<!--/related-->'

    # حذف كل أنواع الفوتر (footer, div, p, نصوص فقط) وتكرارها
    footer_patterns = [
        r'<footer[\s\S]*?</footer>',
        r'<div[^>]*>[\s\S]*?© 2025 Danske Souvenirs\. Alle rettigheder forbeholdes\.[\s\S]*?</div>',
        r'<p[^>]*>[\s\S]*?© 2025 Danske Souvenirs\. Alle rettigheder forbeholdes\.[\s\S]*?</p>',
        r'© 2025 Danske Souvenirs\. Alle rettigheder forbeholdes\.'
    ]
    html_new = html_new
    for pat in footer_patterns:
        html_new = re.sub(pat, '', html_new, flags=re.IGNORECASE)
    insert_html = ''
    # الترتيب: المنتجات ذات الصلة ثم الكلمات المفتاحية
    if related_html:
        insert_html += related_html + '\n'
    if keywords_html:
        insert_html += keywords_html + '\n'
    # أضف الفوتر في الأسفل بعد الأقسام
    insert_html += '<footer class="bg-dark text-white py-4"><div class="container text-center"><p>© 2025 Danske Souvenirs. Alle rettigheder forbeholdes.</p></div></footer>\n'
    if '</body>' in html_new:
        html_new = html_new.replace('</body>', insert_html + '</body>')
    else:
        html_new += insert_html
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_new)
    return True

def main():
    updated = 0
    skipped = 0
    for fname in os.listdir(PRODUCTS_DIR):
        if fname.endswith('.html'):
            path = os.path.join(PRODUCTS_DIR, fname)
            if update_seo_in_file(path):
                print(f"[UPDATED] {fname}")
                updated += 1
            else:
                print(f"[SKIPPED] {fname}")
                skipped += 1
    print(f"\nDone. Updated: {updated}, Skipped: {skipped}")

if __name__ == '__main__':
    main()
