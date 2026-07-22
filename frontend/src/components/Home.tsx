import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import './home.css';
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import imgCalendar from "../assets/calendar.png";
import imgHome from "../assets/home.png";

type Profile = {
  restaurateur: {
    id: number;
    nom: string;
    prenom: string;
  };
  
  restaurant: {
    nom: string;
    nm_rue: number;
    rue: string;
    code_postal: string;
    ville: string;
  };
};


export default function Home() {
  const navigate = useNavigate();
const [profile, setProfile] = useState<Profile | null>(null);

      useEffect(() => {
          const token = localStorage.getItem('restaurateur_token');

        if(!token){

          navigate('/');

          return;


    }
fetch("http://localhost:8000/api/restaurateur/me", {
  method: "GET",
  headers: {
  Authorization: `Bearer ${token}`
  }
})
  .then(async (res) => {
    const text = await res.text();

    console.log("STATUS :", res.status);
    console.log("REPONSE BRUTE :", text);

    return JSON.parse(text);
  })
  .then((data) => {
    console.log("PROFILE :", data);

    if (!data.restaurateur || !data.restaurant) {
      console.log("Réponse inattendue :", data);
      return;
    }

    setProfile(data);
  });
  }, [navigate]);






return (
  <div>
    <TopBar />

    <div className="dashboard">
      <SideBar />

      <main className="home-info">
        {profile && (
          <div className="infos">
            <p>
              Bienvenue, {profile.restaurateur.prenom} {profile.restaurateur.nom} !
            </p>

            <p className="home-restaurant-name">{profile.restaurant.nom}</p>

            <p className="home-info">
              {profile.restaurant.nm_rue} {profile.restaurant.rue}
            </p>

            <p className="home-info">
              {profile.restaurant.code_postal}, {profile.restaurant.ville}
            </p>
          </div>
        )}
        <div className="card">
          <Link to="/reservations" className="carte card-link">
            <img className="logos" src={imgCalendar} alt="" />
            <h1>MES RÉSERVATIONS</h1>
          </Link>

          <Link to="/restaurant" className="carte card-link">
            <img className="logos" src={imgHome} alt="" />
            <h1>MON RESTAURANT</h1>
          </Link>
        </div>
      </main>
    </div>
  </div>
);
}