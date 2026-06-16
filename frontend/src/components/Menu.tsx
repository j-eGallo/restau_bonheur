import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import "./menu.css";

const API_URL = "http://localhost:8000";

type TypeCuisine = {
  id: number;
  nom: string;
};

type Categorie = {
  id: number;
  nom: string;
};

type Plat = {
  id: number;
  nom: string;
  prix: string;
  image_url: string;
  categorie: {
    id: number;
    nom: string;
  };
};

export default function Menu() {
  const navigate = useNavigate();

  const [allTypesCuisine, setAllTypesCuisine] = useState<TypeCuisine[]>([]);
  const [restaurantTypesCuisine, setRestaurantTypesCuisine] = useState<TypeCuisine[]>([]);

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [plats, setPlats] = useState<Plat[]>([]);

  const [showTypeCuisineModal, setShowTypeCuisineModal] = useState(false);
  const [selectedTypeCuisineId, setSelectedTypeCuisineId] = useState("");

  const [showPlatModal, setShowPlatModal] = useState(false);
  const [selectedPlatImage, setSelectedPlatImage] = useState<File | null>(null);

  const [newPlat, setNewPlat] = useState({
    nom: "",
    prix: "",
    id_categorie: "",
  });

  const [showUpdatePlatModal, setShowUpdatePlatModal] = useState(false);
  const [selectedPlatToUpdate, setSelectedPlatToUpdate] = useState<Plat | null>(null);
  const [selectedUpdatePlatImage, setSelectedUpdatePlatImage] = useState<File | null>(null);

  const [updatePlatForm, setUpdatePlatForm] = useState({
    nom: "",
    prix: "",
    id_categorie: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/type-cuisine/get`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur récupération types cuisine :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;
        setAllTypesCuisine(data.types_cuisine);
      })
      .catch((error) => {
        console.error("Erreur fetch types cuisine :", error);
      });

    fetch(`${API_URL}/api/restaurant/type-cuisine/get`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur récupération types cuisine restaurant :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;
        setRestaurantTypesCuisine(data.types_cuisine);
      })
      .catch((error) => {
        console.error("Erreur fetch types cuisine restaurant :", error);
      });

    fetch(`${API_URL}/api/categorie/get`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur récupération catégories :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;
        setCategories(data.categories);
      })
      .catch((error) => {
        console.error("Erreur fetch catégories :", error);
      });

    fetch(`${API_URL}/api/plat/getPlats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur récupération plats :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;
        setPlats(data.plats);
      })
      .catch((error) => {
        console.error("Erreur fetch plats :", error);
      });
  }, [navigate]);

  const handleAddTypeCuisineToRestaurant = () => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    if (selectedTypeCuisineId === "") {
      return;
    }

    fetch(`${API_URL}/api/restaurant/type-cuisine/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        type_cuisine_id: Number(selectedTypeCuisineId),
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur ajout type cuisine au restaurant :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        setRestaurantTypesCuisine((prev) => [...prev, data.type_cuisine]);
        setSelectedTypeCuisineId("");
        setShowTypeCuisineModal(false);
      })
      .catch((error) => {
        console.error("Erreur ajout type cuisine restaurant :", error);
      });
  };

  const handleRemoveTypeCuisineFromRestaurant = (id: number) => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/restaurant/type-cuisine/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        type_cuisine_id: id,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur suppression type cuisine du restaurant :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        setRestaurantTypesCuisine((prev) =>
          prev.filter((typeCuisine) => typeCuisine.id !== id)
        );
      })
      .catch((error) => {
        console.error("Erreur suppression type cuisine restaurant :", error);
      });
  };

  const handleAddPlat = () => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    if (
      newPlat.nom.trim() === "" ||
      newPlat.prix.trim() === "" ||
      newPlat.id_categorie === "" ||
      !selectedPlatImage
    ) {
      console.log("Champs plat manquants");
      return;
    }

    const formData = new FormData();

    formData.append("nom", newPlat.nom);
    formData.append("prix", newPlat.prix);
    formData.append("id_categorie", newPlat.id_categorie);
    formData.append("image", selectedPlatImage);

    fetch(`${API_URL}/api/plat/addPlat`, {
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
          console.log("Erreur ajout plat :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        setPlats((prev) => [...prev, data.plat]);

        setNewPlat({
          nom: "",
          prix: "",
          id_categorie: "",
        });

        setSelectedPlatImage(null);
        setShowPlatModal(false);
      })
      .catch((error) => {
        console.error("Erreur ajout plat :", error);
      });
  };

  const openUpdatePlatModal = (plat: Plat) => {
    setSelectedPlatToUpdate(plat);

    setUpdatePlatForm({
      nom: plat.nom,
      prix: plat.prix,
      id_categorie: String(plat.categorie.id),
    });

    setSelectedUpdatePlatImage(null);
    setShowUpdatePlatModal(true);
  };

  const handleUpdatePlat = () => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    if (!selectedPlatToUpdate) {
      return;
    }

    if (
      updatePlatForm.nom.trim() === "" ||
      updatePlatForm.prix.trim() === "" ||
      updatePlatForm.id_categorie === ""
    ) {
      console.log("Champs update plat manquants");
      return;
    }

    const formData = new FormData();

    formData.append("id", String(selectedPlatToUpdate.id));
    formData.append("nom", updatePlatForm.nom);
    formData.append("prix", updatePlatForm.prix);
    formData.append("id_categorie", updatePlatForm.id_categorie);

    if (selectedUpdatePlatImage) {
      formData.append("image", selectedUpdatePlatImage);
    }

    fetch(`${API_URL}/api/plat/editPlat`, {
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
          console.log("Erreur update plat :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        setPlats((prev) =>
          prev.map((plat) =>
            plat.id === selectedPlatToUpdate.id ? data.plat : plat
          )
        );

        setSelectedPlatToUpdate(null);
        setSelectedUpdatePlatImage(null);
        setShowUpdatePlatModal(false);
      })
      .catch((error) => {
        console.error("Erreur update plat :", error);
      });
  };

  const handleDeletePlat = (id: number) => {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/plat/deletePlat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur suppression plat :", data);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        setPlats((prev) => prev.filter((plat) => plat.id !== id));
      })
      .catch((error) => {
        console.error("Erreur suppression plat :", error);
      });
  };

  const availableTypesCuisine = allTypesCuisine.filter(
    (typeCuisine) =>
      !restaurantTypesCuisine.some(
        (restaurantType) => restaurantType.id === typeCuisine.id
      )
  );

  return (
    <div>
      <TopBar />

      <div className="menu-dashboard">
        <SideBar />

        <main className="menu-content">
          <div className="menu-fildariane">
            <Link to="/restaurant">Mon restaurant</Link>
            <span>/</span>
            <p>Mon menu</p>
          </div>

          <section className="menu-type-cuisine-section">
            <div className="menu-section-header">
              <h2>Types de cuisine du restaurant</h2>

              <button
                type="button"
                className="add-type-cuisine-btn"
                onClick={() => setShowTypeCuisineModal(true)}
              >
                Ajouter un type de cuisine
              </button>
            </div>

            <div className="type-cuisine-list">
              {restaurantTypesCuisine.map((typeCuisine) => (
                <div className="type-cuisine-tag" key={typeCuisine.id}>
                  <span>{typeCuisine.nom}</span>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveTypeCuisineFromRestaurant(typeCuisine.id)
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="menu-actions">
            <button
              type="button"
              className="add-plat-btn"
              onClick={() => setShowPlatModal(true)}
            >
              Ajouter un plat
            </button>
          </section>

          <section className="plats-list">
            {plats.length === 0 && (
              <div className="menu-empty">
                <p>Aucun plat affiché pour le moment.</p>
              </div>
            )}

            {plats.map((plat) => (
              <div
                className="plat-card"
                key={plat.id}
                onClick={() => openUpdatePlatModal(plat)}
              >
                <img
                  src={`${API_URL}${plat.image_url}`}
                  alt={plat.nom}
                />

                <div className="plat-info">
                  <h3>{plat.nom}</h3>
                  <p>{plat.categorie.nom}</p>
                  <strong>{plat.prix} €</strong>
                </div>

                <button
                  type="button"
                  className="delete-plat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlat(plat.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </section>

          {showTypeCuisineModal && (
            <div
              className="menu-modal-overlay"
              onClick={() => setShowTypeCuisineModal(false)}
            >
              <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Ajouter un type de cuisine</h2>

                <select
                  value={selectedTypeCuisineId}
                  onChange={(e) => setSelectedTypeCuisineId(e.target.value)}
                >
                  <option value="">Choisir un type de cuisine</option>

                  {availableTypesCuisine.map((typeCuisine) => (
                    <option key={typeCuisine.id} value={typeCuisine.id}>
                      {typeCuisine.nom}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddTypeCuisineToRestaurant}
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          )}

          {showPlatModal && (
            <div
              className="menu-modal-overlay"
              onClick={() => setShowPlatModal(false)}
            >
              <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Ajouter un plat</h2>

                <input
                  type="text"
                  placeholder="Nom du plat"
                  value={newPlat.nom}
                  onChange={(e) =>
                    setNewPlat({
                      ...newPlat,
                      nom: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix"
                  value={newPlat.prix}
                  onChange={(e) =>
                    setNewPlat({
                      ...newPlat,
                      prix: e.target.value,
                    })
                  }
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    setSelectedPlatImage(file);
                  }}
                />

                <select
                  value={newPlat.id_categorie}
                  onChange={(e) =>
                    setNewPlat({
                      ...newPlat,
                      id_categorie: e.target.value,
                    })
                  }
                >
                  <option value="">Choisir une catégorie</option>

                  {categories.map((categorie) => (
                    <option key={categorie.id} value={categorie.id}>
                      {categorie.nom}
                    </option>
                  ))}
                </select>

                <button type="button" onClick={handleAddPlat}>
                  Sauvegarder
                </button>
              </div>
            </div>
          )}

          {showUpdatePlatModal && selectedPlatToUpdate && (
            <div
              className="menu-modal-overlay"
              onClick={() => setShowUpdatePlatModal(false)}
            >
              <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Modifier le plat</h2>

                <input
                  type="text"
                  placeholder="Nom du plat"
                  value={updatePlatForm.nom}
                  onChange={(e) =>
                    setUpdatePlatForm({
                      ...updatePlatForm,
                      nom: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix"
                  value={updatePlatForm.prix}
                  onChange={(e) =>
                    setUpdatePlatForm({
                      ...updatePlatForm,
                      prix: e.target.value,
                    })
                  }
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    setSelectedUpdatePlatImage(file);
                  }}
                />

                <select
                  value={updatePlatForm.id_categorie}
                  onChange={(e) =>
                    setUpdatePlatForm({
                      ...updatePlatForm,
                      id_categorie: e.target.value,
                    })
                  }
                >
                  <option value="">Choisir une catégorie</option>

                  {categories.map((categorie) => (
                    <option key={categorie.id} value={categorie.id}>
                      {categorie.nom}
                    </option>
                  ))}
                </select>

                <button type="button" onClick={handleUpdatePlat}>
                  Modifier
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}