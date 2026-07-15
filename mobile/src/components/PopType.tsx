import { useEffect, useState } from "react";
import { View, ScrollView, Image, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

// Props
type TypeCuisine = {
  id: number;
  nom: string;
  logo_url: string;
};

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
  type_cuisines: TypeCuisine[];
};

export default function PopType() {

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [typesCuisine, setTypesCuisine] = useState<TypeCuisine[]>([]);
  
    // Appel de la route API
    useEffect(() => {
   
      const fetchRestaurantsPopulaires = async () => {
      try {
      const response = await fetch("http://localhost:8000/api/restaurant/RestauPlusPop");
      const data = await response.json();
  
      console.log("RESTAURANTS POPULAIRES :", data);


      //Filtrer et limiter les restau à UN par type_cuisine
        const restaurantsRecus = data.restaurants ?? [];

        const typesUniques = restaurantsRecus
        .flatMap((restaurant: Restaurant) => restaurant.type_cuisines)
        .filter(
          (typeCuisine: TypeCuisine, index: number, tableau: TypeCuisine[]) => 
            index === tableau.findIndex(
              (type) => type.id === typeCuisine.id
            )
        );
        setRestaurants(restaurantsRecus);
        setTypesCuisine(typesUniques);
     }

  
  
    catch(error) {
          console.log("Erreur fetch types cuisine :", error);
    }
      }
        fetchRestaurantsPopulaires();
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
  <View style={styles.general}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {typesCuisine.map((typeCuisine) => {
        const restaurantDuType = restaurants.find((restaurant) =>
          restaurant.type_cuisines.some(
            (type) => type.id === typeCuisine.id,
          ),
        );

        if (!restaurantDuType) {
          return null;
        }

return (
  <Pressable
    key={typeCuisine.id}
    style={styles.card}
    onPress={() => goToPage(restaurantDuType.id)}
  >
    <Image
      source={{ uri: getImageUrl(restaurantDuType.logo_url) }}
      style={styles.logo}
    />

    <View style={styles.overlay}>
      <Text style={styles.nomRestaurant}>
        {restaurantDuType.nom}
      </Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              star <= Math.round(restaurantDuType.note_moyenne)
                ? styles.starActive
                : styles.starInactive
            ]}
          >
            ★
          </Text>
        ))}
      </View>
    </View>
  </Pressable>
);
      })}
    </ScrollView>
  </View>
);


}

const styles = StyleSheet.create({
  general: {
    marginBottom: 80,
  },

  scrollContent: {
  gap: 18,
  paddingHorizontal: 12,
},

card: {
  width: 250,
  height: 250,
  position: "relative",
  overflow: "hidden",
},

logo: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},

overlay: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(45, 45, 45, 0.8)",
  paddingHorizontal: 12,
  paddingVertical: 12,
},

nomRestaurant: {
  color: "white",
  fontSize: 20,
  fontWeight: 700,
},

stars: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 4,
},

star: {
  fontSize: 24,
  marginRight: 2,
},

starActive: {
  color: "#ec5b15",
},

starInactive: {
  color: "white",
},
})