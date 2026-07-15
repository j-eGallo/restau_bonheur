import { useEffect, useState } from "react";
import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import AppText from "../components/AppText";
import { router } from "expo-router";

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



export default function NouveauRes() {

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

      // Appel de la route API
  useEffect(() => {
 
    const fetchSixDerniers = async () => {
    try {
    const response = await fetch("http://localhost:8000/api/restaurant/latest");
    const data = await response.json();

    console.log("6 DERNIERS RESTAURANTS :", data);
    setRestaurants(data.restaurants ?? []);

   }


  catch(error) {
        console.log("Erreur fetch restaurants :", error);
  }
    }
      fetchSixDerniers();
   }, [] );

   // Appel de l'image principale du restaurant
   const getImageUrl = (logoUrl: string) => {
  if (logoUrl.startsWith("http")) {
    return logoUrl;
  }

  if (logoUrl.startsWith("/uploads")) {
    return `http://localhost:8000${logoUrl}`;
  }

  return `http://localhost:8000/images/restaurants/${logoUrl}`;
};


// Navigation vers le restaurant cliqué :
const goToPage = (id: number) => {
  router.push({
    pathname: "/PageRestaurant",
    params: { id },
  });
};
return (
  <View style={styles.container}>
    <AppText style={styles.titre}>
      LES NOUVEAUX RESTAURANTS
    </AppText>

    <View style={styles.grid}>
      {restaurants.map((restaurant) => {
        return (
          <Pressable
            key={restaurant.id}
            style={styles.card}
            onPress={() => goToPage(restaurant.id)}
          >
            <Image
              source={{ uri: getImageUrl(restaurant.logo_url) }}
              style={styles.logo}
            />

            <View style={styles.overlay}>
              <AppText style={styles.nom}>
                {restaurant.nom}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingTop: 25,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },

  titre: {
    color: "#ec5b15",
    fontSize: 20,
    fontWeight: 900,
    textAlign: "center",
    marginBottom: 45,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },

  card: {
    width: "47%",
    aspectRatio: 1,
    position: "relative",
    overflow: "hidden",
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
    backgroundColor: "rgba(45, 45, 45, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  nom: {
    color: "white",
    fontSize: 18,
    fontWeight: 900,
    textAlign: "center",
  },
});