import Register from "@/components/Register";
import { View, Text, StyleSheet } from "react-native";

export default function Auth() {
  return (
    <View style={styles.container}>
      <View style={styles.topHalf} />
      <View style={styles.bottomHalf} />

      <View style={styles.content}>
        <Register />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topHalf: {
    flex: 1,
    height: 376,
    backgroundColor: "#ec5b15",
  },

  bottomHalf: {
    flex: 1.2,
    backgroundColor: "white",
  },

  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    padding: 20,
  },
});