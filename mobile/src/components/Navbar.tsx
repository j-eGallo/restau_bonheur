import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import AppText from "../components/AppText";
import { router, useLocalSearchParams } from "expo-router";

type TypeCuisine = {
  id: number;
  nom: string;
  logo_url: string;
};

export default function Navbar() {
  const [typesCuisine, setTypesCuisine] = useState<TypeCuisine[]>([]);

  // ID du type de cuisine actuellement présent dans l'URL
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  const selectedTypeId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const fetchTypeCuisine = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/type-cuisine/get"
        );

        const data = await response.json();

        if (!response.ok) {
          console.log(
            "Erreur récupération types cuisine :",
            data.error
          );
          return;
        }

        console.log("TYPES CUISINE :", data);

        setTypesCuisine(data.types_cuisine ?? []);
      } catch (error) {
        console.log("Erreur fetch types cuisine :", error);
      }
    };

    fetchTypeCuisine();
  }, []);

  const getImageUrl = (logoUrl: string) => {
    if (!logoUrl) {
      return "";
    }

    if (logoUrl.startsWith("/")) {
      return `http://localhost:8000${logoUrl}`;
    }

    return logoUrl;
  };

  const goToTypePage = (typeId: number) => {
    router.push({
      pathname: "/RestauParType",
      params: {
        id: typeId.toString(),
      },
    });
  };

  return (
    <View style={styles.navbar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {typesCuisine.map((typeCuisine) => {
          const isSelected =
            selectedTypeId === typeCuisine.id.toString();

          return (
            <Pressable
              key={typeCuisine.id}
              style={[
                styles.item,
                isSelected && styles.itemSelected,
              ]}
              onPress={() => goToTypePage(typeCuisine.id)}
            >
              <Image
                source={{
                  uri: getImageUrl(typeCuisine.logo_url),
                }}
                style={styles.logo}
              />

              <AppText
                style={[
                  styles.label,
                  isSelected && styles.labelSelected,
                ]}
              >
                {typeCuisine.nom.charAt(0).toUpperCase() +
                  typeCuisine.nom.slice(1)}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 110,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    justifyContent: "center",
    position: "absolute",
    top: 63,
    left: 0,
    right: 0,
    zIndex: 999,
  },

  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 12,
  },

  item: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 85,
    minHeight: 95,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },

  itemSelected: {
    backgroundColor: "#ec5b15",
  },

  logo: {
    width: 55,
    height: 50,
    resizeMode: "contain",
  },

  label: {
    marginTop: 5,
    fontSize: 17,
    color: "#ec5b15",
    fontWeight: "bold",
    textAlign: "center",
  },

  labelSelected: {
    color: "white",
  },
});