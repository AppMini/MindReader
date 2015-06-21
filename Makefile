MONOCLE=Monocle/dist/scripts/monocore.js Monocle/dist/scripts/monoctrl.js Monocle/dist/scripts/monocore.css Monocle/dist/styles/monoctrl.css
MONOCLEDEPS=Monocle/Rakefile Monocle/src/**/*.js
BOOKS=$(wildcard books/*.epub)
BOOKDIRS = $(BOOKS:.epub=)

SUBMODULES=$(MONOCLEDEPS)

all:$(SUBMODULES) $(MONOCLE) $(BOOKDIRS)

$(MONOCLE): Monocle/Rakefile Monocle/src/**/*.js
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
	rm -rf $(MONOCLE)
	rm -rf booklist.txt

