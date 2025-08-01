import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, PermissionsAndroid, Platform
} from 'react-native';
import AudioRecord from 'react-native-audio-record';
//import Clipboard from '@react-native-clipboard/clipboard';
import Tts from 'react-native-tts';
import Feather from 'react-native-vector-icons/Feather';
import Animated, {
  FadeInUp, FadeIn, useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, interpolate
} from 'react-native-reanimated';

export default function VoiceToTextScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  const pulse = useSharedValue(0);
  const wave = useSharedValue(0);

  useEffect(() => {
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: 'voice.wav',
    });
  }, []);

  useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
      wave.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    } else {
      pulse.value = withTiming(0, { duration: 300 });
      wave.value = withTiming(0, { duration: 300 });
    }
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0,1], [1,1.1]) }],
    opacity: interpolate(pulse.value, [0,1], [1,0.7]),
  }));
  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(wave.value, [0,1], [0.8,1.2]) }],
    opacity: interpolate(wave.value, [0,1], [0.3,0.1]),
  }));

  const start = async () => {
    if (Platform.OS === 'android') {
      const perm = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (perm !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission required', 'Cannot record without permission.');
        return;
      }
    }
    setTranscript('');
    AudioRecord.start();
    setIsRecording(true);
  };

  const stop = async () => {
    setIsRecording(false);
    setIsProcessing(true);

    const filePath = await AudioRecord.stop();

    // *Simulate processing* — replace this with real STT call
    setTimeout(() => {
      const samples = [
        'This is a transcribed sample.',
        'Another transcription result for demo purposes.',
      ];
      setTranscript(samples[Math.floor(Math.random() * samples.length)]);
      setIsProcessing(false);
    }, 2500);
  };

  const copy = () => {
    if (transcript) {
     // Clipboard.setString(transcript);
      Alert.alert('Copied', 'Transcript copied to clipboard.');
    }
  };

  const speak = () => {
    if (transcript) Tts.speak(transcript);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Animated.View entering={FadeInUp.duration(800)} style={s.header}>
        <Feather name="mic" size={32} color="#00ADB5" />
        <Text style={s.title}>Voice Transcription</Text>
        <Text style={s.subtitle}>
          Record and convert your voice to text
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(800).delay(200)} style={s.recordSection}>
        <View style={s.micWrapper}>
          {isRecording && (
            <>
              <Animated.View style={[s.wave, s.wave1, waveStyle]} />
              <Animated.View style={[s.wave, s.wave2, waveStyle]} />
            </>
          )}
          <Animated.View style={[s.micBtnWrapper, pulseStyle]}>
            <TouchableOpacity
              style={[s.micBtn, isRecording && s.micActive]}
              onPress={isRecording ? stop : start}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : (
                <Feather name={isRecording ? 'mic-off' : 'mic'} size={48} color="#FFF" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
        <Text style={s.status}>
          {isProcessing
            ? 'Processing...'
            : isRecording
            ? 'Recording...'
            : 'Tap to record'}
        </Text>
      </Animated.View>

      {transcript ? (
        <Animated.View entering={FadeIn.duration(600)} style={s.result}>
          <Text style={s.text}>{transcript}</Text>
          <View style={s.actions}>
            <TouchableOpacity style={s.actBtn} onPress={copy}>
              <Feather name="copy" size={20} color="#00ADB5" />
            </TouchableOpacity>
            <TouchableOpacity style={s.actBtn} onPress={speak}>
              <Feather name="volume-2" size={20} color="#00ADB5" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { 
    flex: 1,
     backgroundColor: '#121212'
     },
  content: { 
    padding: 20,
     flexGrow: 1 
    },
  header: { 
    alignItems: 'center',
     marginVertical: 20 
    },
  title: { 
    fontSize: 24,
     color: '#EEEEEE',
    marginTop: 12 
    },
  subtitle: { 
    fontSize: 14, 
    color: '#AAAAAA', 
    textAlign: 'center' 
  },
  recordSection: {
     alignItems: 'center', 
    marginTop: 40
   },
  micWrapper: {
     justifyContent: 'center',
     alignItems: 'center' 
    },
  wave: { position: 'absolute', 
    borderWidth: 2, 
    borderColor: '#00ADB5', 
    borderRadius: 100 
  },
  wave1: { 
    width: 160, 
    height: 160 
  },
  wave2: { 
    width: 200, 
    height: 200 
  },
  micBtnWrapper: {},
  micBtn: {
    width: 120, height: 120,
     borderRadius: 60,
    backgroundColor: '#00ADB5',
     justifyContent: 'center', 
     alignItems: 'center'
  },
  micActive: { backgroundColor: '#FF4444' },
  status: { marginTop: 16, fontSize: 16, color: '#EEEEEE' },
  result: { marginTop: 30,
     padding: 16, 
     backgroundColor: '#1E1E1E',
      borderRadius: 12 },
  text: { color: '#EEEEEE' },
  actions: {
     flexDirection: 'row',
      justifyContent: 'space-around'
      , marginTop: 16
     },
  actBtn: {
    width: 48, 
    height: 48, 
    borderRadius: 24,
    backgroundColor: '#2A2A2A', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
});
