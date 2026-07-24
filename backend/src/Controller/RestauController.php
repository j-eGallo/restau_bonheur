<?php

namespace App\Controller;

use App\Entity\Horaire;
use App\Entity\Restaurant;
use App\Enum\JourEnum;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\RestaurantRepository;
use App\Repository\AvisRepository;
use App\Repository\HoraireRepository;
use App\Repository\PhotoRepository;
use App\Repository\PlatRepository;
use App\Repository\TypeCuisineRepository;
use App\Repository\ReservationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

final class RestauController extends AbstractController
{

  #[Route('/api/restaurant/get/{id}', name: 'get_restaurant_by_id', methods: ['GET'])]
  public function getRestaurantById(
    int $id,
    RestaurantRepository $restaurantRepository,
    AvisRepository $avisRepository,
    HoraireRepository $horaireRepository,
    PhotoRepository $photoRepository,
    PlatRepository $platRepository
  ) {
    $restaurant = $restaurantRepository->find($id);

    if (!$restaurant) {
      return $this->json([
        'error' => 'Restaurant introuvable'
      ], 404);
    }

    // Avis + moyenne
    $avis = $avisRepository->findBy([
      'restaurant' => $restaurant
    ]);

    $nombreAvis = count($avis);
    $total = 0;

    foreach ($avis as $avi) {
      $total += $avi->getNote();
    }

    if ($nombreAvis > 0) {
      $moyenne = $total / $nombreAvis;
    } else {
      $moyenne = 0;
    }

    // Jour + heure actuelle en France
    $jours = [
      'Monday' => 'lundi',
      'Tuesday' => 'mardi',
      'Wednesday' => 'mercredi',
      'Thursday' => 'jeudi',
      'Friday' => 'vendredi',
      'Saturday' => 'samedi',
      'Sunday' => 'dimanche',
    ];

    $timezone = new \DateTimeZone('Europe/Paris');
    $maintenant = new \DateTime('now', $timezone);

    $jourActuel = $jours[$maintenant->format('l')];
    $heureActuelle = $maintenant->format('H:i:s');

    // Calcul ouvert / fermé
    $estOuvert = false;

    $horaires = $horaireRepository->findBy([
      'restaurant' => $restaurant
    ]);

    foreach ($horaires as $horaire) {
      if ($horaire->getJour()->value === $jourActuel) {
        $ouvertMidi =
          $horaire->isOuvertMidi() &&
          $horaire->getHeureOuvertureMidi() &&
          $horaire->getHeureFermetureMidi() &&
          $heureActuelle >= $horaire->getHeureOuvertureMidi()->format('H:i:s') &&
          $heureActuelle <= $horaire->getHeureFermetureMidi()->format('H:i:s');

        $ouvertSoir =
          $horaire->isOuvertSoir() &&
          $horaire->getHeureOuvertureSoir() &&
          $horaire->getHeureFermetureSoir() &&
          $heureActuelle >= $horaire->getHeureOuvertureSoir()->format('H:i:s') &&
          $heureActuelle <= $horaire->getHeureFermetureSoir()->format('H:i:s');

        if ($ouvertMidi || $ouvertSoir) {
          $estOuvert = true;
        }
      }
    }


    // Photos du restaurant
    $photos = $photoRepository->findBy([
      'restaurant' => $restaurant
    ]);

    $plats = $platRepository->findBy([
      'restaurant' => $restaurant
    ]);

    return $this->json([
      'restaurant' => [
        'id' => $restaurant->getId(),
        'nom' => $restaurant->getNom(),
        'logo_url' => $restaurant->getLogoUrl(),
        'telephone' => $restaurant->getTelephone(),
        'nm_rue' => $restaurant->getNmRue(),
        'rue' => $restaurant->getRue(),
        'code_postal' => $restaurant->getCodePostal(),
        'ville' => $restaurant->getVille(),
        'horaires' => array_map(function ($horaire) {
          return [
            'id' => $horaire->getId(),
            'jour' => $horaire->getJour()->value,

            'ouvert_midi' => $horaire->isOuvertMidi(),
            'heure_ouverture_midi' => $horaire->getHeureOuvertureMidi()
              ? $horaire->getHeureOuvertureMidi()->format('H:i')
              : null,
            'heure_fermeture_midi' => $horaire->getHeureFermetureMidi()
              ? $horaire->getHeureFermetureMidi()->format('H:i')
              : null,

            'ouvert_soir' => $horaire->isOuvertSoir(),
            'heure_ouverture_soir' => $horaire->getHeureOuvertureSoir()
              ? $horaire->getHeureOuvertureSoir()->format('H:i')
              : null,
            'heure_fermeture_soir' => $horaire->getHeureFermetureSoir()
              ? $horaire->getHeureFermetureSoir()->format('H:i')
              : null,
          ];
        }, $horaires),

        'type_cuisines' => array_map(function ($typeCuisine) {
          return [
            'id' => $typeCuisine->getId(),
            'nom' => $typeCuisine->getNom(),
            'logo_url' => $typeCuisine->getLogoUrl()
          ];
        }, $restaurant->getTypeCuisines()->toArray()),

        'photos' => array_map(function ($photo) {
          return [
            'id' => $photo->getId(),
            'url' => $photo->getUrl()
          ];
        }, $photos),

        'plats' => array_map(function ($plat) {
          return [
            'id' => $plat->getId(),
            'nom' => $plat->getNom(),
            'prix' => $plat->getPrix(),
            'image_url' => $plat->getImageUrl(),
            'categorie' => $plat->getCategorie() ? $plat->getCategorie()->getNom() : null,
          ];
        }, $plats),

        'note_moyenne' => round($moyenne, 1),
        'nombre_avis' => $nombreAvis,
        'est_ouvert' => $estOuvert,
      ]
    ]);
  }


