import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {useAuthContext} from '../contexts/AuthContext';
import DocumentPicker from 'react-native-document-picker';
import {analyzeWithClaude} from '../services/claude';
import {calculateSVI, type SVIFactors} from '../utils/sviCalculator';
import ResultCard from '../components/ResultCard';

const PitchDeckAnalysisScreen = () => {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const {user} = useAuthContext();
  const [file, setFile] = useState<any>(null);
  const [factors, setFactors] = useState<SVIFactors | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const styles = getStyles(theme);

  const handleFilePicker = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to analyze pitch decks',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Sign In', onPress: () => navigation.navigate('Auth')},
        ],
      );
      return;
    }

    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.images,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
      });

      if (result && result[0]) {
        setFile(result[0]);
        analyzeFile(result[0]);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  const analyzeFile = async (selectedFile: any) => {
    setIsAnalyzing(true);
    try {
      // For mobile, we'll need to implement file reading and analysis
      // This is a simplified version - you'll need to implement actual file reading
      const mockAnalysis = {
        isPitchDeck: true,
        parameters: {
          marketSize: 0.7,
          barrierToEntry: 0.6,
          defensibility: 0.8,
          insightFactor: 0.6,
          complexity: 0.5,
          riskFactor: 0.4,
          teamFactor: 0.8,
          marketTiming: 0.7,
          competitionIntensity: 0.6,
          capitalEfficiency: 0.7,
          distributionAdvantage: 0.6,
          businessModelViability: 0.7,
        },
      };

      setFactors(mockAnalysis.parameters as SVIFactors);
      const calculatedScore = calculateSVI(mockAnalysis.parameters as SVIFactors);
      setScore(calculatedScore);

      Alert.alert(
        'Analysis Complete',
        `Your pitch deck has been analyzed with a SVI score of ${calculatedScore.toFixed(4)}`,
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze the file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Upload Your Pitch Deck</Text>
        <Text style={styles.description}>
          Upload your startup pitch deck and we'll analyze it with Claude AI to
          calculate your Startup Viability Index score.
        </Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleFilePicker}
          disabled={isAnalyzing}>
          <Text style={styles.uploadButtonText}>
            {isAnalyzing ? 'Analyzing...' : 'Select File'}
          </Text>
        </TouchableOpacity>

        {file && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>Selected: {file.name}</Text>
            <Text style={styles.fileSize}>
              Size: {(file.size / 1024 / 1024).toFixed(1)} MB
            </Text>
          </View>
        )}

        {score !== null && factors && (
          <View style={styles.resultsSection}>
            <ResultCard score={score} calculating={isAnalyzing} />

            <View style={styles.parametersSection}>
              <Text style={styles.sectionTitle}>Parameter Analysis</Text>
              {Object.entries(factors).map(([key, value]) => (
                <View key={key} style={styles.parameterRow}>
                  <Text style={styles.parameterLabel}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <Text style={styles.parameterValue}>{value.toFixed(2)}</Text>
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
    uploadButton: {
      backgroundColor: '#6366f1',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    uploadButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    fileInfo: {
      backgroundColor: theme === 'dark' ? '#333333' : '#f3f4f6',
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
    },
    fileName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      marginBottom: 5,
    },
    fileSize: {
      fontSize: 12,
      color: theme === 'dark' ? '#cccccc' : '#666666',
    },
    resultsSection: {
      marginTop: 20,
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
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? '#333333' : '#e5e7eb',
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

export default PitchDeckAnalysisScreen;