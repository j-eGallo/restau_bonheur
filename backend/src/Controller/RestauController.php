<?php

namespace App\Controller;

use App\Entity\Horaire;
use App\Entity\Restaurant;
use App\Enum\JourEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

final class RestauController extends AbstractController
{
  #[Route('/api/restaurant/create', name: 'create_restaurant', methods: ['POST'])]
  public function createRestaurant(
    Request $request,
    EntityManagerInterface $entityManager
  ): JsonResponse {

    $data = json_decode($request->getContent(), true);

    $restaurateur = $this->getUser();

    if (!$restaurateur) {

      return $this->json([
        'error' => 'Utilisateur non connecté'
      ], 401);
    }

    try {

      $restaurant = new Restaurant();

      $restaurant->setNom($data['nom']);
      $restaurant->setNmRue($data['nm_rue']);
      $restaurant->setRue($data['rue']);
      $restaurant->setCodePostal($data['code_postal']);
      $restaurant->setVille($data['ville']);
      $restaurant->setLogoUrl($data['logo_url']);
      $restaurant->setTelephone($data['telephone']);
      $restaurant->setPersonnesMax($data['personnes_max']);

      $restaurant->setRestaurateur($restaurateur);

      $entityManager->persist($restaurant);

      foreach ($data['horaires'] as $horaireData) {

        $horaire = new Horaire();

        $horaire->setJour(
          JourEnum::from($horaireData['jour'])
        );

        $horaire->setOuvertMidi(
          $horaireData['ouvert_midi']
        );

        $horaire->setOuvertSoir(
          $horaireData['ouvert_soir']
        );

        $horaire->setRestaurant($restaurant);

        if (isset($horaireData['heure_ouverture_midi'])) {

          $horaire->setHeureOuvertureMidi(
            new \DateTime(
              $horaireData['heure_ouverture_midi']
            )
          );
        }

        if (isset($horaireData['heure_fermeture_midi'])) {

          $horaire->setHeureFermetureMidi(
            new \DateTime(
              $horaireData['heure_fermeture_midi']
            )
          );
        }

        if (isset($horaireData['heure_ouverture_soir'])) {

          $horaire->setHeureOuvertureSoir(
            new \DateTime(
              $horaireData['heure_ouverture_soir']
            )
          );
        }

        if (isset($horaireData['heure_fermeture_soir'])) {

          $horaire->setHeureFermetureSoir(
            new \DateTime(
              $horaireData['heure_fermeture_soir']
            )
          );
        }

        $entityManager->persist($horaire);
      }

      $entityManager->flush();

      return $this->json([
        'message' => 'Restaurant créé avec succès'
      ], 201);

    } catch (\Exception $e) {

      return $this->json([
        'error' => $e->getMessage()
      ], 500);
    }
  }
}