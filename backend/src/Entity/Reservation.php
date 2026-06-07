<?php

namespace App\Entity;

use App\Repository\ReservationRepository;
use App\Enum\ServiceEnum;
use App\Entity\Restaurant;
use App\Entity\Client;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;


#[ORM\Entity(repositoryClass: ReservationRepository::class)]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $date = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTime $heure = null;


    #[ORM\Column(enumType: ServiceEnum::class)]
    private ?ServiceEnum $service = null;



    #[ORM\Column]
    private ?int $nb_personnes = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Client $client = null;



    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Restaurant $restaurant = null;

    #[ORM\OneToOne(mappedBy: 'reservation', cascade: ['persist', 'remove'])]
    private ?Avis $avis = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getHeure(): ?\DateTime
    {
        return $this->heure;
    }

    public function getService(): ?ServiceEnum
    {
        return $this->service;
    }

    public function setService(ServiceEnum $service): static
    {
        $this->service = $service;

        return $this;
    }




    public function setHeure(\DateTime $heure): static
    {
        $this->heure = $heure;

        return $this;
    }

    public function getNbPersonnes(): ?int
    {
        return $this->nb_personnes;
    }

    public function setNbPersonnes(int $nb_personnes): static
    {
        $this->nb_personnes = $nb_personnes;

        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): static
    {
        $this->client = $client;

        return $this;
    }


    public function getRestaurant(): ?Restaurant
    {
        return $this->restaurant;
    }

    public function setRestaurant(?Restaurant $restaurant): static
    {
        $this->restaurant = $restaurant;

        return $this;
    }

    public function getAvis(): ?Avis
    {
        return $this->avis;
    }

    public function setAvis(Avis $avis): static
    {
        // set the owning side of the relation if necessary
        if ($avis->getReservation() !== $this) {
            $avis->setReservation($this);
        }

        $this->avis = $avis;

        return $this;
    }

}
