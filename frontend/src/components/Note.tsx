import { useEffect, useState } from "react";
import "./note.css";

const API_URL = import.meta.env.VITE_API_URL;

type NoteProps = {
  idRestaurant: number;
};

type NoteResponse = {
  note_moyenne?: number | string | null;
  nombre_avis?: number;
  error?: string;
};

export default function Note({
  idRestaurant,
}: NoteProps) {
  const [note, setNote] =
    useState<number | null>(null);

  const [nombreAvis, setNombreAvis] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(true);

  const [hasError, setHasError] =
    useState(false);

  /* ======================================================
     RÉCUPÉRATION DE LA NOTE DU RESTAURANT
  ====================================================== */

  useEffect(() => {
    let isMounted = true;

    const fetchNote = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const response = await fetch(
          `${API_URL}/api/avis/getAvis/${idRestaurant}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const responseText =
          await response.text();

        let data: NoteResponse = {};

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          throw new Error(
            "Réponse serveur invalide"
          );
        }

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Impossible de récupérer la note"
          );
        }

        if (!isMounted) {
          return;
        }

        const parsedNote =
          data.note_moyenne === null ||
          data.note_moyenne === undefined
            ? null
            : Number(data.note_moyenne);

        setNote(
          parsedNote !== null &&
            !Number.isNaN(parsedNote)
            ? parsedNote
            : null
        );

        setNombreAvis(
          Number(data.nombre_avis ?? 0)
        );
      } catch (error) {
        console.error(
          "Erreur récupération note :",
          error
        );

        if (isMounted) {
          setHasError(true);
          setNote(null);
          setNombreAvis(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchNote();

    return () => {
      isMounted = false;
    };
  }, [idRestaurant]);

  /* ======================================================
     AFFICHAGE
  ====================================================== */

  if (isLoading) {
    return (
      <div className="note-container">
        <p className="note-loading">
          Chargement de la note...
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="note-container">
        <p className="note-empty">
          Note indisponible
        </p>
      </div>
    );
  }

  if (note === null) {
    return (
      <div className="note-container">
        <p className="note-empty">
          Aucun avis
        </p>
      </div>
    );
  }

  return (
    <div className="note-container">
      <div className="note-value">
        <span className="note-star">
          ★
        </span>

        <strong>
          {note.toFixed(1)} / 5
        </strong>
      </div>

      <p className="note-count">
        {nombreAvis} avis
      </p>
    </div>
  );
}