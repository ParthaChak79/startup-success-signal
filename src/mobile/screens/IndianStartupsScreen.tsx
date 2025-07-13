import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {indianStartupExamples} from '../data/indianStartupExamples';
import StartupCard from '../components/StartupCard';

const IndianStartupsScreen = () => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  const handleLoadStartup = (startup: any) => {
    // Handle startup selection
    console.log('Selected startup:', startup.name);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Indian Startups</Text>
        <Text style={styles.description}>
          Explore Indian startups across various sectors and their success
          factors. Select any startup to load its values into the calculator.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indian Unicorns</Text>
          {indianStartupExamples.unicorn.map(startup => (
            <StartupCard
              key={startup.name}
              startup={startup}
              onSelect={handleLoadStartup}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Successful Indian Startups</Text>
          {indianStartupExamples.medium.map(startup => (
            <StartupCard
              key={startup.name}
              startup={startup}
              onSelect={handleLoadStartup}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Failed Indian Startups</Text>
          {indianStartupExamples.failed.map(startup => (
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

export default IndianStartupsScreen;