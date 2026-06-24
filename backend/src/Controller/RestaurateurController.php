<?php

namespace App\Controller;

use App\Entity\Restaurateur;
use App\Entity\TypeCuisine;
use App\Repository\RestaurateurRepository;
use App\Repository\RestaurantRepository;
use App\Entity\Restaurant;
use App\Entity\Horaire;
use App\Enum\JourEnum;
use App\Entity\Photo;
use App\Entity\Plat;
use App\Entity\Reservation;
use App\Entity\Avis;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class RestaurateurController extends AbstractController
{

  /*
    1. ROUTE api/registerRestaurateur :
    Inscription du restaurateur
--------------------------------------------------------------
    2. ROUTE api/loginRestaurateur :
    Connexion du restaurateur
--------------------------------------------------------------
    3. ROUTE api/restaurateur/me :
    Récupérer restaurateur
--------------------------------------------------------------    
    4. ROUTE api/updateRestaurateur :
    Modifier le restaurateur (coordonnées)
--------------------------------------------------------------
    5. ROUTE api/logoutRestaurateur :
    Déconnexion restaurateur
--------------------------------------------------------------
    6. ROUTE api/deleteRestaurateur :
    Supprimer le compte restaurateur 
  */




  // Route d'inscription du restaurateur avec la création de son restaurant
  #[Route('/api/registerRestaurateur', methods: ['POST'])]
  public function registerRes(
    Request $request,
    UserPasswordHasherInterface $passwordHasher,
    EntityManagerInterface $entityManager
  ) {
    $step = 'start';

    // lecture des données
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

      // Exige la soumission un logo
      if (!$logoFile) {
        return $this->json([
          'error' => 'Logo obligatoire'
        ], 400);
      }


      $step = 'lecture_champs';

      // DÉFINITIONS DES DONNÉES À INJECTER DANS LA BASE DE DONNÉES
      $nom = $data['nom'] ?? null;
      $prenom = $data['prenom'] ?? null;
      $email = $data['email'] ?? null;
      $telephone = $data['telephone'] ?? null;
      $password = $data['password'] ?? null;
      $restaurantData = $data['restaurant'] ?? null;

      // VERIFIE SI LES CHAMPS SONT BIEN REMPLIS 
      if (!$nom || !$prenom || !$email || !$telephone || !$password || !$restaurantData) {
        return $this->json([
          'error' => 'Champs restaurateur ou restaurant manquants',
          'data_recue' => $data
        ], 400);
      }
      // VÉRIFIE SI LES HORAIRES SONT BIEN RENSEIGNÉES
      if (empty($restaurantData['horaires'])) {
        return $this->json([
          'error' => 'Les horaires sont obligatoires'
        ], 400);
      }


      $step = 'verification_email';


      // RECHERCHER SI LE RESTAURATEUR A SON EMAIL DÉJÀ INSCRIT DANS LA BDD 
      $existingUser = $entityManager
        ->getRepository(Restaurateur::class)
        ->findOneBy([
          'email' => $email
        ]);

      // ERREUR SI DÉJÀ INSCRIT
      if ($existingUser) {
        return $this->json([
          'error' => 'Email déjà existant !',
          'email' => $email,
          'existing_id' => $existingUser->getId()
        ], 400);
      }

      // AJOUT DU LOGO
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



      // CRÉATION/INSCRIPTION DU RESTAURATEUR
      $step = 'creation_restaurateur';

      $restaurateur = new Restaurateur();

      $restaurateur->setNom($nom);
      $restaurateur->setPrenom($prenom);
      $restaurateur->setEmail($email);
      $restaurateur->setTelephone($telephone);

      $hashedPassword = $passwordHasher->hashPassword($restaurateur, $password);
      $restaurateur->setPassword($hashedPassword);

      $entityManager->persist($restaurateur);

      // CRÉEATION DU RESTAURANT 
      $step = 'creation_restaurant';

      $restaurant = new Restaurant();

      // DÉFINITION DES DONNÉES DU RESTAURANT ENVOYÉES DANS LA BDD
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

      // ATTRIBUTION DES TYPES DE CUISINE AU RESTAURANT
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

      // AJOUT DES HORAIRES
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


  // CONNEXION DU RESTAURATEUR
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


    // VÉRIFICATION CHAMPS BIEN REMPLIS
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if (empty($email) || empty($password)) {
      return $this->json([
        'error' => 'Champs manquants'
      ], 400);
    }

    // CHERCHER LE RESTAURATEUR DANS LA BDD (VIA SON EMAIL)
    $user = $restaurateurRepository->findOneBy([
      'email' => $email
    ]);

    if (!$user) {
      return $this->json([
        'error' => 'Identifiants invalides'
      ], 401);
    }

    // VÉRIFIE SI LE MDP EST CORRECT
    if (!$passwordHasher->isPasswordValid($user, $password)) {
      return $this->json([
        'error' => 'Identifiants invalides'
      ], 401);
    }

    // CRÉATION D'UN NOUVEAU TOKEN À CHAQUE CONNEXION D'UN UTILISATEUR
    $token = $JWTManager->create($user);

    // MESSAGE AFFICHANT LES INFORMATIONS DE L'UTILISATEUR CONNECTÉ
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
          'prenom' => $restaurateur->getPrenom(),
          'email' => $restaurateur->getEmail(),
          'telephone' => $restaurateur->getTelephone()
        ],
        'restaurant' => [
          'id' => $restaurant->getId(),
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


    // Conversion des data en tableau PHP
    $data = json_decode($request->getContent(), true);

    $nom = $data['nom'] ?? null;
    $prenom = $data['prenom'] ?? null;
    $currentEmail = $data['currentEmail'] ?? null;
    $email = $data['email'] ?? null;
    $telephone = $data['telephone'] ?? null;
    $currentPassword = $data['currentPassword'] ?? null;
    $password = $data['password'] ?? null;


    // Recherche du restaurateur par son email
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


    // Vérification du mot de passe pour valider la modif du restaurateur
    if (!$passwordIsValid) {
      return $this->json([
        'error' => 'Mot de passe incorrect'
      ], 404);
    }

    // Mise à jour des informations modifiées (non obligatoires)
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
    RestaurantRepository $restaurantRepository,
    EntityManagerInterface $entityManager,
    UserPasswordHasherInterface $passwordHasher
  ) {

    // Récupération des infos du restaurateur
    $data = json_decode($request->getContent(), true);

    if (!$data) {
      return $this->json([
        'error' => 'Invalid JSON'
      ], 400);
    }

    // Vérification des champs obligatoires
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if (empty($email) || empty($password)) {
      return $this->json([
        'error' => 'Champs manquants'
      ], 400);
    }

    // Recherche de l'utilisateur par son email et erreur si inexistant
    $user = $restaurateurRepository->findOneBy([
      'email' => $email
    ]);

    if (!$user) {
      return $this->json([
        'error' => 'User does not exist'
      ], 404);
    }

    // Vérification du mot de passe
    if (!$passwordHasher->isPasswordValid($user, $password)) {
      return $this->json([
        'error' => 'Identifiants invalides'
      ], 401);
    }

    // Recherche du restaurant associé au restaurateur (le $user)
    $restaurant = $restaurantRepository->findOneBy([
      'restaurateur' => $user
    ]);

    // Condition et boucles pour supprimer toutes les infos liées au restaurant du restaurateur
    if ($restaurant) {

      // Suppression photo du restaurant
      $photos = $entityManager
        ->getRepository(Photo::class)
        ->findBy([
          'restaurant' => $restaurant
        ]);

      foreach ($photos as $photo) {
        $entityManager->remove($photo);
      }

      // Suppression plat du restaurant
      $plats = $entityManager
        ->getRepository(Plat::class)
        ->findBy([
          'restaurant' => $restaurant
        ]);

      foreach ($plats as $plat) {
        $entityManager->remove($plat);
      }

      // Suppression réservations du restaurant
      $reservations = $entityManager
        ->getRepository(Reservation::class)
        ->findBy([
          'restaurant' => $restaurant
        ]);

      foreach ($reservations as $reservation) {
        $entityManager->remove($reservation);
      }

      // Suppression avis du restaurant
      $avis = $entityManager
        ->getRepository(Avis::class)
        ->findBy([
          'restaurant' => $restaurant
        ]);

      foreach ($avis as $avi) {
        $entityManager->remove($avi);
      }

      // Suppression horaires du restaurant
      $horaires = $entityManager
        ->getRepository(Horaire::class)
        ->findBy([
          'restaurant' => $restaurant
        ]);

      foreach ($horaires as $horaire) {
        $entityManager->remove($horaire);
      }

      // Suppression de la liaison restaurant -> typeCuisine
      foreach ($restaurant->getTypeCuisines() as $typeCuisine) {
        $restaurant->removeTypeCuisine($typeCuisine);
      }

      $entityManager->remove($restaurant);
    }

    // Exécution finale de la fonction
    $entityManager->remove($user);
    $entityManager->flush();

    return $this->json([
      'message' => 'Compte restaurateur et restaurant supprimés avec succès'
    ]);
  }
}