import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GEMINI_API_KEY } from '@env';
import Markdown from 'react-native-markdown-display';
import { TextStyle } from 'react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

const sendMessage = async () => {
  if (!inputText.trim() || isLoading) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    text: inputText.trim(),
    isUser: true,
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, userMessage]);
  setInputText('');
  setIsLoading(true);

  try {
    // Utiliser le bon nom de modèle - gemini-1.5-flash ou gemini-1.5-pro
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage.text }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    // Vérifier le statut de la réponse
    if (!response.ok) {
      console.error('Erreur HTTP:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails de l\'erreur:', errorText);
      
      throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse complète de l\'API:', JSON.stringify(data, null, 2));

    // Extraction du texte de réponse
    let aiText = "Je n'ai pas compris.";

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        aiText = candidate.content.parts
          .map((part: any) => part.text)
          .filter(Boolean)
          .join('\n');
      }
    }

    // Vérifier si on a une réponse valide
    if (!aiText || aiText.trim() === '' || aiText === "Je n'ai pas compris.") {
      aiText = "L'IA n'a pas fourni de réponse valide.";
    }

    console.log('Texte final extrait:', aiText);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiText,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
  } catch (error) {
    console.error('Erreur détaillée:', error);

    let errorMessage = "Erreur lors de la communication avec l'IA.";
    
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        errorMessage = "Modèle non trouvé. Vérifiez le nom du modèle utilisé.";
      } else if (error.message.includes('API key') || error.message.includes('403')) {
        errorMessage = "Problème avec la clé API. Vérifiez votre configuration.";
      } else if (error.message.includes('429')) {
        errorMessage = "Trop de requêtes. Attendez un moment avant de réessayer.";
      } else if (error.message.includes('400')) {
        errorMessage = "Requête invalide. Vérifiez le format du message.";
      }
    }

    const errorMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: errorMessage,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsLoading(false);
  }
};

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View style={styles.messageHeader}>
        <Icon
          name={item.isUser ? 'user' : 'android'}
          size={16}
          color="#00ADB5"
        />
        <Text style={styles.messageTime}>
          {item.timestamp.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      {item.isUser ? (
        <Text style={styles.messageText}>{item.text}</Text>
      ) : (
        <Markdown style={markdownStyles}>{item.text}</Markdown>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assistant IA</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00ADB5" />
          <Text style={styles.loadingText}>L'IA réfléchit...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Tapez votre message..."
          placeholderTextColor="#666666"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Icon
            name="send"
            size={20}
            color={!inputText.trim() || isLoading ? '#666666' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#EEEEEE',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00ADB5',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#AAAAAA',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#EEEEEE',
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#AAAAAA',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1E1E1E',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#EEEEEE',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#00ADB5',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333333',
  },
});

// 🎨 Style Markdown (gras, italique, etc.)
const markdownStyles: { [key: string]: TextStyle } = {
  body: {
    color: '#EEEEEE',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  strong: {
    fontWeight: 'bold', 
    color: '#FFDD00',
  },
  em: {
    fontStyle: 'italic',
    color: '#AAAAAA',
  },
  paragraph: {
    marginBottom: 8,
  },
};

export default ChatScreen;