  #[Route('/api/restaurant/by-type/{id}', name: 'restaurants_by_type', methods: ['GET'])]
  public function getRestaurantsByType(
    int $id,
    TypeCuisineRepository $typeCuisineRepository,
    AvisRepository $avisRepository
  ): JsonResponse {

    $typeCuisine = $typeCuisineRepository->find($id);

    if (!$typeCuisine) {
      return $this->json([
        'error' => 'Type de cuisine introuvable'
      ], 404);
    }

    $restaurantsData = [];

    foreach ($typeCuisine->getRestaurants() as $restaurant) {

      $avis = $avisRepository->findBy([
        'restaurant' => $restaurant
      ]);

      $nombreAvis = count($avis);
      $total = 0;

      foreach ($avis as $avi) {
        $total += $avi->getNote();
      }

      if ($nombreAvis > 0) {
        $moyenne = $total / $nombreAvis;
      } else {
        $moyenne = 0;
      }

      $restaurantsData[] = [
        'id' => $restaurant->getId(),
        'nom' => $restaurant->getNom(),
        'logo_url' => $restaurant->getLogoUrl(),
        'ville' => $restaurant->getVille(),
        'note_moyenne' => round($moyenne, 1),
        'nombre_avis' => $nombreAvis,
      ];
    }

    return $this->json([
      'type_cuisine' => [
        'id' => $typeCuisine->getId(),
        'nom' => $typeCuisine->getNom(),
      ],
      'restaurants' => $restaurantsData
    ], 200);
  }


  #[Route('/api/restaurant/latest', name: 'latest_restaurants', methods: ['GET'])]
  public function getLatestRestaurants(
    RestaurantRepository $restaurantRepository
  ): JsonResponse {

    $restaurants = $restaurantRepository->findBy(
      [],
      ['id' => 'DESC'],
      6
    );

    $restaurantsData = [];

    foreach ($restaurants as $restaurant) {
      $restaurantsData[] = [
        'id' => $restaurant->getId(),
        'nom' => $restaurant->getNom(),
        'logo_url' => $restaurant->getLogoUrl(),
        'telephone' => $restaurant->getTelephone(),
        'nm_rue' => $restaurant->getNmRue(),
        'rue' => $restaurant->getRue(),
        'code_postal' => $restaurant->getCodePostal(),
        'ville' => $restaurant->getVille(),
      ];
    }

    return $this->json([
      'restaurants' => $restaurantsData
    ]);
  }


