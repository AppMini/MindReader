MONOCLE=lib/scripts/monocore.js lib/scripts/monoctrl.js lib/styles/monocore.css lib/styles/monoctrl.css
LOADER=lib/loaders.min.css
MONOCLEDEPS=Monocle/Rakefile $(wildcard Monocle/src/**/*.js)
BOOKS=$(wildcard books/*.epub)
BOOKDIRS = $(BOOKS:.epub=)

### Build books ###

all:booklist.txt $(BOOKDIRS)

$(BOOKDIRS): $(BOOKS)
	unzip -o $@.epub -d $@

booklist.txt: $(BOOKS)
	@echo "Building book list."
	@cd books && ls *.epub > ../booklist.txt

### Build dependencies for development/updates ###

deps:$(MONOCLE) $(LOADER)

$(MONOCLE): $(MONOCLEDEPS) Monocle
	@cd Monocle && rake
	@cp -av Monocle/dist/* lib/

$(LOADER): loaders.css
	@cp -av loaders.css/loaders.min.css $(LOADER)

Monocle loaders.css:
	@echo "Checking out submodules."
	@git submodule init
	@git submodule update

clean:
	rm -rf Monocle/dist
	rm -rf booklist.txt

