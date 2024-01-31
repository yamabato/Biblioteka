function fill_book_data(request_body) {
  fetch("/book_data", {
    method: "POST",
    body: JSON.stringify(request_body)
  }).then((result) => {
    if (result.ok) {
      return result.json();
    };
  }).then((book_data) => {
    document.querySelector("#book-data-isbn").value = book_data.isbn;
    document.querySelector("#book-data-title").value = book_data.title;
    document.querySelector("#book-data-author").value = book_data.author;
    document.querySelector("#book-data-publisher").value = book_data.publisher;
    document.querySelector("#book-data-date").value = book_data.date;
    document.querySelector("#book-data-pages").value = book_data.pages;
    document.querySelector("#book-data-language").value = book_data.language;
    let img_type = "image/jpeg";

    const thumbnail_file_path = book_data.thumbnail_file_path;
    if (thumbnail_file_path.includes(".png")) { img_type = "image/png"; }
    else if (thumbnail_file_path.includes(".gif")) { img_type = "image/gif"; }

    const file_path = book_data.thumbnail_file_path;
    if (file_path){
      const img_file = new File([""], thumbnail_file_path, {type: img_type});
      const dt = new DataTransfer();
      dt.items.add(img_file);
      document.querySelector("#book-data-thumbnail-file").files = dt.files;
      document.querySelector("#book-data-thumbnail-img").src = book_data.thumbnail_file_path;
    }
  });
}
