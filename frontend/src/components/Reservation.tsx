import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import "./reservation.css";

const API_URL = "http://localhost:8000";

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

export default function Reservation() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [reservationsCache, setReservationsCache] = useState<ReservationsCache>({});
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(getMonthValue(getTodayDate()));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReservationsForDate(selectedDate, true);
    prefetchAroundSelectedDate(selectedDate);
  }, [selectedDate]);

  function loadReservationsForDate(date: string, shouldDisplay: boolean) {
    const token = localStorage.getItem("restaurateur_token");

    if (!token) {
      navigate("/");
      return;
    }

    if (reservationsCache[date]) {
      if (shouldDisplay) {
        setReservations(reservationsCache[date]);
      }

      return;
    }

    if (shouldDisplay) {
      setIsLoading(true);
    }

    fetch(`${API_URL}/api/restaurateur/reservations?date=${date}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("Erreur récupération réservations :", data);

          if (res.status === 401) {
            localStorage.removeItem("restaurateur_token");
            localStorage.removeItem("restaurateur_user");
            navigate("/");
          }

          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        const receivedReservations = data.reservations || [];

        setReservationsCache((prev) => ({
          ...prev,
          [date]: receivedReservations,
        }));

        if (shouldDisplay) {
          setReservations(receivedReservations);
        }
      })
      .catch((error) => {
        console.error("Erreur fetch réservations :", error);
      })
      .finally(() => {
        if (shouldDisplay) {
          setIsLoading(false);
        }
      });
  }

  function prefetchAroundSelectedDate(date: string) {
    const previousDate = changeDateByDays(date, -1);
    const nextDate = changeDateByDays(date, 1);

    loadReservationsForDate(previousDate, false);
    loadReservationsForDate(nextDate, false);
  }

  const handlePreviousDay = () => {
    const newDate = changeDateByDays(selectedDate, -1);
    setSelectedDate(newDate);
    setCalendarMonth(getMonthValue(newDate));
  };

  const handleNextDay = () => {
    const newDate = changeDateByDays(selectedDate, 1);
    setSelectedDate(newDate);
    setCalendarMonth(getMonthValue(newDate));
  };

  const handleSelectCalendarDate = (date: string) => {
    setSelectedDate(date);
    setCalendarMonth(getMonthValue(date));
    setShowCalendar(false);
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      if (serviceFilter === "all") {
        return true;
      }

      return reservation.service.toLowerCase() === serviceFilter;
    });
  }, [reservations, serviceFilter]);

  const datesWithReservations = useMemo(() => {
    return Object.keys(reservationsCache).filter(
      (date) => reservationsCache[date].length > 0
    );
  }, [reservationsCache]);

  const totalPersons = filteredReservations.reduce(
    (total, reservation) => total + reservation.nb_personnes,
    0
  );

  return (
    <div>
      <TopBar />

      <div className="reservation-dashboard">
        <SideBar />

        <main className="reservation-content">
          <h1 className="reservation-title">MES RÉSERVATIONS</h1>

          <section className="reservation-toolbar">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as ServiceFilter)}
            >
              <option value="all">Midi & Soir</option>
              <option value="midi">Midi</option>
              <option value="soir">Soir</option>
            </select>

            <div className="reservation-date-zone">
              <button
                type="button"
                className="reservation-nav-btn"
                onClick={handlePreviousDay}
              >
                ‹
              </button>

              <button
                type="button"
                className="reservation-date-btn"
                onClick={() => setShowCalendar((prev) => !prev)}
              >
                {formatDateFr(selectedDate)}
              </button>

              <button
                type="button"
                className="reservation-nav-btn"
                onClick={handleNextDay}
              >
                ›
              </button>

              {showCalendar && (
                <div className="reservation-calendar">
                  <div className="reservation-calendar-header">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(changeMonthValue(calendarMonth, -1))
                      }
                    >
                      ‹
                    </button>

                    <span>{formatMonthLabel(calendarMonth)}</span>

                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(changeMonthValue(calendarMonth, 1))
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
                    {getCalendarDays(calendarMonth).map((day) => {
                      if (!day) {
                        return <div key={crypto.randomUUID()} />;
                      }

                      const hasReservation = datesWithReservations.includes(day.date);
                      const isSelected = day.date === selectedDate;

                      return (
                        <button
                          key={day.date}
                          type="button"
                          className={
                            isSelected
                              ? "calendar-day calendar-day-selected"
                              : "calendar-day"
                          }
                          onClick={() => handleSelectCalendarDate(day.date)}
                        >
                          <span>{day.dayNumber}</span>

                          {hasReservation && (
                            <span className="calendar-reservation-dot" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="reservation-summary">
            <div>
              <span>Réservations</span>
              <strong>{filteredReservations.length}</strong>
            </div>

            <div>
              <span>Couverts</span>
              <strong>{totalPersons}</strong>
            </div>

            <div>
              <span>Date</span>
              <strong>{formatDateFr(selectedDate)}</strong>
            </div>
          </section>

          {isLoading && (
            <p className="reservation-loading">Chargement des réservations...</p>
          )}

          {!isLoading && filteredReservations.length === 0 && (
            <section className="reservation-empty-card">
              <p>Aucune réservation pour cette date.</p>
            </section>
          )}

          {!isLoading && filteredReservations.length > 0 && (
            <section className="reservation-list">
              {filteredReservations.map((reservation) => (
                <article className="reservation-card" key={reservation.id}>
                  <div className="reservation-card-time">
                    <strong>{reservation.heure}</strong>
                    <span>{formatService(reservation.service)}</span>
                  </div>

                  <div className="reservation-card-client">
                    <h2>
                      {reservation.client.prenom} {reservation.client.nom}
                    </h2>

                    <p>{reservation.client.telephone}</p>
                  </div>

                  <div className="reservation-card-count">
                    <strong>{reservation.nb_personnes}</strong>
                    <span>
                      {reservation.nb_personnes > 1 ? "personnes" : "personne"}
                    </span>
                  </div>
                </article>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function getTodayDate() {
  const today = new Date();

  return today.toISOString().slice(0, 10);
}

function changeDateByDays(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

function getMonthValue(dateString: string) {
  return dateString.slice(0, 7);
}

function changeMonthValue(monthValue: string, months: number) {
  const date = new Date(`${monthValue}-01`);
  date.setMonth(date.getMonth() + months);

  return date.toISOString().slice(0, 7);
}

function formatDateFr(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("fr-FR");
}

function formatMonthLabel(monthValue: string) {
  const date = new Date(`${monthValue}-01`);

  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function formatService(service: string) {
  const normalizedService = service.toLowerCase();

  if (normalizedService === "midi") {
    return "Midi";
  }

  if (normalizedService === "soir") {
    return "Soir";
  }

  return service;
}

function getCalendarDays(monthValue: string) {
  const firstDayOfMonth = new Date(`${monthValue}-01`);
  const year = firstDayOfMonth.getFullYear();
  const month = firstDayOfMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = convertJsDayToMondayFirst(firstDayOfMonth.getDay());

  const days: Array<null | { date: string; dayNumber: number }> = [];

  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().slice(0, 10);

    days.push({
      date: dateString,
      dayNumber: day,
    });
  }

  return days;
}

function convertJsDayToMondayFirst(jsDay: number) {
  if (jsDay === 0) {
    return 6;
  }

  return jsDay - 1;
}