from collections import defaultdict

from item_database import load_items

def calculate_statistics():
    ok, items = load_items()
    if not ok: return {"count": 0, "lang": {}}

    lang = defaultdict(int)
    for info in items.values():
        l = info[7]
        lang[l] += 1

    return {"count": len(items), "lang": lang}
