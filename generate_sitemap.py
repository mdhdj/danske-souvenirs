import os
from urllib.parse import quote

BASE_URL = "https://mdhdj.github.io/danske-souvenirs"
OUTPUT_FILE = "sitemap.xml"

def collect_html_files(root_dir="."):
    html_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for f in filenames:
            if f.endswith(".html"):
                full_path = os.path.join(dirpath, f)
                url_part = os.path.relpath(full_path, start=".").replace("\\", "/")
                html_files.append(quote(url_part))
    return html_files

def generate_sitemap(urls):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for url in urls:
            f.write("  <url>\n")
            f.write(f"    <loc>{BASE_URL}/{url}</loc>\n")
            f.write("  </url>\n")
        f.write("</urlset>\n")

if __name__ == "__main__":
    urls = collect_html_files()
    generate_sitemap(urls)
    print(f"sitemap.xml generated with {len(urls)} URLs.")
