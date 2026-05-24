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
  public function registerRes(
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
  public function loginRes(
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


  #[Route('/api/updateRestaurateur', methods: ['POST'])]
  public function updateRes(
    Request $request,
    RestaurateurRepository $restaurateurRepository,
    UserPasswordHasherInterface $passwordHasher,
    EntityManagerInterface $entityManager
  ) {



    $data = json_decode($request->getContent(), true);

    $nom = $data['nom'] ?? null;
    $prenom = $data['prenom'] ?? null;
    $currentEmail = $data['currentEmail'] ?? null;
    $email = $data['email'] ?? null;
    $telephone = $data['telephone'] ?? null;
    $currentPassword = $data['currentPassword'] ?? null;
    $password = $data['password'] ?? null;



    $restaurateur = $restaurateurRepository->findOneBy([
      'email' => $currentEmail
    ]);






    if (!$restaurateur) {
      return $this->json([
        'error' => 'Utilisateur inexistant'
      ], 404);
    }


    $passwordIsValid = $passwordHasher->isPasswordValid(
      $restaurateur,
      $currentPassword
    );



    if (!$passwordIsValid) {
      return $this->json([
        'error' => 'Mot de passe incorrect'
      ], 404);
    }


    if ($nom) {
      $restaurateur->setNom($nom);
    }

    if ($prenom) {
      $restaurateur->setPrenom($prenom);
    }

    if ($email) {
      $restaurateur->setEmail($email);
    }

    if ($telephone) {
      $restaurateur->setTelephone($telephone);
    }

    if ($password) {

      $hashedPassword = $passwordHasher->hashPassword(
        $restaurateur,
        $password
      );

      $restaurateur->setPassword($hashedPassword);

    }



    $entityManager->flush();




    return $this->json([
      'message' => 'Restaurateur modifié avec succès !'
    ]);

  }



  #[Route('/api/logoutRestaurateur', methods: ['POST'])]
  public function logoutRes()
  {

    return $this->json([
      'message' => 'User disconnected'
    ]);

  }

  #[Route('/api/deleteRestaurateur', methods: ['POST'])]
  public function deleteRestaurateur(
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