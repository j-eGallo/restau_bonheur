import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function FormRes() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Formulaire de réservation</Text>
      <Text style={styles.text}>Restaurant ID : {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ec5b15",
  },

  text: {
    marginTop: 15,
    fontSize: 18,
    color: "#2D2D2D",
  },
});