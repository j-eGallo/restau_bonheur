<?php
namespace App\Controller;

use App\Entity\Photo;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\RestaurantRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;


class PhotoController extends AbstractController
{
  #[Route('/api/photo/addPhoto', name: 'add_photo', methods: ['POST'])]
  public function addPhoto(
    Request $request,
    EntityManagerInterface $entityManager,
    RestaurantRepository $restaurantRepository
  ): JsonResponse {
    $data = json_decode($request->getContent(), true);
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
        'error' => 'Aucun restaurant trouvé'
      ], 404);
    }


    try {
      $photo = new Photo();
      $photo->setUrl($data['url']);
      $photo->setRestaurant($restaurant);

      $entityManager->persist($photo);
      $entityManager->flush();

      return $this->json([
        'message' => 'Photo ajoutée'
      ], 201);

    } catch (\Throwable $th) {
      return $this->json([
        'error' => $th->getMessage(),
        'line' => $th->getLine()
      ], 500);
    }
  }
}