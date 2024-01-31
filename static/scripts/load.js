let csv;
let isbn_list;
let item_number_list = [];

function open_csv() {
  const file_input = document.querySelector("#load-csv-file");
  if (file_input.files.length == 0) { return }

  let reader = new FileReader();
  reader.readAsText(file_input.files[0]);

  reader.onload = function() {
    csv = reader.result;
    //一列のみのCSVを扱う想定
    isbn_list = csv.split("\n").filter(function(x){ return x!=""; });

    const lines = isbn_list.length;
    document.querySelector("#load-csv-lines").innerHTML = `${lines} Lines`;
  }
}

function send_csv() {
  fetch("/import", {
    method: "POST",
    body: JSON.stringify(isbn_list),
  }).then((result) => {
    if (result.ok) {
      return result.json();
    };
  }).then((data) => {
    const ok = data["ok"];
    const succeeded = data["succeeded"];
    const failed = data["failed"];
    show_items(succeeded, failed);
  });

}

function create_item_html(item_n, info) {
  return `
    <div class="load-item" id="load-item-${item_n}">
        <div class="load-item-info">
            <div class="load-item-summary">
                <img class="load-item-img" id="load-item-img-${item_n}" src="./static/img/1.jpg">
            </div>
            <table class="load-book-data-table">
                <tr class="load-book-data-tr">
                    <th class="load-book-data-th"><label class="load-book-data-lbl">ISBN:</label></th>
                    <td class="load-book-data-td"><input type="text" class="load-book-data-input" \
                      id="load-book-data-isbn-${item_n}" value='${info['isbn']}'/></td>
                </tr>
                <tr class="load-book-data-tr">
                    <th class="load-book-data-th"><label class="load-book-data-lbl">Title:</label></th>
                    <td class="load-book-data-td"><input type="text" class="load-book-data-input" \
                      id="load-book-data-title-${item_n}" value='${info['title']}'/></td>
                </tr>
                <tr class="load-book-data-tr">
                    <th class="load-book-data-th"><label class="load-book-data-lbl">Author:</label></th>
                    <td class="load-book-data-td"><input type="text" class="load-book-data-input" \
                      id="load-book-data-author-${item_n}" value='${info['author']}'/></td>
                </tr>
                <tr class="load-book-data-tr">
                    <th class="load-book-data-th"><label class="load-book-data-lbl">Publisher:</label></th>
                    <td class="load-book-data-td"><input type="text" class="load-book-data-input" \
                      id="load-book-data-publisher-${item_n}" value='${info['publisher']}'/></td>
                </tr>
                <tr class="load-book-data-tr">
                    <th class="load-book-data-th"><label class="load-book-data-lbl">Date:</label></th>
                    <td class="load-book-data-td"><input type="text" class="load-book-data-input" \
                      id="load-book-data-date-${item_n}" value='${info['date']}'/></td>
                </tr>
                <tr class="load-book-data-tr">
                    <th class="load-book-data-th"><label class="load-book-data-lbl">Pages:</label></th>
                    <td class="load-book-data-td"><input type="text" class="load-book-data-input" \
                      id="load-book-data-pages-${item_n}" value='${info['pages']}'/></td>
                </tr>
                <tr class="load-book-data-tr">
                    <th class="load-book-data-th"><label class="load-book-data-lbl">Language:</label></th>
                    <td class="load-book-data-td"><input type="text" class="load-book-data-input" \
                      id="load-book-data-language-${item_n}" value='${info['language']}'/></td>
                </tr>
                <tr class="load-book-data-tr">
                    <th class="load-book-data-th"><label class="load-book-data-lbl">Thumbnail:</label></th>
                    <td class="load-book-data-td"><input type="file" class="file-input-mini" \
                      id="load-book-data-thumbnail-${item_n}" onchange="update_item_img(${item_n});"/></td>
                </tr>
            </table>
        </div>
        <button class="delete-btn" onclick="delete_item(${item_n});">Delete</button>
    </div>
    `
}

function clear_item_fields() {
  document.querySelector("#load-items-area").innerHTML = "";
  item_number_list = [];
}

function show_no_items_msg() {
  document.querySelector("#load-items-area").innerHTML = "<h1 id='load-no-items-msg'>No Items</h1>";
  item_number_list = [];
}

function update_item_img(item_n) {
  const file_input = document.querySelector(`#load-book-data-thumbnail-${item_n}`);
  if (file_input.files.length == 0) { return }

  let reader = new FileReader();
  reader.readAsDataURL(file_input.files[0]);

  reader.onload = function() {
    document.querySelector(`#load-item-img-${item_n}`).src = reader.result;
  }
}

function show_items(succeeded, failed) {
  clear_item_fields();

  let items_field_html = "";
  let item_n = 0;
  let img_path_list = [];

  for (const info of succeeded) {
    items_field_html += create_item_html(item_n, info);
    img_path_list.push(info["thumbnail_path"]);
    item_number_list.push(item_n);
    item_n++;
  }

  for (const info of failed) {
    items_field_html += create_item_html(item_n, info);
    item_number_list.push(item_n);
    item_n++;
  }

  document.querySelector("#load-items-area").innerHTML = items_field_html;

  let img_file;
  let img_type;
  let dt;
  img_path_list.forEach(function(path, i) {
    img_type = "image/jpeg";
    if (path.includes(".png")) { img_type = "image/png"; }
    else if (path.includes(".gif")) { img_type = "image/gif"; }

    img_file = new File([""], path, {type: img_type});
    dt = new DataTransfer();
    dt.items.add(img_file);
    document.querySelector(`#load-book-data-thumbnail-${i}`).files = dt.files;
    document.querySelector(`#load-item-img-${i}`).src = path;
  });
}

function delete_item(item_n) { 
  item_number_list = item_number_list.filter(function(x) { return x != item_n; });
  document.querySelector(`#load-item-${item_n}`).remove();
}

function send_item(item_n) {
  const isbn = document.querySelector(`#load-book-data-isbn-${item_n}`).value;
  const title = document.querySelector(`#load-book-data-title-${item_n}`).value;
  const author = document.querySelector(`#load-book-data-author-${item_n}`).value;
  const publisher = document.querySelector(`#load-book-data-publisher-${item_n}`).value;
  const date = document.querySelector(`#load-book-data-date-${item_n}`).value;
  const pages = document.querySelector(`#load-book-data-pages-${item_n}`).value;
  const language = document.querySelector(`#load-book-data-language-${item_n}`).value;

  if (title == "") { return }

  const thumbnail_files = document.querySelector(`#load-book-data-thumbnail-${item_n}`).files;
  let thumbnail_path;
  if (thumbnail_files.length != 0 ){
    thumbnail_path = thumbnail_files[0].name;
  }

  const item_data = {
    "isbn": isbn,
    "title": title,
    "author": author,
    "publisher": publisher,
    "date": date,
    "pages": pages,
    "language": language,
    "thumbnail_file_path": thumbnail_path,
  }

  fetch("/add", {
    method: "POST",
    body: JSON.stringify(item_data), 
  }).then((result) => {
    if (result.ok) {
    };
  });
}

function send_all_items() {
  for (const item_n of item_number_list) {
    send_item(item_n);
  }

  document.querySelector("#load-msg-placeholder").innerHTML = "<div id='load-msg'>Successfully Saved</div>";
  show_no_items_msg();
  window.setTimeout(function(){
    document.querySelector("#load-msg-placeholder").innerHTML = ""
  }, 5000);
}

window.onload = function() {
  show_no_items_msg();
};

