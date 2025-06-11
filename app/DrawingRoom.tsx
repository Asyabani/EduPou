import DrawingBoard from '@/components/DrawingBoard';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';


export default function DrawingRoom({ drawColor, setDrawColor }) {
  const [strokeWidth, setStrokeWidth] = React.useState(4);
  const colors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff69b4', '#8a2be2',
    '#ffa500', '#00ffff', '#a52a2a', '#800080', '#008000', '#000080', '#ffc0cb',
  ];

  return (
    <>
      <DrawingBoard color={drawColor} strokeWidth={strokeWidth} />

        <View style={styles.sliderWrapper}>
          <Slider
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={strokeWidth}
            onValueChange={setStrokeWidth}
            style={{ width: '100%' }}
          />
        </View>
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
    elevation: 6,
    shadowColor: '#000', 
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
  sliderWrapper: {
  marginTop: 20,
  paddingHorizontal: 20,
},

});
