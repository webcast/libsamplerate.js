SAMPLERATE_VERSION:=0.1.8
SAMPLERATE:=libsamplerate-$(SAMPLERATE_VERSION)

EMCC:=emcc
EXPORTED_FUNCTIONS:='["_src_strerror", "_src_new", "_src_delete", "_src_js_process", "_src_reset", "_src_set_ratio"]'
CFLAGS:=-I$(SAMPLERATE)/src -O2 -s ASM_JS=1 -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) -s USE_TYPED_ARRAYS=2
EMCONFIGURE:=emconfigure
EMMAKE:=emmake
SAMPLERATE_URL:="http://www.mega-nerd.com/SRC/libsamplerate-0.1.8.tar.gz"
TAR:=tar

all: dist/libsamplerate.js

dist/libsamplerate.js: $(SAMPLERATE) src/wrapper.o src/pre.js src/post.js
	$(EMCC) $(CFLAGS) --pre-js src/pre.js --post-js src/post.js $(wildcard $(SAMPLERATE)/src/*.o) src/wrapper.o -o $@

$(SAMPLERATE): $(SAMPLERATE).tar.gz
	$(TAR) xzvf $@.tar.gz && \
	cd $@ && \
	$(EMCONFIGURE) ./configure --disable-fftw && \
	$(EMMAKE) make

$(SAMPLERATE).tar.gz:
	test -e "$@" || wget $(SAMPLERATE_URL)

clean:
	$(RM) -rf $(SAMPLERATE)

src/wrapper.o: src/wrapper.c
	$(EMCC) $(CFLAGS) -I$(SAMPLERATE) -c $< -o $@

distclean: clean
	$(RM) $(SAMPLERATE).tar.gz

.PHONY: clean distclean
