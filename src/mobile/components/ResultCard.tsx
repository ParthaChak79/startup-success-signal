import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';

interface ResultCardProps {
  score: number;
  calculating: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({score, calculating}) => {
  const {theme} = useTheme();
  const [animatedScore, setAnimatedScore] = useState(0);
  const styles = getStyles(theme);

  const getInterpretation = (score: number) => {
    if (score >= 0.8) return 'Exceptional Viability';
    if (score >= 0.6) return 'Strong Viability';
    if (score >= 0.4) return 'Moderate Viability';
    if (score >= 0.2) return 'Challenging Viability';
    return 'Minimal Viability';
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#10b981';
    if (score >= 0.6) return '#22c55e';
    if (score >= 0.4) return '#eab308';
    if (score >= 0.2) return '#f97316';
    return '#ef4444';
  };

  const getDescription = (score: number) => {
    if (score >= 0.8) {
      return 'Revolutionary insight with large market and strong defensible position.';
    }
    if (score >= 0.6) {
      return 'Strong market position with clear competitive advantages.';
    }
    if (score >= 0.4) {
      return 'Good market opportunity with some competitive advantages.';
    }
    if (score >= 0.2) {
      return 'Limited market or advantages with high execution complexity.';
    }
    return 'Small market or no advantages with extreme complexity or risk.';
  };

  useEffect(() => {
    if (calculating) {
      setAnimatedScore(0);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const increment = score / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setAnimatedScore(current);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [score, calculating]);

  return (
    <View style={[styles.container, calculating && styles.calculating]}>
      <Text style={styles.title}>Startup Success Score</Text>

      <View style={styles.scoreContainer}>
        <Text style={[styles.score, {color: getScoreColor(score)}]}>
          {animatedScore.toFixed(4)}
        </Text>
        <Text style={styles.maxScore}>/1.0</Text>
      </View>

      <Text style={styles.interpretation}>{getInterpretation(score)}</Text>
      <Text style={styles.description}>{getDescription(score)}</Text>
    </View>
  );
};

const getStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      backgroundColor: theme === 'dark' ? '#333333' : '#f9fafb',
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#444444' : '#e5e7eb',
    },
    calculating: {
      opacity: 0.5,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'dark' ? '#cccccc' : '#6b7280',
      marginBottom: 15,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 10,
    },
    score: {
      fontSize: 36,
      fontWeight: 'bold',
    },
    maxScore: {
      fontSize: 16,
      color: theme === 'dark' ? '#888888' : '#9ca3af',
      marginLeft: 5,
    },
    interpretation: {
      fontSize: 18,
      fontWeight: '600',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      marginBottom: 8,
    },
    description: {
      fontSize: 12,
      color: theme === 'dark' ? '#cccccc' : '#6b7280',
      lineHeight: 16,
    },
  });

export default ResultCard;