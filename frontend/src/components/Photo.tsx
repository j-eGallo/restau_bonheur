import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import "./photo.css";


const API_URL = import.meta.env.VITE_API_URL;

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
    logoUrl: string;
  };
};

type PhotoItem = {
  id: number;
  url: string;
};

export default function Photo() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);


  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [showAddBox, setShowAddBox] = useState(false);

  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [showLogoBox, setShowLogoBox] = useState(false);

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
          console.log("Erreur profil :", data);

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
      })
      .catch((error) => {
        console.error("Erreur récupération profil :", error);
      });

    fetch(`${API_URL}/api/photo/getPhotos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur photos :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        setPhotos(data.photos);
      })
      .catch((error) => {
        console.error("Erreur récupération photos :", error);
      });
  }, [navigate]);


  const handleUpdateLogo = () => {
  const token = localStorage.getItem("restaurateur_token");

  if (!token) {
    navigate("/");
    return;
  }

  if (!selectedLogo) {
    console.log("Aucun logo sélectionné");
    return;
  }

  const formData = new FormData();
  formData.append("logo", selectedLogo);

  fetch(`${API_URL}/api/restaurant/update-logo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        console.log("Erreur modification logo :", data);
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
            logoUrl: data.logoUrl,
          },
        };
      });

      setSelectedLogo(null);
      setShowLogoBox(false);
    })
    .catch((error) => {
      console.error("Erreur modification logo :", error);
    });
};

  const handleAddPhoto = () => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    if (!selectedPhoto) {
      console.log("Aucune photo sélectionnée");
      return;
    }

    const formData = new FormData();
    formData.append("photo", selectedPhoto);

    fetch(`${API_URL}/api/photo/addPhoto`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur ajout photo :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        setPhotos((prev) => [...prev, data.photo]);
        setSelectedPhoto(null);
        setShowAddBox(false);
      })
      .catch((error) => {
        console.error("Erreur ajout photo :", error);
      });
  };

  const handleDeletePhoto = (url: string) => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/photo/deletePhoto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        url: url,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur suppression photo :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        setPhotos((prev) => prev.filter((photo) => photo.url !== url));
      })
      .catch((error) => {
        console.error("Erreur suppression photo :", error);
      });
  };

  return (
    <div>
      <TopBar />

      <div className="photo-dashboard">
        <SideBar />

        <main className="photo-content">
          <div className="photo-fildariane">
              <Link to="/restaurant">Mon restaurant</Link>
              <span>/</span>
              <p>Mes photos</p>
        </div>

          <section className="photo-logo-section">
            {profile && profile.restaurant.logoUrl && (
              <div className="photo-logo-box">
                <img
                  src={`${API_URL}${profile.restaurant.logoUrl}`}
                  alt="Logo restaurant"
                />
                  <button
                    type="button"
                    className="edit-logo-btn"
                    onClick={() => setShowLogoBox(true)}
                  >
                    ✎
                  </button>
              </div>
            )}


            {showLogoBox && (
              <div
                className="photo-modal-overlay"
                onClick={() => setShowLogoBox(false)}
              >
                <div
                  className="photo-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2>Modifier le logo</h2>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      setSelectedLogo(file);
                    }}
                  />

                  <button type="button" onClick={handleUpdateLogo}>
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}
          </section>


          <section className="photo-actions">
            <button
              type="button"
              className="add-photo-btn"
              onClick={() => setShowAddBox(true)}
            >
              Ajouter une photo
            </button>
          </section>

          {showAddBox && (
            <div
              className="photo-modal-overlay"
              onClick={() => setShowAddBox(false)}
            >
              <div
                className="photo-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <h2>Ajouter une photo</h2>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    setSelectedPhoto(file);
                  }}
                />

                <button type="button" onClick={handleAddPhoto}>
                  Sauvegarder
                </button>
              </div>
            </div>
          )}

          <section className="photos-grid">
            {photos.map((photo) => (
              <div className="photo-item" key={photo.id}>
                <img
                  src={`${API_URL}${photo.url}`}
                  alt="Photo restaurant"
                />

                <button
                  type="button"
                  className="delete-photo-btn"
                  onClick={() => handleDeletePhoto(photo.url)}
                >
                  ×
                </button>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}