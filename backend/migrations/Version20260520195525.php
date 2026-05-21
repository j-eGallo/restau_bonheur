<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260520195525 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE plat (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, prix NUMERIC(11, 11) NOT NULL, image_url VARCHAR(255) NOT NULL, id_restaurant INT NOT NULL, id_categorie INT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE restaurant CHANGE id_restaurateur restaurateur_id INT NOT NULL');
        $this->addSql('ALTER TABLE restaurant ADD CONSTRAINT FK_EB95123F3B311E56 FOREIGN KEY (restaurateur_id) REFERENCES restaurateur (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_EB95123F3B311E56 ON restaurant (restaurateur_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE plat');
        $this->addSql('ALTER TABLE restaurant DROP FOREIGN KEY FK_EB95123F3B311E56');
        $this->addSql('DROP INDEX UNIQ_EB95123F3B311E56 ON restaurant');
        $this->addSql('ALTER TABLE restaurant CHANGE restaurateur_id id_restaurateur INT NOT NULL');
    }
}
