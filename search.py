import os
import string

from item_database import load_items

ITEM_HTML = """
<div class="search-result" onclick="open_book_page('${item_id}');">
  <img class="search-result-img" src="${thumbnail_path}">
  <p class="search-result-title">${title}</p>
</div>
"""
ITEM_HTML_TEMPLATE = string.Template(ITEM_HTML)

EMPTY_RESULT_HTML = """
<h1 id="search-result-empty">No Items Found.</h1>
"""

def search_item(keyword, targets=[]):
    ok, items = load_items()
    if not ok: return False, []

    if not targets: targets = range(0, 8)

    result = []
    for info in items.values():
        # -*- info -*-
        # (item_id), isbn, title, author, publisher, date, pages, language, (thumbnail_url)
        target_info = list(map(lambda x: info[int(x)] if int(x)>=1 and int(x)<=7 else "", targets))
        included = map(lambda x: keyword in x, target_info)
        if any(included): result.append(info)

    return result

def generate_search_result_html(items):
    if not items: return EMPTY_RESULT_HTML

    html = ""
    for item in items:
        item_id = item[0]
        title = item[2]
        thumbnail_path = item[8]

        if not os.path.isfile(thumbnail_path): thumbnail_path = "./static/img/1.jpg"

        html += ITEM_HTML_TEMPLATE.safe_substitute(
            {
                "item_id": item_id,
                "title": title,
                "thumbnail_path": thumbnail_path
            }
        )

    return html
