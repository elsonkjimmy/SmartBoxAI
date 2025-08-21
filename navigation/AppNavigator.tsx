import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/Home';
import ChatScreen from '../screens/ChatAI';
import VoiceScreen from '../screens/Voice';
import ImageScreen from '../screens/Image';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333333',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#00ADB5',
        tabBarInactiveTintColor: '#888888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Chat':
              iconName = 'chatbubbles-outline';
              break;
            case 'Voice':
              iconName = 'mic-outline';
              break;
            case 'Image':
              iconName = 'image-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat IA' }} />
      <Tab.Screen name="Voice" component={VoiceScreen} options={{ title: 'Voix' }} />
      <Tab.Screen name="Image" component={ImageScreen} options={{ title: 'Image' }} />
    </Tab.Navigator>
  );
}
