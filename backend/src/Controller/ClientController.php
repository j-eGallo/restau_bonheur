<?php

namespace App\Controller;

use App\Entity\Client;
use App\Repository\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

use OpenApi\Attributes as OA;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

final class ClientController extends AbstractController
{

  /*
    1. ROUTE api/registerClient :
    Inscription du client
--------------------------------------------------------------
    2. ROUTE api/loginClient :
    Connexion du client
--------------------------------------------------------------
    3. ROUTE api/logoutClient
    Déconnexion du client
--------------------------------------------------------------  
    4. ROUTE api/updateClient :
    Modifier le client
--------------------------------------------------------------    
    5. ROUTE api/deleteClient :
    Supprimer le client
--------------------------------------------------------------
  */



  #[OA\Post(
    path: '/api/registerClient',
    summary: 'Inscription d’un client',
    description: 'Permet de créer un compte client dans l’application Restau Bonheur.',
    tags: ['Client']
  )]
  #[OA\RequestBody(
    required: true,
    content: new OA\JsonContent(
      required: ['nom', 'prenom', 'email', 'telephone', 'password'],
      properties: [
        new OA\Property(property: 'nom', type: 'string', example: 'Dupont'),
        new OA\Property(property: 'prenom', type: 'string', example: 'Jean'),
        new OA\Property(property: 'email', type: 'string', example: 'jean.dupont@email.com'),
        new OA\Property(property: 'telephone', type: 'string', example: '0601020304'),
        new OA\Property(property: 'password', type: 'string', example: 'Motdepasse123')
      ]
    )
  )]
  #[OA\Response(
    response: 201,
    description: 'Client créé avec succès'
  )]
  #[OA\Response(
    response: 400,
    description: 'Données JSON invalides, champs manquants ou email déjà utilisé'
  )]
  #[OA\Response(
    response: 500,
    description: 'Erreur serveur'
  )]
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




  #[OA\Post(
    path: '/api/loginClient',
    summary: 'Connexion d’un client',
    description: 'Permet à un client de se connecter avec son email et son mot de passe. En cas de succès, un token JWT est retourné.',
    tags: ['Client']
  )]
  #[OA\RequestBody(
    required: true,
    content: new OA\JsonContent(
      required: ['email', 'password'],
      properties: [
        new OA\Property(property: 'email', type: 'string', example: 'jean.dupont@email.com'),
        new OA\Property(property: 'password', type: 'string', example: 'Motdepasse123')
      ]
    )
  )]
  #[OA\Response(
    response: 200,
    description: 'Connexion réussie avec retour du token JWT'
  )]
  #[OA\Response(
    response: 400,
    description: 'Données JSON invalides ou champs manquants'
  )]
  #[OA\Response(
    response: 401,
    description: 'Identifiants invalides'
  )]
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


  #[OA\Post(
    path: '/api/logoutClient',
    summary: 'Déconnexion d’un client',
    description: 'Permet de déconnecter un client côté frontend. Avec JWT, la déconnexion consiste principalement à supprimer le token stocké côté client.',
    tags: ['Client']
  )]
  #[OA\Response(
    response: 200,
    description: 'Client déconnecté'
  )]
  #[Route('/api/logoutClient', methods: ['POST'])]
  public function logoutClient()
  {

    return $this->json([
      'message' => 'Client deconnecté'
    ]);

  }



  #[OA\Post(
    path: '/api/updateClient',
    summary: 'Modification du profil client',
    description: 'Permet à un client de modifier ses informations personnelles après vérification de son mot de passe actuel.',
    tags: ['Client']
  )]
  #[OA\RequestBody(
    required: true,
    content: new OA\JsonContent(
      required: ['currentEmail', 'currentPassword'],
      properties: [
        new OA\Property(property: 'currentEmail', type: 'string', example: 'jean.dupont@email.com'),
        new OA\Property(property: 'currentPassword', type: 'string', example: 'AncienMotdepasse123'),
        new OA\Property(property: 'nom', type: 'string', example: 'Martin'),
        new OA\Property(property: 'prenom', type: 'string', example: 'Jean'),
        new OA\Property(property: 'email', type: 'string', example: 'jean.martin@email.com'),
        new OA\Property(property: 'telephone', type: 'string', example: '0611223344'),
        new OA\Property(property: 'password', type: 'string', example: 'NouveauMotdepasse123')
      ]
    )
  )]
  #[OA\Response(
    response: 200,
    description: 'Client modifié avec succès'
  )]
  #[OA\Response(
    response: 400,
    description: 'Données JSON invalides'
  )]
  #[OA\Response(
    response: 401,
    description: 'Mot de passe incorrect'
  )]
  #[OA\Response(
    response: 404,
    description: 'Client introuvable'
  )]
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



  #[OA\Post(
    path: '/api/logoutClient',
    summary: 'Déconnexion d’un client',
    description: 'Permet de déconnecter un client côté frontend. Avec JWT, la déconnexion consiste principalement à supprimer le token stocké côté client.',
    tags: ['Client']
  )]
  #[OA\Response(
    response: 200,
    description: 'Client déconnecté'
  )]
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