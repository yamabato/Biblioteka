function fill_book_data_input() {
  const isbn_input = document.querySelector("#book-data-isbn");
  const isbn = isbn_input.value;
  fill_book_data({"isbn": isbn, "kind": "isbn"});
}

function update_img() {
  const file_input = document.querySelector("#add-book-data-thumbnail-file");
  if (file_input.files.length == 0) { return }

  let reader = new FileReader();
  reader.readAsDataURL(file_input.files[0]);

  reader.onload = function() {
    document.querySelector("#add-book-data-thumbnail-img").src = reader.result;
  }
}

function clear_forms() {
    document.querySelector("#book-data-isbn").value = "";
    document.querySelector("#book-data-title").value = "";
    document.querySelector("#book-data-author").value = "";
    document.querySelector("#book-data-publisher").value = "";
    document.querySelector("#book-data-date").value = "";
    document.querySelector("#book-data-pages").value = "";
    document.querySelector("#book-data-language").value = "";
    document.querySelector("#book-data-thumbnail-file").value = "";

    document.querySelector("#book-data-thumbnail-img").src = "./static/img/3.png";
}

function send_item_data() {
  const isbn = document.querySelector("#book-data-isbn").value;
  const title = document.querySelector("#book-data-title").value;
  const author = document.querySelector("#book-data-author").value;
  const publisher = document.querySelector("#book-data-publisher").value;
  const date = document.querySelector("#book-data-date").value;
  const pages = document.querySelector("#book-data-pages").value;
  const language = document.querySelector("#book-data-language").value;

  if (title == "") { return }

  const thumbnail_files = document.querySelector("#book-data-thumbnail-file").files;
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
