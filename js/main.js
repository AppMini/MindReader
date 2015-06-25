(function () {

  var elSpinner = document.getElementById("spinner");

  // Initialize the reader element.
  function init(bookData) {
    console.log("init");

    var bkTitle = bookData.getMetaData('title');
    window.placeSaver = new Monocle.Controls.PlaceSaver(bkTitle);
    var options = {
      place: placeSaver.savedPlace(),
      stylesheet: fetch("css/theme-dark.css"),
      preloadWindow: 100,
    }
    // load the new pages one after another
    Monocle.Book.PRELOAD_INTERVAL = 1000;
    console.log("pre reader");
    window.reader = Monocle.Reader('reader', bookData, options, prep);
    reader.listen('monocle:componentloaded', function(evt) { console.log(evt); });
    console.log("reader done.");
  }

  function prep(rdr) {
    console.log("prep");
    rdr.addControl(placeSaver/*, 'invisible'*/);
    bookSpinner(reader);
    //oldBookMagnifier(reader);
    bookTitle(reader);
    var chT = bookChapterTitle(reader);
    var pgN = bookPageNumber(reader);
    bookLoadWatcher(reader, pgN, chT);
    bookScrubber(reader, chT, pgN);
    Monocle.Events.listen(window, 'resize', onResize);
    var elReader = document.getElementById('reader');
    elReader.style.visibility = "visible";
    elSpinner.parentNode.removeChild(elSpinner);
    console.log("prep done");
  }

  function onResize() {
    window.reader.resized();
  }

  var pathparts = document.location.href.split("?");
  if (pathparts.length == 2) {
    new Epub("books/" + pathparts[1], function(bookData) {
      init(bookData);
    });
  } else {
    var list = fetch("/booklist.txt").split("\n");
    var out = "<ul class='booklist'>";
    for (var l=0; l<list.length; l++) {
      if (list[l]) {
        out += "<li><a href='?" + list[l] + "'>" + list[l] + "</a></li>";
      }
    }
    out += "</ul>";
    var el = document.getElementById("reader")
      el.innerHTML = out;
    el.style.visibility = "visible";
    elSpinner.parentNode.removeChild(elSpinner);
  }

  function fetch (path) {
    var ajReq = new XMLHttpRequest();
    ajReq.open("GET", path, false);
    ajReq.send(null);
    return ajReq.responseText;
  }
})();
