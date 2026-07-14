import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// 화면 컴포넌트들을 불러옵니다.
import WelcomeScreen from '../screens/user/WelcomeScreen';
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import DongDashboardScreen from '../screens/dongAdmin/DongDashboardScreen';
import StoreLedgerScreen from '../screens/dongAdmin/StoreLedgerScreen';
import UsageDetailScreen from '../screens/dongAdmin/UsageDetailScreen';
import UsageEditScreen from '../screens/dongAdmin/UsageEditScreen';
import UsageEntryScreen from '../screens/dongAdmin/UsageEntryScreen';
import SuperAdminDashboardScreen from '../screens/superAdmin/SuperAdminDashboardScreen';
import DonationAnalyticsScreen from '../screens/superAdmin/DonationAnalyticsScreen';
import AIAgentScreen from '../screens/superAdmin/AIAgentScreen';
import ProjectIntroScreen from '../screens/user/ProjectIntroScreen';
import GVTIScreen from '../screens/gvti/GVTIScreen';
import DonationEntryScreen from '../screens/user/DonationEntryScreen';
import DonationSuccessScreen from '../screens/user/DonationSuccessScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        // 웹에서 각 화면이 뷰포트 높이에 맞춰지도록 강제 → 내부 ScrollView/FlatList 스크롤 정상 동작
        cardStyle: { flex: 1 },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="DonationEntry" component={DonationEntryScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="DongDashboard" component={DongDashboardScreen} />
      <Stack.Screen name="StoreLedger" component={StoreLedgerScreen} />
      <Stack.Screen name="UsageEntry" component={UsageEntryScreen} />
      <Stack.Screen name="UsageDetail" component={UsageDetailScreen} />
      <Stack.Screen name="UsageEdit" component={UsageEditScreen} />
      <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} />
      <Stack.Screen name="DonationAnalytics" component={DonationAnalyticsScreen} />
      <Stack.Screen name="AIAgent" component={AIAgentScreen} />
      <Stack.Screen name="ProjectIntro" component={ProjectIntroScreen} />
      <Stack.Screen name="GVTI" component={GVTIScreen} />
      <Stack.Screen name="DonationSuccess" component={DonationSuccessScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;