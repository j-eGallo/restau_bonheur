import { View, TextInput, Image, StyleSheet, Pressable } from "react-native";
import { useState } from "react";

import AppText from "../components/AppText";

type RegisterProps = {
  onSwitchToLogin: () => void;
};

export default function Register({ onSwitchToLogin }: RegisterProps) {


  // State pour valider la première étape du formulaire d'inscription (en gros la première partie)
  const [etapeUneOk, setEtapeUneOk] = useState(false);


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


// Valider Inscription
  const handleRegister = async () => {
  if (password !== confirmPassword) {
    console.log("Les mots de passe ne correspondent pas");
    return;
  }

  try {
    
    
    
    const response = await fetch("http://localhost:8000/api/registerClient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom: nom,
        prenom: prenom,
        email: email,
        telephone: telephone,
        password: password,
      }),
    });

    const data = await response.json();

    console.log("STATUS :", response.status);
    console.log("REPONSE :", data);

    if (!response.ok) {
      console.log("Erreur inscription :", data);
      return;
    }

    console.log("Client inscrit :", data);

    onSwitchToLogin();
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
                  !etapeUneComplete && styles.submitDisabled
                ]}
                onPress={() => {
                  if (!etapeUneComplete) return;
                  setEtapeUneOk(true);
                  }}
>
  <AppText style={styles.btnext}>SUIVANT</AppText>
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
              </View>

              <Pressable
                style={styles.submit}
                onPress={handleRegister}
              >
                <AppText 
                style={styles.btnext} 
                >
                  INSCRIPTION
                </AppText>
              </Pressable>

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
}
});