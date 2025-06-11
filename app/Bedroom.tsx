import StatusBar from '@/components/StatusBar';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function Bedroom({ isLightOn, setIsLightOn,status,setIsSleeping }) {
  
  return (
    <>
    <StatusBar status={status} />
    <View style={styles.container}>
      <View style={styles.spacer} /> 

      <TouchableOpacity
        onPress={() => {
          const nextLightState = !isLightOn;
          setIsLightOn(nextLightState);
          setIsSleeping(!nextLightState); // tidur kalau lampu dimatikan
        }}

        style={[styles.lightButton, isLightOn ? styles.lightOn : styles.lightOff]}
        activeOpacity={0.7}
      >
        <Icon
          name="lightbulb"
          size={36}
          color={isLightOn ? '#FFD700' : '#555'} 
          solid={isLightOn} 
        />
      </TouchableOpacity>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 10,
    justifyContent: 'flex-end', 
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  lightButton: {
    padding: 12,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  lightOn: {
    backgroundColor: '#333', 
  },
  lightOff: {
    backgroundColor: '#111',
  },
});

