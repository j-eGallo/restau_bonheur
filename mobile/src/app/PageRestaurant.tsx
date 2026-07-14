import { useState, useEffect } from "react";
import { useLocalSearchParams, useGlobalSearchParams, Link } from 'expo-router';
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import TopBar from "@/components/TopBar";
import PlusPopulaire from "@/components/PlusPopulaire";





type Restaurant = {
  id: number;
  nom: string;
  logo_url: string;
  telephone: string;
  nm_rue: string;
  rue: string;
  code_postal: string;
  ville: string;
  note_moyenne: number;
  nombre_avis: number;
  est_ouvert: boolean;
};


export default function PageRestaurant() {
  
  // Si je ne suis pas connecté, je serai automatiquement redirigé vers Auth
  useEffect(() => {
  const token = localStorage.getItem("client_token");

  if (!token) {
    router.replace("/auth");
  }
}, []);

  // Récupération de l'ID du restaurant:
  const { id } = useLocalSearchParams();


  // Récupération du restaurant complet :
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

    useEffect(() => {
 
    const fetchRestaurant = async () => {
    try {
    const response = await fetch(`http://localhost:8000/api/restaurant/get/${id}`);
    const data = await response.json();

    console.log("RESTAURANT :", data);
    setRestaurant(data.restaurant ?? null);

   }


  catch(error) {
        console.log("Erreur fetch Restaurant :", error);
  }
    }
      fetchRestaurant();
   }, [] );


  

  return (
    <View style={styles.page}>
      <TopBar />
      <Text>{restaurant?.nom}</Text>
    </View>
  )
}

  const styles = StyleSheet.create({
    page: {

    }
  })