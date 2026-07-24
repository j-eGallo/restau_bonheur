import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import TopBar from "./TopBar";
import SideBar from "./SideBar";

import "./reservation.css";

const API_URL = "http://localhost:8000";

/* =========================================================
   TYPES
========================================================= */

type ReservationItem = {
  id: number;
  date: string;
  heure: string;
  service: string;
  nb_personnes: number;
  client: {
    nom: string;
    prenom: string;
    telephone: string;
  };
};

type ServiceFilter = "all" | "midi" | "soir";

type ReservationsCache = {
  [date: string]: ReservationItem[];
};

type ReservationsResponse = {
  reservations?: ReservationItem[];
  error?: string;
};

type DeleteReservationResponse = {
  message?: string;
  error?: string;
};

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */

export default function Reservation() {
  const navigate = useNavigate();

  /* =======================================================
     ÉTATS DE LA PAGE
  ======================================================= */

  const [reservations, setReservations] =
    useState<ReservationItem[]>([]);

  const [reservationsCache, setReservationsCache] =
    useState<ReservationsCache>({});

  const [selectedDate, setSelectedDate] =
    useState(getTodayDate());

  const [serviceFilter, setServiceFilter] =
    useState<ServiceFilter>("all");

  const [showCalendar, setShowCalendar] =
    useState(false);

  const [calendarMonth, setCalendarMonth] =
    useState(getMonthValue(getTodayDate()));

  const [isLoading, setIsLoading] =
    useState(false);

  const [
    showRefreshButton,
    setShowRefreshButton,
  ] = useState(false);

  const [currentDateTime, setCurrentDateTime] =
    useState(new Date());

  /* =======================================================
     RÉCUPÉRATION DU TOKEN
  ======================================================= */

  const getToken = useCallback(() => {
    const token = localStorage.getItem(
      "restaurateur_token"
    );

    if (!token) {
      navigate("/");
      return null;
    }

    return token;
  }, [navigate]);

  /* =======================================================
     RÉCUPÉRATION DES RÉSERVATIONS DEPUIS LE BACKEND
  ======================================================= */

  const fetchReservations = useCallback(
    async (
      date: string
    ): Promise<ReservationItem[] | null> => {
      const token = getToken();

      if (!token) {
        return null;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/restaurateur/reservations?date=${date}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const responseText =
          await response.text();

        let data: ReservationsResponse = {};

        try {
          data = responseText
            ? (JSON.parse(
                responseText
              ) as ReservationsResponse)
            : {};
        } catch {
          console.error(
            "Le serveur a renvoyé une réponse invalide."
          );

          return null;
        }

        if (!response.ok) {
          console.error(
            "Erreur récupération réservations :",
            data
          );

          if (response.status === 401) {
            localStorage.removeItem(
              "restaurateur_token"
            );

            localStorage.removeItem(
              "restaurateur_user"
            );

            navigate("/");
          }

          return null;
        }

        return data.reservations ?? [];
      } catch (error) {
        console.error(
          "Erreur fetch réservations :",
          error
        );

        return null;
      }
    },
    [getToken, navigate]
  );

  /* =======================================================
     CHARGEMENT D'UNE DATE AVEC CACHE
  ======================================================= */

  const loadReservationsForDate =
    useCallback(
      async (
        date: string,
        shouldDisplay: boolean
      ) => {
        const cachedReservations =
          reservationsCache[date];

        if (cachedReservations) {
          if (shouldDisplay) {
            setReservations(
              cachedReservations
            );
          }

          return;
        }

        if (shouldDisplay) {
          setIsLoading(true);
        }

        const receivedReservations =
          await fetchReservations(date);

        if (receivedReservations !== null) {
          setReservationsCache((previous) => ({
            ...previous,
            [date]: receivedReservations,
          }));

          if (shouldDisplay) {
            setReservations(
              receivedReservations
            );
          }
        }

        if (shouldDisplay) {
          setIsLoading(false);
        }
      },
      [
        fetchReservations,
        reservationsCache,
      ]
    );

  /* =======================================================
     PRÉCHARGEMENT DES DATES VOISINES
  ======================================================= */

  const prefetchAroundSelectedDate =
    useCallback(
      async (date: string) => {
        const previousDate =
          changeDateByDays(date, -1);

        const nextDate =
          changeDateByDays(date, 1);

        await Promise.all([
          loadReservationsForDate(
            previousDate,
            false
          ),
          loadReservationsForDate(
            nextDate,
            false
          ),
        ]);
      },
      [loadReservationsForDate]
    );

  /* =======================================================
     CHARGEMENT LORS DU CHANGEMENT DE DATE
  ======================================================= */

useEffect(() => {
  const timeout = window.setTimeout(() => {
    void loadReservationsForDate(
      selectedDate,
      true
    );

    void prefetchAroundSelectedDate(
      selectedDate
    );
  }, 0);

  return () => {
    window.clearTimeout(timeout);
  };

  // Les fonctions utilisent déjà la date actuelle.
  // On relance uniquement lorsque selectedDate change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedDate]);

  /* =======================================================
     MISE À JOUR DE L'HEURE ACTUELLE
  ======================================================= */

  useEffect(() => {
    const interval = window.setInterval(
      () => {
        setCurrentDateTime(new Date());
      },
      30000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* =======================================================
     DÉTECTION DES AJOUTS, MODIFICATIONS ET ANNULATIONS
  ======================================================= */

  const checkForReservationChanges =
    useCallback(async () => {
      const cachedReservations =
        reservationsCache[selectedDate];

      if (!cachedReservations) {
        return;
      }

      const serverReservations =
        await fetchReservations(
          selectedDate
        );

      if (serverReservations === null) {
        return;
      }

      const cachedVersion =
        createReservationsComparisonValue(
          cachedReservations
        );

      const serverVersion =
        createReservationsComparisonValue(
          serverReservations
        );

      if (
        cachedVersion !== serverVersion
      ) {
        setShowRefreshButton(true);
      }
    }, [
      fetchReservations,
      reservationsCache,
      selectedDate,
    ]);

  useEffect(() => {
    const interval = window.setInterval(
      () => {
        checkForReservationChanges();
      },
      5000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [checkForReservationChanges]);

  /* =======================================================
     ACTUALISATION MANUELLE
  ======================================================= */

  const handleRefreshReservations =
    async () => {
      setIsLoading(true);

      const updatedReservations =
        await fetchReservations(
          selectedDate
        );

      if (updatedReservations === null) {
        setIsLoading(false);

        alert(
          "Impossible d'actualiser les réservations."
        );

        return;
      }

      setReservations(
        updatedReservations
      );

      setReservationsCache((previous) => ({
        ...previous,
        [selectedDate]:
          updatedReservations,
      }));

      setShowRefreshButton(false);
      setIsLoading(false);
    };

  /* =======================================================
     NAVIGATION ENTRE LES DATES
  ======================================================= */

  const handlePreviousDay = () => {
    const newDate = changeDateByDays(
      selectedDate,
      -1
    );

    setShowRefreshButton(false);
    setSelectedDate(newDate);
    setCalendarMonth(
      getMonthValue(newDate)
    );
  };

  const handleNextDay = () => {
    const newDate = changeDateByDays(
      selectedDate,
      1
    );

    setShowRefreshButton(false);
    setSelectedDate(newDate);
    setCalendarMonth(
      getMonthValue(newDate)
    );
  };

  const handleSelectCalendarDate = (
    date: string
  ) => {
    setShowRefreshButton(false);
    setSelectedDate(date);
    setCalendarMonth(
      getMonthValue(date)
    );
    setShowCalendar(false);
  };

  /* =======================================================
     VÉRIFICATION DE L'ANNULATION
  ======================================================= */

  const isReservationCancelable = (
    reservation: ReservationItem
  ) => {
    const [year, month, day] =
      reservation.date
        .split("-")
        .map(Number);

    const [hours, minutes] =
      reservation.heure
        .split(":")
        .map(Number);

    const reservationDateTime =
      new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
        0
      );

    return (
      reservationDateTime >
      currentDateTime
    );
  };

  /* =======================================================
     ANNULATION D'UNE RÉSERVATION
  ======================================================= */

  const handleCancelReservation =
    async (reservationId: number) => {
      const token = getToken();

      if (!token) {
        return;
      }

      const reservationToCancel =
        reservations.find(
          (reservation) =>
            reservation.id ===
            reservationId
        );

      if (
        !reservationToCancel ||
        !isReservationCancelable(
          reservationToCancel
        )
      ) {
        alert(
          "Cette réservation est déjà passée et ne peut plus être annulée."
        );

        return;
      }

      const confirmation =
        window.confirm(
          "Voulez-vous vraiment annuler cette réservation ?"
        );

      if (!confirmation) {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/reservation/deleteReservation`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: reservationId,
            }),
          }
        );

        const responseText =
          await response.text();

        let data: DeleteReservationResponse =
          {};

        try {
          data = responseText
            ? (JSON.parse(
                responseText
              ) as DeleteReservationResponse)
            : {};
        } catch {
          alert(
            "Le serveur a renvoyé une réponse invalide."
          );

          return;
        }

        if (!response.ok) {
          alert(
            data.error ??
              "Impossible d'annuler la réservation."
          );

          return;
        }

        setReservations((previous) =>
          previous.filter(
            (reservation) =>
              reservation.id !==
              reservationId
          )
        );

        setReservationsCache(
          (previous) => ({
            ...previous,
            [selectedDate]: (
              previous[
                selectedDate
              ] ?? []
            ).filter(
              (reservation) =>
                reservation.id !==
                reservationId
            ),
          })
        );

        setShowRefreshButton(false);

        alert(
          "La réservation a bien été annulée."
        );
      } catch (error) {
        console.error(
          "Erreur annulation réservation :",
          error
        );

        alert(
          "Impossible de contacter le serveur."
        );
      }
    };

  /* =======================================================
     DONNÉES CALCULÉES POUR L'AFFICHAGE
  ======================================================= */

  const filteredReservations =
    useMemo(() => {
      return reservations.filter(
        (reservation) => {
          if (
            serviceFilter === "all"
          ) {
            return true;
          }

          return (
            reservation.service.toLowerCase() ===
            serviceFilter
          );
        }
      );
    }, [
      reservations,
      serviceFilter,
    ]);

  const datesWithReservations =
    useMemo(() => {
      return Object.keys(
        reservationsCache
      ).filter(
        (date) =>
          reservationsCache[date]
            .length > 0
      );
    }, [reservationsCache]);

  const totalPersons =
    filteredReservations.reduce(
      (total, reservation) =>
        total +
        reservation.nb_personnes,
      0
    );

  /* =======================================================
     AFFICHAGE
  ======================================================= */

  return (
    <div>
      <TopBar />

      <div className="reservation-dashboard">
        <SideBar />

        <main className="reservation-content">
          <h1 className="reservation-title">
            MES RÉSERVATIONS
          </h1>

          {/* Filtres et navigation par date */}
          <section className="reservation-toolbar">
            <select
              value={serviceFilter}
              onChange={(event) =>
                setServiceFilter(
                  event.target
                    .value as ServiceFilter
                )
              }
            >
              <option value="all">
                Midi & Soir
              </option>

              <option value="midi">
                Midi
              </option>

              <option value="soir">
                Soir
              </option>
            </select>

            <div className="reservation-date-zone">
              <button
                type="button"
                className="reservation-nav-btn"
                onClick={
                  handlePreviousDay
                }
              >
                ‹
              </button>

              <button
                type="button"
                className="reservation-date-btn"
                onClick={() =>
                  setShowCalendar(
                    (previous) =>
                      !previous
                  )
                }
              >
                {formatDateFr(
                  selectedDate
                )}
              </button>

              <button
                type="button"
                className="reservation-nav-btn"
                onClick={
                  handleNextDay
                }
              >
                ›
              </button>

              {showCalendar && (
                <div className="reservation-calendar">
                  <div className="reservation-calendar-header">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          changeMonthValue(
                            calendarMonth,
                            -1
                          )
                        )
                      }
                    >
                      ‹
                    </button>

                    <span>
                      {formatMonthLabel(
                        calendarMonth
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          changeMonthValue(
                            calendarMonth,
                            1
                          )
                        )
                      }
                    >
                      ›
                    </button>
                  </div>

                  <div className="reservation-calendar-days">
                    <span>L</span>
                    <span>M</span>
                    <span>M</span>
                    <span>J</span>
                    <span>V</span>
                    <span>S</span>
                    <span>D</span>
                  </div>

                  <div className="reservation-calendar-grid">
                    {getCalendarDays(
                      calendarMonth
                    ).map(
                      (
                        day,
                        index
                      ) => {
                        if (!day) {
                          return (
                            <div
                              key={`empty-${index}`}
                            />
                          );
                        }

                        const hasReservation =
                          datesWithReservations.includes(
                            day.date
                          );

                        const isSelected =
                          day.date ===
                          selectedDate;

                        return (
                          <button
                            key={
                              day.date
                            }
                            type="button"
                            className={
                              isSelected
                                ? "calendar-day calendar-day-selected"
                                : "calendar-day"
                            }
                            onClick={() =>
                              handleSelectCalendarDate(
                                day.date
                              )
                            }
                          >
                            <span>
                              {
                                day.dayNumber
                              }
                            </span>

                            {hasReservation && (
                              <span className="calendar-reservation-dot" />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Résumé de la date affichée */}
          <section className="reservation-summary">
            <div>
              <span>
                Réservations
              </span>

              <strong>
                {
                  filteredReservations.length
                }
              </strong>
            </div>

            <div>
              <span>
                Couverts
              </span>

              <strong>
                {totalPersons}
              </strong>
            </div>

            <div>
              <span>Date</span>

              <strong>
                {formatDateFr(
                  selectedDate
                )}
              </strong>
            </div>
          </section>

          {/* Chargement */}
          {isLoading && (
            <p className="reservation-loading">
              Chargement des
              réservations...
            </p>
          )}

          {/* Aucune réservation */}
          {!isLoading &&
            filteredReservations.length ===
              0 && (
              <section className="reservation-empty-card">
                <p>
                  Aucune réservation
                  pour cette date.
                </p>
              </section>
            )}

          {/* Liste des réservations */}
          {!isLoading &&
            filteredReservations.length >
              0 && (
              <section className="reservation-list">
                {filteredReservations.map(
                  (reservation) => {
                    const canBeCancelled =
                      isReservationCancelable(
                        reservation
                      );

                    return (
                      <article
                        className="reservation-card"
                        key={
                          reservation.id
                        }
                      >
                        <div className="reservation-card-time">
                          <strong>
                            {
                              reservation.heure
                            }
                          </strong>

                          <span>
                            {formatService(
                              reservation.service
                            )}
                          </span>
                        </div>

                        <div className="reservation-card-client">
                          <h2>
                            {
                              reservation
                                .client
                                .prenom
                            }{" "}
                            {
                              reservation
                                .client.nom
                            }
                          </h2>

                          <p>
                            {
                              reservation
                                .client
                                .telephone
                            }
                          </p>
                        </div>

                        <div className="reservation-card-count">
                          <strong>
                            {
                              reservation.nb_personnes
                            }
                          </strong>

                          <span>
                            {reservation.nb_personnes >
                            1
                              ? "personnes"
                              : "personne"}
                          </span>
                        </div>

                        {canBeCancelled && (
                          <button
                            type="button"
                            className="reservation-cancel-btn"
                            onClick={() =>
                              handleCancelReservation(
                                reservation.id
                              )
                            }
                          >
                            Annuler
                          </button>
                        )}
                      </article>
                    );
                  }
                )}
              </section>
            )}
        </main>
      </div>

      {/* Actualisation après changement client */}
      {showRefreshButton && (
        <button
          type="button"
          className="reservation-refresh-btn"
          onClick={
            handleRefreshReservations
          }
          title="Actualiser les réservations"
          aria-label="Actualiser les réservations"
        >
          ↻
        </button>
      )}
    </div>
  );
}

/* =========================================================
   FONCTIONS UTILITAIRES
========================================================= */

function createReservationsComparisonValue(
  reservations: ReservationItem[]
) {
  const sortedReservations = [
    ...reservations,
  ].sort(
    (
      firstReservation,
      secondReservation
    ) =>
      firstReservation.id -
      secondReservation.id
  );

  return JSON.stringify(
    sortedReservations
  );
}

function getTodayDate() {
  return formatDateToInputValue(
    new Date()
  );
}

function changeDateByDays(
  dateString: string,
  days: number
) {
  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  date.setDate(
    date.getDate() + days
  );

  return formatDateToInputValue(
    date
  );
}

function getMonthValue(
  dateString: string
) {
  return dateString.slice(0, 7);
}

function changeMonthValue(
  monthValue: string,
  months: number
) {
  const [year, month] =
    monthValue
      .split("-")
      .map(Number);

  const date = new Date(
    year,
    month - 1,
    1
  );

  date.setMonth(
    date.getMonth() + months
  );

  return formatDateToInputValue(
    date
  ).slice(0, 7);
}

function formatDateFr(
  dateString: string
) {
  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return date.toLocaleDateString(
    "fr-FR"
  );
}

function formatMonthLabel(
  monthValue: string
) {
  const [year, month] =
    monthValue
      .split("-")
      .map(Number);

  const date = new Date(
    year,
    month - 1,
    1
  );

  return date.toLocaleDateString(
    "fr-FR",
    {
      month: "long",
      year: "numeric",
    }
  );
}

function formatService(
  service: string
) {
  const normalizedService =
    service.toLowerCase();

  if (
    normalizedService === "midi"
  ) {
    return "Midi";
  }

  if (
    normalizedService === "soir"
  ) {
    return "Soir";
  }

  return service;
}

function getCalendarDays(
  monthValue: string
) {
  const [year, month] =
    monthValue
      .split("-")
      .map(Number);

  const firstDayOfMonth =
    new Date(
      year,
      month - 1,
      1
    );

  const daysInMonth =
    new Date(
      year,
      month,
      0
    ).getDate();

  const firstDayIndex =
    convertJsDayToMondayFirst(
      firstDayOfMonth.getDay()
    );

  const days: Array<
    | null
    | {
        date: string;
        dayNumber: number;
      }
  > = [];

  for (
    let index = 0;
    index < firstDayIndex;
    index++
  ) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    const date = new Date(
      year,
      month - 1,
      day
    );

    days.push({
      date:
        formatDateToInputValue(
          date
        ),
      dayNumber: day,
    });
  }

  return days;
}

function convertJsDayToMondayFirst(
  jsDay: number
) {
  return jsDay === 0
    ? 6
    : jsDay - 1;
}

function formatDateToInputValue(
  date: Date
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}