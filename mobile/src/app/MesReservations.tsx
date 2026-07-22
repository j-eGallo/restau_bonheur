import { useEffect, useState } from "react";
import { View, Image, Pressable, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopBar from "../components/TopBar";
import AppText from "../components/AppText";

type Reservation = {
  id: number;
  date: string;
  heure: string;
  service: string;
  nb_personnes: number;
  restaurant: {
    id: number;
    nom: string;
    logo_url?: string;
    telephone?: string;
    nm_rue?: string;
    rue?: string;
    code_postal?: string;
    ville?: string;
  };
};

export default function MesReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const isReservationFuture = (dateString: string, heureString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const [hours, minutes] = heureString.split(":").map(Number);

    const reservationDateTime = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes
    );

    const now = new Date();

    return reservationDateTime >= now;
  };

  const fetchReservations = async () => {
    try {
      const token = await AsyncStorage.getItem("client_token");

      if (!token) {
        router.replace("/auth");
        return;
      }

      const response = await fetch("http://localhost:8000/api/reservation/sixLastRes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      console.log("MES RÉSERVATIONS :", data);

      if (!response.ok) {
        console.log("Erreur récupération réservations :", data);
        return;
      }

      const reservationsAVenir = (data.reservations ?? []).filter(
        (reservation: Reservation) =>
          isReservationFuture(reservation.date, reservation.heure)
      );

      setReservations(reservationsAVenir);
    } catch (error) {
      console.log("Erreur fetch MesReservations :", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateFr = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("fr-FR");
  };

  const formatService = (service: string) => {
    if (service.toLowerCase() === "midi") {
      return "Midi";
    }

    if (service.toLowerCase() === "soir") {
      return "Soir";
    }

    return service;
  };

  const handleEditReservation = (reservation: Reservation) => {
    router.push({
      pathname: "/FormRes",
      params: {
        reservationId: String(reservation.id),
        id: String(reservation.restaurant.id),
        date: reservation.date,
        heure: reservation.heure,
        service: reservation.service,
        nb_personnes: String(reservation.nb_personnes),
      },
    });
  };

  const handleDeleteReservation = async (reservationId: number) => {
    try {
      const token = await AsyncStorage.getItem("client_token");

      if (!token) {
        router.replace("/auth");
        return;
      }

      const response = await fetch("http://localhost:8000/api/reservation/deleteReservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: reservationId,
        }),
      });

      const data = await response.json();

      console.log("SUPPRESSION :", data);

      if (!response.ok) {
        console.log("Erreur suppression réservation :", data);
        return;
      }

      setReservations((prev) =>
        prev.filter((reservation) => reservation.id !== reservationId)
      );
    } catch (error) {
      console.log("Erreur delete réservation :", error);
    }
  };

  return (
    <View style={styles.page}>
      <TopBar />

      <Pressable
        style={styles.back}
        onPress={() => router.replace("/home")}
      >
        <Image
          source={require("../../assets/images/back.png")}
          style={styles.backimage}
        />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.title}>Vos réservations</AppText>

        {loading && (
          <AppText style={styles.infoText}>Chargement...</AppText>
        )}

        {!loading && reservations.length === 0 && (
          <AppText style={styles.infoText}>Aucune réservation trouvée.</AppText>
        )}

        {!loading && reservations.map((reservation) => (
          <View key={reservation.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <AppText style={styles.restaurantName}>
                {reservation.restaurant.nom.toUpperCase()}
              </AppText>

              <AppText style={styles.restaurantAddress}>
                {reservation.restaurant.nm_rue} {reservation.restaurant.rue}
              </AppText>

              <AppText style={styles.restaurantAddress}>
                {reservation.restaurant.code_postal}, {reservation.restaurant.ville}
              </AppText>

              <View style={styles.separator} />

              <AppText style={styles.reservationInfo}>
                Le {formatDateFr(reservation.date)}
              </AppText>

              <AppText style={styles.reservationInfo}>
                À {reservation.heure} — {formatService(reservation.service)}
              </AppText>

              <AppText style={styles.reservationInfo}>
                {reservation.nb_personnes} {reservation.nb_personnes > 1 ? "personnes" : "personne"}
              </AppText>
            </View>

            <View style={styles.cardActions}>
              <Pressable
                onPress={() => handleEditReservation(reservation)}
                style={styles.actionButton}
              >
                <Image
                  source={require("../../assets/images/edit.png")}
                  style={styles.actionIcon}
                />
              </Pressable>

              <Pressable
                onPress={() => handleDeleteReservation(reservation.id)}
                style={styles.actionButton}
              >
                <Image
                  source={require("../../assets/images/delete.png")}
                  style={styles.actionIcon}
                />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "white",
  },

  back: {
    position: "absolute",
    top: 78,
    left: 22,
    zIndex: 1000,
  },

  backimage: {
    width: 43,
    height: 43,
    resizeMode: "contain",
  },

  scrollContent: {
    paddingTop: 115,
    paddingHorizontal: 18,
    paddingBottom: 40,
  },

  title: {
    color: "#ec5b15",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 32,
  },

  infoText: {
    color: "#2D2D2D",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 30,
  },

  card: {
    width: "100%",
    minHeight: 130,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 26,
    paddingVertical: 12,
    paddingLeft: 10,
    paddingRight: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },

  cardLeft: {
    flex: 1,
  },

  restaurantName: {
    color: "#ec5b15",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 2,
  },

  restaurantAddress: {
    color: "#2D2D2D",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 16,
  },

  separator: {
    width: "80%",
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 7,
  },

  reservationInfo: {
    color: "#2D2D2D",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },

  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginLeft: 12,
  },

  actionButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  actionIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});