import { useMemo, useState } from 'react'
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

  const { output, error } = useMemo(() => {
    if (!input) {
      return { output: '', error: '' }
    }

    try {
      if (direction === 'json-to-string') {
        JSON.parse(input)
        return {
          output: JSON.stringify(input),
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

      return {
        output: decoded,
        error: '',
      }
    } catch (conversionError) {
      return {
        output: '',
        error: conversionError instanceof Error ? conversionError.message : 'Invalid input.',
      }
    }
  }, [direction, input])

  const canUseResult = output.length > 0 && !error

  return (
    <main className="app">
      <section className="converter">
        <header className="converter-header">
          <p className="eyebrow">JSON Tool</p>
          <h1>JSON to string and back</h1>
          <p className="subtitle">
            Instant conversion with exact text preservation while encoding and decoding.
          </p>
        </header>

        <div className="toolbar">
          <div className="direction-toggle" role="group" aria-label="Conversion direction">
            <button
              type="button"
              className={`toggle-btn ${direction === 'json-to-string' ? 'active' : ''}`}
              onClick={() => setDirection('json-to-string')}
            >
              JSON -&gt; string
            </button>
            <button
              type="button"
              className={`toggle-btn ${direction === 'string-to-json' ? 'active' : ''}`}
              onClick={() => setDirection('string-to-json')}
            >
              string -&gt; JSON
            </button>
          </div>

          <div className="toolbar-actions">
            <button
              type="button"
              className="ghost-btn"
              disabled={!canUseResult}
              onClick={() => setInput(output)}
            >
              Use result as input
            </button>
            <button type="button" className="ghost-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>

        <div className="pane-grid">
          <section className="pane">
            <label htmlFor="converter-input">Input</label>
            <textarea
              id="converter-input"
              className="editor"
              value={input}
              onChange={(event) => setInput(event.target.value)}
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
          {error || 'Preservation note: your JSON text is encoded and decoded without reformatting.'}
        </p>
      </section>
    </main>
  )
}

export default App
