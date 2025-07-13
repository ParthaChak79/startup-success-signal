import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';

// Import mobile-specific contexts and providers
import {AuthProvider} from './contexts/AuthContext';
import {ThemeProvider} from './contexts/ThemeContext';

// Import mobile screens
import HomeScreen from './screens/HomeScreen';
import PitchDeckAnalysisScreen from './screens/PitchDeckAnalysisScreen';
import AuthScreen from './screens/AuthScreen';
import MyStartupsScreen from './screens/MyStartupsScreen';
import StartupDetailsScreen from './screens/StartupDetailsScreen';
import StartupIdeasGeneratorScreen from './screens/StartupIdeasGeneratorScreen';
import GlobalStartupsScreen from './screens/GlobalStartupsScreen';
import IndianStartupsScreen from './screens/IndianStartupsScreen';

// Import polyfills for React Native
import 'react-native-url-polyfill/auto';

const Stack = createNativeStackNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Home"
                  screenOptions={{
                    headerStyle: {
                      backgroundColor: '#6366f1',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                    },
                  }}>
                  <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{title: 'Startup Success Index'}}
                  />
                  <Stack.Screen
                    name="PitchDeckAnalysis"
                    component={PitchDeckAnalysisScreen}
                    options={{title: 'Pitch Deck Analysis'}}
                  />
                  <Stack.Screen
                    name="Auth"
                    component={AuthScreen}
                    options={{title: 'Sign In'}}
                  />
                  <Stack.Screen
                    name="MyStartups"
                    component={MyStartupsScreen}
                    options={{title: 'My Startups'}}
                  />
                  <Stack.Screen
                    name="StartupDetails"
                    component={StartupDetailsScreen}
                    options={{title: 'Startup Details'}}
                  />
                  <Stack.Screen
                    name="StartupIdeasGenerator"
                    component={StartupIdeasGeneratorScreen}
                    options={{title: 'Generate Ideas'}}
                  />
                  <Stack.Screen
                    name="GlobalStartups"
                    component={GlobalStartupsScreen}
                    options={{title: 'Global Startups'}}
                  />
                  <Stack.Screen
                    name="IndianStartups"
                    component={IndianStartupsScreen}
                    options={{title: 'Indian Startups'}}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;