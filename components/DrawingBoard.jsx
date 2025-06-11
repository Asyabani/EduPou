import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function DrawingBoard({ color , strokeWidth }) {
  const [paths, setPaths] = React.useState([]);
  const [currentPath, setCurrentPath] = React.useState('');

  const handleTouchMove = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    setCurrentPath((prev) =>
      prev ? `${prev} L${locationX} ${locationY}` : `M${locationX} ${locationY}`
    );
  };

  const handleTouchStart = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    setCurrentPath(`M${locationX} ${locationY}`);
  };

  const handleTouchEnd = () => {
    if (currentPath) {
      setPaths((prev) => [...prev, { d: currentPath, color ,strokeWidth }]);
      setCurrentPath('');
    }
  };

  return (
    <View
      style={styles.drawingBoard}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleTouchStart}
      onResponderMove={handleTouchMove}
      onResponderRelease={handleTouchEnd}
    >
      <Svg height="100%" width="100%">
        {paths.map((p, i) => (
          <Path
            key={i}
            d={p.d}
            stroke={p.color}
            strokeWidth={p.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {currentPath ? (
          <Path
            d={currentPath}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  drawingBoard: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 80,
    backgroundColor: 'white',
    zIndex: 0,
  },
});
