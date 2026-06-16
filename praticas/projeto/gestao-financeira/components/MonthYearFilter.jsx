import { useContext, useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MoneyContext } from "../contexts/GlobalState";
import { colors } from "../constants/colors";

const MONTHS = [
  { value: "Todos", label: "Todos" },
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

/**
 * Filtro de Mês e Ano para as listagens de transações e resumo financeiro.
 * 
 * @returns {JSX.Element}
 */
export default function MonthYearFilter() {
  const {
    transactions,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
  } = useContext(MoneyContext);

  // Determinar anos de forma dinâmica baseada nas transações cadastradas, garantindo que o ano corrente conste
  const years = useMemo(() => {
    const list = new Set([new Date().getFullYear()]);
    transactions.forEach((tx) => {
      if (tx.date) {
        list.add(new Date(tx.date).getFullYear());
      }
    });
    return Array.from(list).sort((a, b) => b - a);
  }, [transactions]);

  return (
    <View style={styles.container}>
      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Mês</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(val) => setSelectedMonth(val)}
            style={styles.picker}
            dropdownIconColor={colors.primary}
          >
            {MONTHS.map((m) => (
              <Picker.Item key={m.value} label={m.label} value={m.value} style={styles.pickerItem} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Ano</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(val) => setSelectedYear(val)}
            style={styles.picker}
            dropdownIconColor={colors.primary}
          >
            <Picker.Item label="Todos" value="Todos" style={styles.pickerItem} />
            {years.map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year.toString()} style={styles.pickerItem} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryText,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerBox: {
    borderColor: colors.secondaryText,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      web: {
        height: 38,
        justifyContent: "center",
      },
      android: {
        height: 50,
        justifyContent: "center",
      },
      default: {
        height: 44,
        justifyContent: "center",
      },
    }),
  },
  picker: {
    width: "100%",
    color: colors.primaryText,
    backgroundColor: "transparent",
    ...Platform.select({
      web: {
        height: 36,
        paddingLeft: 8,
        paddingRight: 8,
        borderWidth: 0,
        outlineStyle: "none",
        fontSize: 14,
        cursor: "pointer",
      },
      android: {
        height: 50,
      },
      default: {
        height: "100%",
      },
    }),
  },
  pickerItem: {
    fontSize: 14,
  },
});
