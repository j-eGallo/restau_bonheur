import { View, Image, Pressable, StyleSheet, TextInput } from "react-native";

export default function BottomNav() {
  return (
    <View style={styles.bottomnav}>
      <Pressable style={styles.iconButton}>
        <Image
          source={require("../../assets/images/homeicon.png")}
          style={styles.icon}
        />
      </Pressable>

      <View style={styles.searchBar}>
        <Image
          source={require("../../assets/images/searchicon.png")}
          style={styles.searchIcon}
        />

        <TextInput
          placeholder="Rechercher ..."
          placeholderTextColor="#555"
          style={[
            styles.searchInput,
            { outlineStyle: "none" } as any
          ]}          
        />
      </View>

      <View style={styles.rightpart}>
        <Pressable style={styles.iconButton}>
          <Image
            source={require("../../assets/images/calendaricon.png")}
            style={styles.icon}
          />
        </Pressable>

        <Pressable style={styles.iconButton}>
          <Image
            source={require("../../assets/images/usericon.png")}
            style={styles.icon}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomnav: {
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    zIndex: 999,
  },

  iconButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },

  searchBar: {
    flex: 1,
    height: 52,
    borderWidth: 3,
    borderColor: "#2D2D2D",
    borderRadius: 30,
    marginHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  searchIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#2D2D2D",
  },

  rightpart: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
});