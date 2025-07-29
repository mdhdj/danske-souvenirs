import os
import re
from bs4 import BeautifulSoup

LANG_DEFAULT = "da"  # يمكن تغييره إلى "en"
AUTO_APPROVE = True  # إذا كنت تريد التعديل التلقائي بدون تأكيد

# ترجمة بسيطة للفئات
CATEGORY_TRANSLATIONS = {
    "t-shirts": "T-shirts",
    "sticker": "Klistermærker",
    "keychain": "Nøgleringe",
    "phone case": "Mobilcover"
}

# تحسين العنوان
def improve_title(title, lang="da"):
    title = title.strip()
    if lang == "da":
        if "Denmark" in title:
            title = title.replace("Denmark", "Danmark")
    return title

# توليد meta description
def generate_meta_description(title, lang="da"):
    if lang == "da":
        return f"Opdag vores eksklusive design: {title}. Perfekt gaveidé fra Danmark!"
    else:
        return f"Discover our exclusive design: {title}. A perfect gift idea from Denmark!"

# تعديل ملف HTML
def update_html_file(filepath, lang=LANG_DEFAULT):
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    title_tag = soup.find("title")
    old_title = title_tag.string.strip() if title_tag else ""
    new_title = improve_title(old_title, lang)

    if title_tag:
        title_tag.string.replace_with(new_title)
    else:
        new_title_tag = soup.new_tag("title")
        new_title_tag.string = new_title
        soup.head.append(new_title_tag)

    # تعديل أو إنشاء meta description
    meta_desc = soup.find("meta", attrs={"name": "description"})
    new_description = generate_meta_description(new_title, lang)
    if meta_desc:
        meta_desc["content"] = new_description
    else:
        new_tag = soup.new_tag("meta", attrs={"name": "description", "content": new_description})
        soup.head.append(new_tag)

    # تعديل lang في <html>
    html_tag = soup.find("html")
    if html_tag and "lang" not in html_tag.attrs:
        html_tag["lang"] = lang

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))

    print(f"✅ Updated: {filepath}")

# مسح المجلدات وتعديل الملفات
def process_directory(folder_path, lang=LANG_DEFAULT):
    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".html"):
                update_html_file(os.path.join(root, file), lang)

# إضافة منتج جديد
def add_product(name, category="phone case", lang=LANG_DEFAULT):
    filename = f"{name.lower().replace(' ', '-')}.html"
    filepath = os.path.join("products", filename)

    title = improve_title(name, lang)
    category_da = CATEGORY_TRANSLATIONS.get(category.lower(), category)

    content = f"""
<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <meta name="description" content="{generate_meta_description(title, lang)}">
  <meta name="keywords" content="{category_da}, {title}, Danmark">
</head>
<body>
  <h1>{title}</h1>
  <p>{category_da} | Danmark</p>
</body>
</html>
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"🆕 Produkt tilføjet: {filepath}")

# === تنفيذ ===
if __name__ == "__main__":
    # تعديل ملفات موجودة
    process_directory("products", lang=LANG_DEFAULT)

    # إضافة منتج جديد كمثال:
    add_product("Copenhagen City Skyline", category="phone case", lang="da")
    add_product("Vintage Denmark Flag", category="t-shirts", lang="en")
