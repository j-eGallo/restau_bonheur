import { useEffect, useState } from "react";
import { View, ScrollView, Image, Text, Pressable, StyleSheet } from "react-native";
import AppText from "../components/AppText";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";



// Props


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

/*
  id
  date
  heure
  service
  nb_personnes
  restaurant
*/

type Reservation = {
  id: number;
  date: string;
  heure: string;
  service: string;
  nb_personnes : number;
  restaurant: Restaurant;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;



export default function ResAgain() {

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true);

    // Appel de la route API
useEffect(() => {
  const fetchRestaurantsPopulaires = async () => {
    try {
      const token = await AsyncStorage.getItem("client_token");

      if (!token) {
        setReservations([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/reservation/sixLastRes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("TROIS DERNIERES RESERVATIONS :", data);
      setReservations(data.reservations ?? []);
    } catch (error) {
      console.log("Erreur fetch réservations :", error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  fetchRestaurantsPopulaires();
}, []);



   // Appel de l'image principale du restaurant
   const getImageUrl = (logoUrl: string) => {
  if (logoUrl.startsWith("http")) {
    return logoUrl;
  }

  if (logoUrl.startsWith("/uploads")) {
    return `${API_URL}${logoUrl}`;
  }

  return `${API_URL}/images/restaurants/${logoUrl}`;
};

// Navigation vers le restaurant cliqué :
const goToPage = (id: number) => {
  router.push({
    pathname: "/PageRestaurant",
    params: { id },
  });
};

if (loading) {
  return null;
}

if (reservations.length === 0) {
  return null;
}

  return (
    <View style={styles.general}>
      <AppText style={styles.titre}>RÉSERVER DE NOUVEAU</AppText>
      {reservations.map((reservation) => {
        return (
          <Pressable 
          key={reservation.id}
            style={styles.card}
            onPress={() => goToPage(reservation.restaurant.id)}
          >
            <Image
              source={{ uri: getImageUrl(reservation.restaurant.logo_url) }}
              style={styles.logo}
            />
              <AppText style={styles.nom}>{reservation.restaurant.nom}</AppText>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text
                      key={star}
                      style={[
                        styles.star,
                        star <= Math.round(reservation.restaurant.note_moyenne)
                          ? styles.starActive
                          : styles.starInactive
                      ]}
                    >
                      ★
                    </Text>
                  ))}
            </View>
          </Pressable>
        );
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  general: {
    backgroundColor: "#ec5b15",
    alignItems: "center"
  },

  titre: {
    color: "white",
    fontSize: 20,
    fontWeight: 900,
    marginTop: 10,
    marginBottom: 54,
    textAlign: "center"
  },

  card: {
    marginBottom: 40,
    // paddingLeft: 12,
  },

  logo: {
    height: 174,
    width: 387,
    borderRadius: 10,
    textAlign: "center",
    alignItems: "center"
  },

  nom: {
    color: "white",
    textAlign: "left",
    fontSize: 25,
    fontWeight: 900
  },

  stars : {
  flexDirection: "row",
  alignItems: "center",
  },

    star : {
    fontSize: 25
  },

  starActive : {
    color: "#2D2D2D",
  },

  starInactive: {
    color: "#ffffff"
  },
})


