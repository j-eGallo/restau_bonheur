import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import "./App.css";
import logo from "./assets/logo.png";
import Home from "./components/Home";
import MonRestaurant from "./components/MonRestaurant";
import Photo from "./components/Photo";
import Menu from "./components/Menu";
import Parametres from "./components/Parametres";
import Reservation from "./components/Reservation";


/*
Cette page concerne l'inscription et la connexion de l'espace Restaurateur

Elle possède plusieurs states :
1. 
*/



type Mode = "login" | "register";

type Horaire = {
  jour: string;
  ouvert_midi: boolean;
  ouvert_soir: boolean;
  heure_ouverture_midi: string;
  heure_fermeture_midi: string;
  heure_ouverture_soir: string;
  heure_fermeture_soir: string;
};

const API_URL = "http://127.0.0.1:8000";

const jours = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

const cuisines = [
  "Française",
  "Italienne",
  "Japonaise",
  "Chinoise",
  "Indienne",
  "Mexicaine",
  "Burger",
  "Pizza",
  "Méditerranéenne",
  "Végétarienne",
];

function App() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState(1);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [midiNeverOpen, setMidiNeverOpen] = useState(false);
  const [soirNeverOpen, setSoirNeverOpen] = useState(false);

  const [midiTimes, setMidiTimes] = useState({
    ouverture: "11:00",
    fermeture: "14:00",
  });

  const [soirTimes, setSoirTimes] = useState({
    ouverture: "19:00",
    fermeture: "22:30",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",

    restaurantNom: "",
    restaurantLogo: null as File | null,
    restaurantTelephone: "",
    personnesMax: 40,

    cuisines: [] as string[],

    nmRue: "",
    rue: "",
    codePostal: "",
    ville: "",
  });

  const [horaires, setHoraires] = useState<Horaire[]>(
    jours.map((jour) => ({
      jour,
      ouvert_midi: true,
      ouvert_soir: true,
      heure_ouverture_midi: "11:00",
      heure_fermeture_midi: "14:00",
      heure_ouverture_soir: "19:00",
      heure_fermeture_soir: "22:30",
    }))
  );

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "personnesMax" ? Number(value) : value,
    });
  };

  const handleCuisineChange = (cuisine: string) => {
    if (formData.cuisines.includes(cuisine)) {
      setFormData({
        ...formData,
        cuisines: formData.cuisines.filter((item) => item !== cuisine),
      });
    } else {
      setFormData({
        ...formData,
        cuisines: [...formData.cuisines, cuisine],
      });
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFormData({
      ...formData,
      restaurantLogo: file,
    });
  };

  const handleMidiNeverOpen = (checked: boolean) => {
    setMidiNeverOpen(checked);

    setHoraires((prev) =>
      prev.map((horaire) => ({
        ...horaire,
        ouvert_midi: checked ? false : true,
        heure_ouverture_midi: checked ? "" : midiTimes.ouverture,
        heure_fermeture_midi: checked ? "" : midiTimes.fermeture,
      }))
    );
  };

  const handleSoirNeverOpen = (checked: boolean) => {
    setSoirNeverOpen(checked);

    setHoraires((prev) =>
      prev.map((horaire) => ({
        ...horaire,
        ouvert_soir: checked ? false : true,
        heure_ouverture_soir: checked ? "" : soirTimes.ouverture,
        heure_fermeture_soir: checked ? "" : soirTimes.fermeture,
      }))
    );
  };

  const handleMidiTimeChange = (
    field: "ouverture" | "fermeture",
    value: string
  ) => {
    const newTimes = {
      ...midiTimes,
      [field]: value,
    };

    setMidiTimes(newTimes);

    setHoraires((prev) =>
      prev.map((horaire) => {
        if (!horaire.ouvert_midi) {
          return horaire;
        }

        return {
          ...horaire,
          heure_ouverture_midi: newTimes.ouverture,
          heure_fermeture_midi: newTimes.fermeture,
        };
      })
    );
  };

  const handleSoirTimeChange = (
    field: "ouverture" | "fermeture",
    value: string
  ) => {
    const newTimes = {
      ...soirTimes,
      [field]: value,
    };

    setSoirTimes(newTimes);

    setHoraires((prev) =>
      prev.map((horaire) => {
        if (!horaire.ouvert_soir) {
          return horaire;
        }

        return {
          ...horaire,
          heure_ouverture_soir: newTimes.ouverture,
          heure_fermeture_soir: newTimes.fermeture,
        };
      })
    );
  };

  const toggleMidiClosedDay = (jour: string) => {
    if (midiNeverOpen) return;

    setHoraires((prev) =>
      prev.map((horaire) => {
        if (horaire.jour !== jour) {
          return horaire;
        }

        const willBeOpen = !horaire.ouvert_midi;

        return {
          ...horaire,
          ouvert_midi: willBeOpen,
          heure_ouverture_midi: willBeOpen ? midiTimes.ouverture : "",
          heure_fermeture_midi: willBeOpen ? midiTimes.fermeture : "",
        };
      })
    );
  };

  const toggleSoirClosedDay = (jour: string) => {
    if (soirNeverOpen) return;

    setHoraires((prev) =>
      prev.map((horaire) => {
        if (horaire.jour !== jour) {
          return horaire;
        }

        const willBeOpen = !horaire.ouvert_soir;

        return {
          ...horaire,
          ouvert_soir: willBeOpen,
          heure_ouverture_soir: willBeOpen ? soirTimes.ouverture : "",
          heure_fermeture_soir: willBeOpen ? soirTimes.fermeture : "",
        };
      })
    );
  };

  const isStepValid = () => {
    if (step === 1) {
      return (
        formData.nom.trim() !== "" &&
        formData.prenom.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.password.trim() !== ""
      );
    }

    if (step === 2) {
      return (
        formData.restaurantNom.trim() !== "" &&
        formData.restaurantLogo !== null &&
        formData.restaurantTelephone.trim() !== "" &&
        formData.personnesMax > 0
      );
    }

    if (step === 3) {
      return formData.cuisines.length > 0;
    }

    if (step === 4) {
      if (midiNeverOpen) {
        return true;
      }

      const joursMidiOuverts = horaires.filter(
        (horaire) => horaire.ouvert_midi
      );

      return (
        midiTimes.ouverture.trim() !== "" &&
        midiTimes.fermeture.trim() !== "" &&
        joursMidiOuverts.length > 0
      );
    }

    if (step === 5) {
      if (soirNeverOpen) {
        return true;
      }

      const joursSoirOuverts = horaires.filter(
        (horaire) => horaire.ouvert_soir
      );

      return (
        soirTimes.ouverture.trim() !== "" &&
        soirTimes.fermeture.trim() !== "" &&
        joursSoirOuverts.length > 0
      );
    }

    if (step === 6) {
      return (
        formData.nmRue.trim() !== "" &&
        formData.rue.trim() !== "" &&
        formData.codePostal.trim() !== "" &&
        formData.ville.trim() !== ""
      );
    }

    return false;
  };

  const nextStep = () => {
    if (!isStepValid()) {
      setMessage("Veuillez remplir tous les champs de cette étape.");
      return;
    }

    if (step < 6) {
      setStep(step + 1);
      setMessage("");
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setMessage("");
    }
  };

  const switchToLogin = () => {
    setMode("login");
    setMessage("");
  };

  const switchToRegister = () => {
    setMode("register");
    setStep(1);
    setMessage("");
  };

  const handleRegister = async () => {
    if (!isStepValid()) {
      setMessage("Veuillez remplir tous les champs avant de vous inscrire.");
      return;
    }

    setLoading(true);
    setMessage("");

    const payload = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      password: formData.password,
      telephone: formData.restaurantTelephone,

      restaurant: {
        nom: formData.restaurantNom,
        telephone: formData.restaurantTelephone,
        personnes_max: formData.personnesMax,
        nm_rue: formData.nmRue,
        rue: formData.rue,
        code_postal: formData.codePostal,
        ville: formData.ville,

        cuisines: formData.cuisines,

        horaires: horaires,
      },
    };

    const dataToSend = new FormData();

    dataToSend.append("data", JSON.stringify(payload));

    if (formData.restaurantLogo) {
      dataToSend.append("logo", formData.restaurantLogo);
    }

    try {
      const response = await fetch(`${API_URL}/api/registerRestaurateur`, {
        method: "POST",
        body: dataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Erreur lors de l'inscription");
        return;
      }

      setMessage("Compte restaurateur créé avec succès !");
      setMode("login");
      setStep(1);
    } catch (error) {
      console.error(error);
      setMessage("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/loginRestaurateur`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Identifiants invalides");
        return;
      }

      localStorage.setItem("restaurateur_token", data.token);
      localStorage.setItem("restaurateur_user", JSON.stringify(data.user));

      setMessage("Connexion réussie !");

      navigate("/components/home");
    } catch (error) {
      console.error(error);
      setMessage("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

return (
  <Routes>
    <Route
      path="/"
      element={
        <main className="auth-page">
          <div className="auth-card">
            <img src={logo} alt="Restau Bonheur" className="auth-logo" />

            {mode === "login" && (
              <form onSubmit={handleLogin} className="auth-form">
                <h1>Connexion restaurateur</h1>

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={loginData.password}
                  onChange={handleLoginChange}
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                </button>

                <button type="button" onClick={switchToRegister}>
                  Pas de compte ? Créer un compte
                </button>

                {message && <p className="auth-message">{message}</p>}
              </form>
            )}

            {mode === "register" && (
              <div className="auth-form">
                <h1>Inscription restaurateur</h1>

                {step === 1 && (
                  <>
                    <input
                      type="text"
                      name="nom"
                      placeholder="Nom"
                      value={formData.nom}
                      onChange={handleFormChange}
                    />

                    <input
                      type="text"
                      name="prenom"
                      placeholder="Prénom"
                      value={formData.prenom}
                      onChange={handleFormChange}
                    />

                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleFormChange}
                    />

                    <input
                      type="password"
                      name="password"
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={handleFormChange}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <input
                      type="text"
                      name="restaurantNom"
                      placeholder="Nom du restaurant"
                      value={formData.restaurantNom}
                      onChange={handleFormChange}
                    />

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />

                    <input
                      type="text"
                      name="restaurantTelephone"
                      placeholder="Téléphone du restaurant"
                      value={formData.restaurantTelephone}
                      onChange={handleFormChange}
                    />

                    <input
                      type="number"
                      name="personnesMax"
                      placeholder="Nombre de personnes maximum"
                      value={formData.personnesMax}
                      onChange={handleFormChange}
                    />
                  </>
                )}

                {step === 3 && (
                  <div className="cuisine-list">
                    {cuisines.map((cuisine) => (
                      <label key={cuisine}>
                        <input
                          type="checkbox"
                          checked={formData.cuisines.includes(cuisine)}
                          onChange={() => handleCuisineChange(cuisine)}
                        />
                        {cuisine}
                      </label>
                    ))}
                  </div>
                )}

                {step === 4 && (
                  <>
                    <label>
                      <input
                        type="checkbox"
                        checked={midiNeverOpen}
                        onChange={(e) =>
                          handleMidiNeverOpen(e.target.checked)
                        }
                      />
                      Jamais ouvert le midi
                    </label>

                    {!midiNeverOpen && (
                      <>
                        <input
                          type="time"
                          value={midiTimes.ouverture}
                          onChange={(e) =>
                            handleMidiTimeChange("ouverture", e.target.value)
                          }
                        />

                        <input
                          type="time"
                          value={midiTimes.fermeture}
                          onChange={(e) =>
                            handleMidiTimeChange("fermeture", e.target.value)
                          }
                        />

                        <div className="jours-list">
                          {horaires.map((horaire) => (
                            <button
                              key={horaire.jour}
                              type="button"
                              className={
                                horaire.ouvert_midi ? "jour-open" : "jour-closed"
                              }
                              onClick={() => toggleMidiClosedDay(horaire.jour)}
                            >
                              {horaire.jour}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}

                {step === 5 && (
                  <>
                    <label>
                      <input
                        type="checkbox"
                        checked={soirNeverOpen}
                        onChange={(e) =>
                          handleSoirNeverOpen(e.target.checked)
                        }
                      />
                      Jamais ouvert le soir
                    </label>

                    {!soirNeverOpen && (
                      <>
                        <input
                          type="time"
                          value={soirTimes.ouverture}
                          onChange={(e) =>
                            handleSoirTimeChange("ouverture", e.target.value)
                          }
                        />

                        <input
                          type="time"
                          value={soirTimes.fermeture}
                          onChange={(e) =>
                            handleSoirTimeChange("fermeture", e.target.value)
                          }
                        />

                        <div className="jours-list">
                          {horaires.map((horaire) => (
                            <button
                              key={horaire.jour}
                              type="button"
                              className={
                                horaire.ouvert_soir ? "jour-open" : "jour-closed"
                              }
                              onClick={() => toggleSoirClosedDay(horaire.jour)}
                            >
                              {horaire.jour}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}

                {step === 6 && (
                  <>
                    <input
                      type="text"
                      name="nmRue"
                      placeholder="Numéro de rue"
                      value={formData.nmRue}
                      onChange={handleFormChange}
                    />

                    <input
                      type="text"
                      name="rue"
                      placeholder="Nom de rue"
                      value={formData.rue}
                      onChange={handleFormChange}
                    />

                    <input
                      type="text"
                      name="codePostal"
                      placeholder="Code postal"
                      value={formData.codePostal}
                      onChange={handleFormChange}
                    />

                    <input
                      type="text"
                      name="ville"
                      placeholder="Ville"
                      value={formData.ville}
                      onChange={handleFormChange}
                    />
                  </>
                )}

                <div className="auth-actions">
                  {step > 1 && (
                    <button type="button" onClick={prevStep}>
                      Retour
                    </button>
                  )}

                  {step < 6 && (
                    <button type="button" onClick={nextStep}>
                      Suivant
                    </button>
                  )}

                  {step === 6 && (
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={loading}
                    >
                      {loading ? "Inscription..." : "Créer le compte"}
                    </button>
                  )}
                </div>

                <button type="button" onClick={switchToLogin}>
                  Déjà un compte ? Se connecter
                </button>

                {message && <p className="auth-message">{message}</p>}
              </div>
            )}
          </div>
        </main>
      }
    />

    <Route path="/components/home" element={<Home />} />
    <Route path="/restaurant" element={<MonRestaurant />} />
    <Route path="/restaurant/photos" element={<Photo />} />
    <Route path="/restaurant/menu" element={<Menu />}/>
    <Route path="/parametres" element={<Parametres />} />
    <Route path="/reservations" element={<Reservation />} />
    
  </Routes>
);
}

export default App;