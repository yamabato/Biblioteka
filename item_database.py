import os
import json
import hashlib

from book_data import trim_isbn

DATABASE_FILE = "./database/books.json"

def load_items():
    try:
        if not os.path.isfile(DATABASE_FILE): create_database_file()

        with open(DATABASE_FILE, mode="r") as f:
            items = json.load(f)

        return True, items
    except:
        return False, {}

def create_database_file():
    with open(DATABASE_FILE, mode="w") as f:
        json.dump({}, f)

def save_new_item(book_data):
    # id, isbn, title, author, publisher, date, pages, language, thumbnail_file_path
    isbn = trim_isbn(book_data["isbn"])
    title = book_data["title"]
    author = book_data["author"]
    publisher = book_data["publisher"]
    date = book_data["date"]
    pages = book_data["pages"]
    language = book_data["language"]
    thumbnail_file_path = book_data["thumbnail_file_path"]

    if thumbnail_file_path[:8] != "./static":
        thumbnail_file_path = os.path.join("./static/thumbnails/", thumbnail_file_path)

    item_id = hashlib.md5((isbn+title).encode()).hexdigest()

    item_data = [item_id, isbn, title, author, publisher, date, pages, language, thumbnail_file_path]

    with open(DATABASE_FILE, mode="r") as f:
        books = json.load(f)

    books[item_id] = item_data

    with open(DATABASE_FILE, mode="w") as f:
        json.dump(books, f)

    return True
