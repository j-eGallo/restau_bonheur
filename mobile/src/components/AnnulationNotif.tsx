import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import AppText from "./AppText";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const RESERVATIONS_URL =
  `${API_URL}/api/reservation/clientReservations`;

type Reservation = {
  id: number;
  date: string;
  heure: string;
  restaurant: {
    id: number;
    nom: string;
  };
};

type ReservationsResponse = {
  reservations?: Reservation[];
};

export default function AnnulationNotif() {
  const [message, setMessage] = useState("");

  const previousReservations = useRef<
    Reservation[] | null
  >(null);

  const translateY = useRef(
    new Animated.Value(-150)
  ).current;

  const timeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  const closeNotification = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setMessage("");
    });
  };

  const handleNotificationPress = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage("");
    translateY.setValue(-150);

    router.push("/MesReservations");
  };

  const showNotification = (
    reservation: Reservation
  ) => {
    setMessage(
      `Votre réservation chez ${reservation.restaurant.nom}, ` +
      `le ${formatDateFr(reservation.date)} à ${reservation.heure} ` +
      `a été annulée.`
    );

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      closeNotification();
    }, 7000);
  };

  const checkReservations = async () => {
    try {
      const token = await AsyncStorage.getItem(
        "client_token"
      );

      if (!token) {
        return;
      }

      const response = await fetch(
        RESERVATIONS_URL,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok || !responseText) {
        return;
      }

      const data = JSON.parse(
        responseText
      ) as ReservationsResponse;

      const currentReservations =
        data.reservations ?? [];

      // Première vérification : mémorisation uniquement
      if (previousReservations.current === null) {
        previousReservations.current =
          currentReservations;

        return;
      }

      // Recherche d'une réservation qui a disparu
      const cancelledReservation =
        previousReservations.current.find(
          (previousReservation) =>
            !currentReservations.some(
              (currentReservation) =>
                currentReservation.id ===
                previousReservation.id
            )
        );

      if (cancelledReservation) {
        showNotification(cancelledReservation);
      }

      previousReservations.current =
        currentReservations;
    } catch (error) {
      console.log(
        "Erreur vérification réservations :",
        error
      );
    }
  };

  useEffect(() => {
    checkReservations();

    const interval = setInterval(() => {
      checkReservations();
    }, 5000);

    return () => {
      clearInterval(interval);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.notification,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        style={styles.notificationContent}
        onPress={handleNotificationPress}
      >
        <View style={styles.content}>
          <AppText style={styles.title}>
            Réservation annulée
          </AppText>

          <AppText style={styles.message}>
            {message}
          </AppText>
        </View>
      </Pressable>

      <Pressable
        style={styles.closeButton}
        onPress={(event) => {
          event.stopPropagation();
          closeNotification();
        }}
      >
        <AppText style={styles.close}>
          ✕
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  notification: {
    position: "absolute",
    top: 155,
    left: 15,
    right: 15,
    zIndex: 99999,
    elevation: 30,
    backgroundColor: "#ec5b15",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  notificationContent: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 16,
  },

  content: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },

  message: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  closeButton: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  close: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
});

function formatDateFr(dateString: string) {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return date.toLocaleDateString("fr-FR");
}