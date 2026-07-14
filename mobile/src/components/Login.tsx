import { View, TextInput, Image, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
import AppText from "../components/AppText";
import { router } from "expo-router";


// Props pour retourner sur Register si pas de compte
type LoginProps = {
  onSwitchToRegister: () => void;
};

export default function Login({ onSwitchToRegister }: LoginProps) {

    // States pour chaque champs
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  

  // Valider Inscription
  const handleLogin = async () => {
    const token = localStorage.getItem("client_token");
  try {
    
    
    // Appel de la route API
    const response = await fetch("http://localhost:8000/api/loginClient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    console.log("STATUS :", response.status);
    console.log("REPONSE :", data);

    if (!response.ok) {
      console.log("Erreur connexion :", data);
      return;
    }

    console.log("Client bien connecté :", data);
    router.replace("/home");
    
    localStorage.setItem("client_token", data.token);
  
  } catch (error) {
    console.log("Erreur fetch inscription :", error);
  }
};
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.formLR}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />

          <View style={styles.field}>
            <AppText style={styles.label}>Adresse Email :</AppText>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <AppText style={styles.label}>Mot de passe :</AppText>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable style={styles.submit} onPress={handleLogin}>
            <AppText style={styles.btnext}>CONNEXION</AppText>
          </Pressable>

          <Pressable onPress={onSwitchToRegister}>
            <AppText style={styles.switchText}>
              Pas encore de compte ? S'inscrire
            </AppText>
          </Pressable>
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
    borderColor: "#ec5b15",
  },

  logo: {
    width: 166,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
  },

  formLR: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    gap: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ec5b15",
  },

  field: {
    gap: 8,
  },

  label: {
    color: "black",
    fontSize: 12,
    fontWeight: "bold",
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

  submit: {
    backgroundColor: "#ec5b15",
    width: 113,
    height: 38,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 6,
    marginTop: 32,
  },

  btnext: {
    color: "white",
    textAlign: "center",
  },

  backButton: {
    alignSelf: "center",
  },

  backText: {
    color: "#ec5b15",
    textAlign: "center",
    fontWeight: "bold",
  },
  switchText: {
  marginTop: 12,
  color: "#ec5b15",
  textAlign: "center",
  fontWeight: "bold",
},
});