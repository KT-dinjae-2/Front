import React, { useEffect, useState } from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import api from '../../api/client';
import BackButton from '../../components/BackButton';

const PRIMARY_COLOR = '#1A237E';

const formatNumber = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0');

// 성동구청 공식 사업 소개 링크
const SD_GOV_URL = 'https://www.sd.go.kr/main/contents.do?key=5027&';

const STEPS = [
  { icon: '🛒', title: '기부 참여', desc: '동네 가게에서 결제할 때, 소액을 함께 기부합니다. "하나 사면 하나 더" — 원플러스원의 시작입니다.' },
  { icon: '🏪', title: '가게가 함께', desc: '지역 가게들이 기부처가 되어 이웃을 위한 나눔에 동참합니다.' },
  { icon: '🤝', title: '동으로 전달', desc: '모인 기부금은 각 동을 통해 도움이 필요한 이웃에게 나눔으로 전달됩니다.' },
  { icon: '📊', title: '투명한 관리', desc: '기부와 나눔 내역이 동별로 투명하게 기록되고 관리됩니다.' },
];

const ProjectIntroScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dongs/totals/');
        setStats(res.data.totals || {});
      } catch (e) {
        setStats({});
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackButton navigation={navigation} color="#FFFFFF" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 히어로 */}
        <View style={styles.hero}>
          <Text style={styles.heroBadge}>성동구</Text>
          <Text style={styles.heroTitle}>원플러스원{'\n'}(1+1) 기부 사업</Text>
          <Text style={styles.heroSubtitle}>하나의 소비가 하나의 나눔이 되는{'\n'}지역사회 상생 프로젝트</Text>
        </View>

        {/* 실시간 임팩트 */}
        <View style={styles.impactRow}>
          <View style={styles.impactCard}>
            <Text style={styles.impactValue}>{stats ? formatNumber(stats.totalDonationAmount) : '-'}</Text>
            <Text style={styles.impactLabel}>총 기부금액(원)</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactValue}>{stats ? formatNumber(stats.totalShareAmount) : '-'}</Text>
            <Text style={styles.impactLabel}>총 나눔금액(원)</Text>
          </View>
        </View>
        <View style={styles.impactRow}>
          <View style={styles.impactCardSm}>
            <Text style={styles.impactValueSm}>{stats ? formatNumber(stats.totalDonationCount) : '-'}건</Text>
            <Text style={styles.impactLabel}>기부 참여</Text>
          </View>
          <View style={styles.impactCardSm}>
            <Text style={styles.impactValueSm}>{stats ? formatNumber(stats.totalShareCount) : '-'}건</Text>
            <Text style={styles.impactLabel}>나눔 전달</Text>
          </View>
        </View>

        {/* 사업 소개 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이런 사업이에요</Text>
          <Text style={styles.paragraph}>
            원플러스원은 지역 주민과 가게가 함께 만드는 나눔 문화입니다. 소비자가 동네 가게에서 물건을 살 때 소액의 기부를 더하면,
            그 마음이 모여 도움이 필요한 이웃에게 전달됩니다. 작은 참여가 지역사회 전체의 온기가 되는 선순환 구조입니다.
          </Text>
          <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(SD_GOV_URL)}>
            <Text style={styles.linkButtonText}>🔗 성동구청 사업 소개 바로가기</Text>
          </TouchableOpacity>
        </View>

        {/* 진행 방식 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>어떻게 진행되나요?</Text>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepIconWrap}>
                <Text style={styles.stepIcon}>{s.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{i + 1}. {s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>지금 바로 참여해보세요</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('DonationEntry')}>
            <Text style={styles.ctaButtonText}>기부 시작하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  hero: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 96,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    color: '#C5CAE9',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
  },
  heroTitle: { fontSize: 30, fontWeight: 'bold', color: '#FFFFFF', lineHeight: 40, marginBottom: 12 },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 23 },
  impactRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 16 },
  impactCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 20, alignItems: 'center', elevation: 2 },
  impactValue: { fontSize: 22, fontWeight: 'bold', color: PRIMARY_COLOR },
  impactCardSm: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 14, alignItems: 'center', elevation: 1 },
  impactValueSm: { fontSize: 18, fontWeight: 'bold', color: PRIMARY_COLOR },
  impactLabel: { fontSize: 12, color: '#6B7280', marginTop: 6 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, marginHorizontal: 20, marginTop: 16, padding: 20, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  paragraph: { fontSize: 15, color: '#374151', lineHeight: 24 },
  linkButton: { marginTop: 16, backgroundColor: '#E8EAF6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  linkButtonText: { fontSize: 15, fontWeight: '700', color: PRIMARY_COLOR },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  stepIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  stepIcon: { fontSize: 22 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  stepDesc: { fontSize: 14, color: '#6B7280', lineHeight: 21 },
  ctaBox: { marginHorizontal: 20, marginTop: 24, alignItems: 'center' },
  ctaTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 14 },
  ctaButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14, width: '100%', alignItems: 'center' },
  ctaButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
});

export default ProjectIntroScreen;
