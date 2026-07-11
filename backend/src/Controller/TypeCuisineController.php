<?php

namespace App\Controller;

use App\Repository\TypeCuisineRepository;
use App\Repository\RestaurantRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class TypeCuisineController extends AbstractController
{
  #[Route('/api/type-cuisine/get', name: 'get_all_type_cuisine', methods: ['GET'])]
  public function getAllTypesCuisine(
    TypeCuisineRepository $typeCuisineRepository
  ) {
    $typesCuisine = $typeCuisineRepository->findAll();

    $typesCuisineData = [];

    foreach ($typesCuisine as $typeCuisine) {
      $typesCuisineData[] = [
        'id' => $typeCuisine->getId(),
        'nom' => $typeCuisine->getNom(),
        'logo_url' => $typeCuisine->getLogoUrl()
      ];
    }

    return $this->json([
      'types_cuisine' => $typesCuisineData
    ]);
  }

  #[Route('/api/restaurant/type-cuisine/get', name: 'get_restaurant_type_cuisine', methods: ['GET'])]
  public function getRestaurantTypesCuisine(
    RestaurantRepository $restaurantRepository,
    TypeCuisineRepository $typeCuisineRepository
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

    $typesCuisineData = [];

    foreach ($restaurant->getTypeCuisines() as $typeCuisine) {
      $typesCuisineData[] = [
        'id' => $typeCuisine->getId(),
        'logo_url' => $typeCuisine->getLogoUrl(),
        'nom' => $typeCuisine->getNom()
      ];
    }

    return $this->json([
      'types_cuisine' => $typesCuisineData
    ]);
  }


  #[Route('/api/restaurant/type-cuisine/add', name: 'add_type_cuisine_to_restaurant', methods: ['POST'])]
  public function addTypeCuisineToRestaurant(
    Request $request,
    RestaurantRepository $restaurantRepository,
    TypeCuisineRepository $typeCuisineRepository,
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

    $typeCuisineId = $data['type_cuisine_id'] ?? null;

    if (!$typeCuisineId) {
      return $this->json([
        'error' => 'ID du type de cuisine manquant'
      ], 400);
    }

    $typeCuisine = $typeCuisineRepository->find($typeCuisineId);

    if (!$typeCuisine) {
      return $this->json([
        'error' => 'Type de cuisine introuvable'
      ], 404);
    }

    if (!$restaurant->getTypeCuisines()->contains($typeCuisine)) {
      $restaurant->addTypeCuisine($typeCuisine);
      $entityManager->flush();
    }

    return $this->json([
      'message' => 'Type de cuisine ajouté au restaurant',
      'type_cuisine' => [
        'id' => $typeCuisine->getId(),
        'nom' => $typeCuisine->getNom()
      ]
    ]);
  }

  #[Route('/api/restaurant/type-cuisine/remove', name: 'remove_type_cuisine_from_restaurant', methods: ['POST'])]
  public function removeTypeCuisineFromRestaurant(
    Request $request,
    RestaurantRepository $restaurantRepository,
    TypeCuisineRepository $typeCuisineRepository,
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

    $typeCuisineId = $data['type_cuisine_id'] ?? null;

    if (!$typeCuisineId) {
      return $this->json([
        'error' => 'ID du type de cuisine manquant'
      ], 400);
    }

    $typeCuisine = $typeCuisineRepository->find($typeCuisineId);

    if (!$typeCuisine) {
      return $this->json([
        'error' => 'Type de cuisine introuvable'
      ], 404);
    }

    if ($restaurant->getTypeCuisines()->contains($typeCuisine)) {
      $restaurant->removeTypeCuisine($typeCuisine);
      $entityManager->flush();
    }

    return $this->json([
      'message' => 'Type de cuisine retiré du restaurant'
    ]);
  }
}