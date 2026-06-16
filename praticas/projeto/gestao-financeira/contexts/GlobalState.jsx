import { createContext, useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

export const MoneyContext = createContext();

/**
 * Provider global do app.
 *
 * Centraliza:
 *  - hidratação inicial das categorias e transações a partir da API REST;
 *  - estado de carregamento e erro de rede;
 *  - ações para criar/excluir transações e categorias mantendo o estado em sync.
 *  - estado de filtro de mês e ano.
 *  - estado de autenticação de usuário persistido localmente.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element} Provider com o objeto de contexto exposto via `MoneyContext`.
 */
export default function GlobalState({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros de mês e ano (padrão: "Todos")
  const [selectedMonth, setSelectedMonth] = useState("Todos");
  const [selectedYear, setSelectedYear] = useState("Todos");

  // Estado de autenticação do usuário
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Inicialização rápida: carregar usuário persistido
  useEffect(() => {
    async function loadUser() {
      try {
        const stored = await AsyncStorage.getItem("@gestao_user");
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Erro ao carregar usuário autenticado", e);
      } finally {
        setAuthLoading(false);
      }
    }
    loadUser();
  }, []);

  /**
   * Realiza login local com validação básica de acesso.
   */
  const login = useCallback(async (username, password) => {
    if (!username || username.trim().length < 3) {
      throw new Error("O nome de usuário deve conter no mínimo 3 caracteres.");
    }
    if (!password || password.length < 4) {
      throw new Error("A senha deve conter no mínimo 4 caracteres.");
    }
    const userData = { username: username.trim() };
    setUser(userData);
    await AsyncStorage.setItem("@gestao_user", JSON.stringify(userData));
  }, []);

  /**
   * Realiza o logout, limpando cache local.
   */
  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem("@gestao_user");
  }, []);

  /**
   * Recarrega categorias e transações do servidor em paralelo.
   *
   * @returns {Promise<void>} Resolve quando ambos os GETs terminarem.
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, txs] = await Promise.all([
        api.listCategories(),
        api.listTransactions(),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch (e) {
      setError(e.message ?? "Falha ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Cria uma nova transação no servidor e adiciona-a ao estado local.
   *
   * @param {{description: string, value: number, date: Date|string, categoryId: string}} data
   * @returns {Promise<object>} Transação criada (já com a categoria expandida).
   */
  const addTransaction = useCallback(async (data) => {
    const created = await api.createTransaction(data);
    setTransactions((prev) => [created, ...prev]);
    return created;
  }, []);

  /**
   * Atualiza uma transação existente no servidor e no estado local.
   *
   * @param {string} id - id da transação.
   * @param {object} data - dados atualizados (parcial).
   * @returns {Promise<object>} Transação atualizada.
   */
  const updateTransaction = useCallback(async (id, data) => {
    const updated = await api.updateTransaction(id, data);
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  /**
   * Exclui uma transação no servidor e remove-a do estado local.
   *
   * @param {string} id - id (cuid) da transação.
   * @returns {Promise<void>}
   */
  const removeTransaction = useCallback(async (id) => {
    await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Cria uma nova categoria no servidor e adiciona-a ao estado local.
   *
   * @param {{name: string, displayName: string, icon: string, background: string, isIncome?: boolean}} data
   * @returns {Promise<object>} Categoria criada.
   */
  const addCategory = useCallback(async (data) => {
    const created = await api.createCategory(data);
    setCategories((prev) =>
      [...prev, created].sort((a, b) => a.displayName.localeCompare(b.displayName))
    );
    return created;
  }, []);

  /**
   * Exclui uma categoria no servidor e remove-a do estado local.
   * Categorias padrão (`isDefault`) são bloqueadas pelo back-end.
   *
   * @param {string} id - id (cuid) da categoria.
   * @returns {Promise<void>}
   */
  const removeCategory = useCallback(async (id) => {
    await api.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <MoneyContext.Provider
      value={{
        transactions,
        categories,
        loading,
        error,
        refresh,
        addTransaction,
        updateTransaction,
        removeTransaction,
        addCategory,
        removeCategory,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        user,
        authLoading,
        login,
        logout,
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
}