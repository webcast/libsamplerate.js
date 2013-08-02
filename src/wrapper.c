#include "samplerate.h"

int src_js_process(SRC_STATE *state,
                   float  *data_in,  long input_frames,
                   float  *data_out, long output_frames,
                   double src_ratio, int  end_of_input,
                   long   *input_frames_used,
                   long   *output_frames_gen)
{
  SRC_DATA src_data;

  src_data.data_in = data_in;
  src_data.input_frames = input_frames;
  src_data.data_out = data_out;
  src_data.output_frames = output_frames;
  src_data.src_ratio = src_ratio;
  src_data.end_of_input = end_of_input;

  int err = src_process(state, &src_data);

  *input_frames_used = src_data.input_frames_used;
  *output_frames_gen = src_data.output_frames_gen;

  return err; 
}
