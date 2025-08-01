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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // <- nouvelle importation
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

export default function ImageGeneratorScreen() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const sampleImages = [
    'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
    'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg',
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
    'https://images.pexels.com/photos/1426718/pexels-photo-1426718.jpeg',
    'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg',
    'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg',
    'https://images.pexels.com/photos/2100063/pexels-photo-2100063.jpeg',
    'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg',
  ];

  const generateImage = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    setTimeout(() => {
      const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
      setGeneratedImage(randomImage);
      setIsGenerating(false);
    }, 3000);
  };

  const resetGeneration = () => {
    setGeneratedImage(null);
    setPrompt('');
  };

  const shareImage = () => {
    console.log('Partage de l\'image');
  };

  const downloadImage = () => {
    console.log('Téléchargement de l\'image');
  };

  return (
    <View style={styles.container}>
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
            onPress={generateImage}
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
    </View>
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