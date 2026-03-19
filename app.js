/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle (src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/

const { useState, useEffect } = React

const WORD_BANK = [
  'banana',
  'cherry',
  'orange',
  'grapes',
  'lemon',
  'melon',
  'peach',
  'mango',
  'papaya',
  'apricot',
  'kiwi',
  'pear'
]

const MAX_STRIKES = 3
const DEFAULT_PASSES = 3

function getScrambledWord(word) {
  if (!word) return ''

  let scrambled = shuffle(word)

  // Try to avoid returning the exact same word
  while (scrambled === word && word.length > 1) {
    scrambled = shuffle(word)
  }

  return scrambled
}

function App() {
  const [words, setWords] = useState([])
  const [currentWord, setCurrentWord] = useState('')
  const [scrambledWord, setScrambledWord] = useState('')
  const [guess, setGuess] = useState('')
  const [points, setPoints] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [passes, setPasses] = useState(DEFAULT_PASSES)
  const [message, setMessage] = useState('')
  const [gameOver, setGameOver] = useState(false)

  function startNewGame() {
    const freshWords = shuffle(WORD_BANK)

    setWords(freshWords)
    setCurrentWord(freshWords[0])
    setScrambledWord(getScrambledWord(freshWords[0]))
    setGuess('')
    setPoints(0)
    setStrikes(0)
    setPasses(DEFAULT_PASSES)
    setMessage('')
    setGameOver(false)
  }

  function goToNextWord(updatedWords) {
    if (updatedWords.length === 0) {
      setWords([])
      setCurrentWord('')
      setScrambledWord('')
      setGameOver(true)
      setMessage('You finished all the words! Great job!')
      return
    }

    const nextWord = updatedWords[0]
    setWords(updatedWords)
    setCurrentWord(nextWord)
    setScrambledWord(getScrambledWord(nextWord))
  }

  useEffect(() => {
    const savedWords = localStorage.getItem('scramble-words')
    const savedCurrentWord = localStorage.getItem('scramble-current-word')
    const savedScrambledWord = localStorage.getItem('scramble-scrambled-word')
    const savedPoints = localStorage.getItem('scramble-points')
    const savedStrikes = localStorage.getItem('scramble-strikes')
    const savedPasses = localStorage.getItem('scramble-passes')
    const savedMessage = localStorage.getItem('scramble-message')
    const savedGameOver = localStorage.getItem('scramble-game-over')

    if (
      savedWords &&
      savedCurrentWord &&
      savedScrambledWord &&
      savedPoints !== null &&
      savedStrikes !== null &&
      savedPasses !== null &&
      savedGameOver !== null
    ) {
      setWords(JSON.parse(savedWords))
      setCurrentWord(savedCurrentWord)
      setScrambledWord(savedScrambledWord)
      setPoints(Number(savedPoints))
      setStrikes(Number(savedStrikes))
      setPasses(Number(savedPasses))
      setMessage(savedMessage || '')
      setGameOver(savedGameOver === 'true')
    } else {
      startNewGame()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('scramble-words', JSON.stringify(words))
    localStorage.setItem('scramble-current-word', currentWord)
    localStorage.setItem('scramble-scrambled-word', scrambledWord)
    localStorage.setItem('scramble-points', points)
    localStorage.setItem('scramble-strikes', strikes)
    localStorage.setItem('scramble-passes', passes)
    localStorage.setItem('scramble-message', message)
    localStorage.setItem('scramble-game-over', gameOver)
  }, [words, currentWord, scrambledWord, points, strikes, passes, message, gameOver])

  function handleSubmit(event) {
    event.preventDefault()

    if (gameOver || !currentWord) return

    const trimmedGuess = guess.trim()
    if (!trimmedGuess) return

    if (trimmedGuess.toLowerCase() === currentWord.toLowerCase()) {
      const updatedWords = words.slice(1)

      setPoints(points + 1)
      setMessage('Correct!')
      setGuess('')
      goToNextWord(updatedWords)
    } else {
      const newStrikes = strikes + 1

      setStrikes(newStrikes)
      setMessage('Incorrect!')
      setGuess('')

      if (newStrikes >= MAX_STRIKES) {
        setGameOver(true)
        setCurrentWord('')
        setScrambledWord('')
        setMessage('Game over! You reached the maximum number of strikes.')
      }
    }
  }

  function handlePass() {
    if (gameOver || passes <= 0 || !currentWord) return

    const updatedWords = words.slice(1)

    setPasses(passes - 1)
    setMessage('Word passed!')
    setGuess('')
    goToNextWord(updatedWords)
  }

  function handleReset() {
    localStorage.removeItem('scramble-words')
    localStorage.removeItem('scramble-current-word')
    localStorage.removeItem('scramble-scrambled-word')
    localStorage.removeItem('scramble-points')
    localStorage.removeItem('scramble-strikes')
    localStorage.removeItem('scramble-passes')
    localStorage.removeItem('scramble-message')
    localStorage.removeItem('scramble-game-over')

    startNewGame()
  }

  return (
    <main className="app">
      <h1>Scramble</h1>

      {!gameOver && (
        <>
          <p className="scrambled-word">{scrambledWord}</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              placeholder="Type your guess"
              autoComplete="off"
            />
          </form>

          <button onClick={handlePass} disabled={passes === 0}>
            Pass
          </button>
        </>
      )}

      <div className="stats">
        <p>Points: {points}</p>
        <p>Strikes: {strikes} / {MAX_STRIKES}</p>
        <p>Passes Remaining: {passes}</p>
      </div>

      {message && <p className="message">{message}</p>}

      {gameOver && (
        <button onClick={handleReset}>
          Play Again
        </button>
      )}
    </main>
  )
}

const rootElement = document.createElement('div')
rootElement.id = 'root'
document.body.appendChild(rootElement)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)