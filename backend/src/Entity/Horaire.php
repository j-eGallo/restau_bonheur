<?php

namespace App\Entity;

use App\Enum\JourEnum;
use App\Repository\HoraireRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: HoraireRepository::class)]
class Horaire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(enumType: JourEnum::class)]
    private ?JourEnum $jour = null;

    #[ORM\Column]
    private ?bool $ouvert_midi = null;

    #[ORM\Column]
    private ?bool $ouvert_soir = null;

    #[ORM\Column(type: Types::TIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $heure_ouverture_midi = null;

    #[ORM\Column(type: Types::TIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $heure_fermeture_midi = null;

    #[ORM\Column(type: Types::TIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $heure_ouverture_soir = null;

    #[ORM\Column(type: Types::TIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $heure_fermeture_soir = null;



    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Restaurant $restaurant = null;


    public function getId(): ?int
    {
        return $this->id;
    }

    public function getJour(): ?JourEnum
    {
        return $this->jour;
    }

    public function setJour(JourEnum $jour): static
    {
        $this->jour = $jour;

        return $this;
    }

    public function isOuvertMidi(): ?bool
    {
        return $this->ouvert_midi;
    }

    public function setOuvertMidi(bool $ouvert_midi): static
    {
        $this->ouvert_midi = $ouvert_midi;

        return $this;
    }

    public function isOuvertSoir(): ?bool
    {
        return $this->ouvert_soir;
    }

    public function setOuvertSoir(bool $ouvert_soir): static
    {
        $this->ouvert_soir = $ouvert_soir;

        return $this;
    }

    public function getHeureOuvertureMidi(): ?\DateTimeInterface
    {
        return $this->heure_ouverture_midi;
    }

    public function setHeureOuvertureMidi(\DateTimeInterface $heure_ouverture_midi): static
    {
        $this->heure_ouverture_midi = $heure_ouverture_midi;

        return $this;
    }

    public function getHeureFermetureMidi(): ?\DateTimeInterface
    {
        return $this->heure_fermeture_midi;
    }

    public function setHeureFermetureMidi(\DateTimeInterface $heure_fermeture_midi): static
    {
        $this->heure_fermeture_midi = $heure_fermeture_midi;

        return $this;
    }

    public function getHeureOuvertureSoir(): ?\DateTimeInterface
    {
        return $this->heure_ouverture_soir;
    }

    public function setHeureOuvertureSoir(\DateTimeInterface $heure_ouverture_soir): static
    {
        $this->heure_ouverture_soir = $heure_ouverture_soir;

        return $this;
    }

    public function getHeureFermetureSoir(): ?\DateTimeInterface
    {
        return $this->heure_fermeture_soir;
    }

    public function setHeureFermetureSoir(\DateTimeInterface $heure_fermeture_soir): static
    {
        $this->heure_fermeture_soir = $heure_fermeture_soir;

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
}
