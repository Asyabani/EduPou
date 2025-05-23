import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveData = async (data) => {
  try {
    await AsyncStorage.setItem('POU_STATUS', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save:', e);
  }
};

export const loadData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('POU_STATUS');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to load:', e);
    return null;
  }
};
