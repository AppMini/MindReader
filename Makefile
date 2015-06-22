MONOCLE=lib/scripts/monocore.js lib/scripts/monoctrl.js lib/styles/monocore.css lib/styles/monoctrl.css
LOADER=lib/loaders.min.css
MONOCLEDEPS=Monocle/Rakefile $(wildcard Monocle/src/**/*.js)
BOOKS=$(wildcard books/*.epub)
BOOKDIRS = $(BOOKS:.epub=)

all:$(MONOCLE) $(LOADER) booklist.txt $(BOOKDIRS)

$(MONOCLE): $(MONOCLEDEPS) $(SUBMODULES)
	@cd Monocle && rake
	@cp -av Monocle/dist/* lib/

$(LOADER): $(SUBMODULES)
	@cp -av loaders.css/loaders.min.css $(LOADER)

$(SUBMODULES):
	@echo "Checking out submodules."
	@git submodule init
	@git submodule update

$(BOOKDIRS): $(BOOKS)
	unzip -o $@.epub -d $@

booklist.txt: $(BOOKS)
	@echo "Building book list."
	@cd books && ls *.epub > ../booklist.txt

clean:
	rm -rf Monocle/dist
	rm -rf booklist.txt

