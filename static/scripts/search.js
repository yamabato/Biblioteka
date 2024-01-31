function search_item() {
  const keyword = document.querySelector("#search-keyword-input").value;

  const tgt_isbn = document.querySelector("#search-target-isbn").checked;
  const tgt_title = document.querySelector("#search-target-title").checked;
  const tgt_author = document.querySelector("#search-target-author").checked;
  const tgt_publisher = document.querySelector("#search-target-publisher").checked;
  const tgt_date = document.querySelector("#search-target-date").checked;
  const tgt_pages = document.querySelector("#search-target-pages").checked;
  const tgt_language = document.querySelector("#search-target-language").checked;

  const target_bool = [
    tgt_isbn, tgt_title, tgt_author, tgt_publisher, tgt_date, tgt_pages, tgt_language
  ]
  let target_index = [];
  for (let i=0; i<target_bool.length; i++) {
    if (target_bool[i]) { target_index.push(i+1); }
  }

  const search_query = {
    "keyword": keyword,
    "targets": target_index
  }

  fetch("/search", {
    method: "POST",
    body: JSON.stringify(search_query)
  }).then((result) => {
    if (result.ok) {
      return result.json();
    };
  }).then((search_result) => {
    const count = search_result["count"];
    const html = search_result["html"];
    document.querySelector("#search-items-count").innerHTML = `${count} Items`;
    document.querySelector("#search-items").innerHTML = html;
  });

}
