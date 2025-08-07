import json
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, ElementTree

# إعداد
base_url = "https://mdhdj.github.io/danske-souvenirs/#"
json_file = "products.json"
sitemap_file = "sitemap.xml"

try:
    # قراءة الملف
    with open(json_file, "r", encoding="utf-8") as f:
        content = json.load(f)

    # دعم للبنية {"products": [...]}
    if isinstance(content, dict) and "products" in content:
        products = content["products"]
    elif isinstance(content, list):
        products = content
    else:
        raise ValueError("تنسيق JSON غير معروف.")

    # بناء ملف XML
    urlset = Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    # رابط الصفحة الرئيسية
    url = SubElement(urlset, "url")
    SubElement(url, "loc").text = "https://mdhdj.github.io/danske-souvenirs/"
    SubElement(url, "lastmod").text = datetime.today().strftime('%Y-%m-%d')
    SubElement(url, "changefreq").text = "weekly"
    SubElement(url, "priority").text = "1.0"

    # روابط المنتجات
    for product in products:
        product_id = product.get("id")
        if product_id:
            url = SubElement(urlset, "url")
            SubElement(url, "loc").text = base_url + product_id
            SubElement(url, "lastmod").text = datetime.today().strftime('%Y-%m-%d')
            SubElement(url, "changefreq").text = "monthly"
            SubElement(url, "priority").text = "0.7"

    # حفظ الملف
    tree = ElementTree(urlset)
    tree.write(sitemap_file, encoding="utf-8", xml_declaration=True)

    print(f"✅ تم إنشاء sitemap بنجاح: {sitemap_file}")

except FileNotFoundError:
    print(f"❌ لم يتم العثور على الملف: {json_file}")
except json.JSONDecodeError as e:
    print(f"❌ خطأ في JSON: {e}")
except Exception as e:
    print(f"❌ خطأ غير متوقع: {e}")
