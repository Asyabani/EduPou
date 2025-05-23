import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Audio } from 'expo-av';

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
      console.log('Error play sound', error);
    }
  }

  const handleAnswer = (selected) => {
    const correct = questions[currentIndex].correct;
    if (selected === correct) {
      setScore(score + 1);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
      if (score + (selected === correct ? 1 : 0) === 10) {
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
  };

  const currentQuestion = questions[currentIndex];

  if (isFinished && !showModal) {
    return (
      <View style={styles.container}>
        <Text style={styles.scoreText}>Quiz finished!</Text>
        <Text style={styles.scoreText}>Your score : {score} / {questions.length}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
          <Text style={styles.retryText}>🔁 Repeat Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>
      Question {currentIndex + 1} from {questions.length}
      </Text>
      <Text style={styles.questionText}>{currentQuestion.question}</Text>
      <View style={styles.buttonsContainer}>
        {currentQuestion.options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.answerButton}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.answerText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Congratulation!</Text>
            <Text style={styles.modalMessage}>You get a perfect score
            !</Text>
            <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
              <Text style={styles.retryText}>🔁 Repeat Quiz
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginBottom: 50 },
  questionText: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 40 },
  answerButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  answerText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  progressText: { fontSize: 18, color: 'gray', marginBottom: 20, textAlign: 'center' },
  scoreText: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginTop: 20,
  },
  retryText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
  },
});
