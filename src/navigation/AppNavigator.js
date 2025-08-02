import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// 화면 컴포넌트들을 불러옵니다.
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import DongDashboardScreen from '../screens/dongAdmin/DongDashboardScreen';
import StoreLedgerScreen from '../screens/dongAdmin/StoreLedgerScreen';
import UsageDetailScreen from '../screens/dongAdmin/UsageDetailScreen';
import UsageEditScreen from '../screens/dongAdmin/UsageEditScreen';
import UsageEntryScreen from '../screens/dongAdmin/UsageEntryScreen';
import SuperAdminDashboardScreen from '../screens/superAdmin/SuperAdminDashboardScreen';
import DonationEntryScreen from '../screens/user/DonationEntryScreen';
import DonationSuccessScreen from '../screens/user/DonationSuccessScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="DonationEntry"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="DonationEntry" component={DonationEntryScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="DongDashboard" component={DongDashboardScreen} />
      <Stack.Screen name="StoreLedger" component={StoreLedgerScreen} />
      <Stack.Screen name="UsageEntry" component={UsageEntryScreen} />
      <Stack.Screen name="UsageDetail" component={UsageDetailScreen} />
      <Stack.Screen name="UsageEdit" component={UsageEditScreen} />
      <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} />
      <Stack.Screen name="DonationSuccess" component={DonationSuccessScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;