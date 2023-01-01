import { Samplerate, Converter } from "@toots/libsamplerate.js"
import { WaveFile } from "wavefile"

const getSamples = (wav: WaveFile) => {
  const { numChannels } = wav.fmt as unknown as {
    numChannels: number
  }
  const { chunkSize } = wav.data as unknown as {
    chunkSize: number
  }
  const samples = chunkSize / (2 * numChannels)
  const ret = new Array(numChannels)

  for (let chan = 0; chan < numChannels; chan++) {
    ret[chan] = new Int16Array(samples)
    for (let i = 0; i < samples; i++) {
      ret[chan][i] = wav.getSample(i * numChannels + chan)
    }
  }

  return ret
}

export const convertData = async (log: (entry: string) => void, data: ArrayBuffer) => {
  await Samplerate.initialized

  log("")
  log("Executing encoding test")

  const input = new WaveFile()
  input.fromBuffer(new Uint8Array(data))
  const samples = getSamples(input)

  log("Got WAV file.")
  log("Converting..")

  const started = new Date()
  const targetSamplerate = 8000
  console.log(input)
  const { sampleRate } = input.fmt as unknown as { sampleRate: number }
  const ratio = targetSamplerate / sampleRate
  const duration = samples[0].length / sampleRate

  const convertedSamples = samples.map((pcm: Float32Array) => {
    const converter = new Samplerate(Converter.BEST_QUALITY)
    const { data } = converter.process({
      data: pcm,
      ratio,
      last: true,
    })
    converter.close()
    return data
  })

  const output = new WaveFile()
  output.fromScratch(samples.length, targetSamplerate, "16", convertedSamples)

  const ended = new Date()
  const encodingTime = (ended.getTime() - started.getTime()) / 1000
  log("Done converting.")
  log(`File duration: ${duration.toFixed(2)} seconds`)
  log(`Conversion time: ${encodingTime.toFixed(2)} seconds`)
  log(`Conversion rate: ${(duration / encodingTime).toFixed(2)}X`)

  return output.toDataURI()
}
