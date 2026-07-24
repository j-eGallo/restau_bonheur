import { useEffect, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import TopBar from "../components/TopBar";
import AppText from "../components/AppText";

type Client = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
};

type EditableField =
  | "nom"
  | "prenom"
  | "email"
  | "telephone"
  | "password";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Parametres() {
  const [client, setClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedField, setSelectedField] =
    useState<EditableField | null>(null);

  const [newValue, setNewValue] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] =
    useState("");

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClient();
  }, []);

const loadClient = async () => {
  try {
    setLoadingClient(true);
    setError("");

    const token = await AsyncStorage.getItem("client_token");

    console.log("TOKEN PARAMÈTRES :", token);

    if (!token) {
      console.log("Aucun token client trouvé");
      router.replace("/auth");
      return;
    }

    const response = await fetch(
      `${API_URL}/api/client/me`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const responseText = await response.text();

    console.log("STATUS CLIENT ME :", response.status);
    console.log("RÉPONSE CLIENT ME :", responseText);

    let data: any = {};

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      throw new Error(
        "Le serveur n'a pas renvoyé une réponse JSON."
      );
    }

    if (!response.ok) {
      if (response.status === 401) {
        await AsyncStorage.removeItem("client_token");
        await AsyncStorage.removeItem("client_user");

        router.replace("/auth");
        return;
      }

      throw new Error(
        data.error ??
          "Impossible de récupérer vos informations."
      );
    }

    if (!data.client) {
      throw new Error(
        "Les informations du client sont absentes."
      );
    }

    const currentClient: Client = {
      id: data.client.id,
      nom: data.client.nom ?? "",
      prenom: data.client.prenom ?? "",
      email: data.client.email ?? "",
      telephone: data.client.telephone ?? "",
    };

    console.log("CLIENT CHARGÉ :", currentClient);

    setClient(currentClient);

    // Copie locale utile, mais l'API reste la source principale
    await AsyncStorage.setItem(
      "client_user",
      JSON.stringify(currentClient)
    );
  } catch (error) {
    console.log(
      "Erreur chargement informations client :",
      error
    );

    setError(
      error instanceof Error
        ? error.message
        : "Impossible de récupérer vos informations."
    );
  } finally {
    setLoadingClient(false);
  }
};

  const logout = async () => {
    await AsyncStorage.removeItem("client_token");
    await AsyncStorage.removeItem("client_user");

    router.replace("/auth");
  };

  const getFieldLabel = (field: EditableField) => {
    switch (field) {
      case "nom":
        return "nom";

      case "prenom":
        return "prénom";

      case "email":
        return "adresse e-mail";

      case "telephone":
        return "numéro de téléphone";

      case "password":
        return "mot de passe";

      default:
        return "";
    }
  };

  const getCurrentFieldValue = (
    field: EditableField
  ): string => {
    if (!client || field === "password") {
      return "";
    }

    return String(client[field] ?? "");
  };

  const openEditModal = (field: EditableField) => {
    setSelectedField(field);
    setError("");
    setCurrentPassword("");

    if (field === "password") {
      setNewValue("");
      setNewPassword("");
      setNewPasswordConfirmation("");
    } else {
      setNewValue(getCurrentFieldValue(field));
      setNewPassword("");
      setNewPasswordConfirmation("");
    }

    setModalVisible(true);
  };

  const closeModal = () => {
    if (loadingUpdate) {
      return;
    }

    setModalVisible(false);
    setSelectedField(null);
    setNewValue("");
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirmation("");
    setError("");
  };

  const validateForm = () => {
    if (!selectedField) {
      setError("Aucune information sélectionnée.");
      return false;
    }

    if (!currentPassword.trim()) {
      setError(
        "Vous devez saisir votre mot de passe actuel."
      );
      return false;
    }

    if (selectedField === "password") {
      if (!newPassword.trim()) {
        setError(
          "Vous devez saisir un nouveau mot de passe."
        );
        return false;
      }

      if (newPassword.length < 8) {
        setError(
          "Le nouveau mot de passe doit contenir au moins 8 caractères."
        );
        return false;
      }

      if (
        newPassword !== newPasswordConfirmation
      ) {
        setError(
          "Les deux nouveaux mots de passe ne correspondent pas."
        );
        return false;
      }

      if (newPassword === currentPassword) {
        setError(
          "Le nouveau mot de passe doit être différent de l'ancien."
        );
        return false;
      }

      return true;
    }

    if (!newValue.trim()) {
      setError(
        `Le nouveau ${getFieldLabel(
          selectedField
        )} ne peut pas être vide.`
      );
      return false;
    }

    if (
      selectedField === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        newValue.trim()
      )
    ) {
      setError("L'adresse e-mail est invalide.");
      return false;
    }

    if (
      selectedField === "telephone" &&
      !/^[0-9+\s.-]{8,20}$/.test(newValue.trim())
    ) {
      setError(
        "Le numéro de téléphone est invalide."
      );
      return false;
    }

    return true;
  };

  

