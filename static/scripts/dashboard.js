let statistics = {
  "count": 0,
  "lang": {},
};

function fetch_statistics() {
  fetch("/dashboard", {
    method: "POST",
  }).then((result) => {
    if (result.ok) {
      return result.json();
    };
  }).then((stat) => {
    statistics = stat;
    draw_charts();
  }
  );
}

function draw_lang_chart() {
  let canvas = document.querySelector("#dashboard-lang-chart-canvas");
  const lang_data = statistics["lang"];
  const langs = Object.keys(lang_data).sort(function(x, y) {
    return lang_data[y] - lang_data[x];
  });
  let lang_count = langs.map(function(x) { return lang_data[x]; });

  let lang_labels = [];
  let lang_value = []

  let colors = ["#101033", "#202166", "#2f3199", "#3f42cc", "#4f52ff"]

  if (langs.length <= 5){
    lang_labels = langs;
    lang_value = lang_count;
  }else {
    lang_labels = langs.slice(0, 4);
    lang_labels.push("other");

    lang_value = lang_count.slice(0, 4);
    lang_value[4] = (lang_count.slice(4).reduce(function(x,y) { return x+y; }));

    colors[4] = "#bbc8e6";
  }

  let lang_pie_hart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: lang_labels,
      datasets: [{
        backgroundColor: colors,
        data: lang_value,
      }]
    },
    options: {
    }
  });
}

function draw_charts() {
  draw_lang_chart();
}

fetch_statistics();
