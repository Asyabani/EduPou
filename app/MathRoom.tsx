import { Audio } from 'expo-av';
import React, { useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const questions = [
  { question: '2 + 3 = ?', options: [5, 6], correct: 5 },
  { question: '7 - 4 = ?', options: [3, 2], correct: 3 },
  { question: '5 + 6 = ?', options: [10, 11], correct: 11 },
  { question: '9 - 5 = ?', options: [3, 4], correct: 4 },
  { question: '8 + 1 = ?', options: [9, 8], correct: 9 },
  { question: '10 - 6 = ?', options: [5, 4], correct: 4 },
  { question: '3 + 4 = ?', options: [7, 8], correct: 7 },
  { question: '6 - 1 = ?', options: [4, 5], correct: 5 },
  { question: '1 + 7 = ?', options: [8, 9], correct: 8 },
  { question: '5 - 3 = ?', options: [1, 2], correct: 2 },
];

export default function CountingRoom() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const questionScale = useState(new Animated.Value(1))[0];
  const optionsOpacity = useState(new Animated.Value(1))[0];

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/win.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound', error);
    }
  }
  async function playChooseSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/select.mp3')
    );
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isPlaying) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log('Error playing correct sound', error);
  }
}

  const animateQuestion = () => {
    questionScale.setValue(0.9);
    optionsOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(questionScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(optionsOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleAnswer = (selected) => {
    const correct = questions[currentIndex].correct;
    let newScore = score;
    playChooseSound(); 
    if (selected === correct) {
      newScore = score + 1;
      setScore(newScore);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      animateQuestion();
    } else {
      setIsFinished(true);
      if (newScore === questions.length) {
        setShowModal(true);
        playSound();
      }
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setShowModal(false);
    animateQuestion();
  };

  const currentQuestion = questions[currentIndex];

  if (isFinished && !showModal) {
    return (
      <View style={styles.container}>
        <Text style={styles.scoreText}>🎉 Quiz Finished! 🎉</Text>
        <Text style={styles.finalScore}>Your score: {score} out of {questions.length}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
          <Text style={styles.retryText}>🔁 Retry Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>
        Question {currentIndex + 1} of {questions.length}
      </Text>
      <Animated.Text style={[styles.questionText, { transform: [{ scale: questionScale }] }]}>
        {currentQuestion.question}
      </Animated.Text>
      <Animated.View style={[styles.buttonsContainer, { opacity: optionsOpacity }]}>
        {currentQuestion.options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.answerButton}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.answerText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🥳 Congratulations! 🥳</Text>
            <Text style={styles.modalMessage}>You got a perfect score!</Text>
            <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
              <Text style={styles.retryText}>🔁 Retry Quiz</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progressText: {
    fontSize: 18,
    color: '#607D8B',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Arial',
  },
  questionText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 50,
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  answerButton: {
    backgroundColor: '#673AB7',
    paddingVertical: 18,
    paddingHorizontal: 45,
    borderRadius: 30,
    marginHorizontal: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  answerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Verdana',
  },
  scoreText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  finalScore: {
    fontSize: 24,
    color: '#3F51B5',
    marginBottom: 40,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginTop: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  retryText: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '85%',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4CAF50',
  },
  modalMessage: {
    fontSize: 20,
    textAlign: 'center',
    color: '#555',
    marginBottom: 25,
  },
});
