import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';

export interface StartupExample {
  name: string;
  score: number;
  description: string;
  category: 'unicorn' | 'medium' | 'failed';
  factors: {
    marketSize: number;
    barrierToEntry: number;
    defensibility: number;
    insightFactor: number;
    complexity: number;
    riskFactor: number;
    teamFactor: number;
    marketTiming: number;
    competitionIntensity: number;
    capitalEfficiency: number;
    distributionAdvantage: number;
    businessModelViability: number;
  };
}

interface StartupCardProps {
  startup: StartupExample;
  onSelect: (startup: StartupExample) => void;
}

const StartupCard: React.FC<StartupCardProps> = ({startup, onSelect}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme, startup.category);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(startup)}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.name}>{startup.name}</Text>
        <Text style={styles.score}>{startup.score.toFixed(2)}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {startup.description}
      </Text>
      <Text style={styles.actionText}>Tap to apply values</Text>
    </TouchableOpacity>
  );
};

const getStyles = (theme: 'light' | 'dark', category: string) => {
  const getCategoryColors = () => {
    switch (category) {
      case 'unicorn':
        return {
          bg: theme === 'dark' ? '#064e3b' : '#d1fae5',
          border: theme === 'dark' ? '#059669' : '#10b981',
          text: '#10b981',
        };
      case 'medium':
        return {
          bg: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
          border: theme === 'dark' ? '#3b82f6' : '#2563eb',
          text: '#2563eb',
        };
      case 'failed':
        return {
          bg: theme === 'dark' ? '#7f1d1d' : '#fee2e2',
          border: theme === 'dark' ? '#ef4444' : '#dc2626',
          text: '#dc2626',
        };
      default:
        return {
          bg: theme === 'dark' ? '#374151' : '#f3f4f6',
          border: theme === 'dark' ? '#6b7280' : '#9ca3af',
          text: '#6b7280',
        };
    }
  };

  const colors = getCategoryColors();

  return StyleSheet.create({
    container: {
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
      borderRadius: 12,
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      flex: 1,
    },
    score: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    description: {
      fontSize: 12,
      color: theme === 'dark' ? '#cccccc' : '#6b7280',
      lineHeight: 16,
      marginBottom: 8,
    },
    actionText: {
      fontSize: 10,
      color: theme === 'dark' ? '#888888' : '#9ca3af',
      textAlign: 'right',
    },
  });
};

export default StartupCard;