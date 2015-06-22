MONOCLE=lib/scripts/monocore.js lib/scripts/monoctrl.js lib/styles/monocore.css lib/styles/monoctrl.css
MONOCLEDEPS=Monocle/Rakefile $(wildcard Monocle/src/**/*.js)
BOOKS=$(wildcard books/*.epub)
BOOKDIRS = $(BOOKS:.epub=)

all:$(MONOCLE) booklist.txt $(BOOKDIRS)

$(MONOCLE): $(MONOCLEDEPS)
	@cd Monocle && rake
	@cp -av Monocle/dist/* lib/

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

