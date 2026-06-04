import { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { MoneyContext } from "../../contexts/GlobalState";
import TransactionItem from "../../components/TransactionItem";
import MonthYearFilter from "../../components/MonthYearFilter";
import Button from "../../components/Button";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";

/**
 * Tela "Transações".
 *
 * Exibe a mensagem de boas-vindas ao usuário logado, filtros de mês/ano,
 * lista filtrada de transações com pull-to-refresh e permite edições/exclusão
 * completa através de um modal reativo disparado ao segurar o item (long-press).
 *
 * @returns {JSX.Element}
 */
export default function Transactions() {
  const {
    transactions,
    categories,
    loading,
    error,
    refresh,
    updateTransaction,
    removeTransaction,
    selectedMonth,
    selectedYear,
    user,
    logout,
  } = useContext(MoneyContext);

  // Estados locais para controle do Modal de Edição
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editValue, setEditValue] = useState("0");
  const [editDate, setEditDate] = useState(new Date());
  const [editCategoryId, setEditCategoryId] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Filtragem local baseada na escolha de Mês/Ano das categorias globais
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

  // Ao segurar o item de transação, abrimos o Modal hidratando os campos
  const handleLongPress = (item) => {
    setEditingId(item.id);
    setEditDescription(item.description);
    setEditValue((item.value * 100).toFixed(0)); // Convertemos para centavos para formatar o input de moeda
    setEditDate(new Date(item.date));
    setEditCategoryId(item.categoryId);
    setModalVisible(true);
  };

  // Input de Moeda com máscara BRL
  const handleCurrencyChange = (text) => {
    const formatted = text.replace(/\D/g, "");
    setEditValue(formatted);
  };

  // Tratamento da mudança de data no Picker nativo
  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditDate(selectedDate);
    }
  };

  // Salvar mudanças do modal
  const handleSaveEdit = async () => {
    if (!editDescription.trim()) {
      Alert.alert("Erro", "A descrição não pode ficar vazia.");
      return;
    }

    const numericValue = editValue ? parseFloat(editValue) / 100 : 0;
    if (numericValue <= 0) {
      Alert.alert("Erro", "O valor deve ser maior que zero.");
      return;
    }

    if (!editCategoryId) {
      Alert.alert("Erro", "Por favor, selecione uma categoria.");
      return;
    }

    setSubmittingEdit(true);
    try {
      await updateTransaction(editingId, {
        description: editDescription.trim(),
        value: numericValue,
        date: editDate,
        categoryId: editCategoryId,
      });
      setModalVisible(false);
      Alert.alert("Sucesso", "Transação atualizada com sucesso!");
    } catch (err) {
      Alert.alert("Erro ao salvar", err.message || "Tente novamente.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Excluir a transação a partir de dentro do próprio modal
  const handleCloseAndDelete = () => {
    Alert.alert(
      "Excluir transação",
      `Deseja realmente excluir "${editDescription}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await removeTransaction(editingId);
              setModalVisible(false);
              Alert.alert("Sucesso", "Transação excluída!");
            } catch (err) {
              Alert.alert("Erro ao excluir", err.message || "Tente novamente.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.secondaryText}>Carregando transações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <Text style={globalStyles.primaryText}>Não foi possível carregar.</Text>
        <Text style={globalStyles.secondaryText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={styles.retry}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Valor numérico formatado para exibição amigável no input do modal
  const displayFormattedValue = (parseFloat(editValue || "0") / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <View style={globalStyles.screenContainer}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleLongPress(item)}
            activeOpacity={0.7}
            delayLongPress={500}
            style={styles.itemWrapper}
          >
            <TransactionItem {...item} />
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={styles.headerComponentContainer}>
            {/* Mensagem de Boas Vindas */}
            <View style={styles.welcomeBanner}>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeGreeting}>Olá, {user?.username || "Visitante"}! 👋</Text>
                <Text style={styles.welcomeSubtitle}>Tenha um ótimo controle financeiro hoje!</Text>
              </View>
              <TouchableOpacity onPress={logout} style={styles.logoutButton} hitSlop={12}>
                <MaterialIcons name="logout" size={22} color={colors.negativesText || "#DA5567"} />
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>

            {/* Filtro de Mês/Ano */}
            <MonthYearFilter />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Histórico de Registros</Text>
              <Text style={styles.sectionSubtitle}>Segure para editar ou remover</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="money-off" size={48} color={colors.inactive} />
            <Text style={[globalStyles.secondaryText, styles.emptyText]}>
              Ainda não há nenhum item para este período! Adicione na aba do meio ou limpe os filtros.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Modal de Detalhes / Edição / Exclusão */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Registro</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={12}>
                <MaterialIcons name="close" size={24} color={colors.primaryText} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View>
                <Text style={globalStyles.inputLabel}>Descrição</Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  style={globalStyles.input}
                  placeholder="ex.: Mercado"
                />
              </View>

              <View>
                <Text style={globalStyles.inputLabel}>Valor</Text>
                <TextInput
                  value={displayFormattedValue}
                  onChangeText={handleCurrencyChange}
                  keyboardType="numeric"
                  style={globalStyles.input}
                />
              </View>

              <View>
                <Text style={globalStyles.inputLabel}>Data</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
                  <TextInput
                    value={editDate.toLocaleDateString("pt-BR")}
                    style={[globalStyles.input, { color: colors.primaryText }]}
                    editable={false}
                  />
                  <MaterialIcons name="event" size={20} color={colors.primary} style={styles.dateIcon} />
                </TouchableOpacity>

                {showDatePicker && (
                  <RNDateTimePicker
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    value={editDate}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              <View>
                <Text style={globalStyles.inputLabel}>Categoria</Text>
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={editCategoryId}
                    onValueChange={(val) => setEditCategoryId(val)}
                    style={styles.picker}
                  >
                    {categories.map((c) => (
                      <Picker.Item key={c.id} label={c.displayName} value={c.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                onPress={handleCloseAndDelete}
                style={[styles.modalButton, styles.deleteButton]}
              >
                <MaterialIcons name="delete" size={18} color="#FFFFFF" />
                <Text style={styles.buttonTextWhite}>Excluir</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Button onPress={handleSaveEdit} disabled={submittingEdit}>
                  {submittingEdit ? "Salvando..." : "Salvar"}
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  headerComponentContainer: {
    marginBottom: 8,
  },
  welcomeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  welcomeTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: colors.primaryText,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 10,
    color: colors.negativesText || "#DA5567",
    fontWeight: "600",
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primaryText,
    textTransform: "uppercase",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 1,
  },
  itemWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 18,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  retry: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.primaryContrast,
    fontWeight: "600",
  },
  // Estilos do Modal de Edição
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primaryText,
  },
  modalForm: {
    gap: 12,
    marginBottom: 24,
  },
  pickerBox: {
    borderColor: colors.secondaryText,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      web: {
        height: 42,
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
        height: 40,
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
  dateSelector: {
    position: "relative",
    justifyContent: "center",
  },
  dateIcon: {
    position: "absolute",
    right: 16,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  modalButton: {
    height: 44,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  deleteButton: {
    backgroundColor: colors.negativesText || "#DA5567",
    gap: 6,
  },
  buttonTextWhite: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});