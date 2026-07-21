import { View, Text, Pressable, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";


export default function RestaurantsByType() {
  const { id } = useLocalSearchParams();
  

  return (
    <View style={styles.page}>
      <Pressable
        onPress={() => router.replace("/home")}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>
      <Text style={styles.text}>
        Restaurants du type cuisine : {id}
      </Text>
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

  text: {
    fontSize: 24,
    fontWeight: 900,
    color: "#ec5b15",
  },
  backButton: {
  marginTop: 50,
  marginLeft: 20,
  paddingVertical: 10,
  paddingHorizontal: 15,
  backgroundColor: "#ec5b15",
  borderRadius: 8,
  alignSelf: "flex-start",
},

  backText: {
    color: "white",
    fontSize: 18,
    fontWeight: 900,
  },
});