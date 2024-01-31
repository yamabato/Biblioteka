import json

from flask import Flask
from flask import render_template, request

from book_data import trim_isbn, generate_book_data, download_thumbnail, import_isbn_list
from search import search_item, generate_search_result_html
from item_database import save_new_item
from dashboard import calculate_statistics

app = Flask(__name__)

@app.route("/")
def page_index():
    return render_template("index.html")

@app.route("/dashboard", methods=["POST", "GET"])
def page_dashboard():
    if request.method == "GET":
        return render_template("dashboard.html")
    elif request.method == "POST":
        statistics = calculate_statistics()
        return statistics

@app.route("/add", methods=["POST", "GET"])
def page_add_item():
    if request.method == "GET":
        return render_template("add_item.html")
    elif request.method == "POST":
        received_data = request.get_data().decode()
        book_data = json.loads(received_data)
        print(book_data)

        ok = save_new_item(book_data)

        return {"ok": ok}

@app.route("/import", methods=["POST", "GET"])
def page_load_csv():
    if request.method == "GET":
        return render_template("load.html")
    elif request.method == "POST":
        received_data = request.get_data().decode()
        isbn_list = json.loads(received_data)
        ok, succeeded, failed = import_isbn_list(isbn_list)

        return {"ok": ok, "succeeded": succeeded, "failed": failed}

@app.route("/search", methods=["POST", "GET"])
def page_search():
    if request.method == "GET":
        items = search_item("")
        search_result_html = generate_search_result_html(items)
        return render_template("search.html", search_result_count=len(items), search_result=search_result_html)
    elif request.method == "POST":
        received_data = request.get_data().decode()
        search_query = json.loads(received_data)

        keyword = search_query["keyword"]
        targets = search_query["targets"]

        items = search_item(keyword, targets)
        search_result_html = generate_search_result_html(items)
        return {"count": len(items), "html": search_result_html}



@app.route("/book_data", methods=["POST"])
def page_book_data():
    if request.method == "POST":
        received_data = str(request.get_data())
        isbn = trim_isbn(received_data)
        book_data = generate_book_data(isbn)

        ok, img_path = download_thumbnail(book_data["thumbnail_url"])

        book_data["thumbnail_file_path"] = img_path

        return book_data

if __name__ == "__main__":
    app.run()
