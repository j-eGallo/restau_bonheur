import { useEffect, useState } from "react";
import { View, ScrollView, Image, Text, Pressable, StyleSheet } from "react-native";
import AppText from "../components/AppText";


type TypeCuisine = {
  id: number;
  nom: string;
  logo_url: string;
};

export default function Navbar() {

const [typesCuisine, setTypesCuisine] = useState<TypeCuisine[]>([]);

    
useEffect(() => {
 
    const fetchTypeCuisine = async () => {
    try {
    const response = await fetch("http://localhost:8000/api/type-cuisine/get");
    const data = await response.json();

    console.log("TYPES CUISINE :", data);
    setTypesCuisine(data.types_cuisine ?? []);
   }


  catch(error) {
        console.log("Erreur fetch types cuisine :", error);
  }
    }
      fetchTypeCuisine();
   }, [] );


   const getImageUrl = (logoUrl: string) => {
  if (logoUrl.startsWith("http://localhost:8000")) {
    return logoUrl.replace("http://localhost:8000", "http://localhost:8000");
  }

  if (logoUrl.startsWith("/")) {
    return `http://localhost:8000${logoUrl}`;
  }

  return logoUrl;
};
 return (
    <View style={styles.navbar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {typesCuisine.map((typeCuisine) => (
          <Pressable
            key={typeCuisine.id}
            style={styles.item}
            onPress={() => console.log("Type sélectionné :", typeCuisine.id)}
          >
            <Image
              source={{ uri: getImageUrl(typeCuisine.logo_url) }}       
              style={styles.logo}
            />

            <AppText style={styles.label}>
              {typeCuisine.nom.charAt(0).toUpperCase() + typeCuisine.nom.slice(1)}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  navbar: {
    height: 100,
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
    gap: 18,
  },

  item: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },

  logo: {
    width: 60,
    height: 58,
    resizeMode: "contain",
  },

  label: {
    marginTop: 5,
    fontSize: 20,
    color: "#ec5b15",
    fontWeight: "bold",
    textAlign: "center",
  },
});