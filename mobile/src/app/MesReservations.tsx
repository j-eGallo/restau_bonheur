import { View, Image,Text,  Pressable, StyleSheet, TextInput } from "react-native";
import { router } from "expo-router";



export default function MesReservations() {

  

  return (
    <View>
      <Pressable onPress={() => router.replace("/home")} >
        <Text>Revenir en arrière</Text>
      </Pressable>
    </View>
  )
}