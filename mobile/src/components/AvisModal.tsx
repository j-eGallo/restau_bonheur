import { useEffect, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppText from "./AppText";

type ReservationAvis = {
  id: number;
  date: string;
  heure: string;
  restaurant: {
    id: number;
    nom: string;
    logo_url?: string;
  };
};

const API_URL = "http://localhost:8000";

export default function AvisModal() {
  const [reservation, setReservation] =
    useState<ReservationAvis | null>(null);

  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkPendingAvis();
  }, []);

  const checkPendingAvis = async () => {
    try {
      setLoadingCheck(true);

      const token = await AsyncStorage.getItem(
        "client_token"
      );

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/avis/pending`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();

      let data: any = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        console.log(
          "Réponse pending avis non JSON :",
          responseText
        );
        return;
      }

      if (!response.ok) {
        console.log(
          "Erreur pending avis :",
          response.status,
          data
        );
        return;
      }

      if (data.reservation) {
        setReservation(data.reservation);
        setVisible(true);
      }
    } catch (error) {
      console.log(
        "Erreur récupération avis disponible :",
        error
      );
    } finally {
      setLoadingCheck(false);
    }
  };

  const envoyerAvis = async () => {
    if (!reservation) {
      return;
    }

    if (note < 1 || note > 5) {
      setError("Choisissez une note entre 1 et 5.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = await AsyncStorage.getItem(
        "client_token"
      );

      if (!token) {
        setError("Votre session a expiré.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/client/avis/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_reservation: reservation.id,
            note,
          }),
        }
      );

      const responseText = await response.text();

      let data: any = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        setError(
          "Le serveur a renvoyé une réponse invalide."
        );
        return;
      }

      if (!response.ok) {
        setError(
          data.error ??
            "Impossible d'enregistrer votre avis."
        );
        return;
      }

      setVisible(false);
      setReservation(null);
      setNote(0);
      setError("");

      // Recherche éventuellement une autre réservation à noter
      setTimeout(() => {
        checkPendingAvis();
      }, 500);
    } catch (error) {
      console.log("Erreur ajout avis :", error);

      setError(
        "Impossible de contacter le serveur."
      );
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) {
      return "";
    }

    if (url.startsWith("http")) {
      return url;
    }

    if (url.startsWith("/")) {
      return `${API_URL}${url}`;
    }

    return `${API_URL}/images/restaurants/${url}`;
  };

  if (loadingCheck || !reservation) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {reservation.restaurant.logo_url && (
            <Image
              source={{
                uri: getImageUrl(
                  reservation.restaurant.logo_url
                ),
              }}
              style={styles.restaurantImage}
            />
          )}

          <AppText style={styles.title}>
            Comment s'est passée votre visite ?
          </AppText>

          <AppText style={styles.restaurantName}>
            {reservation.restaurant.nom}
          </AppText>

          <AppText style={styles.date}>
            Réservation du {reservation.date} à{" "}
            {reservation.heure}
          </AppText>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => {
                  setNote(star);
                  setError("");
                }}
                disabled={loading}
              >
                <AppText
                  style={[
                    styles.star,
                    star <= note
                      ? styles.starSelected
                      : styles.starEmpty,
                  ]}
                >
                  ★
                </AppText>
              </Pressable>
            ))}
          </View>

          <AppText style={styles.noteText}>
            {note === 0
              ? "Sélectionnez une note"
              : `${note}/5`}
          </AppText>

          {error !== "" && (
            <AppText style={styles.error}>
              {error}
            </AppText>
          )}

          <Pressable
            style={[
              styles.validateButton,
              (note === 0 || loading) &&
                styles.disabledButton,
            ]}
            onPress={envoyerAvis}
            disabled={note === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <AppText style={styles.validateText}>
                ENVOYER MON AVIS
              </AppText>
            )}
          </Pressable>

          <Pressable
            style={styles.laterButton}
            onPress={() => setVisible(false)}
            disabled={loading}
          >
            <AppText style={styles.laterText}>
              Plus tard
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },

  restaurantImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    resizeMode: "cover",
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ec5b15",
    textAlign: "center",
    marginBottom: 8,
  },

  restaurantName: {
    fontSize: 21,
    fontWeight: "900",
    color: "#222",
    textAlign: "center",
  },

  date: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
    marginBottom: 22,
    textAlign: "center",
  },

  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  star: {
    fontSize: 43,
  },

  starSelected: {
    color: "#ec5b15",
  },

  starEmpty: {
    color: "#d5d5d5",
  },

  noteText: {
    marginTop: 10,
    fontSize: 17,
    color: "#444",
    fontWeight: "700",
  },

  error: {
    color: "#c62828",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 14,
  },

  validateButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#ec5b15",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 24,
  },

  validateText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.5,
  },

  laterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 5,
  },

  laterText: {
    color: "#777",
    fontSize: 15,
    fontWeight: "700",
  },
});