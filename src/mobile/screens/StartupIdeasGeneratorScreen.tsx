import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useTheme} from '../contexts/ThemeContext';
import {useAuthContext} from '../contexts/AuthContext';

const StartupIdeasGeneratorScreen = () => {
  const {theme} = useTheme();
  const {user} = useAuthContext();
  const [industry, setIndustry] = useState('');
  const [focus, setFocus] = useState('');
  const [continent, setContinent] = useState('');
  const [country, setCountry] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [startupIdea, setStartupIdea] = useState<any>(null);

  const styles = getStyles(theme);

  const industryOptions = [
    'AI & Machine Learning',
    'AgriTech',
    'AR/VR',
    'Automotive',
    'Biotechnology',
    'Blockchain',
    'Clean Energy',
    'Climate Tech',
    'Cloud Computing',
    'Construction Tech',
    'Cybersecurity',
    'E-commerce',
    'EdTech',
    'Entertainment',
    'Fashion Tech',
    'Fintech',
    'Food Tech',
    'Gaming',
    'Healthcare',
    'HR Tech',
    'IoT',
    'Legal Tech',
    'Logistics',
    'Manufacturing',
    'Marketing Tech',
    'Mental Health',
    'PropTech',
    'Quantum Computing',
    'Retail Tech',
    'Robotics',
    'SaaS',
    'Social Media',
    'Space Tech',
    'Sports Tech',
    'Sustainability',
    'Telecom',
    'Travel & Hospitality',
    'Web3',
  ];

  const focusOptions = ['B2B', 'B2C', 'B2G'];

  const continentOptions = [
    'Africa',
    'Asia',
    'Australia/Oceania',
    'Europe',
    'North America',
    'South America',
  ];

  const handleGenerateIdea = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to generate startup ideas',
      );
      return;
    }

    setIsGenerating(true);
    try {
      // Mock idea generation for mobile demo
      const mockIdea = {
        name: 'EcoTrack AI',
        description:
          'AI-powered carbon footprint tracking for small businesses',
        overview:
          'A comprehensive platform that uses machine learning to automatically track and optimize carbon emissions for SMEs.',
        factors: {
          marketSize: 0.8,
          barrierToEntry: 0.7,
          defensibility: 0.6,
          insightFactor: 0.7,
          complexity: 0.6,
          riskFactor: 0.4,
          teamFactor: 0.8,
          marketTiming: 0.9,
          competitionIntensity: 0.5,
          capitalEfficiency: 0.7,
          distributionAdvantage: 0.6,
          businessModelViability: 0.8,
        },
        explanations: {
          marketSize: 'Large and growing market for sustainability solutions',
          barrierToEntry: 'Requires AI expertise and regulatory knowledge',
          defensibility: 'Data network effects and proprietary algorithms',
        },
      };

      setStartupIdea(mockIdea);
      Alert.alert('Success', 'Startup idea generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate startup idea');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Generate New Startup Ideas</Text>
        <Text style={styles.description}>
          Use AI to generate innovative startup ideas that score well on all the
          12 parameters of the Startup Success Index.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Industry (Optional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={industry}
              onValueChange={setIndustry}
              style={styles.picker}>
              <Picker.Item label="Any Industry" value="" />
              {industryOptions.map(option => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Focus (Optional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={focus}
              onValueChange={setFocus}
              style={styles.picker}>
              <Picker.Item label="Any Focus" value="" />
              {focusOptions.map(option => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Continent (Optional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={continent}
              onValueChange={setContinent}
              style={styles.picker}>
              <Picker.Item label="Any Continent" value="" />
              {continentOptions.map(option => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateIdea}
            disabled={isGenerating}>
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating...' : 'Generate Startup Idea'}
            </Text>
          </TouchableOpacity>
        </View>

        {startupIdea && (
          <View style={styles.ideaSection}>
            <Text style={styles.ideaTitle}>{startupIdea.name}</Text>
            <Text style={styles.ideaDescription}>
              {startupIdea.description}
            </Text>
            <Text style={styles.ideaOverview}>{startupIdea.overview}</Text>

            <View style={styles.parametersSection}>
              <Text style={styles.sectionTitle}>Parameter Analysis</Text>
              {Object.entries(startupIdea.factors).map(([key, value]) => (
                <View key={key} style={styles.parameterRow}>
                  <Text style={styles.parameterLabel}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <Text style={styles.parameterValue}>
                    {(value as number).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
    formSection: {
      marginBottom: 30,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      marginBottom: 8,
      marginTop: 15,
    },
    pickerContainer: {
      backgroundColor: theme === 'dark' ? '#333333' : '#f3f4f6',
      borderRadius: 8,
      marginBottom: 10,
    },
    picker: {
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
    },
    generateButton: {
      backgroundColor: '#6366f1',
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    generateButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    ideaSection: {
      backgroundColor: theme === 'dark' ? '#333333' : '#f9fafb',
      padding: 20,
      borderRadius: 12,
      marginTop: 20,
    },
    ideaTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      marginBottom: 10,
    },
    ideaDescription: {
      fontSize: 16,
      color: theme === 'dark' ? '#cccccc' : '#666666',
      marginBottom: 15,
      lineHeight: 22,
    },
    ideaOverview: {
      fontSize: 14,
      color: theme === 'dark' ? '#cccccc' : '#666666',
      marginBottom: 20,
      lineHeight: 20,
    },
    parametersSection: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      marginBottom: 15,
    },
    parameterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? '#444444' : '#e5e7eb',
    },
    parameterLabel: {
      fontSize: 14,
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      flex: 1,
    },
    parameterValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#6366f1',
    },
  });

export default StartupIdeasGeneratorScreen;