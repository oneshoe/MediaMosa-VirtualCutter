DATE=$(shell DATE)
LESS_COMPRESSOR ?= `which lessc`
JS_COMPRESSOR ?= `which uglifyjs`
WATCHR ?= `which watchr`

build:
	@@if test ! -z ${LESS_COMPRESSOR}; then \
		rm -f ./*.css.gz; \
		rm -f ./virtualcutter.css; \
		rm -f ./virtualcutter.all.css; \
		lessc ./less/virtualcutter.less > ./virtualcutter.css; \
		lessc ./less/virtualcutter.less > ./virtualcutter.all.css --compress; \
		lessc ./src/video-js.css >> ./virtualcutter.all.css --compress; \
		gzip -c9 ./virtualcutter.all.css > ./virtualcutter.all.css.gz; \
		echo "CSS rebuilt and gzipped."; \
		make js; \
	else \
		echo "You must have the LESS compiler installed in order to build the LESS files."; \
		echo "You can install it by running: npm install less -g"; \
	fi

js:
	@@if test ! -z ${JS_COMPRESSOR}; then \
		rm -f ./virtualcutter.tmp; \
		cat ./src/video.js > ./virtualcutter.tmp; \
		cat ./src/flowplayer.js >> ./virtualcutter.tmp; \
		cat ./src/video_player.js >> ./virtualcutter.tmp; \
		cat ./src/video_player.html5.js >> ./virtualcutter.tmp; \
		cat ./src/video_player.flash.js >> ./virtualcutter.tmp; \
		cat ./src/virtualcutter.js >> ./virtualcutter.tmp; \
		cat ./src/_begin.js > virtualcutter.all.js; \
		uglifyjs -nc -nm ./virtualcutter.tmp >> ./virtualcutter.all.js; \
		cat ./src/_end.js >> virtualcutter.all.js; \
		rm -f ./virtualcutter.tmp; \
		gzip -c9 ./virtualcutter.all.js > ./virtualcutter.all.js.gz; \
		echo "Javascript rebuilt and gzipped."; \
	else \
		echo "You must have the Uglify-JS package installed in order to compress javascript files."; \
		echo "You can install it by running: npm install uglify-js"; \
	fi

watch:
	@@if test ! -z ${WATCHR}; then \
	  echo "Watching less files..."; \
	  watchr -e "watch('./src/.*\.(less|js)') { system 'make' }"; \
	else \
		echo "You must have the watchr installed in order to watch Bootstrap less files."; \
		echo "You can install it by running: gem install watchr"; \
	fi

.PHONY: build js watch
