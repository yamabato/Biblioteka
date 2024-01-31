import time
import random
import hashlib
import requests

from item_database import load_items, save_database_file
from util import trim_isbn

BOOK_DATA_TEMPLATE = {
    "isbn": "",
    "title": "",
    "author": "",
    "publisher": "",
    "date": "",
    "pages": "",
    "language": "",
    "thumbnail_url": "",
    "thumbnail_file_path": "",
}

# OpenBD API
def fetch_openbd_data(isbn):
    endpoint = "https://api.openbd.jp/v1/get"

    params={
        "isbn": isbn
    }

    result = requests.get(endpoint, headers={}, params=params)

    return result.ok, result.json()

# OpenBDより書誌情報を取得
def generate_book_data_isbn(isbn):
    book_data = BOOK_DATA_TEMPLATE
    book_data["isbn"] = isbn
    book_data["language"] = "jpn"

    ok, json_data = fetch_openbd_data(isbn)

    if not ok: return book_data

    # onixデータに基本書誌情報が含まれる
    try:
        onix_data = json_data[0]["onix"]
    except: onix_data = {}

    # 書籍自体の情報
    try:
        descriptive_detail = onix_data["DescriptiveDetail"]
    except: descriptive_detail = {}
    # 出版社の情報
    try:
        publishing_detail = onix_data["PublishingDetail"]
    except: publishing_detail = {}
    # 販促情報 
    try:
        collateral_detail = onix_data["CollateralDetail"]
    except: collateral_detail = {}

    # タイトルとサブタイトルがあれば連結
    try:
        title_element = descriptive_detail["TitleDetail"]["TitleElement"]
        title = title_element["TitleText"]["content"]
        subtitle = ""
        if "Subtitle" in title_element:
            subtitle = title_element["Subtitle"]["content"]
        book_data["title"] = title + (f" - {subtitle}" if subtitle != "" else "")
    except: pass

    # 著者はリスト形式
    try:
        contributors = descriptive_detail["Contributor"]
        authors = []
        for contributor in contributors:
            authors.append(contributor["PersonName"]["content"])
        book_data["author"] = ", ".join(authors)
    except: pass

    # 発行元出版社
    try:
        book_data["publisher"] = publishing_detail["Imprint"]["ImprintName"]
    except: pass

    # 出版日 一番頭
    try:
        book_data["date"] = publishing_detail["PublishingDate"][0]["Date"]
    except: pass

    # ページ数
    try:
        book_data["pages"] = descriptive_detail["Extent"][0]["ExtentValue"]
    except: pass

    # 言語コード
    try:
        book_data["language"] = descriptive_detail["Language"][0]["LanguageCode"]
    except: pass

    # 書影
    try:
        book_data["thumbnail_url"]= collateral_detail["SupportingResource"][0]["ResourceVersion"][0]["ResourceLink"]
    except: pass

    # 国会図書館書影データベース
    try:
        book_data["thumbnail_url"] = f"https://ndlsearch.ndl.go.jp/thumbnail/{isbn}.jpg"
    except: pass

    return book_data

def generate_book_data_id(item_id):
    book_data = BOOK_DATA_TEMPLATE

    ok, items = load_items()
    if not ok: return book_data

    if item_id not in items: return book_data

    item = items[item_id]
    book_data["isbn"] = item[1]
    book_data["title"] = item[2]
    book_data["author"] = item[3]
    book_data["publisher"] = item[4]
    book_data["date"] = item[5]
    book_data["pages"] = item[6]
    book_data["language"] = item[7]
    book_data["thumbnail_file_path"] = item[8]

    return book_data

def generate_book_data(request_body):
    kind = request_body["kind"]

    if kind == "isbn":
        isbn = request_body["isbn"]
        book_data = generate_book_data_isbn(trim_isbn(isbn))
        ok, img_path = download_thumbnail(book_data["thumbnail_url"])
        book_data["thumbnail_file_path"] = img_path
        return book_data
    else:
        item_id = request_body["item_id"]
        return generate_book_data_id(item_id)

# 書影をダウンロード
def download_thumbnail(url):
    try:
        result = requests.get(url)
    except: return False, ""

    img = bytes()
    content_type = ""
    img_type = ""
    img_extension = ""
    img_file_name = ""
    img_ident = ""

    if not result.ok: return False, img_file_name

    # 取得したコンテンツの種別が画像か判別
    content_type = result.headers["content-type"]
    if "image" not in content_type: return False, img_file_name

    # 画像データを取得
    img = result.content
    # 画像の表現形式を取得
    img_type = content_type[6:]

    # 拡張子
    if img_type == "jpeg": img_extension = "jpg"
    elif img_type == "gif": img_extension = "gif"
    elif img_type == "png": img_extension = "png"

    # ファイル名
    img_ident = f"{time.time()}{random.random()}".replace(".", "")
    img_ident = hashlib.md5(img).hexdigest()
    img_file_name = f"./static/thumbnails/{img_ident}.{img_extension}"

    # 保存
    with open(img_file_name, mode="wb") as f:
        f.write(img)

    return True, img_file_name

def import_isbn_list(isbn_list):
    succeeded = []
    failed = []

    for isbn in isbn_list:
        isbn_trimmed = trim_isbn(isbn)
        book_data = generate_book_data(isbn_trimmed)

        thumbnail_url = book_data["thumbnail_url"]
        ok, thumbnail_path = download_thumbnail(thumbnail_url)
        if ok: book_data["thumbnail_path"] = thumbnail_path

        title = book_data["title"]
        if title: succeeded.append(book_data)
        else: failed.append(book_data)

    return True, succeeded, failed

def save_item_data_change(item_data):
    ok, items = load_items()
    if not ok: return False

    item_id = item_data["item_id"]

    thumbnail_file_path = item_data["thumbnail_file_path"]
    if thumbnail_file_path[:8] != "./static":
        thumbnail_file_path = os.path.join("./static/thumbnails/", thumbnail_file_path)

    item = [
        item_data["item_id"],
        item_data["isbn"],
        item_data["title"],
        item_data["author"],
        item_data["publisher"],
        item_data["date"],
        item_data["pages"],
        item_data["language"],
        thumbnail_file_path
    ]

    items[item_id] = item

    save_database_file(items)

    return True
