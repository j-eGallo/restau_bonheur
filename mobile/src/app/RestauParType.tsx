import { useEffect, useState } from "react";
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AppText from "../components/AppText";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";
import BottomNav from "@/components/BottomNav";

type Restaurant = {
  id: number;
  nom: string;
  logo_url?: string;
  note_moyenne?: number;
  nombre_avis?: number;
  ville?: string;
};


const API_URL = process.env.EXPO_PUBLIC_API_URL;


export default function RestaurantsByType() {
  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const typeCuisineId = Array.isArray(id) ? id[0] : id;

  const [restaurants, setRestaurants] = useState<Restaurant[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!typeCuisineId) {
      setError("Aucun type de cuisine sélectionné.");
      setLoading(false);
      return;
    }

const fetchRestaurantsByType = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      `${API_URL}/api/restaurant/by-type/${typeCuisineId}`
    );

    const data = await response.json();

    console.log("RESTAURANTS PAR TYPE :", data);

    if (!response.ok) {
      setError(
        data.error ??
          "Impossible de récupérer les restaurants."
      );
      setRestaurants([]);
      return;
    }

    setRestaurants(data.restaurants ?? []);
  } catch (error) {
    console.log(
      "Erreur récupération restaurants par type :",
      error
    );

    setError(
      "Une erreur est survenue pendant le chargement."
    );
  } finally {
    setLoading(false);
  }
};

    fetchRestaurantsByType();
  }, [typeCuisineId]);

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) {
      return "";
    }

    if (imageUrl.startsWith("/")) {
      return `${API_URL}${imageUrl}`;
    }

    return imageUrl;
  };

  const goToRestaurant = (restaurantId: number) => {
    router.push({
      pathname: "/PageRestaurant",
      params: {
        id: restaurantId.toString(),
      },
    });
  };

  return (
    <View style={styles.page}>
      <TopBar />

      <Navbar />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {loading && (
          <View style={styles.messageContainer}>
            <ActivityIndicator
              size="large"
              color="#ec5b15"
            />


          </View>
        )}

        {!loading && error !== "" && (
          <AppText style={styles.errorText}>
            {error}
          </AppText>
        )}

        {!loading &&
          error === "" &&
          restaurants.length === 0 && (
            <AppText style={styles.emptyText}>
              Aucun restaurant trouvé pour ce type de
              cuisine.
            </AppText>
          )}

        {!loading &&
          restaurants.map((restaurant) => (
            <Pressable
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() =>
                goToRestaurant(restaurant.id)
              }
            >
              {restaurant.logo_url ? (
                <Image
                  source={{
                    uri: getImageUrl(
                      restaurant.logo_url
                    ),
                  }}
                  style={styles.restaurantImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <AppText
                    style={styles.placeholderText}
                  >
                    Aucune image
                  </AppText>
                </View>
              )}

              <View style={styles.restaurantInfos}>
                <AppText style={styles.restaurantName}>
                  {restaurant.nom}
                </AppText>

                {restaurant.ville && (
                  <AppText style={styles.city}>
                    {restaurant.ville}
                  </AppText>
                )}

                <View style={styles.noteContainer}>
                              <View style={styles.stars}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <AppText
                                    key={star}
                                    style={[
                                      styles.star,
                                      star <= Math.round(restaurant.note_moyenne ?? 0)
                                        ? styles.starActive
                                        : styles.starInactive
                                    ]}
                                  >
                                    ★
                            </AppText>
                          ))}
                              </View>



                  <AppText style={styles.reviewCount}>
                    ({restaurant.nombre_avis ?? 0} avis)
                  </AppText>
                </View>
              </View>
            </Pressable>
          ))}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },

  content: {
    paddingTop: 185,
    paddingHorizontal: 18,
    paddingBottom: 160,
  },

  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#ec5b15",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 22,
  },

  backText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ec5b15",
    marginBottom: 20,
  },

  restaurantCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
    minHeight: 125,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  restaurantImage: {
    width: 125,
    height: 125,
    resizeMode: "cover",
  },

  imagePlaceholder: {
    width: 125,
    height: 125,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eeeeee",
  },

  placeholderText: {
    color: "#777",
    fontSize: 13,
    textAlign: "center",
  },

  restaurantInfos: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  restaurantName: {
    color: "#222",
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 6,
  },

  city: {
    color: "#777",
    fontSize: 15,
    marginBottom: 8,
  },

  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#2D2D2D",
  },

  note: {
    color: "#222",
    fontSize: 18,
    fontWeight: "bold",
  },

  reviewCount: {
    color: "#777",
    fontSize: 14,
    marginLeft: 6,
  },

  messageContainer: {
    alignItems: "center",
    paddingTop: 50,
  },

  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 17,
  },

  errorText: {
    color: "#c62828",
    fontSize: 17,
    textAlign: "center",
    marginTop: 40,
  },

  emptyText: {
    color: "#666",
    fontSize: 17,
    textAlign: "center",
    marginTop: 40,
  },
});