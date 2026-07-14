import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// 의존성 없는 가로 막대 그래프. data = [{ label, value, color? }]
const PRIMARY = '#1A237E';

const defaultFormat = (v) => (v ? v.toLocaleString('ko-KR') : '0');

const BarChart = ({ data = [], color = PRIMARY, valueFormatter = defaultFormat, maxItems = 10 }) => {
  const items = data.slice(0, maxItems);
  const max = Math.max(...items.map((d) => d.value), 1);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      {items.map((d, i) => {
        const pct = Math.max((d.value / max) * 100, 1.5);
        return (
          <View key={`${d.label}-${i}`} style={styles.row}>
            <Text style={styles.label} numberOfLines={1}>{d.label}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%`, backgroundColor: d.color || color }]} />
            </View>
            <Text style={styles.value} numberOfLines={1}>{valueFormatter(d.value)}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { width: 78, fontSize: 12, color: '#374151' },
  track: { flex: 1, height: 16, backgroundColor: '#EEF0F6', borderRadius: 8, overflow: 'hidden', marginHorizontal: 8 },
  fill: { height: '100%', borderRadius: 8 },
  value: { width: 92, fontSize: 11, color: '#1F2937', textAlign: 'right', fontWeight: '600' },
});

export default BarChart;
