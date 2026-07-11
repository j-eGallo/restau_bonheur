import { View, StyleSheet } from "react-native";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <View style={styles.container}>
      <TopBar />
      <Navbar />
    </View>
  )
}


const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#f2f2f2",
},
  h1: {
    color: 'red',
  }
});