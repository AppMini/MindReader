/* CHAPTER TITLE RUNNING HEAD */
function bookChapterTitle(reader) {
  var chapterTitle = {
    runners: [],
    createControlElements: function (page) {
      var cntr = document.createElement('div');
      cntr.className = "chapterTitle";
      var runner = document.createElement('div');
      runner.className = "runner";
      cntr.appendChild(runner);
      this.runners.push(runner);
      this.update(page);
      return cntr;
    },
    update: function (page) {
      var place = reader.getPlace(page);
      if (place) {
        var props = reader.getBook().properties;
        this.runners[page.m.pageIndex].innerHTML = (place.chapterTitle() || "") + " (" + (props.componentIds.indexOf(place.componentId()) + 1) + " of " + props.componentIds.length + ")";
      }
    }
  }
  reader.addControl(chapterTitle, 'page');
  reader.listen(
    'monocle:pagechange',
    function (evt) { chapterTitle.update(evt.m.page); }
  );
  return chapterTitle;
}

/* SPINNER */
function bookSpinner(reader) {
  var spinner = Monocle.Controls.Spinner(reader);
  reader.addControl(spinner, 'page', { hidden: true });
  spinner.listenForUsualDelays();
}

/* PAGE NUMBER RUNNING HEAD */
function bookPageNumber() {
  var pageNumber = {
    runners: [],
    createControlElements: function (page) {
      var cntr = document.createElement('div');
      cntr.className = "pageNumber";
      var runner = document.createElement('div');
      runner.className = "runner";
      cntr.appendChild(runner);
      this.runners.push(runner);
      this.update(page);
      return cntr;
    },
    update: function (page) {
      var place = reader.getPlace(page);
      // console.log(place);
      if (place) {
        this.runners[page.m.pageIndex].innerHTML = place.pageNumber() + " of " + place.pagesInComponent();
      }
    }
  }
  reader.addControl(pageNumber, 'page');
  reader.listen(
    'monocle:pagechange',
    function (evt) {
      pageNumber.update(evt.m.page);
    }
  );
  return pageNumber;
}

function bookLoadWatcher(reader, pageNumber, chapterTitle) {
  reader.listen('monocle:componentloaded', function(evt) {
    console.log("componentloaded");
  });
  reader.listen('monocle:loaded', function(evt) {
    //console.log(reader);
    //console.log(evt.srcElement);
    console.log('component loaded');
    pageNumber.update(evt.srcElement);
    chapterTitle.update(evt.srcElement);
  });
}

/* BOOK TITLE RUNNING HEAD */
function bookTitle(reader) {
  document.getElementById("title").innerText = reader.getBook().getMetaData('title');
  var bookTitle = {}
  bookTitle.contentsMenu = Monocle.Controls.Contents(reader);
  reader.addControl(bookTitle.contentsMenu, 'popover', { hidden: true });
  bookTitle.createControlElements = function () {
    var cntr = document.createElement('div');
    cntr.className = "bookTitle";
    var runner = document.createElement('div');
    runner.className = "runner";
    runner.innerHTML = reader.getBook().getMetaData('title');
    cntr.appendChild(runner);

    Monocle.Events.listen(
      cntr,
      typeof Touch == "object" ? "touchstart" : "mousedown",
      function (evt) {
        if (evt.preventDefault) {
          evt.stopPropagation();
          evt.preventDefault();
        } else {
          evt.returnValue = false;
        }
        reader.showControl(bookTitle.contentsMenu);
      }
    );

    return cntr;
  }
  reader.addControl(bookTitle, 'page');
  return bookTitle;
}

 /* Scrubber */
function bookScrubber(reader, chapterTitle, pageNumber) {
  var scrubber = new Monocle.Controls.Scrubber(reader);
  reader.addControl(scrubber, 'popover', { hidden: true });
  var showFn = function (evt) {
    evt.stopPropagation();
    reader.showControl(scrubber);
    scrubber.updateNeedles();
  }
  for (var i = 0; i < chapterTitle.runners.length; ++i) {
    Monocle.Events.listenForContact(
      chapterTitle.runners[i].parentNode,
      { start: showFn }
    );
    Monocle.Events.listenForContact(
      pageNumber.runners[i].parentNode,
      { start: showFn }
    );
  }
}

