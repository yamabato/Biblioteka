import re
import time
import random
import hashlib
import requests

# OpenBD API
def fetch_openbd_data(isbn):
    endpoint = "https://api.openbd.jp/v1/get"

    params={
        "isbn": isbn
    }

    result = requests.get(endpoint, headers={}, params=params)

    return result.ok, result.json()

# OpenBDより書誌情報を取得
def generate_book_data(isbn):
    book_data = {
        "isbn": isbn,
        "title": "",
        "author": "",
        "publisher": "",
        "date": "",
        "pages": "",
        "language": "jpn",
        "thumbnail_url": "",
    }

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

# 数字以外を削除
def trim_isbn(isbn):
    return  re.sub(r"\D", "", isbn)

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