  #[Route('/api/restaurant/update-places', methods: ['POST'])]
  public function updateRestaurantPlaces(
    Request $request,
    RestaurantRepository $restaurantRepository,
    EntityManagerInterface $entityManager
  ) {
    $restaurateur = $this->getUser();

    if (!$restaurateur) {
      return $this->json([
        'error' => 'Utilisateur non connecté'
      ], 401);
    }

    $restaurant = $restaurantRepository->findOneBy([
      'restaurateur' => $restaurateur
    ]);

    if (!$restaurant) {
      return $this->json([
        'error' => 'Restaurant introuvable'
      ], 404);
    }

    $data = json_decode($request->getContent(), true);

    if (!$data) {
      return $this->json([
        'error' => 'Invalid JSON'
      ], 400);
    }

    $personnesMax = $data['personnes_max'] ?? null;

    if ($personnesMax === null || !is_numeric($personnesMax)) {
      return $this->json([
        'error' => 'Nombre de places invalide'
      ], 400);
    }

    $personnesMax = (int) $personnesMax;

    if ($personnesMax < 1) {
      return $this->json([
        'error' => 'Le nombre de places doit être supérieur à 0'
      ], 400);
    }

    $restaurant->setPersonnesMax($personnesMax);

    $entityManager->flush();

    return $this->json([
      'message' => 'Nombre de places mis à jour',
      'personnes_max' => $restaurant->getPersonnesMax()
    ]);
  }


