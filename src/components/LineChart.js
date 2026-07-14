import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// 의존성 없는 선 그래프. SVG 없이 회전한 View 세그먼트로 선을 그립니다.
// - 왼쪽 Y축에 금액 눈금을 표시합니다.
// - 점에 마우스를 올리거나(웹) 탭하면(모바일) 해당 월의 금액 툴팁이 뜹니다.
// data = [{ label, value }]
const PRIMARY = '#1A237E';

const defaultFormat = (v) => (v ? v.toLocaleString('ko-KR') : '0');

// Y축 눈금용 축약 포맷 (예: 2,811,000 -> "281만", 4300 -> "4,300")
const compact = (v) => {
  if (v >= 100000000) return `${Math.round((v / 100000000) * 10) / 10}억`;
  if (v >= 10000) return `${Math.round(v / 10000).toLocaleString('ko-KR')}만`;
  return v.toLocaleString('ko-KR');
};

const LineChart = ({ data = [], width = 300, height = 180, color = PRIMARY, valueFormatter = defaultFormat }) => {
  const [active, setActive] = useState(null);

  const axisW = 46; // 왼쪽 Y축 눈금 영역
  const padR = 14;
  const padT = 24; // 상단(툴팁·라벨 여유)
  const padB = 26;
  const plotW = width - axisW - padR;
  const plotH = height - padT - padB;
  const n = data.length;

  if (n === 0) return <View style={{ width, height }} />;

  // 축 최대값을 데이터 실제 최댓값으로 설정 → 최고점이 상단에 닿아 변화가 잘 보입니다.
  // (임의의 큰 값으로 올림하면 실적이 낮게/떨어지는 것처럼 보이는 문제 방지)
  const max = Math.max(...data.map((d) => d.value), 1);

  const pts = data.map((d, i) => ({
    x: axisW + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW),
    y: padT + plotH - (d.value / max) * plotH,
    ...d,
  }));

  const segments = [];
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    segments.push({ left: (a.x + b.x) / 2 - len / 2, top: (a.y + b.y) / 2 - 1, width: len, angle });
  }

  // Y축 눈금 (0, 1/2, 최대)
  const ticks = [0, 0.5, 1].map((f) => ({ value: max * f, y: padT + plotH - f * plotH }));

  return (
    <View style={{ width, height }}>
      {/* 가로 눈금선 + Y축 라벨 */}
      {ticks.map((t, i) => (
        <View key={`tick-${i}`}>
          <View style={{ position: 'absolute', left: axisW, top: t.y, width: plotW, height: 1, backgroundColor: i === 0 ? '#D1D5DB' : '#EEF0F6' }} />
          <Text style={[styles.yLabel, { top: t.y - 7, width: axisW - 6 }]} numberOfLines={1}>{compact(t.value)}</Text>
        </View>
      ))}

      {/* 선 세그먼트 */}
      {segments.map((s, i) => (
        <View
          key={`seg-${i}`}
          style={{ position: 'absolute', left: s.left, top: s.top, width: s.width, height: 2, backgroundColor: color, transform: [{ rotate: `${s.angle}deg` }] }}
        />
      ))}

      {/* 점 + 인터랙션(hover/tap) 히트영역 */}
      {pts.map((p, i) => (
        <Pressable
          key={`pt-${i}`}
          onHoverIn={() => setActive(i)}
          onHoverOut={() => setActive((cur) => (cur === i ? null : cur))}
          onPress={() => setActive((cur) => (cur === i ? null : i))}
          style={{ position: 'absolute', left: p.x - 14, top: p.y - 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={[styles.dot, { backgroundColor: color, transform: [{ scale: active === i ? 1.5 : 1 }] }]} />
        </Pressable>
      ))}

      {/* 활성 점 툴팁 */}
      {active !== null && pts[active] ? (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            {
              left: Math.max(axisW - 10, Math.min(pts[active].x - 55, width - 110)),
              top: Math.max(pts[active].y - 42, 0),
            },
          ]}
        >
          <Text style={styles.tooltipLabel}>{pts[active].label}</Text>
          <Text style={styles.tooltipValue}>{valueFormatter(pts[active].value)}</Text>
        </View>
      ) : null}

      {/* X축 라벨 */}
      {pts.map((p, i) => (
        <Text key={`x-${i}`} style={[styles.xLabel, { left: p.x - 22, top: height - 18 }]} numberOfLines={1}>{p.label}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  yLabel: { position: 'absolute', left: 0, textAlign: 'right', fontSize: 9, color: '#9CA3AF' },
  xLabel: { position: 'absolute', width: 44, textAlign: 'center', fontSize: 9, color: '#9CA3AF' },
  dot: { width: 7, height: 7, borderRadius: 3.5, borderWidth: 1, borderColor: '#fff' },
  tooltip: {
    position: 'absolute',
    minWidth: 88,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    zIndex: 20,
  },
  tooltipLabel: { color: '#C5CAE9', fontSize: 10, marginBottom: 2 },
  tooltipValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});

export default LineChart;
