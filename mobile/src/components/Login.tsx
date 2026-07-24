import {
  View,
  TextInput,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";import { useState } from "react";
import AppText from "../components/AppText";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Props pour retourner sur Register si pas de compte
type LoginProps = {
  onSwitchToRegister: () => void;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;


export default function Login({ onSwitchToRegister }: LoginProps) {

    // States pour chaque champs
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //States pour le chargement
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
  

  // Valider Inscription
const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    setError("Veuillez remplir tous les champs.");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      `${API_URL}/api/loginClient`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      }
    );

    const responseText = await response.text();

    let data: any = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      setError("Le serveur a renvoyé une réponse invalide.");
      return;
    }

    console.log("STATUS LOGIN :", response.status);
    console.log("RÉPONSE LOGIN :", data);

    if (!response.ok) {
      setError(
        data.error ??
          data.message ??
          "Adresse e-mail ou mot de passe incorrect."
      );
      return;
    }

    if (!data.token) {
      setError("Le serveur n'a renvoyé aucun token.");
      return;
    }

    await AsyncStorage.setItem(
      "client_token",
      data.token
    );

    // Seulement si ta route renvoie aussi data.client
    if (data.client) {
      await AsyncStorage.setItem(
        "client_user",
        JSON.stringify(data.client)
      );
    }

    router.replace("/home");
  } catch (error) {
    console.log("Erreur connexion :", error);

    setError(
      "Impossible de contacter le serveur."
    );
  } finally {
    setLoading(false);
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

          <Pressable
            style={[
              styles.submit,
              loading && styles.submitDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <AppText style={styles.btnext}>
                CONNEXION
              </AppText>
            )}
          </Pressable>
          {error !== "" && (
            <AppText style={styles.errorText}>
              {error}
            </AppText>
          )}

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

submitDisabled: {
  opacity: 0.65,
},

errorText: {
  color: "#c62828",
  fontSize: 14,
  textAlign: "center",
  fontWeight: "bold",
},
});