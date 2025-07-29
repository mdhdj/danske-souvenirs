import os
import re

# إعدادات عامة
PRODUCTS_DIR = 'products'
SITE_URL = 'https://danske-souvenirs.dk/products/'
AUTHOR = 'Danske Souvenirs'

# قالب السيو (بدون سعر أو خامة أو توصيل)
SEO_TEMPLATE = '''<title>{city} {product_type} | Unik Souvenir – {product_type} med {city} motiv</title>
<meta name="description" content="Opdag {city} {product_type} med unikt dansk design. Perfekt gaveidé eller souvenir fra {city}. Find din favorit online.">
<meta name="keywords" content="{city} {product_type}, {product_type} med {city}, souvenir {product_type} {city}, gave fra {city}, dansk design {product_type}, {city} motiv {product_type}, {product_type} online, {city} souvenir shop">
<meta name="author" content="{author}">
<meta property="og:title" content="{city} {product_type} | Unik Souvenir fra Danmark" />
<meta property="og:description" content="Få en {city} {product_type} inspireret af byens charme. Perfekt som gave eller minde fra {city}." />
<meta property="og:type" content="product" />
<meta property="og:url" content="{url}" />
<meta property="og:image" content="{image}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{city} {product_type} | Unik Souvenir fra Danmark" />
<meta name="twitter:description" content="Opdag {city} {product_type} med ægte dansk design. Perfekt gaveidé fra {city}." />
<meta name="twitter:image" content="{image}" />
<link rel="canonical" href="{url}" />
<script type="application/ld+json">
{{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "{city} {product_type}",
  "image": [
    "{image}"
  ],
  "description": "Unik {product_type} med motiv fra {city}. Perfekt som gave eller souvenir fra Danmark.",
  "brand": {{
    "@type": "Brand",
    "name": "{author}"
  }}
}}
</script>'''

PRODUCT_TYPES = {
    'tshirts': 'T-shirt',
    'plakater': 'plakat',
    'klistermarker': 'klistermærke',
    'nogleringe': 'nøglering',
    'postkort': 'postkort',
}

def get_image_url(html):
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html)
    return match.group(1) if match else ''

def update_seo_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    filename = os.path.basename(filepath)
    parts = filename.replace('.html', '').split('-danmark-')
    if len(parts) != 2:
        return False
    city = parts[0].capitalize()
    prod_key = parts[1].replace('.html', '')
    product_type = PRODUCT_TYPES.get(prod_key, prod_key)
    url = SITE_URL + filename
    image = get_image_url(html)
    if not image:
        image = ''
    # تحقق إذا كان السيو محدث مسبقًا (بدون سعر)
    if '<meta name="keywords"' in html and '<script type="application/ld+json">' in html and '"price":' not in html:
        return False
    # بناء السيو الجديد
    seo_block = SEO_TEMPLATE.format(
        city=city,
        product_type=product_type,
        author=AUTHOR,
        url=url,
        image=image
    )
    # استبدال الوسوم القديمة أو إدراج الجديد بعد <head>
    html_new = re.sub(r'(<head>)(.*?)(<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>)',
                     r'\1\n' + seo_block + r'\n\3', html, flags=re.DOTALL)
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
