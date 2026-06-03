<?php

namespace App\Entity;

use App\Repository\RestaurantRepository;
use App\Entity\Restaurateur;
use App\Entity\TypeCuisine;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: RestaurantRepository::class)]
class Restaurant
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 100)]
    private ?string $nm_rue = null;

    #[ORM\Column(length: 100)]
    private ?string $rue = null;

    #[ORM\Column(length: 10)]
    private ?string $code_postal = null;

    #[ORM\Column(length: 100)]
    private ?string $ville = null;

    #[ORM\Column(length: 255)]
    private ?string $logo_url = null;

    #[ORM\Column(length: 20)]
    private ?string $telephone = null;

    #[ORM\Column(type: Types::INTEGER)]
    private ?int $personnes_max = null;

    #[ORM\OneToOne(targetEntity: Restaurateur::class)]
    #[ORM\JoinColumn(nullable: false, unique: true, onDelete: 'CASCADE')]
    private ?Restaurateur $restaurateur = null;

    #[ORM\ManyToMany(targetEntity: TypeCuisine::class, inversedBy: 'restaurants')]
    #[ORM\JoinTable(name: 'restaurant_type_cuisine')]
    private Collection $typeCuisines;

    public function __construct()
    {
        $this->typeCuisines = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getNmRue(): ?string
    {
        return $this->nm_rue;
    }

    public function setNmRue(string $nm_rue): static
    {
        $this->nm_rue = $nm_rue;

        return $this;
    }

    public function getRue(): ?string
    {
        return $this->rue;
    }

    public function setRue(string $rue): static
    {
        $this->rue = $rue;

        return $this;
    }

    public function getCodePostal(): ?string
    {
        return $this->code_postal;
    }

    public function setCodePostal(string $code_postal): static
    {
        $this->code_postal = $code_postal;

        return $this;
    }

    public function getVille(): ?string
    {
        return $this->ville;
    }

    public function setVille(string $ville): static
    {
        $this->ville = $ville;

        return $this;
    }

    public function getLogoUrl(): ?string
    {
        return $this->logo_url;
    }

    public function setLogoUrl(string $logo_url): static
    {
        $this->logo_url = $logo_url;

        return $this;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(string $telephone): static
    {
        $this->telephone = $telephone;

        return $this;
    }

    public function getPersonnesMax(): ?int
    {
        return $this->personnes_max;
    }

    public function setPersonnesMax(int $personnes_max): static
    {
        $this->personnes_max = $personnes_max;

        return $this;
    }

    public function getRestaurateur(): ?Restaurateur
    {
        return $this->restaurateur;
    }

    public function setRestaurateur(?Restaurateur $restaurateur): static
    {
        $this->restaurateur = $restaurateur;

        return $this;
    }

    /**
     * @return Collection<int, TypeCuisine>
     */
    public function getTypeCuisines(): Collection
    {
        return $this->typeCuisines;
    }

    public function addTypeCuisine(TypeCuisine $typeCuisine): static
    {
        if (!$this->typeCuisines->contains($typeCuisine)) {
            $this->typeCuisines->add($typeCuisine);
        }

        return $this;
    }

    public function removeTypeCuisine(TypeCuisine $typeCuisine): static
    {
        $this->typeCuisines->removeElement($typeCuisine);

        return $this;
    }
}