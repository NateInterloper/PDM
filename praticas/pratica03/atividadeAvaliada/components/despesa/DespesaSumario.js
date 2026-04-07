import { View, Text, StyleSheet } from 'react-native';

function DespesaSumario({despesas, periodo}) {
    const somaDespesas = despesas.reduce((total, despesa) => {
        return total + despesa.valor;
    }, 0);

    return (
        <View style={styles.totalContainer}>
            <Text>{periodo}</Text>
            <Text>R$ {somaDespesas.toFixed(2)}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "gray",
		paddingVertical: 15,
		paddingHorizontal: 10,
  },
});

export default DespesaSumario