import { Samplerate, Converter as SamplerateConverter } from "@toots/libsamplerate.js"
import { Reader, FileWriter } from "wav"
import fs from "fs"
const { Transform } = require("node:stream")

const deinterleaveBuffer = (data: Buffer, channels: number) => {
  const samples = data.length / (2 * channels)
  const ret = new Array(channels)

  for (let chan = 0; chan < channels; chan++) {
    ret[chan] = new Int16Array(samples)
    for (let i = 0; i < samples; i++) {
      ret[chan][i] = data.readInt16LE(2 * (i * channels + chan))
    }
  }

  return ret
}

const interleaveBuffer = (buf: Int16Array[]) => {
  const channels = buf.length
  const samples = buf[0].length
  const ret = Buffer.alloc(2 * samples * channels)

  for (let chan = 0; chan < channels; chan++) {
    for (let i = 0; i < samples; i++) {
      ret.writeInt16LE(buf[chan][i], 2 * (i * channels + chan))
    }
  }

  return ret
}

const concatBuffer = (a: Int16Array, b: Int16Array) => {
  var ret = new Int16Array(a.length + b.length)
  ret.set(a)
  ret.subarray(a.length).set(b)
  return ret
}

const exec = async () => {
  await Samplerate.initialized

  console.log("")
  console.log("Executing encoding test")

  const str = fs.createReadStream("../lib/source.wav")
  const reader = new Reader()

  str.pipe(reader)

  reader.on("format", format => {
    console.log("Got WAV file.")

    console.log("Converting..")
    const started = new Date()
    let duration = 0.0
    let rem = [...new Array(format.channels)].map(() => new Int16Array())
    const targetSamplerate = 8000
    const samplerate = format.sampleRate
    const ratio = targetSamplerate / samplerate
    const target = new FileWriter("./converted.wav", {
      ...format,
      sampleRate: targetSamplerate,
    })

    const converter = rem.map(() => new Samplerate(SamplerateConverter.BEST_QUALITY))
    const converterStream = new Transform({
      transform(rawBuffer: Buffer, _, callback) {
        const buf = deinterleaveBuffer(rawBuffer, format.channels)
        const samples = buf[0].length

        duration += samples / samplerate

        const data = buf.map((pcm, pos) => {
          const chunk = concatBuffer(rem[pos], pcm)
          const { data, used } = converter[pos].process({
            data: chunk,
            ratio,
            last: false,
          })
          rem[pos] = chunk.subarray(used)
          return data
        })

        callback(null, interleaveBuffer(data))
      },
      flush(callback) {
        const pending = converter.map((c, pos) => {
          const { data } = c.process({
            data: rem[pos],
            ratio,
            last: true,
          })
          c.close()
          return data
        })

        callback(null, interleaveBuffer(pending))
      },
    })

    reader.pipe(converterStream)
    converterStream.pipe(target)

    target.on("finish", () => {
      const ended = new Date()
      const encodingTime = (ended.getTime() - started.getTime()) / 1000
      console.log("Done converting.")
      console.log(`File duration: ${duration.toFixed(2)} seconds`)
      console.log(`Conversion time: ${encodingTime.toFixed(2)} seconds`)
      console.log(`Conversion rate: ${(duration / encodingTime).toFixed(2)}X`)
      process.exit(0)
    })
  })
}

exec()
