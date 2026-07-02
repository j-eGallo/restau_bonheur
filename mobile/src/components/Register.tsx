import { View, Text, TextInput, Image, StyleSheet } from "react-native";
import AppText from "../components/AppText";


export default function Register() {
  return (
    <View style={styles.root}>
    <View style={styles.card}>

    <View style={styles.formLR}>
    
    <Image
      source={require("../../assets/images/logo.png")}
      style={styles.logo}
    />
    
      <View style={styles.field}>
        <AppText style={styles.label}>Nom :</AppText>
        <TextInput style={styles.input} />
      </View>

      <View style={styles.field}>
        <AppText style={styles.label}>Prénom :</AppText>
        <TextInput style={styles.input} />
      </View>

      <View style={styles.field}>
        <AppText style={styles.label}>Adresse Email :</AppText>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <AppText style={styles.label}>Numéro de téléphone :</AppText>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
        />
      </View>
    </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    height: 661,
    width: 337,
    borderColor : "#ec5b15"
  },

  logo: {
    width: 166,
    resizeMode: "contain",
    alignSelf: "center"
  },

  formLR: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    gap: 20,
    height: 666,
    borderRadius: 20,
    borderWidth: 2,
    borderColor : "#ec5b15"
  },

  field: {
    gap: 8
  },

  label: {
    color: "black",
    fontSize: 12,
    fontWeight: "bold"
  },

  input: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    height: 38,
    color: "black",
  },
});