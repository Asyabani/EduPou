import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Get screen dimensions for responsive sizing
const windowWidth = Dimensions.get('window').width;
const numColumns = 4;
const cardSize = (windowWidth - 40 - (numColumns - 1) * 10) / numColumns;

const initialCards = [
  '🍎', '🍌', '🍇', '🍓', '🍍', '🥝',
  '🍎', '🍌', '🍇', '🍓', '🍍', '🥝',
];

const GAME_DURATION_SECONDS = 60; 

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function MatchingGame() {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [isGameOver, setIsGameOver] = useState(false);

  const cardFlipAnimates = useRef([]);
  const backgroundSoundRef = useRef(null);
  const timerRef = useRef(null);

  // Function to play short sound effects
  async function playSoundEffect(soundFile) {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying && status.didJustFinish) { 
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound effect:', error);
    }
  }

  // Function to play background music
  async function playBackgroundMusic() {
    if (backgroundSoundRef.current) {
      await stopBackgroundMusic(); 
    }
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/memory.mp3'),
        { isLooping: true, volume: 0.5 } 
      );
      backgroundSoundRef.current = sound;
      await backgroundSoundRef.current.playAsync();
    } catch (error) {
      console.log('Error playing background music:', error);
    }
  }

  // Function to stop background music
  async function stopBackgroundMusic() {
    if (backgroundSoundRef.current) {
      try {
        await backgroundSoundRef.current.stopAsync();
        await backgroundSoundRef.current.unloadAsync();
      } catch (error) {
        console.log('Error stopping background music:', error);
      }
      backgroundSoundRef.current = null;
    }
  }


  useEffect(() => {
    initializeGame();

    // Cleanup on unmount
    return () => {
      stopBackgroundMusic();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const initializeGame = () => {
    console.log("Initializing game...");
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopBackgroundMusic(); 

    const shuffled = shuffleArray([...initialCards]);
    const newCardsData = shuffled.map((value, index) => ({
      id: index,
      value: value,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(newCardsData);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setShowWinModal(false);
    setShowGameOverModal(false);
    setIsGameOver(false);
    setTimeLeft(GAME_DURATION_SECONDS);
    setGameStarted(true); 

    cardFlipAnimates.current = newCardsData.map(() => new Animated.Value(0));
    playBackgroundMusic(); 
  };


  // Timer effect
  useEffect(() => {
    if (gameStarted && !isGameOver && matchedCards.length < initialCards.length) {
      if (timerRef.current) clearInterval(timerRef.current); 
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setIsGameOver(true);
            setShowGameOverModal(true);
            stopBackgroundMusic();
            playSoundEffect(require('@/assets/sounds/game_over_memory.mp3'));
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (isGameOver || matchedCards.length === initialCards.length) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, isGameOver, matchedCards]);


  // Win condition effect
  useEffect(() => {
    if (gameStarted && !isGameOver && matchedCards.length === initialCards.length) {
      setShowWinModal(true);
      playSoundEffect(require('@/assets/sounds/level_up_memory.mp3'));
      stopBackgroundMusic();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [matchedCards, gameStarted, isGameOver]);

  const handleCardPress = (index) => {
    if (!gameStarted || isGameOver || flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    setFlippedCards((prev) => [...prev, index]);
    setMoves((prev) => prev + 1);

    Animated.timing(cardFlipAnimates.current[index], {
      toValue: 1,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    playSoundEffect(require('@/assets/sounds/flip.mp3'));
  };

  useEffect(() => {
    if (flippedCards.length === 2 && !isGameOver) {
      const [firstIndex, secondIndex] = flippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.value === secondCard.value) {
        const newCards = [...cards];
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setMatchedCards((prev) => [...prev, firstIndex, secondIndex].sort((a, b) => a - b)); // Keep sorted for easier comparison
        setFlippedCards([]);
        playSoundEffect(require('@/assets/sounds/match.mp3'));
      } else {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(cardFlipAnimates.current[firstIndex], {
              toValue: 0,
              duration: 300,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(cardFlipAnimates.current[secondIndex], {
              toValue: 0,
              duration: 300,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]).start(() => {
            const newCards = [...cards];
            if (!newCards[firstIndex].isMatched && !isGameOver) newCards[firstIndex].isFlipped = false;
            if (!newCards[secondIndex].isMatched && !isGameOver) newCards[secondIndex].isFlipped = false;
            setCards(newCards);
            setFlippedCards([]);
          });
          // playSoundEffect(require('@/assets/sounds/no_match.mp3')); // Optional
        }, 800);
      }
    }
  }, [flippedCards, cards, isGameOver]);

  const getCardFrontAnimatedStyle = (index) => {
    if (!cardFlipAnimates.current[index]) {
      return { transform: [{ rotateY: '180deg' }], opacity: 0 };
    }
    const rotateY = cardFlipAnimates.current[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    });
    const opacity = cardFlipAnimates.current[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    });
    return {
      transform: [{ rotateY }],
      opacity,
    };
  };

  const getCardBackAnimatedStyle = (index) => {
    if (!cardFlipAnimates.current[index]) {
      return { transform: [{ rotateY: '0deg' }], opacity: 1 };
    }
    const rotateY = cardFlipAnimates.current[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    const opacity = cardFlipAnimates.current[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 0],
    });
    return {
      transform: [{ rotateY }],
      opacity,
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Match!</Text>
      <View style={styles.statsContainer}>
        <Text style={styles.movesText}>Moves: {moves}</Text>
        <Text style={[styles.timerText, timeLeft <= 10 && !isGameOver && styles.timerWarning]}>
          Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </Text>
      </View>
      <View style={styles.cardGrid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={styles.cardWrapper}
            onPress={() => handleCardPress(index)}
            activeOpacity={0.8}
            disabled={card.isFlipped || card.isMatched || isGameOver || flippedCards.length === 2}
          >
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                card.isMatched && styles.cardMatched,
                isGameOver && !card.isMatched && styles.cardGameOverNotMatched, 
                getCardBackAnimatedStyle(index),
              ]}
            >
              <Text style={styles.cardQuestionMark}>?</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.card,
                styles.cardFront,
                card.isMatched && styles.cardMatched,
                isGameOver && !card.isMatched && styles.cardGameOverNotMatched, 
                getCardFrontAnimatedStyle(index),
              ]}
            >
              <Text style={styles.cardText}>{card.value}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={initializeGame} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset Game</Text>
      </TouchableOpacity>

      {/* Win Modal */}
      <Modal visible={showWinModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>You Win! 🎉</Text>
            <Text style={styles.modalSubtitle}>Moves: {moves}</Text>
            <TouchableOpacity onPress={initializeGame} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game Over Modal */}
      <Modal visible={showGameOverModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Over ⏰</Text>
            <Text style={styles.modalSubtitle}>Try again!</Text>
            <TouchableOpacity onPress={initializeGame} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  movesText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerWarning: {
    color: 'red',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: cardSize,
    height: cardSize,
    marginBottom: 10,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: '#4e73df',
  },
  cardFront: {
    backgroundColor: '#fff',
  },
  cardMatched: {
    backgroundColor: '#28a745',
  },
  cardGameOverNotMatched: {
    opacity: 0.3,
  },
  cardQuestionMark: {
    fontSize: 28,
    color: '#fff',
  },
  cardText: {
    fontSize: 28,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: '#f39c12',
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4e73df',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
