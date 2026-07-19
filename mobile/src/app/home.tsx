import { useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import PlusPopulaire from "@/components/PlusPopulaire";
import PopType from "@/components/PopType";
import NouveauRes from "@/components/NouveauRes";
import PopParType from "@/components/PopParType";
import ResAgain from "@/components/ResAgain";
import BottomNav from "@/components/BottomNav";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
  
  // Si je ne suis pas connecté, je serai automatiquement redirigé vers Auth
useEffect(() => {
  const checkToken = async () => {
    const token = await AsyncStorage.getItem("client_token");

    if (!token) {
      router.replace("/auth");
    }
  };

  checkToken();
}, []);

return (
  <View style={styles.container}>
      <TopBar />
      <Navbar />
    <ScrollView contentContainerStyle={styles.content}>
      <PlusPopulaire />
      <PopType />
      <ResAgain />
      <NouveauRes />
      <PopParType />
    </ScrollView>

    <BottomNav />
  </View>
);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    position: "relative",
  },

  content: {
    paddingTop: 163,
    paddingBottom: 800,
  },
});