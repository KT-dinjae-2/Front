import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 화면 컴포넌트들을 불러옵니다.
import DonationEntryScreen from '../screens/user/DonationEntryScreen';
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import DongDashboardScreen from '../screens/dongAdmin/DongDashboardScreen';
import StoreLedgerScreen from '../screens/dongAdmin/StoreLedgerScreen';
import UsageEntryScreen from '../screens/dongAdmin/UsageEntryScreen';
// ... 다른 화면들도 여기에 추가

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="DonationEntry"
        screenOptions={{
          headerShown: false // 각 화면에서 헤더를 커스텀하기 위해 기본 헤더는 숨깁니다.
        }}
      >
        <Stack.Screen name="DonationEntry" component={DonationEntryScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="DongDashboard" component={DongDashboardScreen} />
        <Stack.Screen name="StoreLedger" component={StoreLedgerScreen} />
        <Stack.Screen name="UsageEntry" component={UsageEntryScreen} />
        {/* TODO: 다른 화면들도 여기에 등록합니다. */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;