(function () {

//var bookname = "never-go-back.epub";
// var bookname = "never-go-back.epub";
//var bookname = "capital-in-the-21st-century-Thomas-Piketty.epub";

// Initialize the reader element.
function init(bookData) {
  console.log("init");
    var bkTitle = bookData.getMetaData('title');
    window.placeSaver = new Monocle.Controls.PlaceSaver(bkTitle);
    var options = {
      place: placeSaver.savedPlace(),
      stylesheet: document.getElementById("bookstyle").innerText
    }
    console.log("pre reader");
    window.reader = Monocle.Reader('reader', bookData, options, prep);
    console.log("reader done.");
  }

  function prep(rdr) {
    console.log("prep");
    document.getElementById('reader').style.visibility = "visible";
    rdr.addControl(placeSaver/*, 'invisible'*/);
    //oldBookSpinner(reader);
    //oldBookMagnifier(reader);
    //oldBookTitle(reader);
    var chT = bookChapterTitle(reader);
    var pgN = bookPageNumber(reader);
    bookScrubber(reader, chT, pgN);
    Monocle.Events.listen(window, 'resize', onResize);
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
  }

  function fetch (path) {
      var ajReq = new XMLHttpRequest();
      ajReq.open("GET", path, false);
      ajReq.send(null);
      return ajReq.responseText;
  }
})();

