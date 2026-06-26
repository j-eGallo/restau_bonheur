import { View, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <h1>Coucouuu</h1>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  h1: {
    color: 'red',
  }
});