import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";

export default function Home() {
  
  // Si je ne suis pas connecté, je serai automatiquement redirigé vers Auth
  useEffect(() => {
  const token = localStorage.getItem("client_token");

  if (!token) {
    router.replace("/auth");
  }
}, []);

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