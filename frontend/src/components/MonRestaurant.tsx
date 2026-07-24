import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import TopBar from "./TopBar";
import SideBar from "./SideBar";
import Note from "./Note";

import Menu from "../assets/food.png";
import Photo from "../assets/photo.png";

import "./monRestaurant.css";

const API_URL =
  "http://localhost:8000";

const JOURS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

type Horaire = {
  id?: number;
  jour: string;

  ouvert_midi: boolean;
  heure_ouverture_midi: string | null;
  heure_fermeture_midi: string | null;

  ouvert_soir: boolean;
  heure_ouverture_soir: string | null;
  heure_fermeture_soir: string | null;
};

type Profile = {
  restaurateur: {
    id: number;
    nom: string;
    prenom: string;
  };

  restaurant: {
    id: number;
    nom: string;
    nm_rue: string;
    rue: string;
    code_postal: string;
    ville: string;
    telephone: string;
    personnes_max: number;
  };
};

type UpdateHorairesResponse = {
  message?: string;
  error?: string;
  reservations_annulees?: number;
  horaires?: Horaire[];
};

const createDefaultHoraires =
  (): Horaire[] => {
    return JOURS.map((jour) => ({
      jour,

      ouvert_midi: false,
      heure_ouverture_midi: "11:30",
      heure_fermeture_midi: "14:00",

      ouvert_soir: false,
      heure_ouverture_soir: "19:00",
      heure_fermeture_soir: "22:30",
    }));
  };

