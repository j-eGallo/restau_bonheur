import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import "./parametres.css";

const API_URL = import.meta.env.VITE_API_URL;

type Profile = {
  restaurateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
};

export default function Parametres() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/restaurateur/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur récupération profil :", data);

          if (res.status === 401) {
            localStorage.removeItem("restaurateur_token");
            localStorage.removeItem("restaurateur_user");
            navigate("/");
          }

          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        setProfile(data);

        setForm({
          nom: data.restaurateur.nom,
          prenom: data.restaurateur.prenom,
          email: data.restaurateur.email,
          telephone: data.restaurateur.telephone,
          password: "",
        });
      })
      .catch((error) => {
        console.error("Erreur fetch paramètres :", error);
      });
  }, [navigate]);

  const openPasswordModal = () => {
    if (
      form.nom.trim() === "" ||
      form.prenom.trim() === "" ||
      form.email.trim() === "" ||
      form.telephone.trim() === ""
    ) {
      console.log("Champs obligatoires manquants");
      return;
    }

    setCurrentPassword("");
    setShowPasswordModal(true);
  };

  const handleUpdateRestaurateur = () => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    if (!profile) {
      return;
    }

    if (currentPassword.trim() === "") {
      console.log("Mot de passe actuel obligatoire");
      return;
    }

    const body: {
      nom: string;
      prenom: string;
      currentEmail: string;
      email: string;
      telephone: string;
      currentPassword: string;
      password?: string;
    } = {
      nom: form.nom,
      prenom: form.prenom,
      currentEmail: profile.restaurateur.email,
      email: form.email,
      telephone: form.telephone,
      currentPassword: currentPassword,
    };

    if (form.password.trim() !== "") {
      body.password = form.password;
    }

    fetch(`${API_URL}/api/updateRestaurateur`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur update restaurateur :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        const updatedProfile = {
          restaurateur: {
            ...profile.restaurateur,
            nom: form.nom,
            prenom: form.prenom,
            email: form.email,
            telephone: form.telephone,
          },
        };

        setProfile(updatedProfile);

        localStorage.setItem(
          "restaurateur_user",
          JSON.stringify({
            id: profile.restaurateur.id,
            nom: form.nom,
            prenom: form.prenom,
          })
        );

        setForm((prev) => ({
          ...prev,
          password: "",
        }));

        setCurrentPassword("");
        setShowPasswordModal(false);

        console.log("Paramètres modifiés avec succès");
      })
      .catch((error) => {
        console.error("Erreur sauvegarde paramètres :", error);
      });


      
  };
    const handleDeleteAccount = () => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    if (!profile) {
      return;
    }

    if (deletePassword.trim() === "") {
      console.log("Mot de passe obligatoire pour supprimer le compte");
      return;
    }

    fetch(`${API_URL}/api/deleteRestaurateur`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: profile.restaurateur.email,
        password: deletePassword,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur suppression compte :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        localStorage.removeItem("restaurateur_token");
        localStorage.removeItem("restaurateur_user");

        setDeletePassword("");
        setShowDeleteModal(false);

        navigate("/");
      })
      .catch((error) => {
        console.error("Erreur suppression compte :", error);
      });
  };

  return (
    <div>
      <TopBar />

      <div className="parametres-dashboard">
        <SideBar />

        <main className="parametres-content">
          <h1 className="parametres-title">Paramètres</h1>

          <section className="parametres-form-wrapper">
            <h2>Vos coordonnées</h2>

            <div className="parametres-form">
              <label>Nom :</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nom: e.target.value,
                  })
                }
              />

              <label>Prénom :</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prenom: e.target.value,
                  })
                }
              />

              <label>Adresse Email :</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />

              <label>Numéro de téléphone :</label>
              <input
                type="text"
                value={form.telephone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    telephone: e.target.value,
                  })
                }
              />

              <label>Nouveau mot de passe :</label>
              <input
                type="password"
                placeholder="Laisser vide si inchangé"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="parametres-save-btn"
                onClick={openPasswordModal}
              >
                Enregistrer
              </button>

              <button
                type="button"
                className="parametres-delete-btn"
                onClick={() => {
                  setDeletePassword("");
                  setShowDeleteModal(true);
                }}
              >
                Supprimer mon compte et mon restaurant
              </button>
            </div>
          </section>

          {showPasswordModal && (
            <div
              className="parametres-modal-overlay"
              onClick={() => setShowPasswordModal(false)}
            >
              <div
                className="parametres-password-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <h2>Confirmation</h2>

                <p>
                  Entrez votre mot de passe actuel pour valider les modifications.
                </p>

                <input
                  type="password"
                  placeholder="Mot de passe actuel"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <div className="parametres-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={handleUpdateRestaurateur}
                  >
                    Valider
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteModal && (
  <div
    className="parametres-modal-overlay"
    onClick={() => setShowDeleteModal(false)}
  >
    <div
      className="parametres-password-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h2>Supprimer le compte</h2>

      <p>
        Cette action supprimera votre compte restaurateur et votre restaurant.
      </p>

      <input
        type="password"
        placeholder="Mot de passe actuel"
        value={deletePassword}
        onChange={(e) => setDeletePassword(e.target.value)}
      />

      <div className="parametres-modal-actions">
        <button
          type="button"
          onClick={() => setShowDeleteModal(false)}
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={handleDeleteAccount}
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}
        </main>
      </div>
      
    </div>
  );
}