import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import GerenciarDespesa from './screens/GerenciarDespesa';
import DespesaRecente from './screens/DespesasRecentes';
import TodasDespesas from './screens/TodasDespesas';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import IconButton from './components/IconButton';
import {useNavigation} from '@react-navigation/native';

export default function App() {

  const Tab = createBottomTabNavigator();

  function BottomTabScreen(){
    const navigation = useNavigation();

    return(
      <Tab.Navigator
        screenOptions={({ navigation }) => ({ // Parêntese aqui
          headerRight: ({ tintColor }) => (
            <IconButton
              icon="add"
              size={24}
              color={tintColor} 
              onPress={() => navigation.navigate('GerenciarDespesa')}
            />
          ),
        })} // E fecha parêntese aqui
      >

        <Tab.Screen name="DespesasRecentes" component={DespesaRecente}
        options={{tabBarIcon: ({color, size}) => (<Ionicons name="hourglass" size={size} color={color} />),
        tabBarLabel: 'Recentes',
        title: 'Despesas Recentes',
        tabBarLabelStyle: { fontsize: 12 }}}
        />
        <Tab.Screen name="TodasDespesas" component={TodasDespesas}
        options={{tabBarIcon: ({color, size}) => (<Ionicons name="wallet-outline" size={size} color={color} />),
        tabBarLabel: 'Todas',
        title: 'Todas as Despesas',
        tabBarLabelStyle: { fontsize: 12 }}}
        />
      </Tab.Navigator>
    )
  }

  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Despesas" component={BottomTabScreen} 
        options={{headerShown:false}}/>
        <Stack.Screen name="GerenciarDespesa" component={GerenciarDespesa}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
