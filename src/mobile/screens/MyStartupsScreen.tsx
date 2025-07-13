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
import {supabase} from '../integrations/supabase/client';

const MyStartupsScreen = () => {
  const navigation = useNavigation();
  const {user} = useAuthContext();
  const {theme} = useTheme();
  const [startups, setStartups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const styles = getStyles(theme);

  useEffect(() => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }
    fetchStartups();
  }, [user]);

  const fetchStartups = async () => {
    try {
      const {data, error} = await supabase
        .from('startups')
        .select('*')
        .order('created_at', {ascending: false});

      if (error) throw error;
      setStartups(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load startups');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#10b981';
    if (score >= 0.6) return '#22c55e';
    if (score >= 0.4) return '#eab308';
    if (score >= 0.2) return '#f97316';
    return '#ef4444';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {startups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No startups yet</Text>
            <Text style={styles.emptyDescription}>
              Upload a pitch deck or generate ideas to get started
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('PitchDeckAnalysis')}>
              <Text style={styles.buttonText}>New Analysis</Text>
            </TouchableOpacity>
          </View>
        ) : (
          startups.map((startup: any) => (
            <TouchableOpacity
              key={startup.id}
              style={styles.startupCard}
              onPress={() =>
                navigation.navigate('StartupDetails', {startupId: startup.id})
              }>
              <View style={styles.cardHeader}>
                <Text style={styles.startupName}>{startup.name}</Text>
                <Text
                  style={[
                    styles.startupScore,
                    {color: getScoreColor(startup.score || 0)},
                  ]}>
                  {(startup.score || 0).toFixed(4)}
                </Text>
              </View>
              {startup.description && (
                <Text style={styles.startupDescription}>
                  {startup.description}
                </Text>
              )}
              <Text style={styles.startupDate}>
                {new Date(startup.created_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
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
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      marginBottom: 10,
    },
    emptyDescription: {
      fontSize: 14,
      color: theme === 'dark' ? '#cccccc' : '#666666',
      textAlign: 'center',
      marginBottom: 30,
    },
    primaryButton: {
      backgroundColor: '#6366f1',
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 8,
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: '600',
      textAlign: 'center',
    },
    startupCard: {
      backgroundColor: theme === 'dark' ? '#333333' : '#f9fafb',
      padding: 20,
      borderRadius: 12,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#444444' : '#e5e7eb',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    startupName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      flex: 1,
    },
    startupScore: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    startupDescription: {
      fontSize: 14,
      color: theme === 'dark' ? '#cccccc' : '#666666',
      marginBottom: 10,
      lineHeight: 20,
    },
    startupDate: {
      fontSize: 12,
      color: theme === 'dark' ? '#888888' : '#999999',
    },
  });

export default MyStartupsScreen;