import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import "./App.css";
import Home from "./components/Home";
import logo from "./assets/logo.png";

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
          <section className="auth-card">
            <div className="auth-right">
              <div className="auth-logo-box">
                <img src={logo} alt="Restau Bonheur" className="auth-logo" />
              </div>

              {mode === "login" && (
                <form onSubmit={handleLogin} className="auth-form">
                  <label>Email :</label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                  />

                  <label>Mot de passe :</label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />

                  <button type="submit" disabled={loading}>
                    {loading ? "Connexion..." : "SE CONNECTER"}
                  </button>

                  <p className="auth-bottom-text">
                    Pas encore inscrit ?{" "}
                    <button
                      type="button"
                      className="auth-link-button"
                      onClick={switchToRegister}
                    >
                      Créer un compte
                    </button>
                  </p>
                </form>
              )}

              {mode === "register" && (
                <div className="auth-form">
                  {step === 1 && (
                    <>
                      <label>Nom :</label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleFormChange}
                      />

                      <label>Prénom :</label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleFormChange}
                      />

                      <label>Adresse Email :</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                      />

                      <label>Mot de passe :</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleFormChange}
                      />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <label>Nom du restaurant :</label>
                      <input
                        type="text"
                        name="restaurantNom"
                        value={formData.restaurantNom}
                        onChange={handleFormChange}
                      />

                      <label>Logo du restaurant :</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />

                      {formData.restaurantLogo && (
                        <img
                          src={URL.createObjectURL(formData.restaurantLogo)}
                          alt="Aperçu du logo"
                          className="logo-preview"
                        />
                      )}

                      <label>Numéro de téléphone du restaurant :</label>
                      <input
                        type="text"
                        name="restaurantTelephone"
                        value={formData.restaurantTelephone}
                        onChange={handleFormChange}
                      />

                      <label>Nombre maximum de personnes :</label>
                      <input
                        type="number"
                        name="personnesMax"
                        value={formData.personnesMax}
                        onChange={handleFormChange}
                      />
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <label>Quelles cuisines pratique votre restaurant ?</label>

                      <div className="checkbox-grid">
                        {cuisines.map((cuisine) => (
                          <label key={cuisine} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.cuisines.includes(cuisine)}
                              onChange={() => handleCuisineChange(cuisine)}
                            />
                            {cuisine}
                          </label>
                        ))}
                      </div>
                    </>
                  )}

                  {step === 4 && (
                    <div className="service-hours-block">
                      <p className="service-title">Entrez les horaires du midi</p>

                      <label className="never-open-row">
                        <input
                          type="checkbox"
                          checked={midiNeverOpen}
                          onChange={(e) =>
                            handleMidiNeverOpen(e.target.checked)
                          }
                        />
                        Je n'ouvre jamais le midi
                      </label>

                      {!midiNeverOpen && (
                        <>
                          <p className="service-subtitle">
                            Entrez les horaires de votre restaurant :
                          </p>

                          <div className="hours-input-row">
                            <label>
                              Ouverture :
                              <input
                                type="time"
                                value={midiTimes.ouverture}
                                onChange={(e) =>
                                  handleMidiTimeChange(
                                    "ouverture",
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <label>
                              Fermeture :
                              <input
                                type="time"
                                value={midiTimes.fermeture}
                                onChange={(e) =>
                                  handleMidiTimeChange(
                                    "fermeture",
                                    e.target.value
                                  )
                                }
                              />
                            </label>
                          </div>

                          <p className="service-subtitle">
                            Midi fermé pour les jours suivants :
                          </p>

                          <div className="closed-days-grid">
                            {jours.map((jour) => {
                              const horaire = horaires.find(
                                (item) => item.jour === jour
                              );

                              const isClosed = horaire
                                ? !horaire.ouvert_midi
                                : false;

                              return (
                                <button
                                  key={jour}
                                  type="button"
                                  className={
                                    isClosed
                                      ? "day-toggle day-toggle-closed"
                                      : "day-toggle"
                                  }
                                  onClick={() => toggleMidiClosedDay(jour)}
                                >
                                  {jour}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {step === 5 && (
                    <div className="service-hours-block">
                      <p className="service-title">Entrez les horaires du soir</p>

                      <label className="never-open-row">
                        <input
                          type="checkbox"
                          checked={soirNeverOpen}
                          onChange={(e) =>
                            handleSoirNeverOpen(e.target.checked)
                          }
                        />
                        Je n'ouvre jamais le soir
                      </label>

                      {!soirNeverOpen && (
                        <>
                          <p className="service-subtitle">
                            Entrez les horaires de votre restaurant :
                          </p>

                          <div className="hours-input-row">
                            <label>
                              Ouverture :
                              <input
                                type="time"
                                value={soirTimes.ouverture}
                                onChange={(e) =>
                                  handleSoirTimeChange(
                                    "ouverture",
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <label>
                              Fermeture :
                              <input
                                type="time"
                                value={soirTimes.fermeture}
                                onChange={(e) =>
                                  handleSoirTimeChange(
                                    "fermeture",
                                    e.target.value
                                  )
                                }
                              />
                            </label>
                          </div>

                          <p className="service-subtitle">
                            Soir fermé pour les jours suivants :
                          </p>

                          <div className="closed-days-grid">
                            {jours.map((jour) => {
                              const horaire = horaires.find(
                                (item) => item.jour === jour
                              );

                              const isClosed = horaire
                                ? !horaire.ouvert_soir
                                : false;

                              return (
                                <button
                                  key={jour}
                                  type="button"
                                  className={
                                    isClosed
                                      ? "day-toggle day-toggle-closed"
                                      : "day-toggle"
                                  }
                                  onClick={() => toggleSoirClosedDay(jour)}
                                >
                                  {jour}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {step === 6 && (
                    <>
                      <label>Numéro de rue :</label>
                      <input
                        type="text"
                        name="nmRue"
                        value={formData.nmRue}
                        onChange={handleFormChange}
                      />

                      <label>Rue :</label>
                      <input
                        type="text"
                        name="rue"
                        value={formData.rue}
                        onChange={handleFormChange}
                      />

                      <label>Code postal :</label>
                      <input
                        type="text"
                        name="codePostal"
                        value={formData.codePostal}
                        onChange={handleFormChange}
                      />

                      <label>Ville :</label>
                      <input
                        type="text"
                        name="ville"
                        value={formData.ville}
                        onChange={handleFormChange}
                      />
                    </>
                  )}

                  <div className="step-buttons">
                    {step > 1 && (
                      <button type="button" onClick={prevStep}>
                        RETOUR
                      </button>
                    )}

                    {step < 6 && (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!isStepValid()}
                        className={!isStepValid() ? "disabled-button" : ""}
                      >
                        SUIVANT
                      </button>
                    )}

                    {step === 6 && (
                      <button
                        type="button"
                        onClick={handleRegister}
                        disabled={loading || !isStepValid()}
                        className={!isStepValid() ? "disabled-button" : ""}
                      >
                        {loading ? "Inscription..." : "S'INSCRIRE"}
                      </button>
                    )}
                  </div>

                  <p className="auth-bottom-text">
                    Déjà un compte ?{" "}
                    <button
                      type="button"
                      className="auth-link-button"
                      onClick={switchToLogin}
                    >
                      Me connecter
                    </button>
                  </p>
                </div>
              )}

              {message && <p className="message">{message}</p>}
            </div>

            {mode === "register" && (
              <p className="step-indicator">ÉTAPE {step} / 6</p>
            )}
          </section>
        </main>
      }
    />

    <Route path="components/home" element={<Home />} />
  </Routes>
);
}

export default App;