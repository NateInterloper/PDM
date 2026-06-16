import { useContext, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../contexts/GlobalState";
import { colors } from "../constants/colors";
import Button from "./Button";

/**
 * Tela de login que intercepta o acesso ao app quando o usuário não está autenticado.
 * 
 * @returns {JSX.Element}
 */
export default function LoginScreen() {
  const { login } = useContext(MoneyContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleLogin = async () => {
    Keyboard.dismiss();
    setLocalError("");

    if (!username.trim()) {
      setLocalError("Por favor, digite seu nome ou email.");
      return;
    }
    if (username.trim().length < 3) {
      setLocalError("O nome de usuário deve conter pelo menos 3 caracteres.");
      return;
    }
    if (!password) {
      setLocalError("Por favor, digite sua senha.");
      return;
    }
    if (password.length < 4) {
      setLocalError("A senha deve conter pelo menos 4 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setLocalError(err.message || "Erro para autenticar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <MaterialIcons name="account-balance-wallet" size={48} color={colors.primaryContrast} />
            </View>
            <Text style={styles.title}>Minhas Finanças</Text>
            <Text style={styles.subtitle}>Controle financeiro simples e eficiente</Text>
          </View>

          <View style={styles.form}>
            {!!localError && (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={20} color={colors.negativesText || "#DA5567"} />
                <Text style={styles.errorText}>{localError}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Usuário ou Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person-outline" size={20} color={colors.inactive} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ex.: Guilherme"
                  placeholderTextColor={colors.inactive}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (localError) setLocalError("");
                  }}
                  autoCapitalize="sentences"
                  autoComplete="username"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha de Acesso</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" size={20} color={colors.inactive} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.inactive}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (localError) setLocalError("");
                  }}
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>
            </View>

            <View style={styles.buttonSpacing}>
              <Button onPress={handleLogin} disabled={submitting}>
                {submitting ? "Autenticando..." : "Entrar"}
              </Button>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Conexão local segura</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.primaryText,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF2F4",
    borderColor: "#FADBD8",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: colors.negativesText || "#DA5567",
    fontSize: 13,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.secondaryText,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.primaryText,
    fontSize: 15,
  },
  buttonSpacing: {
    marginTop: 8,
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
});
