import { View, TextInput, Image, Pressable, StyleSheet, Modal } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import TopBar from "@/components/TopBar";
import AppText from "../components/AppText";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Horaire = {
  id: number;
  jour: string;
  ouvert_midi: boolean;
  heure_ouverture_midi: string | null;
  heure_fermeture_midi: string | null;
  ouvert_soir: boolean;
  heure_ouverture_soir: string | null;
  heure_fermeture_soir: string | null;
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

type TypeCuisine = {
  id: number;
  nom: string;
  logo_url: string;
};

export default function FormRes() {
  const {
    id,
    reservationId,
    date: dateParam,
    heure: heureParam,
    service: serviceParam,
    nb_personnes: nbPersonnesParam,
  } = useLocalSearchParams();

  const isEditMode = !!reservationId;

  // States pour chaque champs
  const [date, setDate] = useState("");
  const [service, setService] = useState("");
  const [heure, setHeure] = useState("");
  const [nbPersonnes, setNbPersonnes] = useState("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const [horaires, setHoraires] = useState<Horaire[]>([]);

  // State pour ouvrir / fermer le choix Midi / Soir
  const [serviceModalVisible, setServiceModalVisible] = useState(false);

  // State pour ouvrir / fermer le choix de l'heure
  const [heureModalVisible, setHeureModalVisible] = useState(false);

  // Date du jour pour bloquer les anciennes dates
  const today = formatDateToInputValue(new Date());

  useEffect(() => {
    if (dateParam) {
      setDate(getParamValue(dateParam));
    }

    if (serviceParam) {
      setService(getParamValue(serviceParam));
    }

    if (heureParam) {
      setHeure(getParamValue(heureParam));
    }

    if (nbPersonnesParam) {
      setNbPersonnes(getParamValue(nbPersonnesParam));
    }
  }, [dateParam, serviceParam, heureParam, nbPersonnesParam]);

  // Si je ne suis pas connecté, je serai automatiquement redirigé vers Auth
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("client_token");

      if (!token) {
        router.replace("/auth");
      }
    };

    checkToken();
  }, []);

  // Fetch du restaurant + horaires
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const restaurantId = Array.isArray(id) ? id[0] : id;

        if (!restaurantId) {
          return;
        }

        const response = await fetch(`http://localhost:8000/api/restaurant/get/${restaurantId}`);
        const data = await response.json();

        console.log("RESTAURANT :", data);
        console.log("HORAIRES RESTAURANT :", data.restaurant?.horaires);

        setRestaurant(data.restaurant ?? null);
        setHoraires(data.restaurant?.horaires ?? []);
      } catch (error) {
        console.log("Erreur fetch Restaurant :", error);
      }
    };

    fetchRestaurant();
  }, [id]);

  const getJourDepuisDate = (dateString: string) => {
    if (!dateString) {
      return "";
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);

    const jours = [
      "dimanche",
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
    ];

    return jours[dateObj.getDay()];
  };

  const jourSelectionne = getJourDepuisDate(date);

  const horaireDuJour = horaires.find(
    (horaire) => horaire.jour === jourSelectionne
  );

  let heureMin = "";
  let heureMax = "";

  if (horaireDuJour && service === "midi" && horaireDuJour.ouvert_midi) {
    heureMin = horaireDuJour.heure_ouverture_midi ?? "";
    heureMax = horaireDuJour.heure_fermeture_midi ?? "";
  }

  if (horaireDuJour && service === "soir" && horaireDuJour.ouvert_soir) {
    heureMin = horaireDuJour.heure_ouverture_soir ?? "";
    heureMax = horaireDuJour.heure_fermeture_soir ?? "";
  }

  const convertirHeureEnMinutes = (heureString: string) => {
    const [heures, minutes] = heureString.split(":").map(Number);
    return heures * 60 + minutes;
  };

  const convertirMinutesEnHeure = (minutesTotal: number) => {
    const heures = Math.floor(minutesTotal / 60);
    const minutes = minutesTotal % 60;

    const heuresFormat = String(heures).padStart(2, "0");
    const minutesFormat = String(minutes).padStart(2, "0");

    return `${heuresFormat}:${minutesFormat}`;
  };

  const genererHeuresDisponibles = () => {
    if (!heureMin || !heureMax) {
      return [];
    }

    const debut = convertirHeureEnMinutes(heureMin);
    const fin = convertirHeureEnMinutes(heureMax);

    const heuresDisponibles = [];

    for (let minute = debut; minute <= fin; minute += 15) {
      heuresDisponibles.push(convertirMinutesEnHeure(minute));
    }

    return heuresDisponibles;
  };

  const heuresDisponibles = genererHeuresDisponibles();

  const handleBack = () => {
    if (isEditMode) {
      router.replace("/MesReservations");
      return;
    }

    if (!restaurant) {
      router.replace("/home");
      return;
    }

    router.push({
      pathname: "/PageRestaurant",
      params: { id: String(restaurant.id) },
    });
  };

  const handleReserver = async () => {
    try {
      const token = await AsyncStorage.getItem("client_token");

      if (!token) {
        router.replace("/auth");
        return;
      }

      const restaurantId = Array.isArray(id) ? id[0] : id;

      if (!restaurantId) {
        console.log("Aucun ID restaurant");
        return;
      }

      if (!date || !service || !heure || !nbPersonnes) {
        console.log("Tous les champs sont obligatoires");
        return;
      }

      if (!horaireDuJour) {
        console.log("Aucun horaire trouvé pour ce jour");
        return;
      }

      if (!heureMin || !heureMax) {
        console.log("Le restaurant est fermé pour ce service");
        return;
      }

      if (heure < heureMin || heure > heureMax) {
        console.log(`Heure invalide. Choisir entre ${heureMin} et ${heureMax}`);
        return;
      }

      const url = isEditMode
        ? "http://localhost:8000/api/reservation/updateReservation"
        : "http://localhost:8000/api/reservation/addReservation";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...(isEditMode && {
            id: Number(getParamValue(reservationId)),
          }),
          id_restaurant: Number(restaurantId),
          date: date,
          service: service,
          heure: heure,
          nb_personnes: Number(nbPersonnes),
        }),
      });

      const data = await response.json();

      console.log("STATUS :", response.status);
      console.log("REPONSE :", data);

      if (!response.ok) {
        console.log("Erreur réservation :", data);
        return;
      }

      if (isEditMode) {
        console.log("Réservation modifiée :", data);
      } else {
        console.log("Réservation effectuée :", data);
      }

      router.replace("/MesReservations");
    } catch (error) {
      console.log("Erreur fetch réservation :", error);
    }
  };

  return (
    <View style={styles.page}>
      <TopBar />

      <Pressable
        style={styles.back}
        onPress={handleBack}
      >
        <Image
          source={require("../../assets/images/back.png")}
          style={styles.backimage}
        />
      </Pressable>

      <View style={styles.restaupart}>
        <AppText style={styles.nomrestau}>
          {restaurant?.nom?.toUpperCase()}
        </AppText>

        <AppText style={styles.restauinfos}>
          {restaurant?.nm_rue} {restaurant?.rue}
        </AppText>

        <AppText style={styles.restauinfos}>
          {restaurant?.code_postal}, {restaurant?.ville}
        </AppText>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <AppText
              key={star}
              style={[
                styles.star,
                star <= Math.round(restaurant?.note_moyenne ?? 0)
                  ? styles.starActive
                  : styles.starInactive,
              ]}
            >
              ★
            </AppText>
          ))}
        </View>
      </View>

      <View style={styles.form}>

        {/* Champ date */}
        <Pressable
          style={styles.field}
          onPress={() => {
            dateInputRef.current?.showPicker?.();
            dateInputRef.current?.focus();
          }}
        >
          <AppText style={styles.fakeInput}>
            {date ? date : "Date"}
          </AppText>

          <input
            ref={dateInputRef}
            type="date"
            min={today}
            value={date}
            onChange={(event) => {
              setDate(event.currentTarget.value);
              setHeure("");
            }}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              zIndex: 2,
            }}
          />

          <Image
            source={require("../../assets/images/calorange.png")}
            style={styles.icon}
          />
        </Pressable>

        {/* Choix du service midi / soir */}
        <Pressable
          style={styles.field}
          onPress={() => setServiceModalVisible(true)}
        >
          <AppText style={styles.fakeInput}>
            {service ? service.charAt(0).toUpperCase() + service.slice(1) : "Midi / Soir"}
          </AppText>

          <Image
            source={require("../../assets/images/orangetime.png")}
            style={styles.icon}
          />
        </Pressable>

        {/* Champ heure */}
        <Pressable
          style={styles.field}
          onPress={() => {
            if (!date) {
              console.log("Choisis d'abord une date");
              return;
            }

            if (!service) {
              console.log("Choisis d'abord midi ou soir");
              return;
            }

            if (!heureMin || !heureMax) {
              console.log("Restaurant fermé pour ce service");
              return;
            }

            setHeureModalVisible(true);
          }}
        >
          <AppText style={styles.fakeInput}>
            {heure ? heure : "Heure"}
          </AppText>

          <Image
            source={require("../../assets/images/orangetime.png")}
            style={styles.icon}
          />
        </Pressable>

        {/* Champ nombre de personnes */}
        <View style={styles.field}>
          <TextInput
            value={nbPersonnes}
            onChangeText={setNbPersonnes}
            placeholder="Nombre de personnes"
            placeholderTextColor="#2D2D2D"
            keyboardType="numeric"
            style={[styles.input, { outlineStyle: "none" } as any]}
          />

          <Image
            source={require("../../assets/images/userorange.png")}
            style={styles.icon}
          />
        </View>

        {/* Bouton de réservation */}
        <Pressable style={styles.button} onPress={handleReserver}>
          <AppText style={styles.buttonText}>
            {isEditMode ? "Modifier réservation" : "Réserver"}
          </AppText>
        </Pressable>
      </View>

      {/* Modal choix service */}
      <Modal
        visible={serviceModalVisible}
        transparent={true}
        animationType="fade"
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setServiceModalVisible(false)}
        >
          <View style={styles.serviceModal}>
            <Pressable
              style={styles.serviceOption}
              onPress={() => {
                setService("midi");
                setHeure("");
                setServiceModalVisible(false);
              }}
            >
              <AppText style={styles.serviceOptionText}>Midi</AppText>
            </Pressable>

            <View style={styles.modalSeparator} />

            <Pressable
              style={styles.serviceOption}
              onPress={() => {
                setService("soir");
                setHeure("");
                setServiceModalVisible(false);
              }}
            >
              <AppText style={styles.serviceOptionText}>Soir</AppText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Modal choix heure */}
      <Modal
        visible={heureModalVisible}
        transparent={true}
        animationType="fade"
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setHeureModalVisible(false)}
        >
          <View style={styles.heureModal}>
            {heuresDisponibles.map((heureDisponible) => (
              <Pressable
                key={heureDisponible}
                style={styles.heureOption}
                onPress={() => {
                  setHeure(heureDisponible);
                  setHeureModalVisible(false);
                }}
              >
                <AppText style={styles.heureOptionText}>
                  {heureDisponible}
                </AppText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    marginTop: 100,
    width: "100%",
    marginLeft: 48,
  },

  backimage: {
    height: 43,
    width: 43,
    resizeMode: "contain",
  },

  restaupart: {
    width: "100%",
    alignItems: "center",
  },

  restauinfos: {
    color: "#2D2D2D",
    fontSize: 20,
    fontWeight: "900",
  },

  nomrestau: {
    color: "#ec5b15",
    fontSize: 20,
    fontWeight: "900",
  },

  stars: {
    flexDirection: "row",
    alignItems: "center",
  },

  star: {
    fontSize: 25,
  },

  starActive: {
    color: "#ec5b15",
  },

  starInactive: {
    color: "#2D2D2D",
  },

  page: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    overflow: "hidden",
  },

  form: {
    width: "100%",
    alignItems: "center",
    marginTop: 88,
  },

  field: {
    width: "88%",
    height: 74,
    borderWidth: 2,
    borderColor: "#2D2D2D",
    borderRadius: 14,
    justifyContent: "center",
    marginBottom: 46,
    backgroundColor: "white",
    position: "relative",
  },

  input: {
    width: "100%",
    height: "100%",
    paddingLeft: 16,
    paddingRight: 65,
    fontSize: 24,
    fontWeight: "900",
    color: "#2D2D2D",
  },

  fakeInput: {
    width: "100%",
    paddingLeft: 16,
    paddingRight: 65,
    fontSize: 24,
    fontWeight: "900",
    color: "#2D2D2D",
  },

  icon: {
    position: "absolute",
    right: 14,
    width: 38,
    height: 38,
    resizeMode: "contain",
    zIndex: 1,
  },

  button: {
    width: 300,
    height: 58,
    backgroundColor: "#ec5b15",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  serviceModal: {
    width: 240,
    backgroundColor: "white",
    borderRadius: 14,
    overflow: "hidden",
  },

  serviceOption: {
    height: 65,
    justifyContent: "center",
    alignItems: "center",
  },

  serviceOptionText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ec5b15",
  },

  modalSeparator: {
    height: 1,
    backgroundColor: "#ddd",
  },

  heureModal: {
    width: 260,
    maxHeight: 430,
    backgroundColor: "white",
    borderRadius: 14,
    overflow: "hidden",
  },

  heureOption: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  heureOptionText: {
    fontSize: 21,
    fontWeight: "900",
    color: "#ec5b15",
  },
});

function getParamValue(value: string | string[] | undefined) {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value[0] : value;
}

function formatDateToInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}