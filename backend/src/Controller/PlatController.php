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
  #[Route('/api/plat/addPlat', methods: ['POST'])]
  public function addPlat(
    Request $request,
    EntityManagerInterface $entityManager,
    RestaurantRepository $restaurantRepository,
    CategorieRepository $categorieRepository
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
          'error' => 'Aucun restaurant trouvé'
        ], 404);
      }

      $nom = $request->request->get('nom');
      $prix = $request->request->get('prix');
      $idCategorie = $request->request->get('id_categorie');
      $imageFile = $request->files->get('image');

      if (!$nom || !$prix || !$idCategorie || !$imageFile) {
        return $this->json([
          'error' => 'Champs manquants',
          'debug' => [
            'nom' => $nom,
            'prix' => $prix,
            'id_categorie' => $idCategorie,
            'image_recue' => $imageFile ? true : false
          ]
        ], 400);
      }

      $categorie = $categorieRepository->find($idCategorie);

      if (!$categorie) {
        return $this->json([
          'error' => 'Catégorie introuvable'
        ], 404);
      }

      $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/plats';

      if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
      }

      if (!is_writable($uploadDir)) {
        return $this->json([
          'error' => 'Le dossier upload plats n’est pas accessible en écriture',
          'upload_dir' => $uploadDir
        ], 500);
      }

      $extension = $imageFile->getClientOriginalExtension();

      if (!$extension) {
        $extension = 'png';
      }

      $newFilename = uniqid('plat_', true) . '.' . $extension;

      $imageFile->move($uploadDir, $newFilename);

      $imageUrl = '/uploads/plats/' . $newFilename;

      $plat = new Plat();

      $plat->setNom($nom);
      $plat->setPrix($prix);
      $plat->setImageUrl($imageUrl);
      $plat->setCategorie($categorie);
      $plat->setRestaurant($restaurant);

      $entityManager->persist($plat);
      $entityManager->flush();

      return $this->json([
        'message' => 'Plat ajouté avec succès',
        'plat' => [
          'id' => $plat->getId(),
          'nom' => $plat->getNom(),
          'prix' => $plat->getPrix(),
          'image_url' => $plat->getImageUrl(),
          'categorie' => [
            'id' => $categorie->getId(),
            'nom' => $categorie->getNom()
          ]
        ]
      ], 201);

    } catch (\Exception $e) {
      return $this->json([
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
        'file' => $e->getFile()
      ], 500);
    }
  }

  #[Route('/api/categorie/get', methods: ['GET'])]
  public function getCategories(
    CategorieRepository $categorieRepository
  ): JsonResponse {
    $categories = $categorieRepository->findAll();

    $categoriesData = [];

    foreach ($categories as $categorie) {
      $categoriesData[] = [
        'id' => $categorie->getId(),
        'nom' => $categorie->getNom()
      ];
    }

    return $this->json([
      'categories' => $categoriesData
    ]);
  }



  #[Route('/api/plat/getPlats', methods: ['GET'])]
  public function getPlats(
    RestaurantRepository $restaurantRepository,
    EntityManagerInterface $entityManager
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
        'error' => 'Aucun restaurant trouvé'
      ], 404);
    }

    $plats = $entityManager
      ->getRepository(Plat::class)
      ->findBy([
        'restaurant' => $restaurant
      ]);

    $platsData = [];

    foreach ($plats as $plat) {
      $platsData[] = [
        'id' => $plat->getId(),
        'nom' => $plat->getNom(),
        'prix' => $plat->getPrix(),
        'image_url' => $plat->getImageUrl(),
        'categorie' => [
          'id' => $plat->getCategorie()->getId(),
          'nom' => $plat->getCategorie()->getNom()
        ]
      ];
    }

    return $this->json([
      'plats' => $platsData
    ]);
  }

  #[Route('/api/plat/editPlat', methods: ['POST'])]
  public function updatePlat(
    Request $request,
    RestaurantRepository $restaurantRepository,
    EntityManagerInterface $entityManager,
    CategorieRepository $categorieRepository
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
          'error' => 'Aucun restaurant trouvé'
        ], 404);
      }

      $id = $request->request->get('id');
      $nom = $request->request->get('nom');
      $prix = $request->request->get('prix');
      $idCategorie = $request->request->get('id_categorie');
      $imageFile = $request->files->get('image');

      if (!$id || !$nom || !$prix || !$idCategorie) {
        return $this->json([
          'error' => 'Champs manquants'
        ], 400);
      }

      $plat = $entityManager
        ->getRepository(Plat::class)
        ->find($id);

      if (!$plat) {
        return $this->json([
          'error' => 'Plat introuvable'
        ], 404);
      }

      if ($plat->getRestaurant() !== $restaurant) {
        return $this->json([
          'error' => 'Accès interdit à ce plat'
        ], 403);
      }

      $categorie = $categorieRepository->find($idCategorie);

      if (!$categorie) {
        return $this->json([
          'error' => 'Catégorie introuvable'
        ], 404);
      }

      $plat->setNom($nom);
      $plat->setPrix($prix);
      $plat->setCategorie($categorie);

      if ($imageFile) {
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/plats';

        if (!is_dir($uploadDir)) {
          mkdir($uploadDir, 0777, true);
        }

        if (!is_writable($uploadDir)) {
          return $this->json([
            'error' => 'Le dossier upload plats n’est pas accessible en écriture',
            'upload_dir' => $uploadDir
          ], 500);
        }

        $extension = $imageFile->getClientOriginalExtension();

        if (!$extension) {
          $extension = 'png';
        }

        $newFilename = uniqid('plat_', true) . '.' . $extension;

        $imageFile->move($uploadDir, $newFilename);

        $imageUrl = '/uploads/plats/' . $newFilename;

        $plat->setImageUrl($imageUrl);
      }

      $entityManager->flush();

      return $this->json([
        'message' => 'Plat modifié avec succès',
        'plat' => [
          'id' => $plat->getId(),
          'nom' => $plat->getNom(),
          'prix' => $plat->getPrix(),
          'image_url' => $plat->getImageUrl(),
          'categorie' => [
            'id' => $plat->getCategorie()->getId(),
            'nom' => $plat->getCategorie()->getNom()
          ]
        ]
      ]);

    } catch (\Exception $e) {
      return $this->json([
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
        'file' => $e->getFile()
      ], 500);
    }
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