import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Text } from 'react-native';
import DrawingBoard from '@/components/DrawingBoard';
import { MaterialIcons } from '@expo/vector-icons'; // Icon library populer

export default function ColoringRoom({ drawColor, setDrawColor }) {
  const colors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff69b4', '#8a2be2',
    '#ffa500', '#00ffff', '#a52a2a', '#800080', '#008000', '#000080', '#ffc0cb',
  ];

  return (
    <>
      <DrawingBoard color={drawColor} />

      <View style={styles.colorPickerWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.colorPicker}
        >
          {colors.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setDrawColor(c)}
              style={[
                styles.colorButton,
                { backgroundColor: c },
                c === drawColor && styles.selectedColorButton,
              ]}
            >
              {/* Icon di tengah lingkaran */}
              <MaterialIcons 
                name="brush" 
                size={24} 
                color={c === drawColor ? '#fff' : '#000'} 
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  colorPickerWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 10,
    right: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 6, // shadow di android
    shadowColor: '#000', // shadow di iOS
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  colorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorButton: {
    borderWidth: 3,
    borderColor: '#000',
  },
});
