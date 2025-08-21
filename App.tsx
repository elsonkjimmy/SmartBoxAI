import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import SplashScreen from 'react-native-splash-screen'; 
import 'react-native-reanimated';

export default function App() {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide(); 
    }, 500);
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
