<?php

namespace App\Controller;

use App\Entity\TypeCuisine;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class TypeCuisineController extends AbstractController
{
  #[Route('/api/type-cuisine/add', name: 'add_type_cuisine', methods: ['POST'])]
  public function addTypeCuisine(
    Request $request,
    EntityManagerInterface $entityManager
  ) {
    try {
      $data = json_decode($request->getContent(), true);

      if (!$data) {
        return $this->json([
          'error' => 'Invalid JSON'
        ], 400);
      }

      $nom = $data['nom'] ?? null;
      $logoUrl = $data['logo_url'] ?? null;

      if (!$nom) {
        return $this->json([
          'error' => 'Le nom du type de cuisine est obligatoire'
        ], 400);
      }

      $typeCuisine = new TypeCuisine();

      $typeCuisine->setNom($nom);
      $typeCuisine->setLogoUrl($logoUrl);

      $entityManager->persist($typeCuisine);
      $entityManager->flush();

      return $this->json([
        'message' => 'Type de cuisine ajouté avec succès',
        'type_cuisine' => [
          'id' => $typeCuisine->getId(),
          'nom' => $typeCuisine->getNom(),
          'logo_url' => $typeCuisine->getLogoUrl()
        ]
      ], 201);

    } catch (\Exception $e) {
      return $this->json([
        'error' => $e->getMessage()
      ], 500);
    }
  }
}