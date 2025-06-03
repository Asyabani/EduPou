import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export default function Character({ status, isSleeping }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const zzzAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Transisi fade ketika gambar berubah
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSleeping]);

  useEffect(() => {
    if (isSleeping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(zzzAnim, {
            toValue: -30,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(zzzAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      zzzAnim.stopAnimation();
    }
  }, [isSleeping]);

  const characterImage = isSleeping
    ? require('@/assets/images/sleep.png')
    : require('@/assets/images/live.png');

  return (
    <View style={styles.container}>
      <Animated.Image
        source={characterImage}
        style={[
          styles.image,
          {
            width: isSleeping ? 106 : 100,
            height: isSleeping ? 106 : 100,
            opacity: fadeAnim,
          },
        ]}
        resizeMode="contain"
      />
      {isSleeping && (
        <Animated.Text
          style={[
            styles.zzz,
            {
              transform: [{ translateY: zzzAnim }],
              opacity: zzzAnim.interpolate({
                inputRange: [-30, 0],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          Zzz...
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    zIndex: 1,
  },
  zzz: {
    position: 'absolute',
    top: -20,
    right: -20,
    fontSize: 18,
    color: '#aaa',
    fontStyle: 'italic',
  },
});