  #[Route(
    '/api/restaurant/update-horaires',
    name: 'update_restaurant_horaires',
    methods: ['POST']
  )]
  public function updateRestaurantHoraires(
    Request $request,
    RestaurantRepository $restaurantRepository,
    HoraireRepository $horaireRepository,
    ReservationRepository $reservationRepository,
    EntityManagerInterface $entityManager
  ): JsonResponse {
    try {
      /* =====================================================
         VÉRIFICATION DU RESTAURATEUR
      ===================================================== */

      $restaurateur = $this->getUser();

      if (!$restaurateur) {
        return $this->json([
          'error' => 'Utilisateur non connecté',
        ], 401);
      }

      $restaurant = $restaurantRepository->findOneBy([
        'restaurateur' => $restaurateur,
      ]);

      if (!$restaurant) {
        return $this->json([
          'error' => 'Restaurant introuvable',
        ], 404);
      }

      /* =====================================================
         RÉCUPÉRATION DU JSON
      ===================================================== */

      $data = json_decode(
        $request->getContent(),
        true
      );

      if (!is_array($data)) {
        return $this->json([
          'error' => 'Corps JSON invalide',
        ], 400);
      }

      $horairesEnvoyes =
        $data['horaires'] ?? null;

      if (
        !is_array($horairesEnvoyes) ||
        count($horairesEnvoyes) === 0
      ) {
        return $this->json([
          'error' => 'Aucun horaire envoyé',
        ], 400);
      }

      $joursValides = [
        'lundi',
        'mardi',
        'mercredi',
        'jeudi',
        'vendredi',
        'samedi',
        'dimanche',
      ];

      /* =====================================================
         FONCTION DE CONVERSION DES HEURES
      ===================================================== */

      $createTime = static function (string $heure): \DateTimeInterface {
        $heureNormalisee =
          substr($heure, 0, 5);

        $dateTime =
          \DateTime::createFromFormat(
            '!H:i',
            $heureNormalisee
          );

        if ($dateTime === false) {
          throw new \RuntimeException(
            "Heure invalide : {$heure}"
          );
        }

        return $dateTime;
      };

      $getJourValue = static function (mixed $jour): string {
        if ($jour instanceof \BackedEnum) {
          return (string) $jour->value;
        }

        return (string) $jour;
      };

      $getServiceValue = static function (mixed $service): string {
        if ($service instanceof \BackedEnum) {
          return (string) $service->value;
        }

        return (string) $service;
      };

      /* =====================================================
         VALIDATION DES HORAIRES ENVOYÉS
      ===================================================== */

      foreach ($horairesEnvoyes as $horaireData) {
        if (!is_array($horaireData)) {
          return $this->json([
            'error' => 'Format d’horaire invalide',
          ], 400);
        }

        $jour = strtolower(
          trim(
            (string) (
              $horaireData['jour'] ?? ''
            )
          )
        );

        if (
          $jour === '' ||
          !in_array(
            $jour,
            $joursValides,
            true
          )
        ) {
          return $this->json([
            'error' =>
              "Jour invalide : {$jour}",
          ], 400);
        }

        $ouvertMidi = (bool) (
          $horaireData['ouvert_midi']
          ?? false
        );

        $ouvertSoir = (bool) (
          $horaireData['ouvert_soir']
          ?? false
        );

        if ($ouvertMidi) {
          $ouvertureMidi = substr(
            (string) (
              $horaireData[
                'heure_ouverture_midi'
              ] ?? ''
            ),
            0,
            5
          );

          $fermetureMidi = substr(
            (string) (
              $horaireData[
                'heure_fermeture_midi'
              ] ?? ''
            ),
            0,
            5
          );

          if (
            $ouvertureMidi === '' ||
            $fermetureMidi === '' ||
            $ouvertureMidi >= $fermetureMidi
          ) {
            return $this->json([
              'error' =>
                "Horaires du midi invalides pour {$jour}",
            ], 400);
          }
        }

        if ($ouvertSoir) {
          $ouvertureSoir = substr(
            (string) (
              $horaireData[
                'heure_ouverture_soir'
              ] ?? ''
            ),
            0,
            5
          );

          $fermetureSoir = substr(
            (string) (
              $horaireData[
                'heure_fermeture_soir'
              ] ?? ''
            ),
            0,
            5
          );

          if (
            $ouvertureSoir === '' ||
            $fermetureSoir === '' ||
            $ouvertureSoir >= $fermetureSoir
          ) {
            return $this->json([
              'error' =>
                "Horaires du soir invalides pour {$jour}",
            ], 400);
          }
        }
      }

      /* =====================================================
         RÉCUPÉRATION DES HORAIRES EXISTANTS
      ===================================================== */

      $horairesActuels =
        $horaireRepository->findBy([
          'restaurant' => $restaurant,
        ]);

      $horairesParJour = [];

      foreach ($horairesActuels as $horaire) {
        $jourValue = $getJourValue(
          $horaire->getJour()
        );

        $horairesParJour[$jourValue] =
          $horaire;
      }

      $horairesEnvoyesParJour = [];

      foreach ($horairesEnvoyes as $horaireData) {
        $jour = strtolower(
          trim(
            (string) $horaireData['jour']
          )
        );

        $horairesEnvoyesParJour[$jour] =
          $horaireData;
      }

      /* =====================================================
         MISE À JOUR DES HORAIRES
      ===================================================== */

      foreach (
        $horairesEnvoyesParJour
        as $jour => $horaireData
      ) {
        $horaire =
          $horairesParJour[$jour]
          ?? new Horaire();

        $nouvelHoraire =
          !$horaire->getId();

        if ($nouvelHoraire) {
          $horaire->setRestaurant(
            $restaurant
          );

          $horaire->setJour(
            JourEnum::from($jour)
          );

          $entityManager->persist(
            $horaire
          );
        }

        $ouvertMidi = (bool) (
          $horaireData['ouvert_midi']
          ?? false
        );

        $ouvertSoir = (bool) (
          $horaireData['ouvert_soir']
          ?? false
        );

        $horaire->setOuvertMidi(
          $ouvertMidi
        );

        $horaire->setOuvertSoir(
          $ouvertSoir
        );

        /*
         * Les setters n'acceptent pas null.
         * On conserve les anciennes heures si le service est fermé.
         * Pour un nouvel horaire, on applique des heures par défaut.
         */

        $heureOuvertureMidi =
          $ouvertMidi
          ? $createTime(
            (string) (
              $horaireData[
                'heure_ouverture_midi'
              ] ?? '11:30'
            )
          )
          : (
            $nouvelHoraire
            ? $createTime('11:30')
            : $horaire
              ->getHeureOuvertureMidi()
          );

        $heureFermetureMidi =
          $ouvertMidi
          ? $createTime(
            (string) (
              $horaireData[
                'heure_fermeture_midi'
              ] ?? '14:00'
            )
          )
          : (
            $nouvelHoraire
            ? $createTime('14:00')
            : $horaire
              ->getHeureFermetureMidi()
          );

        $heureOuvertureSoir =
          $ouvertSoir
          ? $createTime(
            (string) (
              $horaireData[
                'heure_ouverture_soir'
              ] ?? '19:00'
            )
          )
          : (
            $nouvelHoraire
            ? $createTime('19:00')
            : $horaire
              ->getHeureOuvertureSoir()
          );

        $heureFermetureSoir =
          $ouvertSoir
          ? $createTime(
            (string) (
              $horaireData[
                'heure_fermeture_soir'
              ] ?? '22:30'
            )
          )
          : (
            $nouvelHoraire
            ? $createTime('22:30')
            : $horaire
              ->getHeureFermetureSoir()
          );

        /*
         * Sécurité supplémentaire au cas où une ancienne ligne
         * contiendrait déjà une valeur null en base.
         */

        if (!$heureOuvertureMidi) {
          $heureOuvertureMidi =
            $createTime('11:30');
        }

        if (!$heureFermetureMidi) {
          $heureFermetureMidi =
            $createTime('14:00');
        }

        if (!$heureOuvertureSoir) {
          $heureOuvertureSoir =
            $createTime('19:00');
        }

        if (!$heureFermetureSoir) {
          $heureFermetureSoir =
            $createTime('22:30');
        }

        $horaire->setHeureOuvertureMidi(
          $heureOuvertureMidi
        );

        $horaire->setHeureFermetureMidi(
          $heureFermetureMidi
        );

        $horaire->setHeureOuvertureSoir(
          $heureOuvertureSoir
        );

        $horaire->setHeureFermetureSoir(
          $heureFermetureSoir
        );
      }

      /* =====================================================
         RÉCUPÉRATION DES RÉSERVATIONS DU RESTAURANT
      ===================================================== */

      $reservations =
        $reservationRepository->findBy([
          'restaurant' => $restaurant,
        ]);

      $joursCorrespondance = [
        1 => 'lundi',
        2 => 'mardi',
        3 => 'mercredi',
        4 => 'jeudi',
        5 => 'vendredi',
        6 => 'samedi',
        7 => 'dimanche',
      ];

      $timezone = new \DateTimeZone(
        'Europe/Paris'
      );

      $maintenant =
        new \DateTimeImmutable(
          'now',
          $timezone
        );

      $reservationsAnnulees = 0;

      /* =====================================================
         ANNULATION DES RÉSERVATIONS DEVENUES IMPOSSIBLES
      ===================================================== */

      foreach ($reservations as $reservation) {
        $dateReservation =
          $reservation->getDate();

        $heureReservation =
          $reservation->getHeure();

        if (
          !$dateReservation ||
          !$heureReservation
        ) {
          continue;
        }

        $dateValue =
          $dateReservation
            ->format('Y-m-d');

        $heureValue =
          $heureReservation
            ->format('H:i');

        $dateHeureReservation =
          \DateTimeImmutable::createFromFormat(
            'Y-m-d H:i',
            "{$dateValue} {$heureValue}",
            $timezone
          );

        if (
          $dateHeureReservation === false
        ) {
          continue;
        }

        // On ne touche pas aux réservations passées
        if (
          $dateHeureReservation <=
          $maintenant
        ) {
          continue;
        }

        $numeroJour = (int) 
          $dateHeureReservation
            ->format('N');

        $jourFrancais =
          $joursCorrespondance[
            $numeroJour
          ] ?? null;

        if (
          !$jourFrancais ||
          !isset(
          $horairesEnvoyesParJour[
            $jourFrancais
          ]
        )
        ) {
          continue;
        }

        $nouvelHoraire =
          $horairesEnvoyesParJour[
            $jourFrancais
          ];

        $serviceValue = strtolower(
          $getServiceValue(
            $reservation->getService()
          )
        );

        $doitEtreAnnulee = false;

        /*
         * Contrôle du service midi
         */

        if ($serviceValue === 'midi') {
          $midiOuvert = (bool) (
            $nouvelHoraire[
              'ouvert_midi'
            ] ?? false
          );

          if (!$midiOuvert) {
            $doitEtreAnnulee = true;
          } else {
            $ouvertureMidi = substr(
              (string) (
                $nouvelHoraire[
                  'heure_ouverture_midi'
                ] ?? ''
              ),
              0,
              5
            );

            $fermetureMidi = substr(
              (string) (
                $nouvelHoraire[
                  'heure_fermeture_midi'
                ] ?? ''
              ),
              0,
              5
            );

            if (
              $heureValue <
              $ouvertureMidi ||
              $heureValue >
              $fermetureMidi
            ) {
              $doitEtreAnnulee = true;
            }
          }
        }

        /*
         * Contrôle du service soir
         */

        if ($serviceValue === 'soir') {
          $soirOuvert = (bool) (
            $nouvelHoraire[
              'ouvert_soir'
            ] ?? false
          );

          if (!$soirOuvert) {
            $doitEtreAnnulee = true;
          } else {
            $ouvertureSoir = substr(
              (string) (
                $nouvelHoraire[
                  'heure_ouverture_soir'
                ] ?? ''
              ),
              0,
              5
            );

            $fermetureSoir = substr(
              (string) (
                $nouvelHoraire[
                  'heure_fermeture_soir'
                ] ?? ''
              ),
              0,
              5
            );

            if (
              $heureValue <
              $ouvertureSoir ||
              $heureValue >
              $fermetureSoir
            ) {
              $doitEtreAnnulee = true;
            }
          }
        }

        if ($doitEtreAnnulee) {
          $entityManager->remove(
            $reservation
          );

          $reservationsAnnulees++;
        }
      }

      /* =====================================================
         ENREGISTREMENT EN BASE DE DONNÉES
      ===================================================== */

      $entityManager->flush();

      /* =====================================================
         RÉPONSE AU FRONTEND
      ===================================================== */

      $horairesMisAJour =
        $horaireRepository->findBy(
          [
            'restaurant' =>
              $restaurant,
          ],
          [
            'id' => 'ASC',
          ]
        );

      $horairesResponse = [];

      foreach (
        $horairesMisAJour
        as $horaire
      ) {
        $horairesResponse[] = [
          'id' =>
            $horaire->getId(),

          'jour' =>
            $getJourValue(
              $horaire->getJour()
            ),

          'ouvert_midi' =>
            $horaire->isOuvertMidi(),

          'heure_ouverture_midi' =>
            $horaire
              ->getHeureOuvertureMidi()
              ->format('H:i'),

          'heure_fermeture_midi' =>
            $horaire
              ->getHeureFermetureMidi()
              ->format('H:i'),

          'ouvert_soir' =>
            $horaire->isOuvertSoir(),

          'heure_ouverture_soir' =>
            $horaire
              ->getHeureOuvertureSoir()
              ->format('H:i'),

          'heure_fermeture_soir' =>
            $horaire
              ->getHeureFermetureSoir()
              ->format('H:i'),
        ];
      }

      return $this->json([
        'message' =>
          'Horaires modifiés avec succès',

        'reservations_annulees' =>
          $reservationsAnnulees,

        'horaires' =>
          $horairesResponse,
      ]);
    } catch (\Throwable $error) {
      return $this->json([
        'error' =>
          $error->getMessage(),

        'fichier' =>
          $error->getFile(),

        'ligne' =>
          $error->getLine(),
      ], 500);
    }
  }



  #[Route('/api/restaurant/update-infos', name: 'update_restaurant_infos', methods: ['POST'])]
  public function updateRestaurantInfos(
    Request $request,
    EntityManagerInterface $entityManager,
    RestaurantRepository $restaurantRepository
  ): JsonResponse {
    $restaurateur = $this->getUser();

    if (!$restaurateur) {
      return $this->json([
        'error' => 'Utilisateur non connecté'
      ], 401);
    }

    $restaurant = $restaurantRepository->findOneBy([
      'restaurateur' => $restaurateur
    ]);

    if (!$restaurant) {
      return $this->json([
        'error' => 'Restaurant introuvable'
      ], 404);
    }

    $data = json_decode($request->getContent(), true);

    if (!$data) {
      return $this->json([
        'error' => 'JSON invalide'
      ], 400);
    }

    $nom = $data['nom'] ?? null;
    $nmRue = $data['nm_rue'] ?? null;
    $rue = $data['rue'] ?? null;
    $codePostal = $data['code_postal'] ?? null;
    $ville = $data['ville'] ?? null;
    $telephone = $data['telephone'] ?? null;

    if (!$nom || !$nmRue || !$rue || !$codePostal || !$ville || !$telephone) {
      return $this->json([
        'error' => 'Champs manquants'
      ], 400);
    }

    $restaurant->setNom($nom);
    $restaurant->setNmRue($nmRue);
    $restaurant->setRue($rue);
    $restaurant->setCodePostal($codePostal);
    $restaurant->setVille($ville);
    $restaurant->setTelephone($telephone);

    $entityManager->flush();

    return $this->json([
      'message' => 'Informations du restaurant modifiées avec succès',
      'restaurant' => [
        'nom' => $restaurant->getNom(),
        'nm_rue' => $restaurant->getNmRue(),
        'rue' => $restaurant->getRue(),
        'code_postal' => $restaurant->getCodePostal(),
        'ville' => $restaurant->getVille(),
        'telephone' => $restaurant->getTelephone(),
        'personnes_max' => $restaurant->getPersonnesMax()
      ]
    ]);
  }



  #[Route('/api/restaurant/RestauPlusPop', name: 'restau_plus_pop', methods: ['GET'])]
  public function getRestauByPop(
    RestaurantRepository $restaurantRepository,
    AvisRepository $avisRepository,
    HoraireRepository $horaireRepository
  ) {
    $restaurants = $restaurantRepository->findAll();

    $restaurantsData = [];

    $jours = [
      'Monday' => 'lundi',
      'Tuesday' => 'mardi',
      'Wednesday' => 'mercredi',
      'Thursday' => 'jeudi',
      'Friday' => 'vendredi',
      'Saturday' => 'samedi',
      'Sunday' => 'dimanche',
    ];

    $timezone = new \DateTimeZone('Europe/Paris');
    $maintenant = new \DateTime('now', $timezone);

    $jourActuel = $jours[$maintenant->format('l')];
    $heureActuelle = $maintenant->format('H:i:s');

    foreach ($restaurants as $restaurant) {
      $avis = $avisRepository->findBy([
        'restaurant' => $restaurant
      ]);

      $nombreAvis = count($avis);
      $total = 0;

      foreach ($avis as $avi) {
        $total += $avi->getNote();
      }

      if ($nombreAvis > 0) {
        $moyenne = $total / $nombreAvis;
      } else {
        $moyenne = 0;
      }

      $estOuvert = false;

      $horaires = $horaireRepository->findBy([
        'restaurant' => $restaurant
      ]);

      foreach ($horaires as $horaire) {
        if ($horaire->getJour()->value === $jourActuel) {

          $ouvertMidi =
            $horaire->isOuvertMidi() &&
            $horaire->getHeureOuvertureMidi() &&
            $horaire->getHeureFermetureMidi() &&
            $heureActuelle >= $horaire->getHeureOuvertureMidi()->format('H:i:s') &&
            $heureActuelle <= $horaire->getHeureFermetureMidi()->format('H:i:s');

          $ouvertSoir =
            $horaire->isOuvertSoir() &&
            $horaire->getHeureOuvertureSoir() &&
            $horaire->getHeureFermetureSoir() &&
            $heureActuelle >= $horaire->getHeureOuvertureSoir()->format('H:i:s') &&
            $heureActuelle <= $horaire->getHeureFermetureSoir()->format('H:i:s');

          if ($ouvertMidi || $ouvertSoir) {
            $estOuvert = true;
          }
        }
      }

      $restaurantsData[] = [
        'id' => $restaurant->getId(),
        'nom' => $restaurant->getNom(),
        'logo_url' => $restaurant->getLogoUrl(),
        'telephone' => $restaurant->getTelephone(),
        'nm_rue' => $restaurant->getNmRue(),
        'rue' => $restaurant->getRue(),
        'code_postal' => $restaurant->getCodePostal(),
        'ville' => $restaurant->getVille(),

        'type_cuisines' => array_map(function ($typeCuisine) {
          return [
            'id' => $typeCuisine->getId(),
            'nom' => $typeCuisine->getNom(),
            'logo_url' => $typeCuisine->getLogoUrl()
          ];
        }, $restaurant->getTypeCuisines()->toArray()),

        'note_moyenne' => round($moyenne, 1),
        'nombre_avis' => $nombreAvis,
        'est_ouvert' => $estOuvert,

        // DEBUG temporaire
        'heure_actuelle_debug' => $heureActuelle,
        'jour_actuel_debug' => $jourActuel,
      ];
    }

    usort($restaurantsData, function ($a, $b) {
      return $b['note_moyenne'] <=> $a['note_moyenne'];
    });

    return $this->json([
      'restaurants' => $restaurantsData
    ]);
  }
}


