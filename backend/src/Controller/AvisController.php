<?php


namespace App\Controller;

use App\Entity\Avis;
use App\Entity\Client;
use App\Repository\AvisRepository;
use App\Repository\RestaurantRepository;
use App\Repository\ReservationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;



/*
  1. ROUTE api/client/avis/add :
  Attribution de l'avis du client au Restaurant après réservation
--------------------------------------------------------------
*/

class AvisController extends AbstractController
{
  #[Route('/api/client/avis/add', methods: ['POST'])]

  // Route /addAvis permettant au client de noter le restaurant
  public function addAvis(
    Request $request,
    EntityManagerInterface $entityManager,
    ReservationRepository $reservationRepository,
    AvisRepository $avisRepository
  ): JsonResponse {
    try {

      // Récupération infos client
      $client = $this->getUser();

      if (!$client) {
        return $this->json([
          'error' => 'Utilisateur non connecté'
        ], 401);
      }


      // Transformation JSON en tableau PHP
      $data = json_decode($request->getContent(), true);
      $idReservation = $data['id_reservation'] ?? null;
      $note = $data['note'] ?? null;

      // Vérifie que les champs sont bien remplis
      if (empty($idReservation) || empty($note)) {
        return $this->json([
          'error' => 'Champs vide'
        ], 400);
      }

      // Recherche d'une réservation déjà existante
      $reservation = $reservationRepository->find($idReservation);

      if (!$reservation) {
        return $this->json([
          'error' => 'Réservation introuvable'
        ], 404);
      }

      $avis = new Avis();

      // Vérifier que c'est le bon client
      if ($reservation->getClient() !== $client) {
        return $this->json([
          'error' => 'le client ne correspond pas !'
        ], 403);
      }

      // Bloquer note entre 1 et 5
      if ($note < 1 || $note > 5) {
        return $this->json([
          'error' => 'Une note ne peut être inférieure à 1 ou supérieure à 5'
        ], 400);
      }

      $dateReservation = $reservation->getDate()->format('Y-m-d');
      $heureReservation = $reservation->getHeure()->format('H:i:s');

      $dateHeureReservation = new \DateTime($dateReservation . ' ' . $heureReservation);

      $delai = clone $dateHeureReservation;
      $delai->modify('+24 hours');

      $heureActuelle = new \DateTime();


      if ($heureActuelle < $delai) {
        return $this->json([
          'error' => 'Vous devez attendre 24h avant de donner votre avis !'
        ], 403);
      }



      // Recherche avis existant
      $avisActuel = $avisRepository->findOneBy([
        'reservation' => $reservation
      ]);

      if ($avisActuel) {
        return $this->json([
          'error' => 'Avis déjà existant !'
        ], 409);
      }


      // Récupération du restaurant lié à la réservation
      $restaurant = $reservation->getRestaurant();
      $avis->setReservation($reservation);
      $avis->setRestaurant($restaurant);
      $avis->setNote($note);
      $avis->setDateAvis(new \DateTime());
      $avis->setClient($client);



      $entityManager->persist($avis);
      $entityManager->flush();

      return $this->json([
        'message' => 'Avis ajouté avec succès'
      ], 201);

    } catch (\Exception $e) {
      return $this->json([
        'error' => $e->getMessage(),
        'line' => $e->getLine()
      ], 500);
    }
  }
}