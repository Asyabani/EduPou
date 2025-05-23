import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatusBar({ status }) {
  return (
    <View style={styles.container}>
      {Object.entries(status).map(([key, value]) => (
        <View key={key} style={styles.statusItem}>
          <Text style={styles.label}>🔹 {capitalize(key)}:</Text>
          <Text style={styles.value}>{String(value)}</Text>
        </View>
      ))}
    </View>
  );
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginVertical: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  label: {
    color: '#00bcd4',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  value: {
    color: 'dark',
    fontSize: 16,
  },
});
