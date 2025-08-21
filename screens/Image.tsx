import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // <- nouvelle importation
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { generateImageFromPrompt } from '../services/api'; // adapte le chemin
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const { width: screenWidth } = Dimensions.get('window');

export default function ImageGeneratorScreen() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

   // Permission request function (Android)
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permission de stockage',
          message: 'L\'application a besoin de cette permission pour sauvegarder les images',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Erreur demande permission :', err);
      Alert.alert('Erreur', 'Impossible de demander la permission de stockage');
      return false;
    }
  };

  // Télécharger l'image dans Téléchargements
  const downloadImage = async () => {
    if (!generatedImage) {
      Alert.alert('Erreur', 'Aucune image à télécharger.');
      return;
    }

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission refusée', 'Impossible de sauvegarder l\'image sans permission.');
      return;
    }

    try {
      if (!generatedImage.startsWith('data:image/')) {
        Alert.alert('Erreur', 'Le format de l’image est invalide.');
        return;
      }

      const base64Data = generatedImage.replace(/^data:image\/\w+;base64,/, '');
      const fileName = `image-gen-${Date.now()}.png`;
      const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      await RNFS.writeFile(path, base64Data, 'base64');

      const exists = await RNFS.exists(path);
      if (!exists) throw new Error('Le fichier n’a pas été créé');

      Alert.alert('Succès', `Image sauvegardée dans le dossier Téléchargements.`);
    } catch (error) {
      console.error('Erreur téléchargement :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
    }
  };

  // Générer l'image via l'API
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une description.');
      return;
    }
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const image = await generateImageFromPrompt(prompt);
      setGeneratedImage(image);
    } catch (error) {
      Alert.alert('Erreur', 'La génération a échoué.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setGeneratedImage(null);
    setPrompt('');
  };

  const shareImage = async () => {
  if (!generatedImage) return;

  try {
    const base64Data = generatedImage.replace(/^data:image\/png;base64,/, '');
    const fileName = `generated-image-${Date.now()}.png`;
    const path = `${RNFS.CachesDirectoryPath}/${fileName}`;

    // Sauvegarder temporairement l'image pour le partage
    await RNFS.writeFile(path, base64Data, 'base64');

    // Ouvrir la fenêtre de partage
    await Share.open({
      url: 'file://' + path,
      type: 'image/png',
      filename: fileName,
      failOnCancel: false,
    });

  } catch (error) {
    console.error('Erreur partage :', error);
    Alert.alert('Erreur', 'Le partage a échoué.');
  }
};


  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="palette" size={24} color="#00ADB5" />
        </View>
        <Text style={styles.headerTitle}>Générateur d'image IA</Text>
        <Text style={styles.headerSubtitle}>Créez des images avec vos idées</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Section */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.inputSection}>
          <Text style={styles.inputLabel}>Décrivez votre image</Text>
          <TextInput
            style={styles.textInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Ex: Un chat mignon dans un jardin fleuri, style aquarelle..."
            placeholderTextColor="#888888"
            multiline
            maxLength={200}
            editable={!isGenerating}
          />
          <Text style={styles.characterCount}>{prompt.length}/200</Text>
          
          <TouchableOpacity
            style={[styles.generateButton, (!prompt.trim() || isGenerating) && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#EEEEEE" />
            ) : (
              <MaterialCommunityIcons name="palette" size={20} color="#EEEEEE" />
            )}
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Génération...' : 'Créer l\'image'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Loading State */}
        {isGenerating && (
          <Animated.View entering={FadeIn.duration(600)} style={styles.loadingSection}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ADB5" />
              <Text style={styles.loadingText}>L'IA crée votre image...</Text>
              <Text style={styles.loadingSubtext}>Cela peut prendre quelques secondes</Text>
            </View>
          </Animated.View>
        )}

        {/* Generated Image */}
        {generatedImage && !isGenerating && (
          <Animated.View entering={FadeIn.duration(800)} style={styles.imageSection}>
            <Text style={styles.resultTitle}>Image générée</Text>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: generatedImage }}
                style={styles.generatedImage}
                resizeMode="cover"
              />
            </View>
            
            {/* Prompt Used */}
            <View style={styles.promptContainer}>
              <Text style={styles.promptLabel}>Prompt utilisé :</Text>
              <Text style={styles.promptText}>"{prompt}"</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={shareImage}>
                <MaterialCommunityIcons name="share" size={20} color="#00ADB5" />
                <Text style={styles.actionButtonText}>Partager</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={downloadImage}>
                <MaterialCommunityIcons name="download" size={20} color="#00ADB5" />
                <Text style={styles.actionButtonText}>Télécharger</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={resetGeneration}>
                <MaterialCommunityIcons name="rotate-left" size={20} color="#00ADB5" />
                <Text style={styles.actionButtonText}>Nouveau</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Placeholder when no image */}
        {!generatedImage && !isGenerating && (
          <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.placeholderSection}>
            <View style={styles.placeholderContainer}>
              <MaterialCommunityIcons name="palette" size={48} color="#444444" />
              <Text style={styles.placeholderTitle}>Aucune image générée</Text>
              <Text style={styles.placeholderText}>
                Décrivez l'image que vous souhaitez créer et appuyez sur "Créer l'image"
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Tips */}
        {!generatedImage && !isGenerating && (
          <Animated.View entering={FadeInUp.duration(600).delay(600)} style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>Conseils pour de meilleurs résultats :</Text>
            <Text style={styles.tipsText}>
              • Soyez précis dans votre description{'\n'}
              • Mentionnez le style artistique (réaliste, cartoon, aquarelle...){'\n'}
              • Décrivez les couleurs, l'ambiance et les détails{'\n'}
              • Utilisez des mots-clés visuels forts
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EEEEEE',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputSection: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EEEEEE',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#EEEEEE',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#444444',
  },
  characterCount: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: '#00ADB5',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#2A2A2A',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EEEEEE',
    marginLeft: 8,
  },
  loadingSection: {
    marginBottom: 24,
  },
  loadingContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00ADB5',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EEEEEE',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generatedImage: {
    width: screenWidth - 40,
    height: screenWidth - 40,
  },
  promptContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00ADB5',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#EEEEEE',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#00ADB5',
    marginTop: 6,
    fontWeight: '600',
  },
  placeholderSection: {
    marginBottom: 24,
  },
  placeholderContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    borderStyle: 'dashed',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ADB5',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#AAAAAA',
  },
});