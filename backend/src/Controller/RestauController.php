<?php

namespace App\Controller;

use App\Entity\Horaire;
use App\Entity\Restaurant;
use App\Enum\JourEnum;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\RestaurantRepository;
use App\Repository\AvisRepository;
use App\Repository\HoraireRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

final class RestauController extends AbstractController
{

  #[Route('/api/restaurant/latest', name: 'get_latest_restaurants', methods: ['GET'])]
  public function getLatestsRestau(
    RestaurantRepository $restaurantRepository
  ) {
    $restaurants = $restaurantRepository->findBy([], ['id' => 'DESC'], 6);

    $restaurantsData = [];

    foreach ($restaurants as $restaurant) {
      $restaurantsData[] = [
        'id' => $restaurant->getId(),
        'nom' => $restaurant->getNom(),
        'logo_url' => $restaurant->getLogoUrl(),
        'telephone' => $restaurant->getTelephone(),
        'ville' => $restaurant->getVille(),
      ];
    }

    return $this->json([
      'restaurants' => $restaurantsData
    ]);
  }


  #[Route('/api/restaurant/get/{id}', name: 'get_restaurant_by_id', methods: ['GET'])]
  public function getRestaurantById(
    int $id,
    RestaurantRepository $restaurantRepository,
    AvisRepository $avisRepository,
    HoraireRepository $horaireRepository
  ) {
    $restaurant = $restaurantRepository->find($id);

    if (!$restaurant) {
      return $this->json([
        'error' => 'Restaurant introuvable'
      ], 404);
    }

    $avis = $avisRepository->findBy([
      'restaurant' => $restaurant
    ]);

    $nombreAvis = count($avis);
    $total = 0;

    foreach ($avis as $avi) {
      $total = $total + $avi->getNote();
    }

    if ($nombreAvis > 0) {
      $moyenne = $total / $nombreAvis;
    } else {
      $moyenne = 0;
    }

    $jours = [
      'Monday' => 'lundi',
      'Tuesday' => 'mardi',
      'Wednesday' => 'mercredi',
      'Thursday' => 'jeudi',
      'Friday' => 'vendredi',
      'Saturday' => 'samedi',
      'Sunday' => 'dimanche',
    ];

    $maintenant = new \DateTime();
    $jourActuel = $jours[$maintenant->format('l')];
    $heureActuelle = $maintenant->format('H:i:s');

    $estOuvert = false;

    $horaires = $horaireRepository->findBy([
      'restaurant' => $restaurant
    ]);

    foreach ($horaires as $horaire) {
      if ($horaire->getJour()->value === $jourActuel) {
        if (
          $horaire->isOuvertMidi() &&
          $horaire->getHeureOuvertureMidi() &&
          $horaire->getHeureFermetureMidi() &&
          $heureActuelle >= $horaire->getHeureOuvertureMidi()->format('H:i:s') &&
          $heureActuelle <= $horaire->getHeureFermetureMidi()->format('H:i:s')
        ) {
          $estOuvert = true;
        }

        if (
          $horaire->isOuvertSoir() &&
          $horaire->getHeureOuvertureSoir() &&
          $horaire->getHeureFermetureSoir() &&
          $heureActuelle >= $horaire->getHeureOuvertureSoir()->format('H:i:s') &&
          $heureActuelle <= $horaire->getHeureFermetureSoir()->format('H:i:s')
        ) {
          $estOuvert = true;
        }
      }
    }

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
        'type_cuisines' => array_map(function ($typeCuisine) {
          return [
            'id' => $typeCuisine->getId(),
            'nom' => $typeCuisine->getNom(),
            'logo_url' => $typeCuisine->getLogoUrl()
          ];
        }, $restaurant->getTypeCuisines()->toArray()),
        'note_moyenne' => round($moyenne, 1),
        'nombre_avis' => $nombreAvis,
        'est_ouvert' => $estOuvert
      ]
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

    $maintenant = new \DateTime();
    $jourActuel = $jours[$maintenant->format('l')];
    $heureActuelle = $maintenant->format('H:i:s');

    foreach ($restaurants as $restaurant) {
      $avis = $avisRepository->findBy([
        'restaurant' => $restaurant
      ]);

      $nombreAvis = count($avis);
      $total = 0;

      foreach ($avis as $avi) {
        $total = $total + $avi->getNote();
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

          if (
            $horaire->isOuvertMidi() &&
            $heureActuelle >= $horaire->getHeureOuvertureMidi()->format('H:i:s') &&
            $heureActuelle <= $horaire->getHeureFermetureMidi()->format('H:i:s')
          ) {
            $estOuvert = true;
          }

          if (
            $horaire->isOuvertSoir() &&
            $heureActuelle >= $horaire->getHeureOuvertureSoir()->format('H:i:s') &&
            $heureActuelle <= $horaire->getHeureFermetureSoir()->format('H:i:s')
          ) {
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
        'est_ouvert' => $estOuvert
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


