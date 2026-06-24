import "./note.css";
import { useState, useEffect } from "react";

type NoteProps = {
  idRestaurant: number;
};

export default function Note({idRestaurant}: NoteProps) {
  const [note, setNote] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
    const response = await fetch(`http://localhost:8000/api/avis/getAvis/${idRestaurant}`);
    const data = await response.json();
    setNote(data.note_moyenne);
    };
    fetchNote();
  }, [idRestaurant])

return (
  <div>
    <h1>Note : {note}</h1>
  </div>
);

}