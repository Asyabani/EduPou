import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function ReadingRoom() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  const startReading = () => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < letters.length) {
          Speech.speak(letters[nextIndex]);
          return nextIndex;
        } else {
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          return prevIndex;
        }
      });
    }, 1500); // Setiap 1.5 detik huruf baru
    Speech.speak(letters[0]); // mulai dari huruf pertama
  };

  const pauseReading = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    Speech.stop();
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current); // clear on unmount
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.letter}>
        {letters[currentIndex]}
      </Text>

      <View style={styles.controls}>
        {!isPlaying ? (
          <TouchableOpacity onPress={startReading} style={styles.playButton}>
            <Text style={styles.playText}>▶ </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={pauseReading} style={styles.pauseButton}>
            <Text style={styles.pauseText}>⏸ </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center', // Tengah secara vertikal
      paddingHorizontal: 10,
    },
    letter: {
      fontSize: 100,
      fontWeight: 'bold',
      color: '#00796b',
      textAlign: 'center',
      marginBottom: 100,
    },
    controls: {
      position: 'absolute',
      bottom: 10, // Jarak dari bawah layar
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playButton: {
      backgroundColor: 'grey',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    playText: {
      color: 'white',
      fontSize: 20,
    },
    pauseButton: {
      backgroundColor: 'grey',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    pauseText: {
      color: 'white',
      fontSize: 20,
    },
  });
  
