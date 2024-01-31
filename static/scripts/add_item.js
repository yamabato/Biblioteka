function fill_book_data() {
  const isbn_input = document.querySelector("#add-isbn-input");
  const isbn = isbn_input.value;

  fetch("/book_data", {
    method: "POST",
    body: isbn
  }).then((result) => {
    if (result.ok) {
      return result.json();
    };
  }).then((book_data) => {
    document.querySelector("#add-book-data-title").value = book_data.title;
    document.querySelector("#add-book-data-author").value = book_data.author;
    document.querySelector("#add-book-data-publisher").value = book_data.publisher;
    document.querySelector("#add-book-data-date").value = book_data.date;
    document.querySelector("#add-book-data-pages").value = book_data.pages;
    document.querySelector("#add-book-data-language").value = book_data.language;

    let img_type = "image/jpeg";

    const thumbnail_file_path = book_data.thumbnail_file_path;
    if (thumbnail_file_path.includes(".png")) { img_type = "image/png"; }
    else if (thumbnail_file_path.includes(".gif")) { img_type = "image/gif"; }

    const img_file = new File([""], thumbnail_file_path, {type: img_type});
    const dt = new DataTransfer();
    dt.items.add(img_file);
    document.querySelector("#add-book-thumbnail-file").files = dt.files;
    document.querySelector("#add-book-thumbnail-img").src = book_data.thumbnail_file_path;
  });
}

function update_img() {
  const file_input = document.querySelector("#add-book-thumbnail-file");
  if (file_input.files.length == 0) { return }

  let reader = new FileReader();
  reader.readAsDataURL(file_input.files[0]);

  reader.onload = function() {
    document.querySelector("#add-book-thumbnail-img").src = reader.result;
  }
}

function clear_forms() {
    document.querySelector("#add-isbn-input").value = "";
    document.querySelector("#add-book-data-title").value = "";
    document.querySelector("#add-book-data-author").value = "";
    document.querySelector("#add-book-data-publisher").value = "";
    document.querySelector("#add-book-data-date").value = "";
    document.querySelector("#add-book-data-pages").value = "";
    document.querySelector("#add-book-data-language").value = "";
    document.querySelector("#add-book-thumbnail-file").value = "";

    document.querySelector("#add-book-thumbnail-img").src = "./static/img/3.png";
}

function send_item_data() {
  const isbn = document.querySelector("#add-isbn-input").value;
  const title = document.querySelector("#add-book-data-title").value;
  const author = document.querySelector("#add-book-data-author").value;
  const publisher = document.querySelector("#add-book-data-publisher").value;
  const date = document.querySelector("#add-book-data-date").value;
  const pages = document.querySelector("#add-book-data-pages").value;
  const language = document.querySelector("#add-book-data-language").value;

  if (title == "") { return }

  const thumbnail_files = document.querySelector("#add-book-thumbnail-file").files;
  let thumbnail_file_path;
  if (thumbnail_files.length != 0 ){
    thumbnail_file_path = thumbnail_files[0].name;
  }

  const item_data = {
    "isbn": isbn,
    "title": title,
    "author": author,
    "publisher": publisher,
    "date": date,
    "pages": pages,
    "language": language,
    "thumbnail_file_path": thumbnail_file_path,
  }

  fetch("/add", {
    method: "POST",
    body: JSON.stringify(item_data), 
  }).then((result) => {
    if (result.ok) {
      document.querySelector("#add-msg-placeholder").innerHTML = "<div id='add-msg'>Successfully Saved</div>"
      clear_forms();
      window.setTimeout(function(){
        document.querySelector("#add-msg-placeholder").innerHTML = ""
      }, 5000);
    };
  });
}
