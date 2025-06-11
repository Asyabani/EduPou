import React from 'react';
import { Platform, ProgressBarAndroid, ProgressViewIOS, StyleSheet, Text, View } from 'react-native';

export default function StatusBar({ status }) {
  const energy = status.energy ?? 0; // fallback jika tidak ada nilai energy

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🔋 Energy:</Text>
      {Platform.OS === 'android' ? (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={energy / 100}
          color="#00bcd4"
          style={styles.progressBar}
        />
      ) : (
        <ProgressViewIOS
          progress={energy / 100}
          progressTintColor="#00bcd4"
          style={styles.progressBar}
        />
      )}
      <Text style={styles.energyValue}>{energy}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  label: {
    color: '#00bcd4',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  energyValue: {
    marginTop: 6,
    alignSelf: 'flex-end',
    fontSize: 14,
    color: '#555',
  },
});
