import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Parametres() {
  const logout = async () => {
    await AsyncStorage.removeItem("client_token");
    await AsyncStorage.removeItem("client_user");

    router.replace("/auth");
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Mes paramètres</Text>

      <Pressable onPress={logout} style={styles.button}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#ec5b15",
    marginBottom: 30,
  },

  button: {
    backgroundColor: "#ec5b15",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
});