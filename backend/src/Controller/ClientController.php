<?php

namespace App\Controller;

use App\Entity\Client;
use App\Repository\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

final class ClientController extends AbstractController
{

  #[Route('/api/registerClient', methods: ['POST'])]
  public function registerClient(
    Request $request,
    UserPasswordHasherInterface $passwordHasher,
    EntityManagerInterface $entityManager
  ) {

    try {

      $data = json_decode($request->getContent(), true);

      if (json_last_error() !== JSON_ERROR_NONE) {

        return $this->json([
          'error' => json_last_error_msg()
        ], 400);
      }

      $nom = $data['nom'] ?? null;
      $prenom = $data['prenom'] ?? null;
      $email = $data['email'] ?? null;
      $telephone = $data['telephone'] ?? null;
      $password = $data['password'] ?? null;

      if (
        !$nom ||
        !$prenom ||
        !$email ||
        !$telephone ||
        !$password
      ) {

        return $this->json([
          'error' => 'Champs manquants'
        ], 400);
      }

      $existingClient = $entityManager
        ->getRepository(Client::class)
        ->findOneBy([
          'email' => $email
        ]);

      if ($existingClient) {

        return $this->json([
          'error' => 'Email déjà utilisé'
        ], 400);
      }

      $client = new Client();

      $client->setNom($nom);
      $client->setPrenom($prenom);
      $client->setEmail($email);
      $client->setTelephone($telephone);

      $hashedPassword = $passwordHasher
        ->hashPassword($client, $password);

      $client->setPassword($hashedPassword);

      $entityManager->persist($client);
      $entityManager->flush();

      return $this->json([
        'message' => 'Client créé avec succès'
      ], 201);

    } catch (\Exception $e) {

      return $this->json([
        'error' => $e->getMessage()
      ], 500);
    }
  }


  #[Route('/api/updateClient', methods: ['POST'])]
  public function updateClient(
    Request $request,
    ClientRepository $clientRepository,
    UserPasswordHasherInterface $passwordHasher,
    EntityManagerInterface $entityManager
  ) {

    $data = json_decode($request->getContent(), true);

    if (json_last_error() !== JSON_ERROR_NONE) {

      return $this->json([
        'error' => json_last_error_msg()
      ], 400);
    }

    $currentEmail = $data['currentEmail'] ?? null;
    $currentPassword = $data['currentPassword'] ?? null;

    $nom = $data['nom'] ?? null;
    $prenom = $data['prenom'] ?? null;
    $email = $data['email'] ?? null;
    $telephone = $data['telephone'] ?? null;
    $password = $data['password'] ?? null;

    $client = $clientRepository->findOneBy([
      'email' => $currentEmail
    ]);

    if (!$client) {

      return $this->json([
        'error' => 'Client introuvable'
      ], 404);
    }

    $passwordIsValid = $passwordHasher->isPasswordValid(
      $client,
      $currentPassword
    );

    if (!$passwordIsValid) {

      return $this->json([
        'error' => 'Mot de passe incorrect'
      ], 401);
    }

    if ($nom) {
      $client->setNom($nom);
    }

    if ($prenom) {
      $client->setPrenom($prenom);
    }

    if ($email) {
      $client->setEmail($email);
    }

    if ($telephone) {
      $client->setTelephone($telephone);
    }

    if ($password) {

      $hashedPassword = $passwordHasher->hashPassword(
        $client,
        $password
      );

      $client->setPassword($hashedPassword);
    }

    $entityManager->flush();

    return $this->json([
      'message' => 'Client modifié avec succès'
    ]);
  }



  #[Route('/api/loginClient', methods: ['POST'])]
  public function loginClient(
    Request $request,
    ClientRepository $clientRepository,
    UserPasswordHasherInterface $passwordHasher,
    JWTTokenManagerInterface $JWTManager
  ) {

    $data = json_decode($request->getContent(), true);

    if (json_last_error() !== JSON_ERROR_NONE) {

      return $this->json([
        'error' => json_last_error_msg()
      ], 400);
    }

    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if (!$email || !$password) {

      return $this->json([
        'error' => 'Champs manquants'
      ], 400);
    }

    $client = $clientRepository->findOneBy([
      'email' => $email
    ]);

    if (!$client) {

      return $this->json([
        'error' => 'Identifiants invalides'
      ], 401);
    }

    if (
      !$passwordHasher->isPasswordValid(
        $client,
        $password
      )
    ) {

      return $this->json([
        'error' => 'Identifiants invalides'
      ], 401);
    }

    $token = $JWTManager->create($client);

    return $this->json([
      'token' => $token,
      'client' => [
        'id' => $client->getId(),
        'nom' => $client->getNom(),
        'prenom' => $client->getPrenom()
      ]
    ]);
  }



  #[Route('/api/deleteClient', methods: ['POST'])]
  public function deleteClient(
    Request $request,
    ClientRepository $clientRepository,
    EntityManagerInterface $entityManager,
    UserPasswordHasherInterface $passwordHasher
  ) {

    $data = json_decode($request->getContent(), true);

    if (json_last_error() !== JSON_ERROR_NONE) {

      return $this->json([
        'error' => json_last_error_msg()
      ], 400);
    }

    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if (!$email || !$password) {

      return $this->json([
        'error' => 'Champs manquants'
      ], 400);
    }

    $client = $clientRepository->findOneBy([
      'email' => $email
    ]);

    if (!$client) {

      return $this->json([
        'error' => 'Client introuvable'
      ], 404);
    }

    if (
      !$passwordHasher->isPasswordValid(
        $client,
        $password
      )
    ) {

      return $this->json([
        'error' => 'Identifiants invalides'
      ], 401);
    }

    $entityManager->remove($client);
    $entityManager->flush();

    return $this->json([
      'message' => 'Client supprimé avec succès'
    ]);
  }
}