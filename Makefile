MONOCLE=Monocle/dist/scripts/monocore.js Monocle/dist/scripts/monoctrl.js Monocle/dist/styles/monocore.css Monocle/dist/styles/monoctrl.css
MONOCLEDEPS=Monocle/Rakefile $(wildcard Monocle/src/**/*.js)
BOOKS=$(wildcard books/*.epub)
BOOKDIRS = $(BOOKS:.epub=)

all:$(MONOCLE) $(BOOKDIRS)

$(MONOCLE): $(MONOCLEDEPS)
	@cd Monocle && rake

$(SUBMODULES):
	@echo "Checking out submodules."
	@git submodule init
	@git submodule update

$(BOOKDIRS): $(BOOKS)
	unzip $< -d $@

booklist:
	@ls books > booklist.txt

clean:
	rm -rf Monocle/dist
	rm -rf booklist.txt

