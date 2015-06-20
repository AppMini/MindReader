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
        this.runners[page.m.pageIndex].innerHTML = place.chapterTitle();
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
      console.log(place);
      if (place) {
        this.runners[page.m.pageIndex].innerHTML = "(" + Math.round(place.percentageThrough()) + "%) " + place.pageNumber();
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

