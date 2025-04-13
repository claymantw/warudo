"use client";

import { sdk } from '@farcaster/frame-sdk';
import { farcasterFrame as frameConnector } from '@farcaster/frame-wagmi-connector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { WagmiProvider, useAccount, useConnect } from 'wagmi';
import { config } from './wagmiConfig';
import styles from './globals.css';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function AppInner() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Word Guess Game</h1>
      <ConnectMenu />
    </div>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();

  if (isConnected) {
    return (
      <div className={styles.connected}>
        <p className={styles.text}>
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        <WordGuessGame />
      </div>
    );
  }

  return (
    <div className={styles.connectContainer}>
      <p className={styles.text}>Connect your wallet to play!</p>
      <button
        type="button"
        onClick={() => connect({ connector: frameConnector() })}
        className={styles.button}
      >
        Connect Wallet
      </button>
    </div>
  );
}

function WordGuessGame() {
  const words = ["SUPERHERO", "PASADENA", "COMPUTER", "GUITAR", "MOUNTAIN", "OCEAN"];
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const maxWrongGuesses = 5;

  // Pilih kata acak saat komponen dimuat atau game di-reset
  useEffect(() => {
    resetGame();
  }, []);

  const handleGuess = (letter: string) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus("lost");
      }
    }

    const displayWord = word
      .split("")
      .map((char) => (newGuessedLetters.includes(char) ? char : "_"))
      .join("");
    if (displayWord === word) {
      setGameStatus("won");
    }
  };

  const resetGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
  };

  const displayWord = word
    .split("")
    .map((char) => (guessedLetters.includes(char) ? char : "_"))
    .join(" ");

  return (
    <div className={styles.gameContainer}>
      {word ? (
        <>
          <p className={styles.word}>{displayWord}</p>
          <p className={styles.text}>Wrong Guesses: {wrongGuesses} / {maxWrongGuesses}</p>
          <p className={styles.text}>Guessed Letters: {guessedLetters.join(", ") || "None"}</p>

          {gameStatus === "playing" && (
            <div className={styles.input}>
              <input
                type="text"
                maxLength={1}
                onChange={(e) => {
                  const letter = e.target.value.toUpperCase();
                  if (/^[A-Z]$/.test(letter)) {
                    handleGuess(letter);
                    e.target.value = "";
                  }
                }}
                placeholder="Guess a letter"
                className={styles.inputBox}
              />
            </div>
          )}

          {gameStatus === "won" && (
            <p className={styles.message}>
              Congratulations! You won! The word was <strong>{word}</strong>.
            </p>
          )}
          {gameStatus === "lost" && (
            <p className={styles.message}>
              Game Over! The word was <strong>{word}</strong>.
            </p>
          )}

          {(gameStatus === "won" || gameStatus === "lost") && (
            <button onClick={resetGame} className={styles.button}>
              Play Again
            </button>
          )}
        </>
      ) : (
        <p className={styles.text}>Loading...</p>
      )}
    </div>
  );
}

export default App;
