SAMPLERATE_VERSION:=0.2.2
SAMPLERATE:=libsamplerate-$(SAMPLERATE_VERSION)

EMCC:=emcc
EXPORTED_FUNCTIONS:='["_malloc", "_free", "_src_strerror", "_src_new", "_src_delete", "_src_js_process", "_src_reset", "_src_is_valid_ratio"]'
CFLAGS:=-I$(SAMPLERATE)/src -O3
LINKFLAGS:=-s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) -s SINGLE_FILE=1 -s EXPORTED_RUNTIME_METHODS=setValue,getValue --memory-init-file 0 $(CFLAGS)
WEB_LINKFLAGS:=$(LINKFLAGS) -s ENVIRONMENT='web' -s EXPORT_NAME='createModule' -s USE_ES6_IMPORT_META=0
EMCONFIGURE:=emconfigure
EMMAKE:=emmake
SAMPLERATE_BASEDIR:=libsamplerate-$(SAMPLERATE_VERSION)
SAMPLERATE_TARBALL:=$(SAMPLERATE_BASEDIR).tar.xz
SAMPLERATE_URL:="https://github.com/libsndfile/libsamplerate/releases/download/$(SAMPLERATE_VERSION)/$(SAMPLERATE_TARBALL)"
TAR:=tar

all: dist/libsamplerate_node.js dist/libsamplerate_browser.js

src/post-node.js: src/class.js src/node-wrapper.js
	rm -f src/post-node.js
	cat src/class.js src/node-wrapper.js > src/post-node.js

dist/libsamplerate_node.js: $(SAMPLERATE_BASEDIR) src/wrapper.o src/post-node.js
	$(EMCC) $(LINKFLAGS) --post-js src/post-node.js $(wildcard $(SAMPLERATE_BASEDIR)/src/.libs/*.o) src/wrapper.o -o $@

dist/libsamplerate_browser_stubs.js: $(SAMPLERATE_BASEDIR) src/wrapper.o
	$(EMCC) $(WEB_LINKFLAGS) $(wildcard $(SAMPLERATE_BASEDIR)/src/.libs/*.o) src/wrapper.o -o dist/libsamplerate_browser_stubs.mjs
	mv dist/libsamplerate_browser_stubs.mjs $@

dist/libsamplerate_browser.js: dist/libsamplerate_browser_stubs.js src/class.js src/browser-wrapper.js
	rm -rf $@
	cat src/class.js src/browser-wrapper.js > $@

$(SAMPLERATE_BASEDIR): $(SAMPLERATE_TARBALL)
	$(TAR) xf $(SAMPLERATE_TARBALL) && \
	cd $(SAMPLERATE_BASEDIR) && \
	$(EMCONFIGURE) ./configure --disable-fftw CFLAGS="$(CFLAGS)" && \
	$(EMMAKE) make

$(SAMPLERATE_TARBALL):
	rm -f $(SAMPLERATE_TARBALL)
	wget $(SAMPLERATE_URL)

clean:
	$(RM) -rf $(SAMPLERATE_BASEDIR) $(SAMPLERATE_TARBALL) src/*.o src/post-node.js

src/wrapper.o: src/wrapper.c
	$(EMCC) $(CFLAGS) -I$(SAMPLERATE_BASEDIR) -c $< -o $@

.PHONY: clean
