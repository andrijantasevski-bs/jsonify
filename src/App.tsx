import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Direction = 'json-to-string' | 'string-to-json'

const INITIAL_INPUT = `{
  "name": "jsonify",
  "speed": "fast",
  "preserveWhitespace": true
}`

function App() {
  const [direction, setDirection] = useState<Direction>('json-to-string')
  const [input, setInput] = useState(INITIAL_INPUT)
  const [normalizeJsonWhitespace, setNormalizeJsonWhitespace] = useState(true)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  const { output, error } = useMemo(() => {
    if (!input) {
      return { output: '', error: '' }
    }

    try {
      if (direction === 'json-to-string') {
        const parsedInput = JSON.parse(input)
        const textToEncode = normalizeJsonWhitespace
          ? JSON.stringify(parsedInput)
          : input

        return {
          output: JSON.stringify(textToEncode),
          error: '',
        }
      }

      const decoded = JSON.parse(input)
      if (typeof decoded !== 'string') {
        return {
          output: '',
          error: 'Input must be a JSON string value when converting string -> JSON.',
        }
      }

      let normalizedOutput = decoded
      if (normalizeJsonWhitespace) {
        try {
          normalizedOutput = JSON.stringify(JSON.parse(decoded))
        } catch {
          normalizedOutput = decoded
        }
      }

      return {
        output: normalizedOutput,
        error: '',
      }
    } catch (conversionError) {
      return {
        output: '',
        error: conversionError instanceof Error ? conversionError.message : 'Invalid input.',
      }
    }
  }, [direction, input, normalizeJsonWhitespace])

  useEffect(() => {
    if (copyState !== 'copied') {
      return
    }

    const timeoutId = setTimeout(() => {
      setCopyState('idle')
    }, 1400)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [copyState])

  const canUseResult = output.length > 0 && !error

  const handleCopyResult = async () => {
    if (!canUseResult) {
      return
    }

    try {
      await navigator.clipboard.writeText(output)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  return (
    <main className="app">
      <section className="converter">
        <header className="converter-header">
          <p className="eyebrow">JSON Tool</p>
          <h1>JSON to string and back</h1>
          <p className="subtitle">
            Instant conversion with optional JSON normalization for compact output.
          </p>
        </header>

        <div className="toolbar">
          <div className="direction-toggle" role="group" aria-label="Conversion direction">
            <button
              type="button"
              className={`toggle-btn ${direction === 'json-to-string' ? 'active' : ''}`}
              onClick={() => {
                setDirection('json-to-string')
                setCopyState('idle')
              }}
            >
              JSON -&gt; string
            </button>
            <button
              type="button"
              className={`toggle-btn ${direction === 'string-to-json' ? 'active' : ''}`}
              onClick={() => {
                setDirection('string-to-json')
                setCopyState('idle')
              }}
            >
              string -&gt; JSON
            </button>
          </div>

          <div className="toolbar-actions">
            <button
              type="button"
              className="ghost-btn"
              disabled={!canUseResult}
              onClick={() => {
                void handleCopyResult()
              }}
            >
              {copyState === 'copied'
                ? 'Copied'
                : copyState === 'error'
                  ? 'Copy failed'
                  : 'Copy result'}
            </button>
            <button
              type="button"
              className="ghost-btn"
              disabled={!canUseResult}
              onClick={() => {
                setInput(output)
                setCopyState('idle')
              }}
            >
              Use result as input
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                setInput('')
                setCopyState('idle')
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <label className="format-toggle" htmlFor="normalize-spacing-toggle">
          <input
            id="normalize-spacing-toggle"
            type="checkbox"
            checked={normalizeJsonWhitespace}
            onChange={(event) => {
              setNormalizeJsonWhitespace(event.target.checked)
              setCopyState('idle')
            }}
          />
          {direction === 'json-to-string'
            ? 'Minify JSON before encoding (JSON.parse + JSON.stringify)'
            : 'Minify decoded JSON (JSON.parse + JSON.stringify)'}
        </label>

        <div className="pane-grid">
          <section className="pane">
            <label htmlFor="converter-input">Input</label>
            <textarea
              id="converter-input"
              className="editor"
              value={input}
              onChange={(event) => {
                setInput(event.target.value)
                if (copyState !== 'idle') {
                  setCopyState('idle')
                }
              }}
              spellCheck={false}
              placeholder={
                direction === 'json-to-string'
                  ? 'Paste valid JSON text here...'
                  : 'Paste a JSON string literal here...'
              }
            />
          </section>

          <section className="pane">
            <div className="pane-top">
              <label htmlFor="converter-output">Result</label>
              <span className={`status-pill ${error ? 'error' : 'ok'}`}>
                {error ? 'Invalid input' : 'Ready'}
              </span>
            </div>

            <textarea
              id="converter-output"
              className="editor output"
              value={output}
              readOnly
              spellCheck={false}
              aria-label="Result"
            />
          </section>
        </div>
        <p className={`message ${error ? 'error' : ''}`}>
          {error ||
            (normalizeJsonWhitespace
              ? direction === 'json-to-string'
                ? 'Input JSON is minified before encoding.'
                : 'Decoded JSON is minified with standard JSON.parse + JSON.stringify.'
              : 'Preservation note: your JSON text is encoded and decoded without reformatting.')}
        </p>
      </section>
    </main>
  )
}

export default App
