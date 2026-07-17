import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import PlusPopulaire from "@/components/PlusPopulaire";
import PopType from "@/components/PopType";
import NouveauRes from "@/components/NouveauRes";
import PopParType from "@/components/PopParType";

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
      <PlusPopulaire />
      <PopType />
      {/* <ResAgain /> */}
      <NouveauRes />
      <PopParType />
    </View>
  )
}


const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#ffffff",
  overflow: "scroll"
},
  h1: {
    color: 'red',
  }
});