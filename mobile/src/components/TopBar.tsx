import { View, Image, StyleSheet } from "react-native";

export default function TopBar() {
  return (
    <View style={styles.topbar}>
          <Image
            source={require("../../assets/images/logow.png")}
            style={styles.logo}
          />
    </View>
  )
}

const styles = StyleSheet.create({
  topbar: {
    height: 63,
    width: "100%",
    backgroundColor: "#ec5b15",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  logo: {
    height: 39,
    width: 135,
  }
});