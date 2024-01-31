function fill_book_data_input() {
  const params = new URLSearchParams(document.location.search);
  const item_id = params.get("id");
  fill_book_data({"item_id": item_id, "kind": "item_id"});
}

function save_changes() {
  const params = new URLSearchParams(document.location.search);
  const item_id = params.get("id");
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
    "item_id": item_id,
    "isbn": isbn,
    "title": title,
    "author": author,
    "publisher": publisher,
    "date": date,
    "pages": pages,
    "language": language,
    "thumbnail_file_path": thumbnail_file_path,
  }

  fetch("/edit", {
    method: "POST",
    body: JSON.stringify(item_data), 
  }).then((result) => {
    if (result.ok) {
      return result.json();
    } else {
      document.querySelector("#item-msg-placeholder").innerHTML = "<div id='item-msg'>Failed to Save</div>"
      window.setTimeout(function(){
          document.querySelector("#item-msg-placeholder").innerHTML = ""
      }, 5000);
    };
  }).then((res) => {
    if (res.ok){
      document.querySelector("#item-msg-placeholder").innerHTML = "<div id='item-msg'>Successfully Saved</div>"
    } else {
      document.querySelector("#item-msg-placeholder").innerHTML = "<div id='item-msg'>Failed to Save</div>"
    }
    window.setTimeout(function(){
        document.querySelector("#item-msg-placeholder").innerHTML = ""
    }, 5000);
  });
}

window.onload = function() {
  fill_book_data_input();
}
