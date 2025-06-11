import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Get screen dimensions for responsive sizing
const windowWidth = Dimensions.get('window').width;
const numColumns = 4;
const numRows = 3;
const totalCards = numColumns * numRows;
const cardSize = (windowWidth - 40 - (numColumns - 1) * 10) / numColumns;

// Symbols for the gacha
const gachaSymbols = ['🍎', '🍌', '🍇', '🍓', '🍍', '🥝', '🍒', '🍉', '💎', '🔔']; 

// Game constants
const INITIAL_BALANCE = 100;
const SPIN_COST = 5;
const ALL_SPIN_MULTIPLIER = 10;

// New Win Amounts
const FIVE_PLUS_IDENTICAL_WIN_AMOUNT = 10;
const PER_ROW_WIN_AMOUNT = 5;


const getRandomSymbol = () => {
  return gachaSymbols[Math.floor(Math.random() * gachaSymbols.length)];
};

export default function GachaGame() {
  const [cards, setCards] = useState([]);
  const [spins, setSpins] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [winMessage, setWinMessage] = useState('');
  const [winType, setWinType] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAllSpinning, setIsAllSpinning] = useState(false);
  const [showAllSpinModal, setShowAllSpinModal] = useState(false);
  const [allSpinResultsMessage, setAllSpinResultsMessage] = useState('');
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [fullRowWinsCount, setFullRowWinsCount] = useState(0);
  const [winningCardIds, setWinningCardIds] = useState(new Set()); 
  const spinSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  const jackpotSoundRef = useRef(null);
  const spinAnimationIntervalRef = useRef(null);
  const backgroundSoundRef = useRef(null);


  useEffect(() => {
  const loadSounds = async () => {
    try {
      const { sound: spinS } = await Audio.Sound.createAsync(require('../assets/sounds/gacha.mp3'));
      spinSoundRef.current = spinS;
      const { sound: winS } = await Audio.Sound.createAsync(require('../assets/sounds/match.mp3'));
      winSoundRef.current = winS;
      const { sound: jackpotS } = await Audio.Sound.createAsync(require('../assets/sounds/level_up_memory.mp3'));
      jackpotSoundRef.current = jackpotS;

      // Load and play background music
      const { sound: bgS } = await Audio.Sound.createAsync(
        require('../assets/sounds/gamemenu.mp3'), // Ganti sesuai path dan file audio yang kamu punya
        { isLooping: true, volume: 0.5 }
      );
      backgroundSoundRef.current = bgS;
      await bgS.playAsync();
    } catch (error) {
      console.log("Error loading sounds: ", error);
    }
  };

  loadSounds();

  return () => {
    spinSoundRef.current?.unloadAsync();
    winSoundRef.current?.unloadAsync();
    jackpotSoundRef.current?.unloadAsync();
    backgroundSoundRef.current?.unloadAsync();
    if (spinAnimationIntervalRef.current) {
      clearInterval(spinAnimationIntervalRef.current);
    }
  };
}, []);


  useEffect(() => {
    initializeGame();
  }, []);

  const playSound = async (soundRef) => {
    try {
      if (soundRef && soundRef.current) {
        await soundRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 0 });
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const initializeGame = (isReset = false) => {
    const newCardsData = Array.from({ length: totalCards }).map((_, index) => ({
      id: index,
      value: getRandomSymbol(),
    }));
    setCards(newCardsData);
    if (isReset) {
      setSpins(0);
      setBalance(INITIAL_BALANCE);
      setFullRowWinsCount(0);
    }
    setShowModal(false);
    setWinMessage('');
    setWinType('');
    setIsSpinning(false);
    setIsAllSpinning(false);
    setShowAllSpinModal(false);
    setAllSpinResultsMessage('');
    setWinningCardIds(new Set()); // Reset highlight
  };

  const calculateSpinResult = (currentCards) => {
    const counts = {};
    const currentWinningIds = new Set();

    currentCards.forEach(card => {
      counts[card.value] = (counts[card.value] || 0) + 1;
    });

    // 1. Check for 5 or more identical symbols anywhere
    for (const symbol in counts) {
      if (counts[symbol] >= 5) {
        currentCards.forEach(card => {
          if (card.value === symbol) {
            currentWinningIds.add(card.id);
          }
        });
        return {
          prize: FIVE_PLUS_IDENTICAL_WIN_AMOUNT,
          message: `JACKPOT! You got ${counts[symbol]}x ${symbol}!`,
          type: 'jackpot_5_identical',
          symbol: symbol,
          count: counts[symbol],
          numRowsWon: 0,
          winningIds: currentWinningIds,
        };
      }
    }

    // 2. Check for full row(s) if no 5+ identical win
    let numRowsWonThisSpin = 0;
    let rowWinDetails = [];
    let firstWinningSymbolForRow = null;

    for (let i = 0; i < numRows; i++) {
      const rowStartIndex = i * numColumns;
      const firstSymbolInRow = currentCards[rowStartIndex].value;
      let isFullRowMatch = true;
      for (let j = 1; j < numColumns; j++) {
        if (currentCards[rowStartIndex + j].value !== firstSymbolInRow) {
          isFullRowMatch = false;
          break;
        }
      }
      if (isFullRowMatch) {
        numRowsWonThisSpin++;
        if (!firstWinningSymbolForRow) firstWinningSymbolForRow = firstSymbolInRow;
        rowWinDetails.push(`Row ${i + 1} (${firstSymbolInRow})`);
        for (let k = 0; k < numColumns; k++) { // Add all cards in this winning row to winningIds
            currentWinningIds.add(currentCards[rowStartIndex + k].id);
        }
      }
    }

    if (numRowsWonThisSpin > 0) {
      const prizeMoney = numRowsWonThisSpin * PER_ROW_WIN_AMOUNT;
      return {
        prize: prizeMoney,
        message: `${numRowsWonThisSpin} full row${numRowsWonThisSpin > 1 ? 's' : ''} matched: ${rowWinDetails.join('; ')}`,
        type: 'row_win',
        numRowsWon: numRowsWonThisSpin,
        firstSymbol: firstWinningSymbolForRow,
        winningIds: currentWinningIds,
      };
    }

    return { prize: 0, message: "No win this time.", type: 'no_win', numRowsWon: 0, winningIds: new Set() };
  };


  const handleGachaSpin = () => {
    if (isSpinning || isAllSpinning) return;

    if (balance < SPIN_COST) {
      Alert.alert("Not Enough Money", `You need $${SPIN_COST} to spin.`);
      return;
    }

    setIsSpinning(true);
    setWinningCardIds(new Set()); // Clear previous highlights
    setBalance(prev => prev - SPIN_COST);
    playSound(spinSoundRef);
    setShowModal(false);
    setWinMessage('');
    setWinType('');

    const animationDuration = 1000;
    const updateFrequency = 60;
    let timeElapsed = 0;

    if (spinAnimationIntervalRef.current) {
      clearInterval(spinAnimationIntervalRef.current);
    }

    spinAnimationIntervalRef.current = setInterval(() => {
      timeElapsed += updateFrequency;
      const temporaryAnimatingCards = cards.map(card => ({
        ...card,
        value: getRandomSymbol(),
      }));
      setCards(temporaryAnimatingCards);

      if (timeElapsed >= animationDuration) {
        clearInterval(spinAnimationIntervalRef.current);
        spinAnimationIntervalRef.current = null;

        const finalCardsData = cards.map(card => ({
          ...card,
          value: getRandomSymbol(),
        }));
        setCards(finalCardsData);
        setIsSpinning(false);
        setSpins(prev => prev + 1);

        const result = calculateSpinResult(finalCardsData);

        if (result.prize > 0) {
          setBalance(prev => prev + result.prize);
          setWinMessage(`${result.message}\nCongratulations! You won $${result.prize}!`);
          setWinType(result.type);
          setWinningCardIds(result.winningIds); // Set highlights
          setShowModal(true); // Tetap tampilkan modal

          if (result.type === 'jackpot_5_identical') {
            playSound(jackpotSoundRef);
          } else if (result.type === 'row_win') {
            setFullRowWinsCount(prev => prev + result.numRowsWon);
            playSound(winSoundRef);
          }
        }
        // No modal for 'no_win'
      }
    }, updateFrequency);
  };

  const handleAllGachaSpins = async () => {
    if (isSpinning || isAllSpinning) return;
    const totalCost = SPIN_COST * ALL_SPIN_MULTIPLIER;

    if (balance < totalCost) {
      Alert.alert("Not Enough Money", `You need $${totalCost} for 10 spins.`);
      return;
    }

    setIsAllSpinning(true);
    setWinningCardIds(new Set()); // Clear previous highlights
    setBalance(prev => prev - totalCost);
    playSound(spinSoundRef);
    setShowModal(false);

    let totalWinningsThisAllSpin = 0;
    let summaryMessages = [`--- Results for 10 Spins ---`];
    let finalBoardState = [...cards];
    let totalRowsWonThisSession = 0;
    let lastSpinResultForHighlight = null;

    for (let i = 0; i < ALL_SPIN_MULTIPLIER; i++) {
      const currentSpinCards = Array.from({ length: totalCards }).map((_, cardIndex) => ({ // Perbaiki cardIndex
        id: cardIndex, // Pastikan ID unik untuk setiap kartu dalam spin ini
        value: getRandomSymbol(),
      }));

      const result = calculateSpinResult(currentSpinCards);
      if (i === ALL_SPIN_MULTIPLIER - 1) {
        finalBoardState = currentSpinCards;
        lastSpinResultForHighlight = result; // Simpan hasil spin terakhir untuk highlight
      }

      let spinPrize = result.prize;
      let spinMessage = `Spin ${i + 1}: `;

      if (result.prize > 0) {
        spinMessage += `${result.message} You won $${spinPrize}.`;
        if (result.type === 'jackpot_5_identical') {
          playSound(jackpotSoundRef);
        } else if (result.type === 'row_win') {
          totalRowsWonThisSession += result.numRowsWon;
          playSound(winSoundRef);
        }
        await new Promise(resolve => setTimeout(resolve, 150));
      } else {
        spinMessage += "No win.";
      }
      totalWinningsThisAllSpin += spinPrize;
      summaryMessages.push(spinMessage);
    }

    setCards(finalBoardState);
    if (lastSpinResultForHighlight && lastSpinResultForHighlight.prize > 0) {
        setWinningCardIds(lastSpinResultForHighlight.winningIds); // Highlight kartu dari spin terakhir jika menang
    }

    setBalance(prev => prev + totalWinningsThisAllSpin);
    setFullRowWinsCount(prev => prev + totalRowsWonThisSession);
    setSpins(prev => prev + ALL_SPIN_MULTIPLIER);

    summaryMessages.push(`\nTotal Winnings from 10 Spins: $${totalWinningsThisAllSpin}`);
    setAllSpinResultsMessage(summaryMessages.join('\n'));
    setShowAllSpinModal(true);
    setIsAllSpinning(false);
  };

  const getModalTitle = () => {
    if (winType === 'jackpot_5_identical') return '🎉 JACKPOT! 🎉';
    if (winType === 'row_win') return '✨ You Win! ✨';
    return '✨ Result ✨';
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Your Luck!</Text>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Money: ${balance}</Text>
        <Text style={styles.statsText}>Round: {spins}</Text>
      </View>
      <Text style={styles.statsTextSmall}>Total Full Rows Matched: {fullRowWinsCount}</Text>

      <View style={styles.cardGrid}>
        {cards.map((card) => (
          <View key={card.id} style={styles.cardWrapper}>
            <View style={[
                styles.card,
                styles.cardFront,
                (isSpinning || isAllSpinning) && styles.cardSpinningEffect,
                winningCardIds.has(card.id) && styles.winningCard // Terapkan style jika kartu menang
            ]}>
              <Text style={[
                  styles.cardText,
                  winningCardIds.has(card.id) && styles.winningCardText // Style teks untuk kartu menang
                ]}>{card.value}</Text>
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity
        onPress={handleGachaSpin}
        style={[styles.gachaButton, (isSpinning || isAllSpinning || balance < SPIN_COST) && styles.gachaButtonDisabled]}
        disabled={isSpinning || isAllSpinning || balance < SPIN_COST}
      >
        <Text style={styles.gachaButtonText}>{isSpinning ? 'Spinning...' : `Spin ($${SPIN_COST})`}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleAllGachaSpins}
        style={[styles.gachaButton, styles.allSpinButton, (isSpinning || isAllSpinning || balance < SPIN_COST * ALL_SPIN_MULTIPLIER) && styles.gachaButtonDisabled]}
        disabled={isSpinning || isAllSpinning || balance < SPIN_COST * ALL_SPIN_MULTIPLIER}
      >
        <Text style={styles.gachaButtonText}>{isAllSpinning ? 'Spinning 10x...' : `Spin 10x ($${SPIN_COST * ALL_SPIN_MULTIPLIER})`}</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            <Text style={styles.modalMessage}>{winMessage}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setShowModal(false);
                // setWinningCardIds(new Set()); // Hapus highlight saat modal ditutup jika diinginkan
              }}
            >
              <Text style={styles.retryText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.retryButton, {backgroundColor: '#ff6b6b', marginTop: 10}]}
              onPress={() => initializeGame(true)}
            >
              <Text style={styles.retryText}>New Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAllSpinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.allSpinModalContent]}>
            <Text style={styles.modalTitle}>10 Spin Results</Text>
            <ScrollView style={styles.allSpinScrollView}>
                <Text style={styles.modalMessage}>{allSpinResultsMessage}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setShowAllSpinModal(false);
                // setWinningCardIds(new Set()); // Hapus highlight saat modal ditutup jika diinginkan
              }}
            >
              <Text style={styles.retryText}>OK</Text>
            </TouchableOpacity>
             <TouchableOpacity
              style={[styles.retryButton, {backgroundColor: '#ff6b6b', marginTop: 10}]}
              onPress={() => {
                setShowAllSpinModal(false);
                initializeGame(true);
              }}
            >
              <Text style={styles.retryText}>New Game</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginBottom: 5,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
  },
  statsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ecf0f1',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1},
    textShadowRadius: 1,
  },
  statsTextSmall: {
      fontSize: 15,
      color: '#bdc3c7',
      marginBottom: 15,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34495e'
  },
  cardWrapper: {
    width: cardSize,
    height: cardSize,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    overflow: 'hidden',
    transitionProperty: 'background-color, border-color', // Untuk animasi halus jika didukung
    transitionDuration: '0.3s',
  },
  cardFront: {
    backgroundColor: '#ecf0f1',
    borderColor: '#ffd700',
  },
  winningCard: { // Style untuk kartu yang menang
    backgroundColor: '#2ecc71', // Hijau cerah sebagai contoh
    borderColor: '#ffffff', // Border putih untuk kontras
    transform: [{ scale: 1.05 }], // Sedikit membesar
  },
  winningCardText: { // Style untuk teks pada kartu yang menang
    color: '#ffffff', // Teks putih
    fontWeight: 'bold',
  },
  cardSpinningEffect: {
    borderColor: '#e67e22',
    opacity: 0.8,
  },
  cardText: {
    fontSize: cardSize * 0.55,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  gachaButton: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 35,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    minWidth: '75%',
    alignItems: 'center',
  },
  allSpinButton: {
    backgroundColor: '#3498db',
  },
  gachaButtonDisabled: {
    backgroundColor: '#7f8c8d',
    opacity: 0.7,
  },
  gachaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#34495e',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  allSpinModalContent: {
    maxHeight: '85%',
  },
  allSpinScrollView: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 17,
    textAlign: 'center',
    color: '#ecf0f1',
    marginBottom: 25,
    lineHeight: 25,
  },
  retryButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 7,
    minWidth: '65%',
    alignItems: 'center',
    marginTop: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
});