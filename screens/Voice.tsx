import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, PermissionsAndroid, Platform} from 'react-native';
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';
import Tts from 'react-native-tts';
import Feather from 'react-native-vector-icons/Feather';
import Animated, {
  FadeInUp, FadeIn, useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, interpolate
} from 'react-native-reanimated';
import { GEMINI_API_KEY } from '@env';
import Clipboard from '@react-native-clipboard/clipboard';

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

  // Fonction pour convertir audio en base64
  const audioToBase64 = async (filePath: string): Promise<string> => {
    try {
      const base64Audio = await RNFS.readFile(filePath, 'base64');
      return base64Audio;
    } catch (error) {
      console.error('Erreur conversion base64:', error);
      throw error;
    }
  };

  // Transcription avec Google Speech-to-Text API
  /*const transcribeWithGoogle = async (audioBase64: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS', // ou 'LINEAR16' selon votre format
              sampleRateHertz: 16000,
              languageCode: 'fr-FR', // Français
              enableAutomaticPunctuation: true,
            },
            audio: {
              content: audioBase64,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].alternatives[0].transcript;
      }
      
      return "Aucune transcription trouvée.";
    } catch (error) {
      console.error('Erreur transcription Google:', error);
      throw error;
    }
  };*/

  // Alternative avec Gemini (si Speech API ne marche pas)
  const transcribeWithGemini = async (audioBase64: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Transcris cet audio en français:"
              }, {
                inline_data: {
                mime_type: "audio/wav",
                data: audioBase64
              }
              }]
            }]
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur Gemini: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      
      return "Aucune transcription trouvée.";
    } catch (error) {
      console.error('Erreur transcription Gemini:', error);
      throw error;
    }
  };

  const start = async () => {
    if (Platform.OS === 'android') {
      const perm = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (perm !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission requise', 'Impossible d\'enregistrer sans permission.');
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

    try {
      const filePath = await AudioRecord.stop();
      console.log('Fichier audio:', filePath);

      // Convertir en base64
      const audioBase64 = await audioToBase64(filePath);
      
      // Essayer d'abord avec Google Speech-to-Text
      let transcription = '';
      try {
        transcription = await transcribeWithGemini(audioBase64);
      } catch (googleError) {
        console.log('Google Speech failed, trying Gemini...');
        // Fallback vers Gemini
        transcription = await transcribeWithGemini(audioBase64);
      }

      setTranscript(transcription);
      
    } catch (error) {
      console.error('Erreur transcription:', error);
      setTranscript('Erreur lors de la transcription. Réessayez.');
      Alert.alert('Erreur', 'Impossible de transcrire l\'audio.');
    } finally {
      setIsProcessing(false);
    }
  };

const copy = async () => {
  console.log("copy pressed"); // Pour vérifier que le bouton fonctionne
  if (transcript) {
    Clipboard.setString(transcript);
    Alert.alert('Copié', 'Transcription copiée dans le presse-papiers.');
  } else {
    console.log("Transcript vide");
    Alert.alert('Erreur', 'Aucun texte à copier.');
  }
};
 


  const speak = () => {
    if (transcript) {
      Tts.setDefaultLanguage('fr-FR');
      Tts.speak(transcript);
    }
  };
  

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Animated.View entering={FadeInUp.duration(800)} style={s.header}>
        <Feather name="mic" size={32} color="#00ADB5" />
        <Text style={s.title}>Transcription Vocale</Text>
        <Text style={s.subtitle}>
          Enregistrez et convertissez votre voix en texte
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
            ? 'Transcription en cours...'
            : isRecording
            ? 'Enregistrement...'
            : 'Appuyez pour enregistrer'}
        </Text>
      </Animated.View>

      {transcript ? (
        <Animated.View entering={FadeIn.duration(600)} style={s.result}>
          <Text style={s.resultTitle}>Transcription :</Text>
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
    marginTop: 12,
    fontWeight: 'bold'
  },
  subtitle: { 
    fontSize: 14, 
    color: '#AAAAAA', 
    textAlign: 'center',
    marginTop: 8
  },
  recordSection: {
    alignItems: 'center', 
    marginTop: 40
  },
  micWrapper: {
    justifyContent: 'center',
    alignItems: 'center' 
  },
  wave: { 
    position: 'absolute', 
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
    width: 120, 
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00ADB5',
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#00ADB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micActive: { 
    backgroundColor: '#FF4444'
  },
  status: { 
    marginTop: 16, 
    fontSize: 16, 
    color: '#EEEEEE',
    fontWeight: '500'
  },
  result: { 
    marginTop: 30,
    padding: 20, 
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333'
  },
  resultTitle: {
    color: '#00ADB5',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  text: { 
    color: '#EEEEEE',
    fontSize: 16,
    lineHeight: 24
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  },
  actBtn: {
    width: 48, 
    height: 48, 
    borderRadius: 24,
    backgroundColor: '#2A2A2A', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#404040'
  },
});