import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuthContext} from '../contexts/AuthContext';
import {useTheme} from '../contexts/ThemeContext';
import SliderComponent from '../components/SliderComponent';
import ResultCard from '../components/ResultCard';
import StartupCard from '../components/StartupCard';
import {
  calculateSVI,
  getFactorText,
  getLabelForFactor,
  getTooltipForFactor,
  getFactorDescription,
  type SVIFactors,
} from '../utils/sviCalculator';
import {startupExamples, defaultFactors} from '../data/startupExamples';

const HomeScreen = () => {
  const navigation = useNavigation();
  const {user} = useAuthContext();
  const {theme} = useTheme();
  const [factors, setFactors] = useState<SVIFactors>(defaultFactors);
  const [score, setScore] = useState<number>(0);
  const [calculating, setCalculating] = useState<boolean>(false);

  const styles = getStyles(theme);

  useEffect(() => {
    const sviScore = calculateSVI(factors);
    setScore(sviScore);
  }, [factors]);

  const handleFactorChange = (factor: keyof SVIFactors, value: number) => {
    setFactors(prev => ({
      ...prev,
      [factor]: value,
    }));
  };

  const handleReset = () => {
    setCalculating(true);
    setTimeout(() => {
      setFactors(defaultFactors);
      setCalculating(false);
      Alert.alert('Reset Complete', 'All factors have been reset to default values.');
    }, 400);
  };

  const loadStartupExample = (startup: any) => {
    setCalculating(true);
    setTimeout(() => {
      setFactors(startup.factors);
      setCalculating(false);
      Alert.alert(
        `${startup.name} loaded`,
        `SVI Score: ${startup.score.toFixed(4)}`,
      );
    }, 400);
  };

  const factorKeys: (keyof SVIFactors)[] = [
    'marketSize',
    'barrierToEntry',
    'defensibility',
    'insightFactor',
    'complexity',
    'riskFactor',
    'teamFactor',
    'marketTiming',
    'competitionIntensity',
    'capitalEfficiency',
    'distributionAdvantage',
    'businessModelViability',
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Startup Success Index</Text>
        <Text style={styles.subtitle}>
          The Startup Success Index (SSI) is a quantitative framework for
          evaluating startup potential by measuring the balance between
          opportunity factors and execution challenges.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('PitchDeckAnalysis')}>
            <Text style={styles.buttonText}>Upload Pitch Deck</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('StartupIdeasGenerator')}>
            <Text style={styles.secondaryButtonText}>Generate Ideas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('GlobalStartups')}>
            <Text style={styles.secondaryButtonText}>Global Startups</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('IndianStartups')}>
            <Text style={styles.secondaryButtonText}>Indian Startups</Text>
          </TouchableOpacity>
        </View>

        {user && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('MyStartups')}>
            <Text style={styles.secondaryButtonText}>My Startups</Text>
          </TouchableOpacity>
        )}

        {!user && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Auth')}>
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.calculatorSection}>
          <Text style={styles.sectionTitle}>Calculator</Text>
          {factorKeys.map(factor => (
            <SliderComponent
              key={factor}
              label={getLabelForFactor(factor)}
              value={factors[factor]}
              onChange={value => handleFactorChange(factor, value)}
              tooltip={getTooltipForFactor(factor)}
              valueText={getFactorText(factor, factors[factor])}
              description={getFactorDescription(factor, factors[factor])}
            />
          ))}

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultSection}>
          <ResultCard score={score} calculating={calculating} />

          <View style={styles.examplesSection}>
            <Text style={styles.sectionTitle}>Compare With Examples</Text>
            <StartupCard
              startup={startupExamples.unicorn[0]}
              onSelect={loadStartupExample}
            />
            <StartupCard
              startup={startupExamples.unicorn[1]}
              onSelect={loadStartupExample}
            />
            <StartupCard
              startup={startupExamples.medium[0]}
              onSelect={loadStartupExample}
            />
            <StartupCard
              startup={startupExamples.failed[0]}
              onSelect={loadStartupExample}
            />
          </View>
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
    header: {
      padding: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: theme === 'dark' ? '#cccccc' : '#666666',
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 10,
    },
    primaryButton: {
      backgroundColor: '#6366f1',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flex: 1,
      marginHorizontal: 5,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#6366f1',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flex: 1,
      marginHorizontal: 5,
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: '600',
      textAlign: 'center',
    },
    secondaryButtonText: {
      color: '#6366f1',
      fontWeight: '600',
      textAlign: 'center',
    },
    content: {
      padding: 20,
    },
    calculatorSection: {
      marginBottom: 30,
    },
    resultSection: {
      marginBottom: 30,
    },
    examplesSection: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      marginBottom: 15,
    },
    resetButton: {
      backgroundColor: theme === 'dark' ? '#333333' : '#f3f4f6',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 20,
      alignSelf: 'flex-start',
    },
    resetButtonText: {
      color: theme === 'dark' ? '#ffffff' : '#374151',
      fontWeight: '600',
    },
  });

export default HomeScreen;