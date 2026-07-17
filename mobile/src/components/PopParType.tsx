import { useEffect, useState } from "react";
import { View, ScrollView, Image, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import AppText from "../components/AppText";


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

export default function PopParType() {

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

     return(
      <View
       style={styles.general}>
        
        {typesCuisine.map((typeCuisine) => {
          const restaurantsDuType = restaurants.filter((restaurant) =>
          restaurant.type_cuisines.some(
            (type) => type.id === typeCuisine.id,

          ),
          
        );

        if (!restaurantsDuType) {
          return null;
        }
                   
  return (
      <View key={typeCuisine.id}>
    <AppText style={styles.titre}>
      LES MEILLEURS RESTAU {typeCuisine.nom.toUpperCase()}
    </AppText>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent} 
    key={typeCuisine.id}>
      {restaurantsDuType.map((restaurant) => {
        return (
          <View key={restaurant.id} style={styles.bande}>
                <Image
                  source={{ uri: getImageUrl(restaurant.logo_url) }}
                  style={styles.logo}
                />
            <AppText style={styles.nom}>{restaurant.nom}</AppText>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  style={[
                    styles.star,
                    star <= Math.round(restaurant.note_moyenne)
                      ? styles.starActive
                      : styles.starInactive
                  ]}
                >
                  ★
          </Text>
        ))}
      </View>
          </View>
        );
      })}
      

    </ScrollView>
    </View>
  );
})}
      </View>
     )
}

const styles = StyleSheet.create({
  general: {
    height: 800
  },

  bande: {
    marginBottom : 40
  },

  titre : {
    color: "#ec5b15",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 20,
    fontWeight: 900
  },
  
  scrollContent: {
  gap: 18,
  paddingHorizontal: 12,
},

logo : {
  height: 200,
  width: 200
},

nom : {
  fontSize: 20,
  fontWeight: 900
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