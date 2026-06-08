import { NavLink } from "react-router-dom";
import "./sidebar.css";

export default function SideBar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Accueil
        </NavLink>

        <NavLink
          to="/reservations"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Mes réservations
        </NavLink>

        <NavLink
          to="/restaurant"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Mon restaurant
        </NavLink>
                <NavLink
          to="/parametres"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Paramètres
        </NavLink>
      </nav>
    </aside>
  );
}