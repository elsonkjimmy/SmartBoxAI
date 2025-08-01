import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen({ navigation }: Props) {
  const features = [
    {
      id: 'chat',
      title: 'Chat with AI',
      subtitle: 'Ask anything to the assistant',
      icon: 'message-circle',
      route: 'Chat',
      delay: 100,
    },
    {
      id: 'voice',
      title: 'Voice → Text',
      subtitle: 'Transcribe your voice to text',
      icon: 'mic',
      route: 'Voice',
      delay: 200,
    },
    {
      id: 'image',
      title: 'Generate Image',
      subtitle: 'Create images from ideas',
      icon: 'image',
      route: 'Image',
      delay: 300,
    },
  ] as const;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <View style={styles.logoContainer}>
            <Feather name="zap" size={32} color="#00ADB5" />
            <Text style={styles.appName}>SmartBox AI</Text>
          </View>
          <Text style={styles.subtitle}>Your personal AI toolbox</Text>
        </Animated.View>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          {features.map((feature) => (
            <AnimatedTouchableOpacity
              key={feature.id}
              entering={FadeInUp.duration(600).delay(feature.delay)}
              style={styles.card}
              onPress={() => navigation.navigate(feature.route)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Feather name={feature.icon} size={28} color="#FFFFFF" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{feature.title}</Text>
                  <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
                </View>
              </View>
            </AnimatedTouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EEEEEE',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#00ADB5',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  textContainer: {
    flex: 1,
    marginLeft: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EEEEEE',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});
