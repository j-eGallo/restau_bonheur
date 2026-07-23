import { View, TextInput, Image, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";

import AppText from "../components/AppText";

type RegisterProps = {
  onSwitchToLogin: () => void;
};

export default function Register({ onSwitchToLogin }: RegisterProps) {


  // State pour valider la première étape du formulaire d'inscription (en gros la première partie)
  const [etapeUneOk, setEtapeUneOk] = useState(false);

  // State pour chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // States pour chaque champs
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


// Valider étape une du formulaire 
const etapeUneComplete =
  nom.trim() !== "" &&
  prenom.trim() !== "" &&
  email.trim() !== "" &&
  telephone.trim() !== "";

// Vérification de la validité du mot de passe
const motDePasseValide =
  password.length >= 8 &&
  confirmPassword.length >= 8 &&
  password === confirmPassword;


// Valider Inscription
const handleRegister = async () => {
  if (!password.trim() || !confirmPassword.trim()) {
    setError("Veuillez remplir les deux champs de mot de passe.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Les mots de passe ne correspondent pas.");
    return;
  }

  if (password.length < 8) {
    setError(
      "Le mot de passe doit contenir au moins 8 caractères."
    );
    return;
  }

  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      "http://localhost:8000/api/registerClient",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim(),
          telephone: telephone.trim(),
          password,
        }),
      }
    );

    const responseText = await response.text();

    let data: any = {};

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      setError(
        "Le serveur a renvoyé une réponse invalide."
      );
      return;
    }

    console.log("STATUS INSCRIPTION :", response.status);
    console.log("RÉPONSE INSCRIPTION :", data);

    if (!response.ok) {
      setError(
        data.error ??
          data.message ??
          "Impossible de créer le compte."
      );
      return;
    }

    console.log("Client inscrit :", data);

    onSwitchToLogin();
  } catch (error) {
    console.log("Erreur inscription :", error);

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

          {!etapeUneOk ? (
            <>
              <View style={styles.field}>
                <AppText style={styles.label}>Nom :</AppText>
                <TextInput style={styles.input} value={nom} onChangeText={setNom}/>
              </View>

              <View style={styles.field}>
                <AppText style={styles.label}>Prénom :</AppText>
                <TextInput style={styles.input} value={prenom} onChangeText={setPrenom}/>
              </View>

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
                <AppText style={styles.label}>Numéro de téléphone :</AppText>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                   value={telephone}
                   onChangeText={setTelephone}
                />
              </View>

            <Pressable
              style={[
                styles.submit,
                !etapeUneComplete && styles.submitDisabled,
              ]}
              onPress={() => {
                if (!etapeUneComplete) return;

                setError("");
                setEtapeUneOk(true);
              }}
              disabled={!etapeUneComplete}
            >
              <AppText style={styles.btnext}>
                SUIVANT
              </AppText>
            </Pressable>
            </>
          ) : (
            <>
              <View style={styles.field}>
                <AppText style={styles.label}>Mot de passe :</AppText>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                   value={password}
                   onChangeText={setPassword}
                />
              <AppText
                style={[
                  styles.passwordHint,
                  password.length >= 8 && styles.passwordHintValid,
                ]}
              >
                {password.length >= 8
                  ? "✓ Minimum 8 caractères respecté"
                  : `${password.length}/8 caractères minimum`}
              </AppText>
              </View>

              <View style={styles.field}>
                <AppText style={styles.label}>
                  Confirmer le mot de passe :
                </AppText>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              {confirmPassword.length > 0 && (
                <AppText
                  style={[
                    styles.passwordHint,
                    password === confirmPassword &&
                      styles.passwordHintValid,
                  ]}
                >
                  {password === confirmPassword
                    ? "✓ Les mots de passe correspondent"
                    : "Les mots de passe ne correspondent pas"}
                </AppText>
              )}
              </View>

              <Pressable
                style={[
                  styles.submit,
                  (!motDePasseValide || loading) &&
                    styles.submitDisabled,
                  loading && styles.submitLoading,
                ]}
                onPress={handleRegister}
                disabled={!motDePasseValide || loading}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="white"
                  />
                ) : (
                  <AppText style={styles.btnext}>
                    INSCRIPTION
                  </AppText>
                )}
              </Pressable>

              {error !== "" && (
                <AppText style={styles.errorText}>
                  {error}
                </AppText>
              )}

              <Pressable
                style={styles.backButton}
                onPress={() => setEtapeUneOk(false)}
              >
                <AppText style={styles.backText}>Retour</AppText>
              </Pressable>
            </>
          )}

          <Pressable onPress={onSwitchToLogin}>
            <AppText style={styles.switchText}>
              Déjà un compte ? Se connecter
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

  submitDisabled: {
  backgroundColor: "#bdbdbd",
} ,

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

  submitLoading: {
    opacity: 0.65,
  },

  errorText: {
    color: "#c62828",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },

  passwordHint: {
  color: "#c62828",
  fontSize: 12,
  fontWeight: "bold",
  marginTop: -4,
  },

  passwordHintValid: {
    color: "#2e7d32",
  },
});