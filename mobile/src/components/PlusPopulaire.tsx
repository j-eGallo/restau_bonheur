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

export default function PlusPopulaire() {

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Appel de la route API
  useEffect(() => {
 
    const fetchRestaurantsPopulaires = async () => {
    try {
    const response = await fetch("http://localhost:8000/api/restaurant/RestauPlusPop");
    const data = await response.json();

    console.log("RESTAURANTS POPULAIRES :", data);
    setRestaurants(data.restaurants ?? []);

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
    <View style={styles.page}>
      <Text style={styles.titre}>LES PLUS POPULAIRES</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >


        {restaurants.map((restaurant) => (
          <Pressable
            key={restaurant.id}
            style={styles.card}
            onPress={() => goToPage(restaurant.id)}
          >

            <Image
              source={{ uri: getImageUrl(restaurant.logo_url) }}
              style={styles.logo}
            />

            <View style={styles.top}>
              <Text style={styles.label}>
                {restaurant.nom}
              </Text>
              <Text
              style={[
                restaurant.est_ouvert ? styles.ouvert : styles.ferme
              ]}
              >{restaurant.est_ouvert ? "OUVERT" : "FERMÉ"}
              </Text>
            </View>


            <View style={styles.bottom}>            
                <Text style={styles.type}>
                {restaurant.type_cuisines.map((typeCuisine) => typeCuisine.nom.charAt(0).toUpperCase() + typeCuisine.nom.slice(1)).join(", ")}
              </Text>
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

          </Pressable>
        ))}
      </ScrollView>
    </View>
   )
}

const styles = StyleSheet.create({
  top: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  },

  titre: {
    color: "#ec5b15",
    fontSize: 20,
    fontWeight: 900,
    textAlign: "center",
    marginBottom: 40
  },

    ouvert : {
    color: "green",
    fontSize: 15,
    fontWeight: 900,
    alignSelf: "flex-end"
  },

  ferme: {
    color: "red",
    fontSize: 15,
    fontWeight: 900
  },

  bottom : {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  },

  stars : {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  },

  star : {
    fontSize: 25
  },

  starActive : {
    color: "#ec5b15",
  },

  starInactive: {
    color: "#2D2D2D"
  },

  page: {
    height: 450,
    backgroundColor: "white",
    marginTop: 55
  },

    scrollContent: {
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 18,
  },

  card: {
    height: 347,
    width: 306,
  },

  logo: {
    height: 299,
    width: 307
  },

  label : {
    fontSize: 25,
    fontWeight: 900
  },

  type: {
    color: '#ec5b15',
    fontSize: 20,
    fontWeight: 900
  }

});