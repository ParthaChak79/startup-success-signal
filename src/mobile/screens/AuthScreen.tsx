import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuthContext} from '../contexts/AuthContext';
import {useTheme} from '../contexts/ThemeContext';

const AuthScreen = () => {
  const navigation = useNavigation();
  const {signIn, signUp} = useAuthContext();
  const {theme} = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const styles = getStyles(theme);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const {error} = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          isSignUp ? 'Account created successfully!' : 'Signed in successfully!',
        );
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.authButton}
          onPress={handleAuth}
          disabled={isLoading}>
          <Text style={styles.authButtonText}>
            {isLoading
              ? 'Loading...'
              : isSignUp
              ? 'Sign Up'
              : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchButtonText}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : 'Need an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      textAlign: 'center',
      marginBottom: 40,
    },
    input: {
      backgroundColor: theme === 'dark' ? '#333333' : '#f3f4f6',
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      marginBottom: 15,
    },
    authButton: {
      backgroundColor: '#6366f1',
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    authButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    switchButton: {
      marginTop: 20,
      alignItems: 'center',
    },
    switchButtonText: {
      color: '#6366f1',
      fontSize: 14,
    },
  });

export default AuthScreen;