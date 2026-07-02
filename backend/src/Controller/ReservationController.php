<?php

namespace App\Controller;

use App\Entity\Reservation;
use App\Entity\Restaurant;
use App\Enum\ServiceEnum;
use App\Repository\ReservationRepository;
use App\Repository\RestaurantRepository;
use Doctrine\ORM\EntityManagerInterface;

use OpenApi\Attributes as OA;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

final class ReservationController extends AbstractController
{


  #[OA\Post(
    path: '/api/reservation/addReservation',
    summary: 'Créer une réservation',
    description: 'Permet à un client connecté de créer une réservation dans un restaurant.',
    tags: ['Réservations']
  )]
  #[OA\RequestBody(
    required: true,
    content: new OA\JsonContent(
      required: ['id_restaurant', 'date', 'heure', 'service', 'nb_personnes'],
      properties: [
        new OA\Property(property: 'id_restaurant', type: 'integer', example: 1),
        new OA\Property(property: 'date', type: 'string', example: '2026-07-02'),
        new OA\Property(property: 'heure', type: 'string', example: '19:30'),
        new OA\Property(property: 'service', type: 'string', example: 'soir'),
        new OA\Property(property: 'nb_personnes', type: 'integer', example: 4)
      ]
    )
  )]
  #[OA\Response(
    response: 201,
    description: 'Réservation créée avec succès'
  )]
  #[OA\Response(
    response: 400,
    description: 'JSON invalide, champs manquants ou pas assez de places disponibles'
  )]
  #[OA\Response(
    response: 401,
    description: 'Utilisateur non connecté'
  )]
  #[OA\Response(
    response: 404,
    description: 'Restaurant introuvable'
  )]
  #[OA\Response(
    response: 500,
    description: 'Erreur serveur'
  )]
  #[Route('/api/reservation/addReservation', methods: ['POST'])]
  public function addReservation(
    Request $request,
    EntityManagerInterface $entityManager,
    RestaurantRepository $restaurantRepository,
    ReservationRepository $reservationRepository
  ): JsonResponse {

    try {

      $data = json_decode($request->getContent(), true);

      if (json_last_error() !== JSON_ERROR_NONE) {

        return $this->json([
          'error' => json_last_error_msg()
        ], 400);
      }

      $id_restaurant = $data['id_restaurant'] ?? null;
      $date = $data['date'] ?? null;
      $heure = $data['heure'] ?? null;
      $service = $data['service'] ?? null;
      $nb_personnes = $data['nb_personnes'] ?? null;

      if (
        !$id_restaurant ||
        !$date ||
        !$heure ||
        !$service ||
        !$nb_personnes
      ) {

        return $this->json([
          'error' => 'Champs manquants'
        ], 400);
      }

      $client = $this->getUser();

      if (!$client) {

        return $this->json([
          'error' => 'Utilisateur non connecté'
        ], 401);
      }

      $restaurant = $restaurantRepository->find($id_restaurant);

      if (!$restaurant) {

        return $this->json([
          'error' => 'Restaurant introuvable'
        ], 404);
      }

      $serviceEnum = ServiceEnum::from($service);

      $reservations = $reservationRepository->findBy([
        'restaurant' => $restaurant,
        'date' => new \DateTime($date),
        'service' => $serviceEnum
      ]);

      $placesPrises = 0;

      foreach ($reservations as $reservation) {

        $placesPrises += $reservation->getNbPersonnes();
      }

      $placesRestantes = $restaurant->getPersonnesMax() - $placesPrises;

      if ($nb_personnes > $placesRestantes) {

        return $this->json([
          'error' => 'Pas assez de places disponibles'
        ], 400);
      }

      $reservation = new Reservation();

      $reservation->setDate(new \DateTime($date));
      $reservation->setHeure(new \DateTime($heure));
      $reservation->setService($serviceEnum);
      $reservation->setNbPersonnes($nb_personnes);

      $reservation->setClient($client);
      $reservation->setRestaurant($restaurant);

      $entityManager->persist($reservation);
      $entityManager->flush();

      return $this->json([
        'message' => 'Réservation créée avec succès'
      ], 201);

    } catch (\Exception $e) {

      return $this->json([
        'error' => $e->getMessage()
      ], 500);
    }
  }

  #[Route('/api/restaurateur/reservations', methods: ['GET'])]
  public function getRestaurantReservations(
    Request $request,
    RestaurantRepository $restaurantRepository,
    ReservationRepository $reservationRepository
  ): JsonResponse {
    try {
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
          'error' => 'Restaurant introuvable pour ce restaurateur'
        ], 404);
      }

      $date = $request->query->get('date');

      if (!$date) {
        return $this->json([
          'error' => 'Date manquante'
        ], 400);
      }

      $dateObject = new \DateTime($date);

      $reservations = $reservationRepository->findBy(
        [
          'restaurant' => $restaurant,
          'date' => $dateObject
        ],
        [
          'heure' => 'ASC'
        ]
      );

      $reservationsData = [];

      foreach ($reservations as $reservation) {
        $client = $reservation->getClient();

        $reservationsData[] = [
          'id' => $reservation->getId(),
          'date' => $reservation->getDate()->format('Y-m-d'),
          'heure' => $reservation->getHeure()->format('H:i'),
          'service' => $reservation->getService()->value,
          'nb_personnes' => $reservation->getNbPersonnes(),
          'client' => [
            'nom' => $client->getNom(),
            'prenom' => $client->getPrenom(),
            'telephone' => $client->getTelephone()
          ]
        ];
      }

      return $this->json([
        'restaurant' => [
          'id' => $restaurant->getId(),
          'nom' => $restaurant->getNom()
        ],
        'reservations' => $reservationsData
      ]);

    } catch (\Exception $e) {
      return $this->json([
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
        'file' => $e->getFile()
      ], 500);
    }
  }



  #[OA\Post(
    path: '/api/reservation/updateReservation',
    summary: 'Modifier une réservation',
    description: 'Permet à un client connecté de modifier une réservation existante.',
    tags: ['Réservations']
  )]
  #[OA\RequestBody(
    required: true,
    content: new OA\JsonContent(
      required: ['id', 'id_restaurant', 'date', 'heure', 'service', 'nb_personnes'],
      properties: [
        new OA\Property(property: 'id', type: 'integer', example: 12),
        new OA\Property(property: 'id_restaurant', type: 'integer', example: 1),
        new OA\Property(property: 'date', type: 'string', example: '2026-07-03'),
        new OA\Property(property: 'heure', type: 'string', example: '20:00'),
        new OA\Property(property: 'service', type: 'string', example: 'soir'),
        new OA\Property(property: 'nb_personnes', type: 'integer', example: 2)
      ]
    )
  )]
  #[OA\Response(
    response: 200,
    description: 'Réservation modifiée avec succès'
  )]
  #[OA\Response(
    response: 400,
    description: 'JSON invalide ou pas assez de places disponibles'
  )]
  #[OA\Response(
    response: 401,
    description: 'Utilisateur non connecté'
  )]
  #[OA\Response(
    response: 404,
    description: 'Réservation ou restaurant introuvable'
  )]
  #[OA\Response(
    response: 500,
    description: 'Erreur serveur'
  )]
  #[Route('/api/reservation/updateReservation', methods: ['POST'])]
  public function updateReservation(
    Request $request,
    EntityManagerInterface $entityManager,
    RestaurantRepository $restaurantRepository,
    ReservationRepository $reservationRepository
  ): JsonResponse {

    try {

      $data = json_decode($request->getContent(), true);

      if (json_last_error() !== JSON_ERROR_NONE) {

        return $this->json([
          'error' => json_last_error_msg()
        ], 400);
      }

      $id = $data['id'] ?? null;
      $id_restaurant = $data['id_restaurant'] ?? null;
      $date = $data['date'] ?? null;
      $heure = $data['heure'] ?? null;
      $service = $data['service'] ?? null;
      $nb_personnes = $data['nb_personnes'] ?? null;

      $reservation = $reservationRepository->find($id);

      if (!$reservation) {

        return $this->json([
          'error' => 'Réservation introuvable'
        ], 404);
      }

      $client = $this->getUser();

      if (!$client) {

        return $this->json([
          'error' => 'Utilisateur non connecté'
        ], 401);
      }

      $restaurant = $restaurantRepository->find($id_restaurant);

      if (!$restaurant) {

        return $this->json([
          'error' => 'Restaurant introuvable'
        ], 404);
      }

      $serviceEnum = ServiceEnum::from($service);

      $reservations = $reservationRepository->findBy([
        'restaurant' => $restaurant,
        'date' => new \DateTime($date),
        'service' => $serviceEnum
      ]);

      $placesPrises = 0;

      foreach ($reservations as $resa) {

        if ($resa->getId() !== $reservation->getId()) {

          $placesPrises += $resa->getNbPersonnes();
        }
      }

      $placesRestantes = $restaurant->getPersonnesMax() - $placesPrises;

      if ($nb_personnes > $placesRestantes) {

        return $this->json([
          'error' => 'Pas assez de places disponibles'
        ], 400);
      }

      if ($date) {
        $reservation->setDate(new \DateTime($date));
      }

      if ($heure) {
        $reservation->setHeure(new \DateTime($heure));
      }

      if ($service) {
        $reservation->setService($serviceEnum);
      }

      if ($nb_personnes) {
        $reservation->setNbPersonnes($nb_personnes);
      }

      $entityManager->flush();

      return $this->json([
        'message' => 'Réservation modifiée avec succès'
      ]);

    } catch (\Exception $e) {

      return $this->json([
        'error' => $e->getMessage()
      ], 500);
    }
  }




  #[OA\Post(
    path: '/api/reservation/deleteReservation',
    summary: 'Supprimer une réservation',
    description: 'Permet de supprimer une réservation existante à partir de son identifiant.',
    tags: ['Réservations']
  )]
  #[OA\RequestBody(
    required: true,
    content: new OA\JsonContent(
      required: ['id'],
      properties: [
        new OA\Property(property: 'id', type: 'integer', example: 12)
      ]
    )
  )]
  #[OA\Response(
    response: 200,
    description: 'Réservation supprimée avec succès'
  )]
  #[OA\Response(
    response: 400,
    description: 'JSON invalide ou ID manquant'
  )]
  #[OA\Response(
    response: 404,
    description: 'Réservation introuvable'
  )]
  #[OA\Response(
    response: 500,
    description: 'Erreur serveur'
  )]
  #[Route('/api/reservation/deleteReservation', methods: ['POST'])]
  public function deleteReservation(
    Request $request,
    EntityManagerInterface $entityManager,
    ReservationRepository $reservationRepository
  ): JsonResponse {

    try {

      $data = json_decode($request->getContent(), true);

      if (json_last_error() !== JSON_ERROR_NONE) {

        return $this->json([
          'error' => json_last_error_msg()
        ], 400);
      }

      $id = $data['id'] ?? null;

      if (!$id) {

        return $this->json([
          'error' => 'ID manquant'
        ], 400);
      }

      $reservation = $reservationRepository->find($id);

      if (!$reservation) {

        return $this->json([
          'error' => 'Réservation introuvable'
        ], 404);
      }

      $entityManager->remove($reservation);
      $entityManager->flush();

      return $this->json([
        'message' => 'Réservation supprimée avec succès'
      ]);

    } catch (\Exception $e) {

      return $this->json([
        'error' => $e->getMessage()
      ], 500);
    }
  }
}