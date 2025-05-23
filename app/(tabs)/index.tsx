import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import Character from '@/components/Character'; // Character component (Pou)
import { loadData, saveData } from '@/utils/storage'; // AsyncStorage helpers
import ColoringRoom from '@/app/ColoringRoom';
import Bedroom from '@/app/Bedroom';
import CountingRoom from '@/app/MathRoom';
import Library from '@/app/ReadingRoom';

// Define room list and background colors
const rooms = [
  { name: 'Library', backgroundColor: '#6a9fb5' },
  { name: 'Math Room', backgroundColor: '#f0a500' },
  { name: 'Drawing Room', backgroundColor: '#ffffff' },
  { name: 'Kitchen', backgroundColor: '#3cb371' },
  { name: 'Bedroom', backgroundColor: 'dark' },
];

// Get screen dimensions
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function App() {
  // Initial status values
  const [status, setStatus] = useState({
    hunger: 100,
    energy: 100,
    cleanliness: 100,
    happiness: 100,
  });

  const [roomIndex, setRoomIndex] = useState(0); // Current room index
  const [drawColor, setDrawColor] = useState('#000000'); // Drawing color
  const [isLightOn, setIsLightOn] = useState(true); // Bedroom light toggle
  const position = useRef(new Animated.ValueXY()).current; // Character position

  // Load status from storage on first render
  useEffect(() => {
    (async () => {
      const savedStatus = await loadData();
      if (savedStatus) setStatus(savedStatus);
    })();
  }, []);

  // Save status every time it changes
  useEffect(() => {
    saveData(status);
  }, [status]);

  // Reset character position when room changes
  useEffect(() => {
    resetPosition();
  }, [roomIndex]);

  // Reset character to default position
  const resetPosition = () => {
    position.setValue({ x: windowWidth / 2 - 50, y: windowHeight - 180 });
  };

  // Pan responder to drag character around the screen
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          {
            dx: position.x,
            dy: position.y,
          },
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        position.flattenOffset();

        // Clamp character within screen bounds
        let x = position.x._value;
        let y = position.y._value;
        if (x < 0) x = 0;
        if (x > windowWidth - 100) x = windowWidth - 100;
        if (y < 0) y = 0;
        if (y > windowHeight - 150) y = windowHeight - 150;

        position.setValue({ x, y });
      },
    })
  ).current;

  // Navigate to previous room
  const prevRoom = () => {
    setRoomIndex((prev) => (prev === 0 ? rooms.length - 1 : prev - 1));
  };

  // Navigate to next room
  const nextRoom = () => {
    setRoomIndex((prev) => (prev === rooms.length - 1 ? 0 : prev + 1));
  };

  // Determine which room is currently active
  const currentRoom = rooms[roomIndex];
  const isColorRoom = currentRoom.name === 'Drawing Room';
  const isSleepRoom = currentRoom.name === 'Bedroom';
  const isCountingRoom = currentRoom.name === 'Math Room';
  const isReadingRoom = currentRoom.name === 'Library';

  // List of colors used in Drawing Room
  const colors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff69b4', '#8a2be2',
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isSleepRoom
            ? isLightOn ? '#ccc' : '#000' // Dark background if lights off in Bedroom
            : currentRoom.backgroundColor, // Otherwise use room color
        },
      ]}
    >
      {/* Top Navigation Bar */}
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={prevRoom}
          style={[styles.navButton, { backgroundColor: isColorRoom ? 'grey' : 'rgba(255,255,255,0.3)' }]}
        >
          <Text style={[styles.navButtonText, { color: isColorRoom ? '#000' : 'white' }]}>◀</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: isColorRoom ? '#000' : 'white' }]}>
          {currentRoom.name}
        </Text>

        <TouchableOpacity
          onPress={nextRoom}
          style={[styles.navButton, { backgroundColor: isColorRoom ? 'grey' : 'rgba(255,255,255,0.3)' }]}
        >
          <Text style={[styles.navButtonText, { color: isColorRoom ? '#000' : 'white' }]}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Drawing Room */}
      {isColorRoom && (
        <ColoringRoom drawColor={drawColor} setDrawColor={setDrawColor} />
      )}

      {/* Math Room */}
      {isCountingRoom && <CountingRoom />}

      {/* Library (Reading Room) */}
      {isReadingRoom && <Library />}

      {/* Character - always visible and draggable */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.characterWrapper,
          {
            transform: position.getTranslateTransform(),
          },
        ]}
      >
        <Character status={status} isSleeping={isSleepRoom && !isLightOn} />
      </Animated.View>

      {/* Bedroom - display light switch and status bars */}
      {isSleepRoom && (
        <Bedroom
          status={status}
          isLightOn={isLightOn}
          setIsLightOn={setIsLightOn}
        />
      )}
    </SafeAreaView>
  );
}

// Styles for the app
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  navigation: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
    zIndex: 10,
  },

  navButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
  },

  navButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  characterWrapper: {
    position: 'absolute',
    width: 100,
    height: 100,
    zIndex: 30,
  },
});
