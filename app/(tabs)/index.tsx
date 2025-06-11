import Bedroom from '@/app/Bedroom';
import DrawingRoom from '@/app/DrawingRoom';
import Gacha from '@/app/Gacha';
import MatchingGame from '@/app/MatchRoom';
import CountingRoom from '@/app/MathRoom';
import Puzzle from '@/app/PuzzleRoom';
import Library from '@/app/ReadingRoom';
import Character from '@/components/Character';
import { loadData, saveData } from '@/utils/storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Audio } from 'expo-av';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';



const rooms = [
  { name: 'Library', backgroundColor: '#E0F2F7' },
  { name: 'Math Room', backgroundColor: '#F0F4F8' },
  { name: 'Drawing Room', backgroundColor: '#ffffff' },
  { name: 'Matching', backgroundColor: '#e6f7ff' }, 
  { name: 'Bedroom', backgroundColor: 'dark' },
  { name: 'Puzzle', backgroundColor: '#ffffff' },
  { name: 'Gacha', backgroundColor: '#1a2a3a' },
];

// Get screen dimensions
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
    const [permissionStatus, setPermissionStatus] = useState(null);
    const [status, setStatus] = useState({ energy: 100 });
    const [roomIndex, setRoomIndex] = useState(0);
    const [drawColor, setDrawColor] = useState('#000000');
    const [isLightOn, setIsLightOn] = useState(true);
    const [isSleeping, setIsSleeping] = useState(false);
    const [showSleepModal, setShowSleepModal] = useState(false);
    const [showAutoSleepModal, setShowAutoSleepModal] = useState(false);


    const position = useRef(
      new Animated.ValueXY({
        x: windowWidth / 2 - 50,
        y: windowHeight - 150,
      })
    ).current;

    const playNotificationSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/notif.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

   useEffect(() => {
    (async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        setPermissionStatus(status);
        if (status !== 'granted') {
          alert('Permission not granted for notifications!');
        }
      } else {
        alert('Must use physical device for notifications');
      }
    })();
  }, []);

  // Load status from storage on mount
  useEffect(() => {
    (async () => {
      const savedStatus = await loadData();
      if (savedStatus) setStatus(savedStatus);
    })();
  }, []);

  // Save status on change
  useEffect(() => {
    saveData(status);
  }, [status]);

  // Handle sleeping logic when energy reaches zero
  useEffect(() => {
    if (status.energy <= 0 && !isSleeping) {
      setIsLightOn(false);
      setIsSleeping(true);
    }
  }, [status.energy]);

  // Regenerate energy while sleeping
  useEffect(() => {
    if (!isSleeping) return;

    const interval = setInterval(() => {
      setStatus((prev) => {
        const newEnergy = Math.min(prev.energy + 1, 100);
        if (newEnergy === 100) {
          setIsSleeping(false);
          setIsLightOn(true);
        }
        return { ...prev, energy: newEnergy };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSleeping]);

  // Decrease energy when awake
  useEffect(() => {
    if (isSleeping || status.energy <= 0) return;

    const interval = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        energy: Math.max(prev.energy - 1, 0),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, [isSleeping, status.energy]);

  // Auto-move to Bedroom if energy ≤ 10%
 useEffect(() => {
  if (status.energy <= 10 && roomIndex !== 4) {
    setRoomIndex(4);
    setShowAutoSleepModal(true);
    playNotificationSound();
  }
}, [status.energy, roomIndex]);


  // Register for push notifications (additional safeguard)
  useEffect(() => {
    (async () => {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for notifications!');
        }
      } else {
        alert('Must use physical device for Push Notifications');
      }
    })();
  }, []);

  const hasNotified = useRef(false);

  // Notify when energy hits 20%
  useEffect(() => {
    if (status.energy === 20 && !hasNotified.current) {
      hasNotified.current = true;
      Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Uh-oh, Low Energy!',
          body: "Your energy is down to 20%! Time to take a cozy nap in your Bedroom!"
        },
        trigger: { seconds: 0 },
      });
    }

    if (status.energy > 20) {
      hasNotified.current = false;
    }
  }, [status.energy]);


  // RESET CHAR POSITION WHEN ROOM CHANGES
  // useEffect(() => {
  //   resetPosition();
  // }, [roomIndex]);
  // const resetPosition = () => {
  //   position.setValue({ x: windowWidth / 2 - 50, y: windowHeight - 180 });
  // };

  // Determine which room is currently active
  const currentRoom = rooms[roomIndex];
  const isColorRoom = currentRoom.name === 'Drawing Room';
  const isSleepRoom = currentRoom.name === 'Bedroom';
  const isCountingRoom = currentRoom.name === 'Math Room';
  const isReadingRoom = currentRoom.name === 'Library';
  const isMatchRoom = currentRoom.name === 'Matching'; 
  const isPuzzleRoom = currentRoom.name === 'Puzzle'; 
  const isGachaRoom = currentRoom.name === 'Gacha'; 

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => !isMatchRoom,
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

  const prevRoom = () => {
    if (isSleeping) {
      setShowSleepModal(true);
      playNotificationSound();
      return; 
    }
    if (status.energy <= 10) {
      setRoomIndex(4); 
    } else {
      setRoomIndex((prev) => (prev === 0 ? rooms.length - 1 : prev - 1));
    }
  };

  const nextRoom = () => {
    if (isSleeping) {
      setShowSleepModal(true);
      playNotificationSound();
      return; 
    }
    if (status.energy <= 10) {
      setRoomIndex(4); 
    } else {
      setRoomIndex((prev) => (prev === rooms.length - 1 ? 0 : prev + 1));
    }
  };



  const colors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff69b4', '#8a2be2',
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: isSleepRoom
              ? isLightOn ? '#ccc' : '#000'
              : currentRoom.backgroundColor,
          },
        ]}
      >
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={prevRoom}
            style={[styles.navButton, { backgroundColor: isColorRoom || isMatchRoom || isPuzzleRoom || isReadingRoom || isCountingRoom ? 'grey' : 'rgba(255,255,255,0.3)' }]}
          >
            <Text style={[styles.navButtonText, { color: isColorRoom || isMatchRoom || isPuzzleRoom || isReadingRoom || isCountingRoom ? '#000' : 'white' }]}>◀</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: isColorRoom || isMatchRoom || isPuzzleRoom || isReadingRoom || isCountingRoom ? '#000' : 'white' }]}>
            {currentRoom.name}
          </Text>

          <TouchableOpacity
            onPress={nextRoom}
            style={[styles.navButton, { backgroundColor: isColorRoom || isMatchRoom || isPuzzleRoom || isReadingRoom || isCountingRoom ? 'grey' : 'rgba(255,255,255,0.3)' }]}
          >
            <Text style={[styles.navButtonText, { color: isColorRoom || isMatchRoom || isPuzzleRoom || isReadingRoom || isCountingRoom ? '#000' : 'white' }]}>▶</Text>
          </TouchableOpacity>
        </View>

        {isColorRoom && (
          <DrawingRoom drawColor={drawColor} setDrawColor={setDrawColor} />
        )}

        {isCountingRoom && <CountingRoom />}

        {isReadingRoom && <Library />}
        {isGachaRoom && <Gacha />}

        {isMatchRoom &&
         <MatchingGame />}

         {isPuzzleRoom &&
         <Puzzle />}

        {/* {!isMatchRoom && ( */}
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

        {isSleepRoom && (
          <Bedroom
            status={status}
            isLightOn={isLightOn}
            setIsLightOn={setIsLightOn}
            setIsSleeping={setIsSleeping}
          />
        )}
          {/* Modal notifikasi tidur */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showSleepModal}
          onRequestClose={() => setShowSleepModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>😴 Shhh... Sleep Time!</Text>
              <Text style={styles.modalText}>
                Your character is sleeping now. Please let them rest to regain energy!
              </Text>
              <TouchableOpacity
                onPress={() => setShowSleepModal(false)}
                style={styles.modalButton}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showAutoSleepModal}
          onRequestClose={() => setShowAutoSleepModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>😴 Energy Low! Time to Sleep</Text>
              <Text style={styles.modalText}>
                Your energy is below 10%. You have been moved to the Bedroom to rest.
              </Text>
              <TouchableOpacity
                onPress={() => setShowAutoSleepModal(false)}
                style={styles.modalButton}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Okay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFE8A3', 
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#444',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
  },
  modalButton: {
    backgroundColor: '#5A67D8',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
});