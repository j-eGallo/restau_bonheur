<?php

namespace App\Controller;

use App\Entity\Restaurateur;
use App\Repository\RestaurateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class AuthController extends AbstractController
{
  #[Route('/api/registerRestaurateur', methods: ['POST'])]
  public function register(
    Request $request,
    UserPasswordHasherInterface $passwordHasher,
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
      $prenom = $data['prenom'] ?? null;
      $email = $data['email'] ?? null;
      $telephone = $data['telephone'] ?? null;
      $password = $data['password'] ?? null;



      if (!$password || !$nom || !$prenom || !$email || !$telephone) {
        return $this->json([
          'error' => 'Champs manquants'
        ], 400);
      }

      $existingUser = $entityManager
        ->getRepository(Restaurateur::class)
        ->findOneBy([
          'email' => $email
        ]);

      if ($existingUser) {
        return $this->json([
          'error' => 'Email déjà existant !'
        ], 400);
      }

      $restaurateur = new Restaurateur();

      $restaurateur->setNom($nom);
      $restaurateur->setPrenom($prenom);
      $restaurateur->setEmail($email);
      $restaurateur->setTelephone($telephone);


      $hashedPassword = $passwordHasher->hashPassword($restaurateur, $password);

      $restaurateur->setPassword($hashedPassword);

      $entityManager->persist($restaurateur);
      $entityManager->flush();

      return $this->json([
        'message' => 'User created'
      ]);

    } catch (\Exception $e) {

      return $this->json([
        'error' => $e->getMessage()
      ], 500);

    }

  }

  #[Route('/api/loginRestaurateur', methods: ['POST'])]
  public function login(
    Request $request,
    RestaurateurRepository $restaurateurRepository,
    UserPasswordHasherInterface $passwordHasher,
    JWTTokenManagerInterface $JWTManager
  ) {

    $data = json_decode($request->getContent(), true);

    if (!$data) {
      return $this->json([
        'error' => 'Invalid JSON'
      ], 400);
    }

    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if (empty($email) || empty($password)) {
      return $this->json([
        'error' => 'Champs manquants'
      ], 400);
    }

    $user = $restaurateurRepository->findOneBy([
      'email' => $email
    ]);

    if (!$user) {
      return $this->json([
        'error' => 'Identifiants invalides'
      ], 401);
    }

    if (!$passwordHasher->isPasswordValid($user, $password)) {
      return $this->json([
        'error' => 'Identifiants invalides'
      ], 401);
    }

    $token = $JWTManager->create($user);

    return $this->json([
      'token' => $token,
      'user' => [
        'id' => $user->getId(),
        'nom' => $user->getNom(),
        'prenom' => $user->getPrenom()
      ]
    ]);

  }

  #[Route('/api/logout', methods: ['POST'])]
  public function logout()
  {

    return $this->json([
      'message' => 'User disconnected'
    ]);

  }

  #[Route('/api/deleteAccount', methods: ['POST'])]
  public function deleteAccount(
    Request $request,
    RestaurateurRepository $restaurateurRepository,
    EntityManagerInterface $entityManager,
    UserPasswordHasherInterface $passwordHasher
  ) {

    $data = json_decode($request->getContent(), true);

    if (!$data) {
      return $this->json([
        'error' => 'Invalid JSON'
      ], 400);
    }

    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if (empty($email) || empty($password)) {
      return $this->json([
        'error' => 'Champs manquants'
      ], 400);
    }

    $user = $restaurateurRepository->findOneBy([
      'email' => $email
    ]);

    if (!$user) {
      return $this->json([
        'error' => 'User does not exists'
      ], 404);
    }

    if (!$passwordHasher->isPasswordValid($user, $password)) {
      return $this->json([
        'error' => 'Identifiants invalides'
      ], 401);
    }

    $entityManager->remove($user);
    $entityManager->flush();

    return $this->json([
      'message' => 'Account deleted'
    ]);

  }
}