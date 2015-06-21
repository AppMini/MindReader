(function () {

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

  new Epub("books/never-go-back.epub", function(bookData) {
    init(bookData);
  });

  function fetch (path) {
      var ajReq = new XMLHttpRequest();
      ajReq.open("GET", path, false);
      ajReq.send(null);
      return ajReq.responseText;
  }
})();

