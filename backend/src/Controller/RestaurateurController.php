<?php

namespace App\Controller;

use App\Entity\Restaurateur;
use App\Entity\TypeCuisine;
use App\Repository\RestaurateurRepository;
use App\Repository\RestaurantRepository;
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
  public function registerRes(
    Request $request,
    UserPasswordHasherInterface $passwordHasher,
    EntityManagerInterface $entityManager
  ) {
    $step = 'start';

    try {
      $step = 'lecture_formdata';

      $rawData = $request->request->get('data');
      $logoFile = $request->files->get('logo');

      if (!$rawData) {
        return $this->json([
          'error' => 'Aucune donnée reçue dans FormData[data]'
        ], 400);
      }

      $data = json_decode($rawData, true);

      if (!$data) {
        return $this->json([
          'error' => 'Invalid JSON',
          'raw_data' => $rawData
        ], 400);
      }

      if (!$logoFile) {
        return $this->json([
          'error' => 'Logo obligatoire'
        ], 400);
      }

      $step = 'lecture_champs';

      $nom = $data['nom'] ?? null;
      $prenom = $data['prenom'] ?? null;
      $email = $data['email'] ?? null;
      $telephone = $data['telephone'] ?? null;
      $password = $data['password'] ?? null;
      $restaurantData = $data['restaurant'] ?? null;

      if (!$nom || !$prenom || !$email || !$telephone || !$password || !$restaurantData) {
        return $this->json([
          'error' => 'Champs restaurateur ou restaurant manquants',
          'data_recue' => $data
        ], 400);
      }

      if (empty($restaurantData['horaires'])) {
        return $this->json([
          'error' => 'Les horaires sont obligatoires'
        ], 400);
      }

      $step = 'verification_email';

      $existingUser = $entityManager
        ->getRepository(Restaurateur::class)
        ->findOneBy([
          'email' => $email
        ]);

      if ($existingUser) {
        return $this->json([
          'error' => 'Email déjà existant !',
          'email' => $email,
          'existing_id' => $existingUser->getId()
        ], 400);
      }

      $step = 'upload_logo';

      $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/restaurants';

      if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
      }

      if (!is_writable($uploadDir)) {
        return $this->json([
          'error' => 'Le dossier upload n’est pas accessible en écriture',
          'upload_dir' => $uploadDir
        ], 500);
      }

      $extension = $logoFile->getClientOriginalExtension();

      if (!$extension) {
        $extension = 'png';
      }

      $newFilename = uniqid('restaurant_logo_', true) . '.' . $extension;

      $logoFile->move($uploadDir, $newFilename);

      $logoUrl = '/uploads/restaurants/' . $newFilename;

      $step = 'creation_restaurateur';

      $restaurateur = new Restaurateur();

      $restaurateur->setNom($nom);
      $restaurateur->setPrenom($prenom);
      $restaurateur->setEmail($email);
      $restaurateur->setTelephone($telephone);

      $hashedPassword = $passwordHasher->hashPassword($restaurateur, $password);
      $restaurateur->setPassword($hashedPassword);

      $entityManager->persist($restaurateur);

      $step = 'creation_restaurant';

      $restaurant = new Restaurant();

      $restaurant->setNom($restaurantData['nom']);
      $restaurant->setNmRue($restaurantData['nm_rue']);
      $restaurant->setRue($restaurantData['rue']);
      $restaurant->setCodePostal($restaurantData['code_postal']);
      $restaurant->setVille($restaurantData['ville']);
      $restaurant->setLogoUrl($logoUrl);
      $restaurant->setTelephone($restaurantData['telephone']);
      $restaurant->setPersonnesMax($restaurantData['personnes_max']);
      $restaurant->setRestaurateur($restaurateur);

      $entityManager->persist($restaurant);

      $step = 'liaison_types_cuisine';

      $cuisines = $restaurantData['cuisines'] ?? [];

      foreach ($cuisines as $cuisineNom) {
        $typeCuisine = $entityManager
          ->getRepository(TypeCuisine::class)
          ->findOneBy([
            'nom' => $cuisineNom
          ]);

        if (!$typeCuisine) {
          return $this->json([
            'error' => 'Type de cuisine introuvable : ' . $cuisineNom
          ], 400);
        }

        $restaurant->addTypeCuisine($typeCuisine);
      }

      $step = 'creation_horaires';

      foreach ($restaurantData['horaires'] as $horaireData) {
        $horaire = new Horaire();

        $jour = strtoupper($horaireData['jour']);

        $jourEnum = match ($jour) {
          'LUNDI' => JourEnum::LUNDI,
          'MARDI' => JourEnum::MARDI,
          'MERCREDI' => JourEnum::MERCREDI,
          'JEUDI' => JourEnum::JEUDI,
          'VENDREDI' => JourEnum::VENDREDI,
          'SAMEDI' => JourEnum::SAMEDI,
          'DIMANCHE' => JourEnum::DIMANCHE,
          default => null
        };

        if (!$jourEnum) {
          return $this->json([
            'error' => 'Jour invalide',
            'jour_recu' => $horaireData['jour']
          ], 400);
        }

        $horaire->setJour($jourEnum);
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

      $step = 'flush';

      $entityManager->flush();

      return $this->json([
        'message' => 'Restaurateur, restaurant, logo et horaires créés avec succès',
        'logo_url' => $logoUrl
      ], 201);

    } catch (\Throwable $e) {
      return $this->json([
        'error' => $e->getMessage(),
        'step' => $step,
        'line' => $e->getLine(),
        'file' => $e->getFile()
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

  #[Route('/api/restaurateur/me', methods: ['GET'])]
  public function getCurrentRestaurateur(
    RestaurantRepository $restaurantRepository
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
    } else {
      return $this->json([
        'restaurateur' => [
          'id' => $restaurateur->getId(),
          'nom' => $restaurateur->getNom(),
          'prenom' => $restaurateur->getPrenom()
        ],
        'restaurant' => [
          'nom' => $restaurant->getNom(),
          'nm_rue' => $restaurant->getNmRue(),
          'rue' => $restaurant->getRue(),
          'personnes_max' => $restaurant->getPersonnesMax(),
          'code_postal' => $restaurant->getCodePostal(),
          'telephone' => $restaurant->getTelephone(),
          'ville' => $restaurant->getVille(),
          'logoUrl' => $restaurant->getLogoUrl()
        ]
      ]);
    }
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