// this is a modified version of efm.js to remove the zip.js dependency and work from an already-extracted epub instead.
// Original source here:
// https://github.com/rschroll/efm

// Original license remains intact:

/*
 * EFM - Epub for Monocle
 * 
 * A pure-javascript implementation of the book data object for Monocle.
 * 
 * Copyright (c) 2013 Robert Schroll
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

MIMETYPES = {
    png: "image/png",
    gif: "image/gif",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    js: "text/javascript",
    css: "text/css",
    svg: "image/svg+xml",
};
URL_TAGS = {
    img: "src",
    link: "href",
    image: "xlink:href",  // Image in in-line SVG.  (Calibre uses these for covers.)
};

// Get the directory portion of path.  The path separator is '/', for
// use with zip files.
function getDir(path) {
    return path.split('/').slice(0,-1).join('/');
}

// Join and normalize the two paths.  The path separator is '/', for use
// with zip files.
function joinPaths(path1, path2) {
    var path = path1.split('/').concat(path2.split('/')),
        normpath = [];
    for (var i in path) {
        var dir = path[i];
        if (dir == "..")
            normpath.pop();
        else if (dir != "." && dir != "")
            normpath.push(dir);
    }
    return normpath.join('/');
}

// A book data object for the Epub file 'epubfile', a HTML5 File object.
// The callback will be called when this object is fully initialized,
// with this object as an argument.
function Epub(epubfile, callback) {
    var files = {};      // Maps filename to zip.Entry
    var spine = [];      // List of filenames in spine
    var contents = [];   // Table of contents
    var metadata = {};   // Maps keys to metadata
    var data_urls = {};  // Maps filename to data URL of file contents
    var num_data_urls = 0;
    var root = epubfile.split(".epub")[0];
    console.log("Epub: starting.");
    
    setTimeout(function() {
      getComponent("META-INF/container.xml", findOPF);
    });

    // Called at the end of the initialization process.  At this point,
    // the object is ready to be passed to a Monocle.Reader.
    var onLoaded = (function(self) {
        return function () {
            console.log("Epub: done.");
            callback(self);
        }
    })(this);

    // Find the location of the OPF file from container.xml
    function findOPF(xml) {
        var doc = new DOMParser().parseFromString(xml, "text/xml");
        var opffn = doc.getElementsByTagName("rootfile")[0].getAttribute("full-path");
        console.log("findOPF doc", doc);
        console.log(opffn);
        getComponent(opffn, parseOPF(getDir(opffn)));
    };
    
    // Parse the OPF file to get the spine, the table of contents, and
    // the metadata.
    function parseOPF(reldir) {
        return function (xml) {
            var doc = new DOMParser().parseFromString(xml, "text/xml");
            var idmap = {};
            var nav_href = null;
            
            // Parse manifest
            var manifest = doc.getElementsByTagName("manifest")[0];
            var items = manifest.getElementsByTagName("item");
            for (var i=0; i<items.length; i++) {
                var item = items[i];
                var id = item.getAttribute("id");
                var href = item.getAttribute("href");
                console.log("manifest item href:", href);
                idmap[id] = joinPaths(reldir, href);
                var props = item.getAttribute("properties");
                if (props != null && props.split(" ").indexOf("nav") > -1)
                    nav_href = idmap[id];
            }
            
            // Parse spine
            var spineel = doc.getElementsByTagName("spine")[0];
            var sitems = spineel.getElementsByTagName("itemref");
            for (var i=0; i<sitems.length; i++) {
                var id = sitems[i].getAttribute("idref");
                spine.push(idmap[id]);
            }
            
            // Parse table of contents
            if (nav_href != null) {  // Epub3 navigation
                getComponent(nav_href, parseNav(getDir(nav_href)));
            } else {  // Epub2 navigation
                var ncxfile = idmap[spineel.getAttribute("toc")];
                if (ncxfile != undefined)
                    getComponent(ncxfile, parseNCX(getDir(ncxfile)));
            }
            
            // Parse metadata
            var metadatael = doc.getElementsByTagName("metadata")[0];
            for (var i=0; i<metadatael.childNodes.length; i++) {
                var node = metadatael.childNodes[i];
                if (node.nodeType == 1 && node.firstChild != null) 
                    metadata[node.localName] = node.firstChild.nodeValue;
            }
            
            // Make data URLs for auxillary files, for future use
            for (var fn in files) {
                if (spine.indexOf(fn) == -1 && ["mimetype", "META-INF/container.xml"].indexOf(fn) == -1) {
                    num_data_urls += 1;
                    getEncodedComponent(fn, function (f) {
                        return function (data) {
                            data_urls[f] = data;
                            num_data_urls -= 1;
                            if (num_data_urls == 0)
                                onLoaded();
                        };
                    }(fn));
                }
            }
            if (num_data_urls == 0) {
              //setTimeout(onLoaded, 1);
              onLoaded();
            }
        };
    };
    
    // Parse the Epub3 table of contents.
    function parseNav(reldir) {
        return function (navdata) {
            var navdoc = new DOMParser().parseFromString(navdata, "text/xml");
            var navs = navdoc.getElementsByTagName("nav");
            for (var i=0; i<navs.length; i++) {
                var nav = navs[i];
                if (nav.getAttribute("epub:type") == "toc")
                    contents = parseNavList(nav.getElementsByTagName("ol")[0], reldir);
            }
        };
    };
    
    function parseNavList(element, reldir) {
        var children = [];
        for (var i=0; i<element.childNodes.length; i++) {
            var node = element.childNodes[i];
            if (node.nodeType == 1 && node.nodeName == "li") {
                var link = node.getElementsByTagName("a")[0];
                if (link != undefined) {
                    var child = { title: link.firstChild.nodeValue,
                                  src: joinPaths(reldir, link.getAttribute("href")) };
                    var olist = node.getElementsByTagName("ol")[0];
                    if (olist != undefined)
                        child["children"] = parseNavList(olist, reldir);
                    children.push(child);
                }
            }
        }
        return children;
    };
    
    // Parse the Epub2 table of contents.
    function parseNCX(reldir) {
        return function (ncxdata) {
            var ncx = new DOMParser().parseFromString(ncxdata, "text/xml");
            var navmap = ncx.getElementsByTagName("navMap")[0];
            contents = parseNCXChildren(navmap, reldir);
        };
    };
    
    function parseNCXChildren(element, reldir) {
        var children = [];
        for (var i=0; i<element.childNodes.length; i++) {
            var node = element.childNodes[i];
            if (node.nodeType == 1 && node.nodeName == "navPoint") {
                var child = {};
                var nav_label = node.getElementsByTagName("text")[0];
                child["title"] = nav_label.firstChild.nodeValue;
                var content = node.getElementsByTagName("content")[0];
                child["src"] = joinPaths(reldir, content.getAttribute("src"));
                var child_nav = parseNCXChildren(node, reldir);
                if (child_nav.length > 0)
                    child["children"] = child_nav;
                children.push(child);
            }
        }
        return children;
    };
    
    // Part of Monocle's book data object interface.
    this.getComponents = function () {
      console.log("getComponents spine", spine);
        return spine;
    };
    
    // Part of Monocle's book data object interface.
    this.getContents = function () {
      console.log("getContents", contents);
        return contents;
    };
    
    // Part of Monocle's book data object interface.
    // Note that (X|HT)ML files are parsed and URLs in <img> and <link>
    // to resouces in the Epub are replaced with data URLs.
    function getComponent(id, callback) {
        console.log("Epub: getComponent = " + id);
        var reldir = getDir(id);
        var ext = id.split('.').slice(-1)[0];
        if (["html", "htm", "xhtml", "xml"].indexOf(ext) != -1) {
            console.log(ext + " in " + id);
            var doc = new DOMParser().parseFromString(fetch(root + "/" + id), "text/xml");
                console.log(doc);
                for (var tag in URL_TAGS) {
                    var attribute = URL_TAGS[tag];
                    var elements = doc.getElementsByTagName(tag);
                    for (var i=0; i<elements.length; i++) {
                        var element = elements[i];
                        var path = joinPaths(reldir, element.getAttribute(attribute));
                        console.log("original path:", path);
                        //var data_url = data_urls[path];
                        //if (data_url != undefined)
                        //    element.setAttribute(attribute, data_url);
                        console.log("set", attribute, "to", document.location.href.split("?")[0] + root + "/" + path);
                        element.setAttribute(attribute, document.location.href.split("?")[0] + root + "/" + path);
                    }
                }
                
                callback(new XMLSerializer().serializeToString(doc));
        } else {
            callback(fetch(root + "/" + id));
        }
    };
    this.getComponent = getComponent;
    
    // Return the content, via the callback, as a data URL.
    function getEncodedComponent(id, callback) {
        console.log("getEncodedComponent:", id);
        var mime = MIMETYPES[id.split('.').slice(-1)[0]];
        callback(fetch(root + "/" + id));
    };
    
    // Part of Monocle's book data object interface.
    this.getMetaData = function (key) {
      console.log("getMetaData", key, metadata[key]);
        return metadata[key];
    };
}

function fetch (path) {
    var ajReq = new XMLHttpRequest();
    ajReq.open("GET", path, false);
    ajReq.send(null);
    return ajReq.response;
}
