import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import Menu from "../assets/food.png";
import Photo from "../assets/photo.png"
import "./monRestaurant.css";

type Profile = {
  restaurateur: {
    id: number;
    nom: string;
    prenom: string;
  };
  restaurant: {
    nom: string;
    nm_rue: string;
    rue: string;
    code_postal: string;
    ville: string;
    personnes_max: number;
  };
};
export default function MonRestaurant() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);


  const [showPlacesBox, setShowPlacesBox] = useState(false);
  const [places, setPlaces] = useState<number>(0);

useEffect(() => {
  const token = localStorage.getItem("restaurateur_token");

  if (!token) {
    navigate("/");
    return;
  }

  fetch("http://localhost:8000/api/restaurateur/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        console.log("Erreur API :", data);

        if (res.status === 401) {
          localStorage.removeItem("restaurateur_token");
          navigate("/");
        }

        return null;
      }

      return data;
    })
    .then((data) => {
      if (!data) return;

      setProfile(data);
      setPlaces(data.restaurant.personnes_max);
    })
    .catch((error) => {
      console.error("Erreur fetch restaurant :", error);
    });
}, [navigate]);


  const handleSavePlaces = () => {
  const token = localStorage.getItem("restaurateur_token");

  if (!token) {
    navigate("/");
    return;
  }

  fetch("http://localhost:8000/api/restaurant/update-places", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    },
    body: JSON.stringify({
      personnes_max: places
    })
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        console.log("Erreur API :", data);
        return null;
      }

      return data;
    })
    .then((data) => {
      if (!data) return;

      setProfile((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          restaurant: {
            ...prev.restaurant,
            personnes_max: data.personnes_max
          }
        };
      });

      setShowPlacesBox(false);
    })
    .catch((error) => {
      console.error("Erreur sauvegarde places :", error);
    });
};
  return (
    <div>
      <TopBar />

      <div className="restaurant-dashboard">
        <SideBar />

        <main className="restaurant-content">
          <h1 className="restaurant-title">MON RESTAURANT</h1>

        <section className="restaurant-top">
          {profile && (
            <div className="restaurant-info-block">
              <p className="restaurant-welcome">
                Bienvenue, {profile.restaurateur.prenom} {profile.restaurateur.nom} !
              </p>

              <p className="home-restaurant-name">
                {profile.restaurant.nom}
              </p>

              <p className="home-info">
                {profile.restaurant.nm_rue} {profile.restaurant.rue}
              </p>

              <p className="home-info">
                {profile.restaurant.code_postal}, {profile.restaurant.ville}
              </p>
            </div>
          )}

          <div className="restaurant-note">
            <h2>Note restaurant</h2>
          </div>
        </section>

<section className="restaurant-places">
  <div
    className="restaurant-small-box"
    onClick={() => setShowPlacesBox(true)}
  >
    Places disponibles
  </div>
</section>

{showPlacesBox && (
  <div className="modal-overlay" onClick={() => setShowPlacesBox(false)}>
    <div className="places-modal" onClick={(e) => e.stopPropagation()}>
      <h2>Nombre de places disponibles</h2>

      <div className="places-counter">
        <button
          type="button"
          onClick={() => setPlaces((prev) => Math.max(1, prev - 1))}
        >
          -
        </button>

        <span>{places}</span>

        <button
          type="button"
          onClick={() => setPlaces((prev) => prev + 1)}
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

          <section className="restaurant-cards">
            <div className="restaurant-card">
              <div className="restaurant-card-icon"><img className="btn-photo" src={Photo} alt="" /></div>
              <h2>Mes photos</h2>
            </div>

            <div className="restaurant-card">
              <div className="restaurant-card-icon"><img className="btn-photo" src={Menu} alt="" /></div>
              <h2>Mon menu</h2>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}