const updateInformation = async () => {
  if (!validateForm() || !selectedField || !client) {
    return;
  }

  try {
    setLoadingUpdate(true);
    setError("");

    const token = await AsyncStorage.getItem("client_token");

    if (!token) {
      setError("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    const body: Record<string, string> = {
      currentEmail: client.email,
      currentPassword: currentPassword,
    };

    if (selectedField === "password") {
      body.password = newPassword;
    } else {
      body[selectedField] = newValue.trim();
    }

    console.log("BODY UPDATE CLIENT :", body);

    const response = await fetch(
      `${API_URL}/api/updateClient`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const responseText = await response.text();

    console.log("STATUS UPDATE CLIENT :", response.status);
    console.log("RÉPONSE UPDATE CLIENT :", responseText);

    let data: any = {};

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      setError("Le serveur a renvoyé une réponse invalide.");
      return;
    }

    if (!response.ok) {
      setError(
        data.error ??
        data.message ??
        `Impossible de modifier cette information. Erreur ${response.status}`
      );
      return;
    }

    await loadClient();

    setModalVisible(false);
    setSelectedField(null);
    setNewValue("");
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirmation("");
    setError("");

    Alert.alert(
      "Modification réussie",
      data.message ?? "Client modifié avec succès"
    );
  } catch (error) {
    console.log("Erreur modification client :", error);

    setError(
      "Une erreur est survenue pendant la modification."
    );
  } finally {
    setLoadingUpdate(false);
  }
};

  const renderInformationRow = (
    label: string,
    value: string,
    field: EditableField
  ) => {
    return (
      <View style={styles.informationRow}>
        <View style={styles.informationContent}>
          <AppText style={styles.informationLabel}>
            {label}
          </AppText>

          <AppText style={styles.informationValue}>
            {value}
          </AppText>
        </View>

        <Pressable
          style={styles.editButton}
          onPress={() => openEditModal(field)}
        >
          <AppText style={styles.editButtonText}>
            Modifier
          </AppText>
        </Pressable>
      </View>
    );
  };

  if (loadingClient) {
    return (
      <View style={styles.page}>
        <TopBar />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#ec5b15"
          />

          <AppText style={styles.loadingText}>
            Chargement de vos informations...
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <TopBar />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.title}>
          Mes paramètres
        </AppText>

        <AppText style={styles.subtitle}>
          Gérez vos informations personnelles
        </AppText>

        {client && (
          <View style={styles.card}>
            {renderInformationRow(
              "Nom",
              client.nom,
              "nom"
            )}

            {renderInformationRow(
              "Prénom",
              client.prenom,
              "prenom"
            )}

            {renderInformationRow(
              "Adresse e-mail",
              client.email,
              "email"
            )}

            {renderInformationRow(
              "Téléphone",
              client.telephone,
              "telephone"
            )}

            {renderInformationRow(
              "Mot de passe",
              "••••••••",
              "password"
            )}
          </View>
        )}

        <Pressable
          onPress={logout}
          style={styles.logoutButton}
        >
          <AppText style={styles.logoutButtonText}>
            Se déconnecter
          </AppText>
        </Pressable>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>
              Modifier mon{" "}
              {selectedField
                ? getFieldLabel(selectedField)
                : ""}
            </AppText>

            {selectedField !== "password" &&
              selectedField && (
                <>
                  <AppText style={styles.inputLabel}>
                    Nouveau{" "}
                    {getFieldLabel(selectedField)}
                  </AppText>

                  <TextInput
                    style={styles.input}
                    value={newValue}
                    onChangeText={setNewValue}
                    placeholder={`Saisissez votre nouveau ${getFieldLabel(
                      selectedField
                    )}`}
                    placeholderTextColor="#999"
                    autoCapitalize={
                      selectedField === "email"
                        ? "none"
                        : "sentences"
                    }
                    keyboardType={
                      selectedField === "email"
                        ? "email-address"
                        : selectedField === "telephone"
                        ? "phone-pad"
                        : "default"
                    }
                  />
                </>
              )}

            {selectedField === "password" && (
              <>
                <AppText style={styles.inputLabel}>
                  Nouveau mot de passe
                </AppText>

                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nouveau mot de passe"
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                />

                <AppText style={styles.inputLabel}>
                  Confirmez le nouveau mot de passe
                </AppText>

                <TextInput
                  style={styles.input}
                  value={newPasswordConfirmation}
                  onChangeText={
                    setNewPasswordConfirmation
                  }
                  placeholder="Confirmez le mot de passe"
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </>
            )}

            <AppText style={styles.inputLabel}>
              Mot de passe actuel
            </AppText>

            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Saisissez votre mot de passe actuel"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
            />

            {error !== "" && (
              <AppText style={styles.errorText}>
                {error}
              </AppText>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeModal}
                disabled={loadingUpdate}
              >
                <AppText style={styles.cancelButtonText}>
                  Annuler
                </AppText>
              </Pressable>

              <Pressable
                style={[
                  styles.validateButton,
                  loadingUpdate &&
                    styles.disabledButton,
                ]}
                onPress={updateInformation}
                disabled={loadingUpdate}
              >
                {loadingUpdate ? (
                  <ActivityIndicator
                    size="small"
                    color="white"
                  />
                ) : (
                  <AppText
                    style={styles.validateButtonText}
                  >
                    Valider
                  </AppText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },

  content: {
    paddingTop: 100,
    paddingHorizontal: 18,
    paddingBottom: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ec5b15",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 30,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  informationRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ededed",
    paddingVertical: 18,
  },

  informationContent: {
    flex: 1,
    paddingRight: 10,
  },

  informationLabel: {
    fontSize: 14,
    color: "#777",
    marginBottom: 5,
  },

  informationValue: {
    fontSize: 18,
    color: "#222",
    fontWeight: "700",
  },

  editButton: {
    backgroundColor: "#fff1ea",
    borderWidth: 1,
    borderColor: "#ec5b15",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  editButtonText: {
    color: "#ec5b15",
    fontSize: 14,
    fontWeight: "800",
  },

  logoutButton: {
    backgroundColor: "#ec5b15",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: "center",
  },

  logoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalContent: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 22,
    maxHeight: "90%",
  },

  modalTitle: {
    color: "#ec5b15",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 24,
  },

  inputLabel: {
    color: "#333",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 7,
  },

  input: {
    width: "100%",
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#d5d5d5",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: "#fafafa",
    color: "#222",
    fontSize: 16,
  },

  errorText: {
    color: "#c62828",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 15,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 5,
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#999",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "800",
  },

  validateButton: {
    flex: 1,
    backgroundColor: "#ec5b15",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  validateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.6,
  },
});