import './topbar.css';
import LogoW from '../assets/logow.png'
import { useNavigate } from 'react-router-dom';


export default function TopBar() {

    const navigate = useNavigate();


      const handleLogout = () => {

    localStorage.removeItem('restaurateur_token');

    navigate('/');

  };

  return (
    <div className="topbar">
      <img className='logo' src={LogoW} alt="" />
      <button onClick={handleLogout} className='btn'>DÉCONNEXION</button>
    </div>
  )
}
