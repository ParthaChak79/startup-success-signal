import React from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {startupExamples} from '../data/startupExamples';
import StartupCard from '../components/StartupCard';

const GlobalStartupsScreen = () => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  const handleLoadStartup = (startup: any) => {
    // Handle startup selection
    console.log('Selected startup:', startup.name);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Global Startups</Text>
        <Text style={styles.description}>
          Explore global unicorns and startups across various industries.
          Select any startup to load its values into the calculator.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Unicorns</Text>
          {startupExamples.unicorn.map(startup => (
            <StartupCard
              key={startup.name}
              startup={startup}
              onSelect={handleLoadStartup}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Successful Global Startups</Text>
          {startupExamples.medium.map(startup => (
            <StartupCard
              key={startup.name}
              startup={startup}
              onSelect={handleLoadStartup}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Failed Global Startups</Text>
          {startupExamples.failed.map(startup => (
            <StartupCard
              key={startup.name}
              startup={startup}
              onSelect={handleLoadStartup}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const getStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      marginBottom: 10,
    },
    description: {
      fontSize: 14,
      color: theme === 'dark' ? '#cccccc' : '#666666',
      marginBottom: 30,
      lineHeight: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      marginBottom: 15,
    },
  });

export default GlobalStartupsScreen;