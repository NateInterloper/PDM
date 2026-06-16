import { useContext, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { MoneyContext } from "../../contexts/GlobalState";
import SummaryItem from "../../components/SummaryItem";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";
import MonthYearFilter from "../../components/MonthYearFilter";

/**
 * Tela "Resumo".
 *
 * Filtra as transações baseadas no mês e ano selecionados no filtro global.
 * Calcula totais por categoria e saldo no período aplicável.
 * Desenha um Gráfico tipo Pizza (Donut SVG) na plataforma Web e barras de progresso no Native.
 *
 * @returns {JSX.Element}
 */
export default function Summary() {
  const {
    transactions,
    categories,
    loading,
    selectedMonth,
    selectedYear,
  } = useContext(MoneyContext);

  // Filtra as transações baseadas no mês e ano selecionados
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      const m = (d.getMonth() + 1).toString();
      const y = d.getFullYear().toString();

      const matchMonth = selectedMonth === "Todos" || m === selectedMonth;
      const matchYear = selectedYear === "Todos" || y === selectedYear;

      return matchMonth && matchYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Calcula os totais por categoria e saldo final
  const { totalsById, balance, totalExpenses, expenseChartData } = useMemo(() => {
    const acc = {};
    let saldo = 0;
    let despesasTotais = 0;

    for (const c of categories) {
      acc[c.id] = 0;
    }

    // Processar transações filtradas
    for (const t of filteredTransactions) {
      const numericValue = Number(t.value);
      if (acc[t.categoryId] !== undefined) {
        acc[t.categoryId] += numericValue;
      }

      const cat = t.category ?? categories.find((c) => c.id === t.categoryId);
      if (cat?.isIncome) {
        saldo += numericValue;
      } else {
        saldo -= numericValue;
        despesasTotais += numericValue;
      }
    }

    // Gerar dados do gráfico especificamente de despesas
    const chartData = categories
      .filter((c) => !c.isIncome && acc[c.id] > 0)
      .map((c) => ({
        id: c.id,
        displayName: c.displayName,
        background: c.background,
        value: acc[c.id],
        percentage: despesasTotais > 0 ? (acc[c.id] / despesasTotais) * 100 : 0,
      }));

    return {
      totalsById: acc,
      balance: saldo,
      totalExpenses: despesasTotais,
      expenseChartData: chartData,
    };
  }, [filteredTransactions, categories]);

  // Renderizar o gráfico Donut SVG (apenas no Web)
  const renderWebDonutChart = () => {
    if (expenseChartData.length === 0) {
      return (
        <View style={styles.emptyChartContainer}>
          <Text style={styles.emptyChartText}>Nenhuma despesa para exibir no gráfico neste período.</Text>
        </View>
      );
    }

    const radius = 50;
    const strokeWidth = 16;
    const circumference = 2 * Math.PI * radius; // ~314.16
    let accumulatedAngle = -90; // Começar no topo (12 horas)

    return (
      <View style={styles.donutWrapper}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
          <svg width="200" height="200" viewBox="0 0 140 140">
            {expenseChartData.map((slice) => {
              const strokeDashoffset = circumference - (circumference * slice.percentage) / 100;
              const currentAngle = accumulatedAngle;
              accumulatedAngle += (slice.percentage * 360) / 100;

              return (
                <circle
                  key={slice.id}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={slice.background}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${currentAngle}, 70, 70)`}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              );
            })}
          </svg>
          <div style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: "11px", color: "#B1B1B1", fontWeight: "600", textTransform: "uppercase" }}>Despesas</span>
            <span style={{ fontSize: "16px", color: "#666666", fontWeight: "800", marginTop: "2px" }}>
              {totalExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>
      </View>
    );
  };

  // Renderizar gráfico para Native (Gráfico de Pizza/Donut usando Svg)
  const renderNativeDonutChart = () => {
    if (expenseChartData.length === 0) {
      return (
        <View style={styles.emptyChartContainer}>
          <Text style={styles.emptyChartText}>Nenhuma despesa para exibir no gráfico neste período.</Text>
        </View>
      );
    }

    const radius = 50;
    const strokeWidth = 16;
    const circumference = 2 * Math.PI * radius; // ~314.16
    let accumulatedAngle = -90; // Começar no topo (12 horas)

    return (
      <View style={styles.nativeChartContainer}>
        <Text style={styles.chartTitle}>Distribuição de Gastos</Text>

        <View style={styles.donutWrapper}>
          <View style={{ alignItems: "center", justifyContent: "center", position: "relative", width: 200, height: 200 }}>
            <Svg width="200" height="200" viewBox="0 0 140 140">
              {expenseChartData.map((slice) => {
                const strokeDashoffset = circumference - (circumference * slice.percentage) / 100;
                const currentAngle = accumulatedAngle;
                accumulatedAngle += (slice.percentage * 360) / 100;

                return (
                  <Circle
                    key={slice.id}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke={slice.background}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    rotation={currentAngle}
                    origin="70, 70"
                  />
                );
              })}
            </Svg>
            <View style={{
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Text style={{ fontSize: 10, color: "#8E8E93", fontWeight: "600", textTransform: "uppercase" }}>Despesas</Text>
              <Text style={{ fontSize: 15, color: colors.primaryText, fontWeight: "800", marginTop: 2, textAlign: "center" }}>
                {totalExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </Text>
            </View>
          </View>
        </View>

        {/* Legendas adicionais para guiar o usuário na leitura do gráfico de pizza */}
        <View style={styles.legendContainer}>
          {expenseChartData.map((item) => (
            <View key={item.id} style={styles.legendItem}>
              <View style={[styles.colorDot, { backgroundColor: item.background }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {item.displayName}
              </Text>
              <Text style={styles.legendValue}>
                {item.percentage.toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading && categories.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const balanceStyle =
    balance >= 0 ? globalStyles.positiveText : globalStyles.negativeText;

  return (
    <View style={globalStyles.screenContainer}>
      <ScrollView style={globalStyles.content}>
        {/* Componente de Filtro de Mês/Ano */}
        <MonthYearFilter />

        {/* Gráfico de Despesas */}
        {Platform.OS === "web" ? renderWebDonutChart() : renderNativeDonutChart()}

        <View style={styles.divider} />

        <Text style={styles.sectionHeading}>Categorias no Período</Text>
        
        {categories.map((category) => (
          <SummaryItem
            key={category.id}
            category={category}
            value={totalsById[category.id] ?? 0}
          />
        ))}

        <View style={[globalStyles.line, { marginVertical: 12 }]} />
        
        <View style={styles.balance}>
          <Text style={styles.balanceText}>Saldo no Período</Text>
          <Text style={[balanceStyle, styles.balanceValue]}>
            {balance.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  balance: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  balanceText: {
    fontSize: 18,
    color: colors.primaryText,
    fontWeight: "800",
  },
  balanceValue: {
    fontWeight: "800",
    fontSize: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primaryText,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondaryText,
    opacity: 0.2,
    marginVertical: 16,
  },
  // Estilos de Gráfico SVG Donut
  donutWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    alignSelf: "center",
  },
  emptyChartContainer: {
    padding: 24,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  emptyChartText: {
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: "center",
  },
  // Estilos do Gráfico Progress para Native convertido para Pizza (Donut)
  nativeChartContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryText,
    marginBottom: 14,
    textTransform: "uppercase",
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendContainer: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primaryText,
    marginRight: 6,
  },
  legendValue: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondaryText,
  },
});