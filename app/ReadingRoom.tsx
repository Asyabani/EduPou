import { AntDesign } from '@expo/vector-icons'; // Pastikan Anda sudah menginstal: expo install @expo/vector-icons
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function ReadingRoom() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  const startReading = () => {
    // Jika sudah bermain, jangan lakukan apa-apa untuk menghindari multiple intervals
    if (isPlaying) {
      return;
    }

    setIsPlaying(true);

    // Langsung ucapkan huruf yang sedang ditampilkan saat ini
    // Ini penting agar saat melanjutkan, suara langsung dari huruf yang benar
    Speech.speak(letters[currentIndex]);

    // Set interval untuk mengulang setiap 1.5 detik
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < letters.length) {
          // Ucapkan huruf berikutnya setelah currentIndex diperbarui
          Speech.speak(letters[nextIndex]);
          return nextIndex;
        } else {
          // Jika sudah mencapai akhir, hentikan interval dan reset state
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          // Opsi: Jika ingin otomatis kembali ke awal setelah selesai
          // setCurrentIndex(0);
          return prevIndex; // Tetap pada huruf terakhir yang ditampilkan
        }
      });
    }, 1500); // Setiap 1.5 detik huruf baru
  };

  const pauseReading = () => {
    clearInterval(intervalRef.current); // Hentikan interval
    setIsPlaying(false); // Set status bermain menjadi false
    Speech.stop(); // Hentikan suara yang sedang berjalan
  };

  const restartReading = () => {
    clearInterval(intervalRef.current); // Hentikan interval yang mungkin sedang berjalan
    Speech.stop(); // Hentikan suara
    setIsPlaying(false); // Pastikan status bermain false
    setCurrentIndex(0); // Atur kembali index ke 0 (huruf pertama)
  };

  useEffect(() => {
    // Cleanup function: pastikan interval dibersihkan saat komponen di-unmount
    return () => {
      clearInterval(intervalRef.current);
      Speech.stop(); // Hentikan juga speech saat komponen dilepas
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.letter}>
        {letters[currentIndex]}
      </Text>

      <View style={styles.controls}>
        {/* Tombol Restart */}
        <TouchableOpacity onPress={restartReading} style={styles.restartButton}>
          <AntDesign name="reload1" size={36} color="purple" />
        </TouchableOpacity>

        {/* Tombol Play/Pause */}
        {!isPlaying ? (
          <TouchableOpacity onPress={startReading} style={styles.playButton}>
            <AntDesign name="play" size={36} color="green" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={pauseReading} style={styles.pauseButton}>
            <AntDesign name="pause" size={36} color="orange" />
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
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    letter: {
      fontSize: 100,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 100,
      color: '#333', // Warna teks yang kontras dengan background
    },
    controls: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      flexDirection: 'row', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: 20, 
    },
    playButton: {
      backgroundColor: 'lightgreen',
      borderRadius: 60,
      padding: 15,
    },
    pauseButton: {
      backgroundColor: 'lightcoral',
      borderRadius: 60,
      padding: 15,
    },
    restartButton: {
      backgroundColor: '#DDA0DD', 
      borderRadius: 60,
      padding: 15,
    },
  });