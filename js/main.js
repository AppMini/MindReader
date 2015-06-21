    	    zip.workerScriptsPath = "/zip.js/WebContent/";
	    (function () {

// Initialize the reader element.
function init(bookData) {
  console.log("init");
    var bkTitle = bookData.getMetaData('title');
    window.placeSaver = new Monocle.Controls.PlaceSaver(bkTitle);
    var options = {
      place: placeSaver.savedPlace(),
      stylesheet: document.getElementById("bookstyle").innerText,
      //panels: Monocle.Browser.on.Kindle3 ?
      //  Monocle.Panels.eInk :
      //  Monocle.Panels.Marginal
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

  //function prep(rdr) {
  //	document.getElementById('reader').style.visibility = "visible";
  //}


  function onResize() {
    window.reader.resized();
  }

  var request = new XMLHttpRequest();
  //request.open("GET", "books/The-Languages-of-Pao-vde11-20130624_dc.epub", true);
  request.open("GET", "books/never-go-back.epub", true);
  request.responseType = "blob";
  request.onload = function () {
      console.log("Book received");
      // on iOS it's a normal string
      if (request.response.length) {
        var blob = binaryStringToBlob(request.responseText, "application/epub+zip");
      } else {
        var blob = request.response;
      }
      new Epub(blob, function (bookData) {
              // Monocle.Reader("reader", bookData, {}, prep);
              console.log("Epub created.");
              init(bookData);
      });
  };
  request.send();

  function fetch (path) {
      var ajReq = new XMLHttpRequest();
      ajReq.open("GET", path, false);
      ajReq.send(null);
      return ajReq.responseText;
  }

  //function init() {
  //  window.reader = Monocle.Reader('reader', null, {}, prep);
  //}
  //Monocle.Events.listen(window, 'load', init);
})();

// iOS hack
function binaryStringToBlob( byteCharacters, contentType ) {
    var sliceSize = 1024;
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}
