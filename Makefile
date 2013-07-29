EMCC:=emcc
CFLAGS:=-O1 -s ASM_JS=1 -s LINKABLE=1 -s USE_TYPED_ARRAYS=2
EMCONFIGURE:=emconfigure
EMMAKE:=emmake
MAD_URL:="ftp://ftp.mars.org/pub/mpeg/libmad-0.15.1b.tar.gz"
TAR:=tar

MAD_VERSION:=0.15.1b
MAD:=libmad-$(MAD_VERSION)

all: dist/libmad.js

dist/libmad.js: $(MAD) pre.js post.js
	$(EMCC) $(CFLAGS) --pre-js pre.js --post-js post.js $(wildcard $(MAD)/*.o) -o $@

$(MAD): $(MAD).tar.gz
	$(TAR) xzvf $@.tar.gz && \
	cd $@ && \
	$(EMCONFIGURE) ./configure --enable-fpm=no && \
	$(EMMAKE) make

$(MAD).tar.gz:
	test -e "$@" || wget $(MAD_URL)

clean:
	$(RM) -rf $(MAD)

distclean: clean
	$(RM) $(MAD).tar.gz

.PHONY: clean distclean
