import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Slider} from '@react-native-community/slider';
import {useTheme} from '../contexts/ThemeContext';

interface SliderComponentProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip: string;
  valueText: string;
  description: string;
}

const SliderComponent: React.FC<SliderComponentProps> = ({
  label,
  value,
  onChange,
  tooltip,
  valueText,
  description,
}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value.toFixed(2)}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={value}
        onValueChange={onChange}
        step={0.01}
        minimumTrackTintColor="#6366f1"
        maximumTrackTintColor={theme === 'dark' ? '#444444' : '#e5e7eb'}
        thumbStyle={styles.thumb}
      />

      <View style={styles.info}>
        <Text style={styles.valueText}>{valueText}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const getStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      marginBottom: 25,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      flex: 1,
    },
    value: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#6366f1',
    },
    slider: {
      width: '100%',
      height: 40,
    },
    thumb: {
      backgroundColor: '#6366f1',
      width: 20,
      height: 20,
    },
    info: {
      marginTop: 8,
    },
    valueText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme === 'dark' ? '#ffffff' : '#374151',
      marginBottom: 4,
    },
    description: {
      fontSize: 12,
      color: theme === 'dark' ? '#cccccc' : '#6b7280',
      lineHeight: 16,
    },
  });

export default SliderComponent;