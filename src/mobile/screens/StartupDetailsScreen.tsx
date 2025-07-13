import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {supabase} from '../integrations/supabase/client';
import ResultCard from '../components/ResultCard';

const StartupDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {theme} = useTheme();
  const {startupId} = route.params as {startupId: string};
  const [startup, setStartup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const styles = getStyles(theme);

  useEffect(() => {
    fetchStartupDetails();
  }, [startupId]);

  const fetchStartupDetails = async () => {
    try {
      const {data, error} = await supabase
        .from('startups')
        .select('*')
        .eq('id', startupId)
        .single();

      if (error) throw error;
      setStartup(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load startup details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!startup) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Startup not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{startup.name}</Text>
        {startup.description && (
          <Text style={styles.description}>{startup.description}</Text>
        )}
        <Text style={styles.date}>
          Created: {new Date(startup.created_at).toLocaleDateString()}
        </Text>

        <View style={styles.scoreSection}>
          <ResultCard score={startup.score || 0} calculating={false} />
        </View>

        <View style={styles.parametersSection}>
          <Text style={styles.sectionTitle}>Parameters Analysis</Text>
          {startup.factors &&
            Object.entries(startup.factors).map(([key, value]) => (
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    },
    loadingText: {
      fontSize: 16,
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    },
    errorText: {
      fontSize: 16,
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
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
      marginBottom: 10,
      lineHeight: 20,
    },
    date: {
      fontSize: 12,
      color: theme === 'dark' ? '#888888' : '#999999',
      marginBottom: 20,
    },
    scoreSection: {
      marginBottom: 30,
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
      paddingVertical: 12,
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

export default StartupDetailsScreen;