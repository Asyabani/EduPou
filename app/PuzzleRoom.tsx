import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PIECES_CONFIG = [
  { id: 'p1', row: 0, col: 0, imgSrc: require('@/assets/images/l1.jpg') }, // Top-left piece
  { id: 'p2', row: 0, col: 1, imgSrc: require('@/assets/images/r1.jpg') }, // Top-right piece
  { id: 'p3', row: 1, col: 0, imgSrc: require('@/assets/images/l2.jpg') }, // Bottom-left piece
  { id: 'p4', row: 1, col: 1, imgSrc: require('@/assets/images/r2.jpg') }, // Bottom-right piece
];

const PUZZLE_ROWS = 2; 
const PUZZLE_COLS = 2; 
const PIECE_DIMENSION = 90; 

const PUZZLE_BOARD_MARGIN_TOP = 150; // Space from the top of the screen to the puzzle board
const SHUFFLE_AREA_TOP_MARGIN = 30; // Space between puzzle board and shuffle area
const SHUFFLE_AREA_ITEM_HORIZONTAL_MARGIN = 10; // Horizontal spacing between pieces in shuffle area
const SHUFFLE_AREA_ITEM_VERTICAL_MARGIN = 10;   // Vertical spacing between rows in shuffle area

const { width: windowWidth } = Dimensions.get('window');

// Helper function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- DraggablePiece Component ---
const DraggablePiece = ({ pieceInfo, onDrop, pieceLayout, isPlaced }) => {
  const pan = useRef(new Animated.ValueXY(isPlaced ? pieceLayout.correctPos : pieceLayout.initialPos)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !isPlaced,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        const finalX = pan.x._value; // This is the absolute X position on screen
        const finalY = pan.y._value; // This is the absolute Y position on screen

        const droppedCorrectly = onDrop(pieceInfo.id, finalX, finalY);

        if (!droppedCorrectly) {
          Animated.spring(pan, { toValue: pieceLayout.initialPos, useNativeDriver: false }).start();
        } else {
        }
      },
    })
  ).current;

  useEffect(() => {
    const targetPosition = isPlaced ? pieceLayout.correctPos : pieceLayout.initialPos;
    Animated.spring(pan, { toValue: targetPosition, useNativeDriver: false }).start();
  }, [isPlaced, pieceLayout.correctPos, pieceLayout.initialPos, pan]);

  return (
    <Animated.View
      style={[
        styles.pieceBase, 
        { width: PIECE_DIMENSION, height: PIECE_DIMENSION },
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        isPlaced ? styles.placedPiece : styles.draggablePiece,
      ]}
      {...(!isPlaced ? panResponder.panHandlers : {})}
    >
      <Image source={pieceInfo.imgSrc} style={styles.pieceImage} />
    </Animated.View>
  );
};

