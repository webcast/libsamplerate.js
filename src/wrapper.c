#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <assert.h>
#include <netinet/in.h>
#include <stdint.h>
#include <mad.h>

#define mad_f_tofloat(x)  ((float)  \
         ((x) / (float) (1L << MAD_F_FRACBITS)))

#define BUFFER_SIZE 16*1024

struct madfile__t
{
  long position;
  struct mad_stream stream;
  struct mad_frame frame;
  struct mad_synth synth;
  unsigned char *buf;
};

typedef struct madfile__t madfile_t;

extern void _mad_js_raise(const char *name);
extern void _mad_js_read(madfile_t *mf, unsigned char *read_start, long position, size_t read_size, size_t remaining);
extern void _mad_js_decode_callback(madfile_t *mf);

int unsynchsafe(unsigned int in) {
  int out=0, i;
  unsigned int mask=0x7F000000;

  for(i=0; i<4; ++i) {
    out >>= 1;
    out |= in & mask;
    mask >>= 8;
  }

  return out;
}

int mad_js_id3_len(char id3_header[10]) { 
  uint32_t id3_len;
  int footer_len = 0;
  /* Check for ID3 tag magic */
  if ((id3_header[0] == 0x49) &
      (id3_header[1] == 0x44) &
      (id3_header[2] == 0x33))
  { /* Check for footer flag */
    if (id3_header[5] & 0x10)
      footer_len = 10;
    /* Get synchsafe len of ID3 tag */
    memcpy(&id3_len, id3_header+6, 4);
    return unsynchsafe(ntohl(id3_len))+footer_len;
  } else
    return -1;
}

madfile_t *mad_js_init() {
  madfile_t *mf;

  mf = malloc(sizeof(madfile_t));
  mf->position = 0;
  mad_stream_init(&mf->stream);
  mad_frame_init(&mf->frame);
  mad_synth_init(&mf->synth);
  mf->buf = (unsigned char*)malloc(BUFFER_SIZE);

  return mf;
}

void mad_js_close(madfile_t *mf) {
  mad_synth_finish(&mf->synth);
  mad_frame_finish(&mf->frame);
  mad_stream_finish(&mf->stream);
  free(mf->buf);
  free(mf);
}

void mad_js_fill_buffer(madfile_t *mf)
{
  if (mf->stream.buffer == NULL || mf->stream.error == MAD_ERROR_BUFLEN)
  {
    size_t read_size, remaining;
    unsigned char *read_start;

    if (mf->stream.next_frame)
    {
      remaining = mf->stream.bufend - mf->stream.next_frame;
      memmove(mf->buf, mf->stream.next_frame, remaining);
      read_start = mf->buf + remaining;
      read_size = BUFFER_SIZE - remaining;
    }
    else
    {
      read_size = BUFFER_SIZE;
      read_start = mf->buf;
      remaining = 0;
    }

    _mad_js_read(mf, read_start, mf->position, read_size, remaining);
  } else
    _mad_js_decode_callback(mf);
}

void mad_js_after_read(madfile_t *mf, size_t read_size, size_t remaining)
{
  mf->position += read_size;
  mad_stream_buffer(&mf->stream, mf->buf, read_size + remaining);
  mf->stream.error = 0;

  _mad_js_decode_callback(mf);
  return;
}

/* Returns 1 if a recoverable error occured, 0 else. */
int mad_js_decode_frame(madfile_t *mf)
{
  int dec;

  dec = mad_frame_decode(&mf->frame, &mf->stream);
  if (dec) {
    if (MAD_RECOVERABLE(mf->stream.error)
        || mf->stream.error == MAD_ERROR_BUFLEN) {
      return 1;
    } else {
      _mad_js_raise(mad_stream_errorstr(&mf->stream));
    }
  }

  mad_synth_frame(&mf->synth, &mf->frame);

  return 0;
}

float **mad_js_pack_frame(madfile_t *mf, int *chans, int *samples) {
  int i, c;
  float **ret;

  *chans = MAD_NCHANNELS(&mf->frame.header);
  *samples = mf->synth.pcm.length;
  ret = malloc(*chans);

  for (c = 0; c < *chans; c++) {
    ret[c] = malloc(sizeof(float)*(*samples));
    for (i = 0; i < *samples; i++)
      ret[c][i] = mad_f_tofloat(mf->synth.pcm.samples[c][i]);
  }

  return ret;
}