export default function MonRestaurant() {
  const navigate = useNavigate();

  /* ======================================================
     ÉTATS PRINCIPAUX
  ====================================================== */

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [places, setPlaces] =
    useState(0);

  const [
    showPlacesBox,
    setShowPlacesBox,
  ] = useState(false);

  const [
    showRestaurantModal,
    setShowRestaurantModal,
  ] = useState(false);

  const [
    showHorairesModal,
    setShowHorairesModal,
  ] = useState(false);

  const [
    horaires,
    setHoraires,
  ] = useState<Horaire[]>(
    createDefaultHoraires()
  );

  const [
    horairesBeforeEdit,
    setHorairesBeforeEdit,
  ] = useState<Horaire[]>([]);

  const [
    isSavingHoraires,
    setIsSavingHoraires,
  ] = useState(false);

  const [restaurantForm, setRestaurantForm] =
    useState({
      nom: "",
      nm_rue: "",
      rue: "",
      code_postal: "",
      ville: "",
      telephone: "",
    });

  /* ======================================================
     CHARGEMENT DU RESTAURANT ET DE SES HORAIRES
  ====================================================== */

  useEffect(() => {
    const token =
      localStorage.getItem(
        "restaurateur_token"
      );

    if (!token) {
      navigate("/");
      return;
    }

    fetch(
      `${API_URL}/api/restaurateur/me`,
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${token}`,

          Accept: "application/json",
        },
      }
    )
      .then(async (response) => {
        const data =
          await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem(
              "restaurateur_token"
            );

            navigate("/");
          }

          return null;
        }

        return data as Profile;
      })
      .then(async (data) => {
        if (!data) {
          return;
        }

        setProfile(data);

        setPlaces(
          data.restaurant.personnes_max
        );

        setRestaurantForm({
          nom: data.restaurant.nom,
          nm_rue:
            data.restaurant.nm_rue,
          rue: data.restaurant.rue,
          code_postal:
            data.restaurant.code_postal,
          ville:
            data.restaurant.ville,
          telephone:
            data.restaurant.telephone,
        });

        const restaurantResponse =
          await fetch(
            `${API_URL}/api/restaurant/get/${data.restaurant.id}`
          );

        const restaurantData =
          await restaurantResponse.json();

        if (
          restaurantResponse.ok &&
          restaurantData
            .restaurant
            ?.horaires
        ) {
          setHoraires(
            normalizeHoraires(
              restaurantData
                .restaurant
                .horaires
            )
          );
        }
      })
      .catch((error) => {
        console.error(
          "Erreur chargement restaurant :",
          error
        );
      });
  }, [navigate]);

  /* ======================================================
     MODIFICATION DES INFORMATIONS
  ====================================================== */

  const openRestaurantModal = () => {
    if (!profile) {
      return;
    }

    setRestaurantForm({
      nom: profile.restaurant.nom,
      nm_rue:
        profile.restaurant.nm_rue,
      rue: profile.restaurant.rue,
      code_postal:
        profile.restaurant.code_postal,
      ville:
        profile.restaurant.ville,
      telephone:
        profile.restaurant.telephone,
    });

    setShowRestaurantModal(true);
  };

  const handleSaveRestaurantInfos =
    async () => {
      const token =
        localStorage.getItem(
          "restaurateur_token"
        );

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/restaurant/update-infos`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/json",
            },
            body: JSON.stringify(
              restaurantForm
            ),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.error ??
              "Impossible de modifier le restaurant."
          );

          return;
        }

        setProfile((previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            restaurant: {
              ...previous.restaurant,
              ...data.restaurant,
            },
          };
        });

        setShowRestaurantModal(false);
      } catch (error) {
        console.error(
          "Erreur sauvegarde restaurant :",
          error
        );
      }
    };

  /* ======================================================
     MODIFICATION DU NOMBRE DE PLACES
  ====================================================== */

  const handleSavePlaces =
    async () => {
      const token =
        localStorage.getItem(
          "restaurateur_token"
        );

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/restaurant/update-places`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/json",
            },
            body: JSON.stringify({
              personnes_max: places,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.error ??
              "Impossible de modifier les places."
          );

          return;
        }

        setProfile((previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            restaurant: {
              ...previous.restaurant,
              personnes_max:
                data.personnes_max,
            },
          };
        });

        setShowPlacesBox(false);
      } catch (error) {
        console.error(
          "Erreur sauvegarde places :",
          error
        );
      }
    };

  /* ======================================================
     MODIFICATION DES HORAIRES
  ====================================================== */

  const openHorairesModal = () => {
    setHorairesBeforeEdit(
      horaires.map((horaire) => ({
        ...horaire,
      }))
    );

    setShowHorairesModal(true);
  };

  const updateHoraire = (
    index: number,
    field: keyof Horaire,
    value: string | boolean
  ) => {
    setHoraires((previous) =>
      previous.map(
        (horaire, currentIndex) =>
          currentIndex === index
            ? {
                ...horaire,
                [field]: value,
              }
            : horaire
      )
    );
  };

  const closeHorairesModal = () => {
    setHoraires(
      horairesBeforeEdit.map(
        (horaire) => ({
          ...horaire,
        })
      )
    );

    setShowHorairesModal(false);
  };

const handleSaveHoraires = async () => {
  const token = localStorage.getItem(
    "restaurateur_token"
  );

  if (!token) {
    navigate("/");
    return;
  }

  const hasClosedService = horaires.some(
    (horaire, index) => {
      const oldHoraire =
        horairesBeforeEdit[index];

      if (!oldHoraire) {
        return false;
      }

      return (
        (oldHoraire.ouvert_midi &&
          !horaire.ouvert_midi) ||
        (oldHoraire.ouvert_soir &&
          !horaire.ouvert_soir)
      );
    }
  );

  if (hasClosedService) {
    const confirmed = window.confirm(
      "La fermeture d'un service annulera toutes les réservations futures concernées. Continuer ?"
    );

    if (!confirmed) {
      return;
    }
  }

  try {
    setIsSavingHoraires(true);

    const response = await fetch(
      `${API_URL}/api/restaurant/update-horaires`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          horaires,
        }),
      }
    );

    const responseText =
      await response.text();

    console.log(
      "STATUS UPDATE HORAIRES :",
      response.status
    );

    console.log(
      "RÉPONSE UPDATE HORAIRES :",
      responseText
    );

    let data: UpdateHorairesResponse = {};

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      alert(
        `Erreur serveur ${response.status} : ${responseText}`
      );

      return;
    }

    if (!response.ok) {
      alert(
        data.error ??
          `Erreur serveur ${response.status}`
      );

      return;
    }

    if (data.horaires) {
      setHoraires(
        normalizeHoraires(
          data.horaires
        )
      );
    }

    setShowHorairesModal(false);

    const cancelled =
      data.reservations_annulees ?? 0;

    if (cancelled > 0) {
      alert(
        `Horaires enregistrés. ${cancelled} réservation${
          cancelled > 1 ? "s ont" : " a"
        } été annulée${
          cancelled > 1 ? "s" : ""
        }.`
      );
    } else {
      alert(
        "Les horaires ont bien été enregistrés."
      );
    }
  } catch (error) {
    console.error(
      "Erreur sauvegarde horaires :",
      error
    );

    alert(
      "Impossible de contacter le serveur."
    );
  } finally {
    setIsSavingHoraires(false);
  }
};

  /* ======================================================
     AFFICHAGE
  ====================================================== */

  return (
    <div>
      <TopBar />

      <div className="restaurant-dashboard">
        <SideBar />

        <main className="restaurant-content">
          <h1 className="restaurant-title">
            MON RESTAURANT
          </h1>

          <section className="restaurant-top">
            {profile && (
              <div
                className="restaurant-info-block"
                onClick={
                  openRestaurantModal
                }
              >
                <p className="restaurant-welcome">
                  Bienvenue,{" "}
                  {
                    profile.restaurateur
                      .prenom
                  }{" "}
                  {
                    profile.restaurateur
                      .nom
                  } !
                </p>

                <p className="home-restaurant-name">
                  {
                    profile.restaurant
                      .nom
                  }
                </p>

                <p className="home-info">
                  {
                    profile.restaurant
                      .nm_rue
                  }{" "}
                  {
                    profile.restaurant
                      .rue
                  }
                </p>

                <p className="home-info">
                  {
                    profile.restaurant
                      .code_postal
                  }
                  ,{" "}
                  {
                    profile.restaurant
                      .ville
                  }
                </p>

                <p className="home-info">
                  {
                    profile.restaurant
                      .telephone
                  }
                </p>
              </div>
            )}

            {profile && (
              <div className="restaurant-note">
                <Note
                  idRestaurant={
                    profile.restaurant
                      .id
                  }
                />
              </div>
            )}
          </section>

          {/* Réglages rapides */}
          <section className="restaurant-places">
            <button
              type="button"
              className="restaurant-small-box"
              onClick={() =>
                setShowPlacesBox(true)
              }
            >
              Places disponibles
            </button>

            <button
              type="button"
              className="restaurant-small-box"
              onClick={
                openHorairesModal
              }
            >
              Modifier les horaires
            </button>
          </section>

          {/* Cartes photos et menu */}
          <section className="restaurant-cards">
            <Link
              to="/restaurant/photos"
              className="restaurant-card card-link"
            >
              <div className="restaurant-card-icon">
                <img
                  className="btn-photo"
                  src={Photo}
                  alt=""
                />
              </div>

              <h2>Mes photos</h2>
            </Link>

            <Link
              to="/restaurant/menu"
              className="restaurant-card card-link"
            >
              <div className="restaurant-card-icon">
                <img
                  className="btn-photo"
                  src={Menu}
                  alt=""
                />
              </div>

              <h2>Mon menu</h2>
            </Link>
          </section>
        </main>
      </div>

      {/* Modal nombre de places */}
      {showPlacesBox && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowPlacesBox(false)
          }
        >
          <div
            className="places-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h2>
              Nombre de places disponibles
            </h2>

            <div className="places-counter">
              <button
                type="button"
                onClick={() =>
                  setPlaces((previous) =>
                    Math.max(
                      1,
                      previous - 1
                    )
                  )
                }
              >
                -
              </button>

              <span>{places}</span>

              <button
                type="button"
                onClick={() =>
                  setPlaces(
                    (previous) =>
                      previous + 1
                  )
                }
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="places-save"
              onClick={handleSavePlaces}
            >
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Modal informations du restaurant */}
      {showRestaurantModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowRestaurantModal(
              false
            )
          }
        >
          <div
            className="places-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h2>
              Modifier les informations
            </h2>

            {Object.entries(
              restaurantForm
            ).map(([field, value]) => (
              <input
                key={field}
                type="text"
                value={value}
                placeholder={getFieldLabel(
                  field
                )}
                onChange={(event) =>
                  setRestaurantForm(
                    (previous) => ({
                      ...previous,
                      [field]:
                        event.target
                          .value,
                    })
                  )
                }
              />
            ))}

            <button
              type="button"
              className="places-save"
              onClick={
                handleSaveRestaurantInfos
              }
            >
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Modal modification des horaires */}
      {showHorairesModal && (
        <div
          className="modal-overlay"
          onClick={closeHorairesModal}
        >
          <div
            className="horaires-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h2>
              Modifier les horaires
            </h2>

            <p className="horaires-warning">
              Fermer un service annulera
              les réservations futures
              concernées.
            </p>

            <div className="horaires-list">
              {horaires.map(
                (horaire, index) => (
                  <div
                    className="horaire-row"
                    key={horaire.jour}
                  >
                    <strong className="horaire-jour">
                      {capitalize(
                        horaire.jour
                      )}
                    </strong>

                    <div className="horaire-service">
                      <label>
                        <input
                          type="checkbox"
                          checked={
                            horaire.ouvert_midi
                          }
                          onChange={(
                            event
                          ) =>
                            updateHoraire(
                              index,
                              "ouvert_midi",
                              event.target
                                .checked
                            )
                          }
                        />

                        Midi
                      </label>

                      <input
                        type="time"
                        disabled={
                          !horaire.ouvert_midi
                        }
                        value={
                          horaire.heure_ouverture_midi
                          ?? ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateHoraire(
                            index,
                            "heure_ouverture_midi",
                            event.target
                              .value
                          )
                        }
                      />

                      <span>à</span>

                      <input
                        type="time"
                        disabled={
                          !horaire.ouvert_midi
                        }
                        value={
                          horaire.heure_fermeture_midi
                          ?? ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateHoraire(
                            index,
                            "heure_fermeture_midi",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="horaire-service">
                      <label>
                        <input
                          type="checkbox"
                          checked={
                            horaire.ouvert_soir
                          }
                          onChange={(
                            event
                          ) =>
                            updateHoraire(
                              index,
                              "ouvert_soir",
                              event.target
                                .checked
                            )
                          }
                        />

                        Soir
                      </label>

                      <input
                        type="time"
                        disabled={
                          !horaire.ouvert_soir
                        }
                        value={
                          horaire.heure_ouverture_soir
                          ?? ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateHoraire(
                            index,
                            "heure_ouverture_soir",
                            event.target
                              .value
                          )
                        }
                      />

                      <span>à</span>

                      <input
                        type="time"
                        disabled={
                          !horaire.ouvert_soir
                        }
                        value={
                          horaire.heure_fermeture_soir
                          ?? ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateHoraire(
                            index,
                            "heure_fermeture_soir",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="horaires-actions">
              <button
                type="button"
                className="horaires-cancel"
                onClick={
                  closeHorairesModal
                }
              >
                Annuler
              </button>

              <button
                type="button"
                className="places-save"
                disabled={
                  isSavingHoraires
                }
                onClick={
                  handleSaveHoraires
                }
              >
                {isSavingHoraires
                  ? "Enregistrement..."
                  : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================
   FONCTIONS UTILITAIRES
======================================================== */

function normalizeHoraires(
  receivedHoraires: Horaire[]
) {
  return JOURS.map((jour) => {
    const found =
      receivedHoraires.find(
        (horaire) =>
          horaire.jour === jour
      );

    return (
      found ?? {
        jour,

        ouvert_midi: false,
        heure_ouverture_midi:
          "11:30",
        heure_fermeture_midi:
          "14:00",

        ouvert_soir: false,
        heure_ouverture_soir:
          "19:00",
        heure_fermeture_soir:
          "22:30",
      }
    );
  });
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function getFieldLabel(
  field: string
) {
  const labels:
    Record<string, string> = {
      nom: "Nom du restaurant",
      nm_rue: "Numéro de rue",
      rue: "Rue",
      code_postal: "Code postal",
      ville: "Ville",
      telephone: "Téléphone",
    };

  return labels[field] ?? field;
}