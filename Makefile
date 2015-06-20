MONOCLE=Monocle/dist/scripts/monocore.js Monocle/dist/scripts/monoctrl.js Monocle/dist/scripts/monocore.css Monocle/dist/styles/monoctrl.css
MONOCLEDEPS=Monocle/Rakefile Monocle/src/**/*.js
ZIPDEPS=zip.js/WebContent/zip.js zip.js/WebContent/inflate.js zip.js/WebContent/deflate.js

SUBMODULES=$(MONOCLEDEPS) efm/efm.js $(ZIPDEPS)

all:$(SUBMODULES) $(MONOCLE)

$(MONOCLE): Monocle/Rakefile Monocle/src/**/*.js
	@cd Monocle && rake

$(SUBMODULES):
	@echo "Checking out submodules."
	@git submodule init
	@git submodule update

booklist:
	@ls books > booklist.txt

clean:
	rm -rf $(MONOCLE)
	rm -rf booklist.txt

