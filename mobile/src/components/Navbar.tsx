import { useEffect, useState } from "react";
import { View, ScrollView, Image, Text, Pressable, StyleSheet } from "react-native";

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
              source={{ uri: typeCuisine.logo_url }}
              style={styles.logo}
            />

            <Text style={styles.label}>
              {typeCuisine.nom.charAt(0).toUpperCase() + typeCuisine.nom.slice(1)}
            </Text>
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
    justifyContent: "center"
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