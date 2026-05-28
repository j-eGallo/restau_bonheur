<?php

namespace App\Controller;

use App\Entity\Plat;
use App\Repository\RestaurantRepository;
use App\Entity\Categorie;
use App\Repository\CategorieRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

final class PlatController extends AbstractController
{
  #[Route('/api/plat/addPlat', methods: ['POST'])]
  public function addPlat(
    Request $request,
    EntityManagerInterface $entityManager,
    RestaurantRepository $restaurantRepository,
    CategorieRepository $categorieRepository

  ): JsonResponse {

    try {

      $data = json_decode($request->getContent(), true);

      if (json_last_error() !== JSON_ERROR_NONE) {

        return $this->json([
          'error' => json_last_error_msg()
        ], 400);
      }

      $nom = $data['nom'] ?? null;
      $prix = $data['prix'] ?? null;
      $image_url = $data['image_url'] ?? null;
      $id_categorie = $data['id_categorie'] ?? null;

      if (
        !$nom ||
        !$prix ||
        !$image_url ||
        !$id_categorie
      ) {

        return $this->json([
          'error' => 'Champs manquants'
        ], 400);
      }

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

      $categorie = $categorieRepository->find($id_categorie);

      if (!$categorie) {

        return $this->json([
          'error' => 'Catégorie introuvable'
        ], 404);
      }

      $plat = new Plat();

      $plat->setNom($nom);
      $plat->setPrix($prix);
      $plat->setImageUrl($image_url);
      $plat->setCategorie($categorie);
      $plat->setRestaurant($restaurant);

      $entityManager->persist($plat);
      $entityManager->flush();

      return $this->json([
        'message' => 'Plat ajouté avec succès'
      ], 201);

    } catch (\Exception $e) {

      return $this->json([
        'error' => $e->getMessage()
      ], 500);
    }
  }



  #[Route('/api/plat/editPlat', methods: ['POST'])]
  public function updatePlat(
    Request $request,
    RestaurantRepository $restaurantRepository,
    EntityManagerInterface $entityManager,
    CategorieRepository $categorieRepository

  ) {

    $data = json_decode($request->getContent(), true);



    $id_categorie = $data['id_categorie'] ?? null;
    $categorie = $categorieRepository->find($id_categorie);


    $id = $data['id'] ?? null;

    $plat = $entityManager
      ->getRepository(Plat::class)
      ->find($id);

    if (!$plat) {

      return $this->json([
        'error' => 'Plat introuvable'
      ], 404);
    }





    $nom = $data['nom'] ?? null;
    $prix = $data['prix'] ?? null;
    $image_url = $data['image_url'] ?? null;
    $id_categorie = $data['id_categorie'] ?? null;




    $restaurateur = $this->getUser();

    if (!$restaurateur) {

      return $this->json([
        'error' => 'Utilisateur non connecté'
      ], 401);
    }

    $restaurant = $restaurantRepository->findOneBy([
      'restaurateur' => $restaurateur
    ]);




    if ($nom) {
      $plat->setNom($nom);
    }

    if ($prix) {
      $plat->setPrix($prix);
    }

    if ($image_url) {
      $plat->setImageUrl($image_url);
    }

    if ($categorie) {
      $plat->setCategorie($categorie);
    }



    if (!$restaurant) {

      return $this->json([
        'error' => 'Aucun restaurant trouvé'
      ], 404);
    }


    $entityManager->flush();

    return $this->json([
      'message' => 'plat modifié avec succès !'
    ]);

  }



  #[Route('/api/plat/deletePlat', methods: ['POST'])]
  public function deletePlat(
    Request $request,
    EntityManagerInterface $entityManager,
  ) {



    if (json_last_error() !== JSON_ERROR_NONE) {

      return $this->json([
        'error' => json_last_error_msg()
      ], 400);
    }

    $data = json_decode($request->getContent(), true);
    $id = $data['id'] ?? null;



    $plat = $entityManager
      ->getRepository(Plat::class)
      ->find($id);

    if (!$plat) {

      return $this->json([
        'error' => 'Plat introuvable'
      ], 404);
    }







    $entityManager->remove($plat);
    $entityManager->flush();

    return $this->json([
      'message' => 'Plat supprimé avec succès'
    ]);
  }

}