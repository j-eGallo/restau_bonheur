<?php

namespace App\Controller;

use App\Entity\Restaurateur;
use App\Repository\RestaurateurRepository;
use App\Entity\Restaurant;
use App\Entity\Horaire;
use App\Enum\JourEnum;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class RestaurateurController extends AbstractController
{
  #[Route('/api/registerRestaurateur', methods: ['POST'])]
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
      $restaurantData = $data['restaurant'] ?? null;

      if (!$password || !$nom || !$prenom || !$email || !$telephone || !$restaurantData) {
        return $this->json([
          'error' => 'Champs restaurateur ou restaurant manquants'
        ], 400);
      }

      if (empty($restaurantData['horaires'])) {
        return $this->json([
          'error' => 'Les horaires sont obligatoires'
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

      // 1. Création du restaurateur
      $restaurateur = new Restaurateur();

      $restaurateur->setNom($nom);
      $restaurateur->setPrenom($prenom);
      $restaurateur->setEmail($email);
      $restaurateur->setTelephone($telephone);

      $hashedPassword = $passwordHasher->hashPassword($restaurateur, $password);
      $restaurateur->setPassword($hashedPassword);

      $entityManager->persist($restaurateur);

      // 2. Création du restaurant
      $restaurant = new Restaurant();

      $restaurant->setNom($restaurantData['nom']);
      $restaurant->setNmRue($restaurantData['nm_rue']);
      $restaurant->setRue($restaurantData['rue']);
      $restaurant->setCodePostal($restaurantData['code_postal']);
      $restaurant->setVille($restaurantData['ville']);
      $restaurant->setLogoUrl($restaurantData['logo_url']);
      $restaurant->setTelephone($restaurantData['telephone']);
      $restaurant->setPersonnesMax($restaurantData['personnes_max']);

      // Ici tu lies le restaurant au restaurateur créé juste au-dessus
      $restaurant->setRestaurateur($restaurateur);

      $entityManager->persist($restaurant);

      // 3. Création des horaires
      foreach ($restaurantData['horaires'] as $horaireData) {
        $horaire = new Horaire();

        $horaire->setJour(
          JourEnum::from($horaireData['jour'])
        );

        $horaire->setOuvertMidi($horaireData['ouvert_midi']);
        $horaire->setOuvertSoir($horaireData['ouvert_soir']);

        if (!empty($horaireData['heure_ouverture_midi'])) {
          $horaire->setHeureOuvertureMidi(
            new \DateTime($horaireData['heure_ouverture_midi'])
          );
        }

        if (!empty($horaireData['heure_fermeture_midi'])) {
          $horaire->setHeureFermetureMidi(
            new \DateTime($horaireData['heure_fermeture_midi'])
          );
        }

        if (!empty($horaireData['heure_ouverture_soir'])) {
          $horaire->setHeureOuvertureSoir(
            new \DateTime($horaireData['heure_ouverture_soir'])
          );
        }

        if (!empty($horaireData['heure_fermeture_soir'])) {
          $horaire->setHeureFermetureSoir(
            new \DateTime($horaireData['heure_fermeture_soir'])
          );
        }

        $horaire->setRestaurant($restaurant);

        $entityManager->persist($horaire);
      }

      // 4. Un seul flush final
      $entityManager->flush();

      return $this->json([
        'message' => 'Restaurateur, restaurant et horaires créés avec succès'
      ], 201);

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