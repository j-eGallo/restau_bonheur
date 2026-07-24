import { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

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

const API_URL = process.env.EXPO_PUBLIC_API_URL;


export default function SearchRestaurants() {
  const { q } = useLocalSearchParams();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${API_URL}/api/restaurant/RestauPlusPop`);
        const data = await response.json();

        const motRecherche = String(q ?? "").toLowerCase();

        const resultats = (data.restaurants ?? []).filter((restaurant: Restaurant) =>
          restaurant.nom.toLowerCase().includes(motRecherche) ||
          restaurant.ville.toLowerCase().includes(motRecherche) ||
          restaurant.type_cuisines.some((type) =>
            type.nom.toLowerCase().includes(motRecherche)
          )
        );

        setRestaurants(resultats);
      } catch (error) {
        console.log("Erreur recherche restaurants :", error);
      }
    };

    fetchRestaurants();
  }, [q]);

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL est introuvable dans le fichier .env");
}

const getImageUrl = (logoUrl: string) => {
  if (!logoUrl) {
    return "";
  }

  if (logoUrl.startsWith("http://localhost:8000")) {
    return logoUrl.replace("http://localhost:8000", API_URL);
  }

  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    return logoUrl;
  }

  return `${API_URL}${logoUrl.startsWith("/") ? logoUrl : `/${logoUrl}`}`;
};

  const goToPage = (id: number) => {
    router.push({
      pathname: "/PageRestaurant",
      params: { id },
    });
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.replace("/home")}>
        <Text style={styles.back}>← Retour</Text>
      </Pressable>

      <Text style={styles.titre}>
        Recherche : {q}
      </Text>

      {restaurants.length === 0 && (
        <Text style={styles.empty}>
          Aucun restaurant trouvé.
        </Text>
      )}

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

          <View>
            <Text style={styles.nom}>{restaurant.nom}</Text>
            <Text style={styles.ville}>{restaurant.ville}</Text>
            <Text style={styles.type}>
              {restaurant.type_cuisines.map((type) => type.nom).join(", ")}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "white",
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  back: {
    color: "#ec5b15",
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 25,
  },

  titre: {
    color: "#ec5b15",
    fontSize: 24,
    fontWeight: 900,
    marginBottom: 25,
    textAlign: "center",
  },

  empty: {
    textAlign: "center",
    fontSize: 18,
    color: "#2D2D2D",
  },

  card: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
    alignItems: "center",
  },

  logo: {
    width: 110,
    height: 90,
    borderRadius: 10,
  },

  nom: {
    fontSize: 22,
    fontWeight: 900,
    color: "#2D2D2D",
  },

  ville: {
    fontSize: 16,
    color: "#555",
  },

  type: {
    fontSize: 16,
    color: "#ec5b15",
    fontWeight: 900,
  },
});