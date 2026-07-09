import { View, TextInput, Image, StyleSheet, Pressable } from "react-native";
import { useEffect } from "react";
import AppText from "../components/AppText";

import { useState } from "react";

type RegisterProps = {
  onSwitchToLogin: () => void;
};



export default function Register({ onSwitchToLogin }: RegisterProps) {

  // State pour valider la première étape du formulaire d'inscription (en gros la première partie)
  const [etapeUneOk, setEtapeUneOk] = useState(false);
    



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

              <Pressable
                style={styles.submit}
                onPress={() => setEtapeUneOk(true)}
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
                />
              </View>

              <View style={styles.field}>
                <AppText style={styles.label}>Confirmer le mot de passe :</AppText>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                />
              </View>

              <Pressable
                style={styles.submit}
                onPress={() => console.log("Inscription")}
              >
                <AppText style={styles.btnext}>INSCRIPTION</AppText>
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