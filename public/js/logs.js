drawGraph = (items) => {
  let container = document.getElementById('visualization');
  let dataset = new vis.DataSet(items);
  let options = {
    start: items[0].x,
    end: items[items.length-1].x,
    shaded: true
  };

  container.innerHTML = "";
  let graph2d = new vis.Graph2d(container, dataset, options);
}

processItems = (data) => {
  let log = [], date_time, counter_Count, tmp;
  
  data.toString().split('\n').forEach(function(line) {
    tmp = line.split(' ');
    if(tmp[0] != "") {
      let item = new Object;
      
      date_time = tmp[1];
      counter_Count = tmp[0];
      
      item.x = new Date(parseInt(date_time));
      item.y = parseInt(counter_Count);
      
      if(false) {
        item.label = {
          content: "label",
          yOffset: -20,
          xOffset: -10
        };
      }
      
      log.push(item);
    }
  });
  
  drawGraph(log);
}

httpGetAsync = (theUrl, callback) => {
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
    callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true); // true for asynchronous 
  xmlHttp.send(null);
}

const domain = window.location.href;
httpGetAsync(`${domain}logs/teller.log`, processItems);
