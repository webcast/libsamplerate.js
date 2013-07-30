EMCC:=emcc
EXPORTED_FUNCTIONS:='["_mad_js_init", "_mad_js_id3_len", "_mad_js_fill_buffer", \
	"_mad_js_close", "_mad_js_after_read", "_mad_js_decode_frame", "_mad_js_pack_frame"]'
CFLAGS:=-O2 -s ASM_JS=1 -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) -s USE_TYPED_ARRAYS=2
EMCONFIGURE:=emconfigure
EMMAKE:=emmake
MAD_URL:="ftp://ftp.mars.org/pub/mpeg/libmad-0.15.1b.tar.gz"
TAR:=tar

MAD_VERSION:=0.15.1b
MAD:=libmad-$(MAD_VERSION)

all: dist/libmad.js

dist/libmad.js: $(MAD) src/wrapper.o src/pre.js src/post.js src/library.js
	$(EMCC) $(CFLAGS) --pre-js src/pre.js --post-js src/post.js --js-library src/library.js $(wildcard $(MAD)/*.o) src/wrapper.o -o $@

$(MAD): $(MAD).tar.gz
	$(TAR) xzvf $@.tar.gz && \
	cd $@ && \
	$(EMCONFIGURE) ./configure --enable-fpm=no && \
	$(EMMAKE) make

$(MAD).tar.gz:
	test -e "$@" || wget $(MAD_URL)

clean:
	$(RM) -rf $(MAD)

src/wrapper.o: src/wrapper.c
	$(EMCC) $(CFLAGS) -I$(MAD) -c $< -o $@

distclean: clean
	$(RM) $(MAD).tar.gz

.PHONY: clean distclean
