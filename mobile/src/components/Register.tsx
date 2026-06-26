import { View, Text, TextInput, StyleSheet } from "react-native";

export default function Register() {
  return (
    <View style={styles.formLR}>
      <View style={styles.field}>
        <Text style={styles.label}>Nom :</Text>
        <TextInput style={styles.input} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Prénom :</Text>
        <TextInput style={styles.input} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Adresse Email :</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Numéro de téléphone :</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formLR: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    justifyContent: "center",
    gap: 20,
  },

  field: {
    gap: 8,
  },

  label: {
    color: "black",
    fontSize: 22,
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: "black",
  },
});