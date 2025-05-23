import React from 'react';
import { Image,View } from 'react-native';

export default function Character({ status, isSleeping }) {
  const characterImage = isSleeping
    ? require('../assets/images/Pou_Sleep.png')
    : require('../assets/images/Pou.png');

  return (
    <View>
   <Image
        source={characterImage}
        style={{
          width: isSleeping ? 126 : 120,
          height: isSleeping ? 126 : 120,
        }}
        resizeMode="contain"
      />
    </View>
  );
}
