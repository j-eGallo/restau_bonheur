<?php

namespace App\Controller;

use App\Entity\Horaire;
use App\Entity\Restaurant;
use App\Enum\JourEnum;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\RestaurantRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

final class RestauController extends AbstractController
{
  // #[Route('/api/restaurant/create', name: 'create_restaurant', methods: ['POST'])]
  // public function createRestaurant(
  //   Request $request,
  //   EntityManagerInterface $entityManager
  // ): JsonResponse {

  //   $data = json_decode($request->getContent(), true);

  //   $restaurateur = $this->getUser();

  //   if (!$restaurateur) {

  //     return $this->json([
  //       'error' => 'Utilisateur non connecté'
  //     ], 401);
  //   }

  //   try {

  //     $restaurant = new Restaurant();

  //     $restaurant->setNom($data['nom']);
  //     $restaurant->setNmRue($data['nm_rue']);
  //     $restaurant->setRue($data['rue']);
  //     $restaurant->setCodePostal($data['code_postal']);
  //     $restaurant->setVille($data['ville']);
  //     $restaurant->setLogoUrl($data['logo_url']);
  //     $restaurant->setTelephone($data['telephone']);
  //     $restaurant->setPersonnesMax($data['personnes_max']);

  //     $restaurant->setRestaurateur($restaurateur);

  //     $entityManager->persist($restaurant);

  //     foreach ($data['horaires'] as $horaireData) {

  //       $horaire = new Horaire();

  //       $horaire->setJour(
  //         JourEnum::from($horaireData['jour'])
  //       );

  //       $horaire->setOuvertMidi(
  //         $horaireData['ouvert_midi']
  //       );

  //       $horaire->setOuvertSoir(
  //         $horaireData['ouvert_soir']
  //       );

  //       $horaire->setRestaurant($restaurant);

  //       if (isset($horaireData['heure_ouverture_midi'])) {

  //         $horaire->setHeureOuvertureMidi(
  //           new \DateTime(
  //             $horaireData['heure_ouverture_midi']
  //           )
  //         );
  //       }

  //       if (isset($horaireData['heure_fermeture_midi'])) {

  //         $horaire->setHeureFermetureMidi(
  //           new \DateTime(
  //             $horaireData['heure_fermeture_midi']
  //           )
  //         );
  //       }

  //       if (isset($horaireData['heure_ouverture_soir'])) {

  //         $horaire->setHeureOuvertureSoir(
  //           new \DateTime(
  //             $horaireData['heure_ouverture_soir']
  //           )
  //         );
  //       }

  //       if (isset($horaireData['heure_fermeture_soir'])) {

  //         $horaire->setHeureFermetureSoir(
  //           new \DateTime(
  //             $horaireData['heure_fermeture_soir']
  //           )
  //         );
  //       }

  //       $entityManager->persist($horaire);
  //     }

  //     $entityManager->flush();

  //     return $this->json([
  //       'message' => 'Restaurant créé avec succès'
  //     ], 201);

  //   } catch (\Exception $e) {

  //     return $this->json([
  //       'error' => $e->getMessage()
  //     ], 500);
  //   }
  // }



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
}