// --- Main Puzzle Component ---
export default function PuzzleRoom() {
  const [pieces, setPieces] = useState([]);
  const [dropZoneLayouts, setDropZoneLayouts] = useState([]);
  const [showWinMessage, setShowWinMessage] = useState(false);

  // Calculate dimensions and positions for the puzzle board
  const puzzleBoardWidth = PUZZLE_COLS * PIECE_DIMENSION;
  const puzzleBoardHeight = PUZZLE_ROWS * PIECE_DIMENSION;
  const puzzleBoardX = (windowWidth - puzzleBoardWidth) / 2;
  const puzzleBoardY = PUZZLE_BOARD_MARGIN_TOP;

  // Calculate dimensions and positions for the shuffle area (where pieces start)
  const shuffleAreaY = puzzleBoardY + puzzleBoardHeight + SHUFFLE_AREA_TOP_MARGIN;
  const shuffleAreaItemSlotWidth = PIECE_DIMENSION + SHUFFLE_AREA_ITEM_HORIZONTAL_MARGIN;


  const initializePuzzle = useCallback(() => {
    setShowWinMessage(false);

    // 1. Define Drop Zones (where pieces should go on the board)
    const dzLayouts = [];
    for (let r = 0; r < PUZZLE_ROWS; r++) {
      for (let c = 0; c < PUZZLE_COLS; c++) {
        const pieceConfigForSlot = PIECES_CONFIG.find(p => p.row === r && p.col === c);
        if (!pieceConfigForSlot) {
            console.warn(`No piece config found for row ${r}, col ${c}. Check PIECES_CONFIG.`);
            continue;
        }
        dzLayouts.push({
          id: `dz-${r}-${c}`,
          x: puzzleBoardX + c * PIECE_DIMENSION,
          y: puzzleBoardY + r * PIECE_DIMENSION,
          width: PIECE_DIMENSION,
          height: PIECE_DIMENSION,
          targetPieceId: pieceConfigForSlot.id,
        });
      }
    }
    setDropZoneLayouts(dzLayouts);

    // 2. Initialize Pieces (shuffled, with initial and correct positions)
    const shuffledPieceConfigs = shuffleArray([...PIECES_CONFIG]);
    const initialPiecesState = shuffledPieceConfigs.map((config, index) => {
      const numColsInShuffleArea = Math.floor(windowWidth / shuffleAreaItemSlotWidth);
      const shuffleRow = Math.floor(index / numColsInShuffleArea);
      const shuffleCol = index % numColsInShuffleArea;

      // Calculate initial X, Y for each piece in the shuffle area
      const initialX = shuffleCol * shuffleAreaItemSlotWidth + (windowWidth - numColsInShuffleArea * shuffleAreaItemSlotWidth) / 2;
      const initialY = shuffleAreaY + shuffleRow * (PIECE_DIMENSION + SHUFFLE_AREA_ITEM_VERTICAL_MARGIN);

      const correctSlot = dzLayouts.find(dz => dz.targetPieceId === config.id);
      if (!correctSlot) {
          console.warn(`No drop zone found for piece ${config.id}. Check PIECES_CONFIG and drop zone logic.`);
          return { ...config, layout: { initialPos: {x:0,y:0}, correctPos: {x:0,y:0} }, isPlaced: false}; // Fallback
      }

      return {
        ...config,
        layout: {
          initialPos: { x: initialX, y: initialY },
          correctPos: { x: correctSlot.x, y: correctSlot.y },
        },
        isPlaced: false,
      };
    });
    setPieces(initialPiecesState);
  }, [puzzleBoardX, puzzleBoardY, shuffleAreaY, windowWidth]); 

  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]); 
  const handleDropPiece = (pieceId, pieceFinalX, pieceFinalY) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.isPlaced) return false;

    const pieceCenterX = pieceFinalX + PIECE_DIMENSION / 2;
    const pieceCenterY = pieceFinalY + PIECE_DIMENSION / 2;

    const targetDropZone = dropZoneLayouts.find(dz => dz.targetPieceId === pieceId);

    if (targetDropZone) {
      const dz = targetDropZone;
      if (
        pieceCenterX >= dz.x &&
        pieceCenterX <= dz.x + dz.width &&
        pieceCenterY >= dz.y &&
        pieceCenterY <= dz.y + dz.height
      ) {
        setPieces(prevPieces => {
          const newPieces = prevPieces.map(p =>
            p.id === pieceId ? { ...p, isPlaced: true } : p
          );
          // Check for win condition
          if (newPieces.every(p => p.isPlaced)) {
            setShowWinMessage(true);
          }
          return newPieces;
        });
        return true; 
      }
    }
    return false;
  };

  const numShuffleRows = Math.ceil(PIECES_CONFIG.length / Math.floor(windowWidth / shuffleAreaItemSlotWidth));
  const resetButtonTop = shuffleAreaY + numShuffleRows * (PIECE_DIMENSION + SHUFFLE_AREA_ITEM_VERTICAL_MARGIN) + 20;


  return (
    <View style={styles.container}>
      {/* <Text style={styles.mainTitle}>Animal Puzzle</Text> */}

      <View style={styles.referenceImageContainer}>
        <Image
          source={require('@/assets/images/animalss.jpg')} 
          style={styles.referenceImage}
        />
        <Text style={styles.referenceTitle}>Goal</Text>
      </View>

      <View style={[styles.puzzleBoard, { width: puzzleBoardWidth, height: puzzleBoardHeight, left: puzzleBoardX, top: puzzleBoardY }]}>
        {dropZoneLayouts.map(dz => (
          <View
            key={dz.id}
            style={[
              styles.dropZone,
              {
                left: dz.x - puzzleBoardX, // Position relative to puzzleBoard's top-left
                top: dz.y - puzzleBoardY,   // Position relative to puzzleBoard's top-left
                width: dz.width,
                height: dz.height,
              },
            ]}
          />
        ))}
      </View>

      {/* Draggable Pieces */}
      {pieces.map(p => (
        <DraggablePiece
          key={p.id}
          pieceInfo={p}
          onDrop={handleDropPiece}
          pieceLayout={p.layout}
          isPlaced={p.isPlaced}
        />
      ))}

      {/* Win Message Modal */}
      {showWinMessage && (
        <View style={styles.winMessageContainer}>
          <Text style={styles.winMessageText}>🎉 You Solved It! 🎉</Text>
        </View>
      )}

      {/* Reset Button */}
      <TouchableOpacity onPress={initializePuzzle} style={[styles.resetButton, { top: resetButtonTop }]}>
        <Text style={styles.resetButtonText}>Reset Puzzle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // mainTitle: {
  //   fontSize: 28,
  //   fontWeight: 'bold',
  //   color: '#00796B', 
  //   textAlign: 'center',
  //   marginTop: 40, 
  //   marginBottom: 15,
  // },
  puzzleBoard: {
    position: 'absolute', 
    borderWidth: 3,
    borderColor: '#004D40', 
    backgroundColor: 'rgba(178, 223, 219, 0.4)', 
    borderRadius: 8,
  },
  dropZone: {
    position: 'absolute', 
    borderWidth: 1,
    borderColor: '#4DB6AC',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  pieceBase: { 
    position: 'absolute', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggablePiece: {
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  placedPiece: {
    // Styles for pieces that are correctly placed (e.g., no shadow, or different border)
    elevation: 0,
  },
  pieceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4, // Optional: slightly rounded corners for pieces
  },
  winMessageContainer: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '60%', // Centered vertically
    backgroundColor: '#2E7D32', // A positive green color
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10, // Make it pop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  winMessageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  resetButton: {
    position: 'absolute', // Positioned dynamically based on shuffle area height
    alignSelf: 'center',
    backgroundColor: '#00796B', // Teal color
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25, // Rounded button
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  referenceImageContainer: {
    position: 'absolute',
    top: 30, 
    right: 15,
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BDBDBD', 
    elevation: 2,
  },
  referenceImage: {
    width: PIECE_DIMENSION * 0.75, 
    height: PIECE_DIMENSION * 0.75,
    borderRadius: 6,
  },
  referenceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004D40', // Dark teal
    marginTop: 4,
  },
});