import { Fragment, useEffect, useState, useCallback } from "react"
import { convertData } from "@samplerate/lib/convert"

const logEntries: string[] = []
let encoderStarted = false

export default function Home() {
  const [logs, setLogs] = useState(logEntries)
  const [encodedBlobUrl, setEncodedBlobUrl] = useState<string | undefined>()

  const log = useCallback(
    (entry: string) => {
      logEntries.push(entry)
      setLogs(logEntries)
    },
    [setLogs]
  )

  useEffect(() => {
    if (encoderStarted) return

    const fn = async () => {
      const response = await fetch("/source.wav")
      const data = await response.arrayBuffer()
      const uri = await convertData(log, data)
      setEncodedBlobUrl(uri)
    }

    encoderStarted = true
    void fn()
  }, [log, setEncodedBlobUrl])

  return (
    <>
      {encodedBlobUrl && (
        <a href={encodedBlobUrl} download='converted.wav'>
          Download encoded file
        </a>
      )}
      <div>
        {logs.map(entry => (
          <Fragment key={entry}>
            {entry}
            <br />
          </Fragment>
        ))}
      </div>
    </>
  )
}
