<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260520211617 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE reservation (id INT AUTO_INCREMENT NOT NULL, date DATE NOT NULL, heure TIME NOT NULL, service VARCHAR(255) NOT NULL, nb_personnes INT NOT NULL, id_client INT NOT NULL, id_restaurant INT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE restaurant ADD CONSTRAINT FK_EB95123F3B311E56 FOREIGN KEY (restaurateur_id) REFERENCES restaurateur (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE reservation');
        $this->addSql('ALTER TABLE restaurant DROP FOREIGN KEY FK_EB95123F3B311E56');
    }
}
