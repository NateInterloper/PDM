import { Picker } from "@react-native-picker/picker";
import { Platform, StyleSheet, Text, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import { colors } from "../constants/colors";

/**
 * Picker de categoria que itera dinamicamente sobre a lista vinda do back-end.
 *
 * @param {{
 *   form: { categoryId: string },
 *   setForm: (next: object) => void,
 *   categories: Array<{ id: string, displayName: string }>
 * }} props
 * @returns {JSX.Element}
 */
export default function CategoryPicker({ form, setForm, categories }) {
  return (
    <View>
      <Text style={globalStyles.inputLabel}>Categoria</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={form.categoryId}
          onValueChange={(itemValue) =>
            setForm({ ...form, categoryId: itemValue })
          }
          style={styles.picker}
        >
          {categories.map((c) => (
            <Picker.Item key={c.id} label={c.displayName} value={c.id} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});