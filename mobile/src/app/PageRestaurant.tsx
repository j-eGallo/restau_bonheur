import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, Image, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import AppText from "../components/AppText";
import TopBar from "@/components/TopBar";

type TypeCuisine = {
  id: number;
  nom: string;
  logo_url: string;
};

type Photo = {
  id: number;
  url: string;
};

type Plat = {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  image_url: string;
  categorie: "entree" | "plat" | "dessert" | "boisson";
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
  photos: Photo[];
  plats: Plat[];
};

export default function PageRestaurant() {
  const { id } = useLocalSearchParams();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

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
        console.log("PLATS REÇUS :", data.restaurant?.plats);

        setRestaurant(data.restaurant ?? null);
      } catch (error) {
        console.log("Erreur fetch Restaurant :", error);
      }
    };

    fetchRestaurant();
  }, [id]);

  const getImageUrl = (url: string) => {
    if (!url) {
      return "";
    }

    if (url.startsWith("http")) {
      return url;
    }

    if (url.startsWith("/uploads")) {
      return `http://localhost:8000${url}`;
    }

    return `http://localhost:8000${url}`;
  };

  const openPhoto = (index: number) => {
    setPhotoIndex(index);
    setModalVisible(true);
  };

  const closePhoto = () => {
    setModalVisible(false);
  };

  const previousPhoto = () => {
    if (!restaurant?.photos?.length) return;

    if (photoIndex === 0) {
      setPhotoIndex(restaurant.photos.length - 1);
    } else {
      setPhotoIndex(photoIndex - 1);
    }
  };

  const nextPhoto = () => {
    if (!restaurant?.photos?.length) return;

    if (photoIndex === restaurant.photos.length - 1) {
      setPhotoIndex(0);
    } else {
      setPhotoIndex(photoIndex + 1);
    }
  };

  const entrees = restaurant?.plats?.filter((plat) => plat.categorie === "entree") ?? [];
  const plats = restaurant?.plats?.filter((plat) => plat.categorie === "plat") ?? [];
  const desserts = restaurant?.plats?.filter((plat) => plat.categorie === "dessert") ?? [];
  const boissons = restaurant?.plats?.filter((plat) => plat.categorie === "boisson") ?? [];


  const goFormReservation = () => {
  router.push({
    pathname: "/FormRes",
    params: { id },
  });
};

  const renderSectionPlats = (titre: string, platsSection: Plat[]) => {
    return (
      <View style={styles.categorieBlock}>
        <View style={styles.separator} />

        <AppText style={styles.categorieTitle}>
          {titre}
        </AppText>

        {platsSection.length === 0 && (
          <AppText style={styles.emptyCategorie}>
            Aucun plat pour cette catégorie.
          </AppText>
        )}

        {platsSection.map((plat) => (
          <View key={plat.id} style={styles.platCard}>
            <Image
              source={{ uri: getImageUrl(plat.image_url) }}
              style={styles.platImage}
            />

            <View style={styles.platRight}>
              <AppText style={styles.platNom}>
                {plat.nom}
              </AppText>

              <AppText style={styles.platPrix}>
                {plat.prix} €
              </AppText>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
              <Pressable
        style={styles.back}
       onPress={() => router.replace("/home")} 
      >      
      <Image
              source={require("../../assets/images/back.png")}
              style={styles.backimage}
      />
      </Pressable>
        <View style={styles.content}>
          <View style={styles.top}>
            <AppText style={styles.nom}>
              {restaurant?.nom?.toUpperCase()}
            </AppText>

            <AppText style={restaurant?.est_ouvert ? styles.ouvert : styles.ferme}>
              {restaurant?.est_ouvert ? "OUVERT" : "FERMÉ"}
            </AppText>
          </View>

          <AppText style={styles.infos}>
            {restaurant?.nm_rue} {restaurant?.rue}
          </AppText>

          <AppText style={styles.infos}>
            {restaurant?.code_postal}, {restaurant?.ville}
          </AppText>
        </View>

        <View style={styles.bottom}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text
                key={star}
                style={[
                  styles.star,
                  star <= Math.round(restaurant?.note_moyenne ?? 0)
                    ? styles.starActive
                    : styles.starInactive,
                ]}
              >
                ★
              </Text>
            ))}
          </View>

          <AppText style={styles.typec}>
            {restaurant?.type_cuisines
              ?.map(
                (typeCuisine) =>
                  typeCuisine.nom.charAt(0).toUpperCase() + typeCuisine.nom.slice(1)
              )
              .join(", ")}
          </AppText>
        </View>

        <View style={styles.photosGrid}>
          {restaurant?.photos?.slice(0, 5).map((photo, index) => (
            <Pressable
              key={photo.id}
              onPress={() => openPhoto(index)}
              style={[
                styles.photoWrapper,
                index < 2 ? styles.bigPhoto : styles.smallPhoto,
              ]}
            >
              <Image
                source={{ uri: getImageUrl(photo.url) }}
                style={styles.photo}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.plats}>
          {renderSectionPlats("NOS ENTRÉES", entrees)}
          {renderSectionPlats("NOS PLATS", plats)}
          {renderSectionPlats("NOS DESSERTS", desserts)}
          {renderSectionPlats("NOS BOISSONS", boissons)}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Pressable onPress={closePhoto} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>

          <Pressable onPress={previousPhoto} style={styles.arrowLeft}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>

          {restaurant?.photos?.[photoIndex] && (
            <Image
              source={{ uri: getImageUrl(restaurant.photos[photoIndex].url) }}
              style={styles.bigImageModal}
            />
          )}

          <Pressable onPress={nextPhoto} style={styles.arrowRight}>
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>
      </Modal>
        <View style={styles.reserveBar}>
          <Pressable style={styles.reserveButton} onPress={goFormReservation}>
            <AppText style={styles.reserveText}>Réserver</AppText>
          </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "white",
    overflow: "hidden"
  },

  back : {
    marginTop: 100,
    width: "100%",
    marginLeft: 20
  },

  backimage: {
    height: 43,
    width: 43,
  },

  scrollContent: {
    paddingBottom: 100,
  },

  content: {
    paddingTop: 100,
    paddingHorizontal: 20,
  },

  top: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  nom: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ec5b15",
  },

  infos: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2D2D2D",
  },

  ouvert: {
    color: "green",
    fontSize: 15,
    fontWeight: "900",
  },

  ferme: {
    color: "red",
    fontSize: 15,
    fontWeight: "900",
  },

  bottom: {
    paddingLeft: 20,
    paddingRight: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -10,
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

  typec: {
    color: "#ec5b15",
    fontSize: 15,
    fontWeight: "900",
  },

  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 20,
    paddingHorizontal: 20,
  },

  photoWrapper: {
    overflow: "hidden",
    backgroundColor: "#ddd",
  },

  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  bigPhoto: {
    width: "49%",
    height: 160,
  },

  smallPhoto: {
    width: "32%",
    height: 105,
  },

  plats: {
    marginTop: 25,
  },

  categorieBlock: {
    marginBottom: 30,
  },

  separator: {
    height: 2,
    backgroundColor: "#ec5b15",
    marginBottom: 15,
  },

  categorieTitle: {
    textAlign: "center",
    color: "#ec5b15",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 35,
  },

  emptyCategorie: {
    textAlign: "center",
    color: "#999",
    fontSize: 15,
    marginBottom: 25,
  },

  platCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 25,
    marginBottom: 28,
    minHeight: 120,
  },

  platImage: {
    width: 120,
    height: 120,
    resizeMode: "cover",
    marginRight: 20,
  },

  platRight: {
    flex: 1,
    minHeight: 120,
    justifyContent: "space-between",
  },

  platNom: {
    color: "#2D2D2D",
    fontSize: 18,
    fontWeight: "900",
  },

  platPrix: {
    color: "#ec5b15",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  bigImageModal: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },

  closeButton: {
    position: "absolute",
    top: 40,
    right: 25,
    zIndex: 10,
  },

  closeText: {
    color: "white",
    fontSize: 45,
    fontWeight: "900",
  },

  arrowLeft: {
    position: "absolute",
    left: 20,
    zIndex: 10,
  },

  arrowRight: {
    position: "absolute",
    right: 20,
    zIndex: 10,
  },

  arrowText: {
    color: "white",
    fontSize: 70,
    fontWeight: "900",

  },
  reserveBar: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 90,
  borderTopWidth: 2,
  borderTopColor: "#2d2d2d",
  backgroundColor: "white",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
},

reserveButton: {
  backgroundColor: "#ec5b15",
  width: 210,
  height: 58,
  borderRadius: 35,
  justifyContent: "center",
  alignItems: "center",
},

reserveText: {
  color: "white",
  fontSize: 22,
  fontWeight: "900",
},
});