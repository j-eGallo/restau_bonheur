<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260603190507 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE restaurant_type_cuisine (restaurant_id INT NOT NULL, type_cuisine_id INT NOT NULL, INDEX IDX_C5C7C1DEB1E7706E (restaurant_id), INDEX IDX_C5C7C1DEF0487A31 (type_cuisine_id), PRIMARY KEY (restaurant_id, type_cuisine_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE restaurant_type_cuisine ADD CONSTRAINT FK_C5C7C1DEB1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurant (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE restaurant_type_cuisine ADD CONSTRAINT FK_C5C7C1DEF0487A31 FOREIGN KEY (type_cuisine_id) REFERENCES type_cuisine (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE plat ADD CONSTRAINT FK_2038A207BCF5E72D FOREIGN KEY (categorie_id) REFERENCES categorie (id)');
        $this->addSql('CREATE INDEX IDX_2038A207BCF5E72D ON plat (categorie_id)');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C8495519EB6921 FOREIGN KEY (client_id) REFERENCES client (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C84955B1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurant (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE restaurant DROP FOREIGN KEY `restaurant_ibfk_1`');
        $this->addSql('ALTER TABLE restaurant ADD CONSTRAINT FK_EB95123F3B311E56 FOREIGN KEY (restaurateur_id) REFERENCES restaurateur (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE type_cuisine CHANGE logo_url logo_url VARCHAR(255) DEFAULT NULL, CHANGE url nom VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE restaurant_type_cuisine DROP FOREIGN KEY FK_C5C7C1DEB1E7706E');
        $this->addSql('ALTER TABLE restaurant_type_cuisine DROP FOREIGN KEY FK_C5C7C1DEF0487A31');
        $this->addSql('DROP TABLE restaurant_type_cuisine');
        $this->addSql('ALTER TABLE plat DROP FOREIGN KEY FK_2038A207BCF5E72D');
        $this->addSql('DROP INDEX IDX_2038A207BCF5E72D ON plat');
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C8495519EB6921');
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C84955B1E7706E');
        $this->addSql('ALTER TABLE restaurant DROP FOREIGN KEY FK_EB95123F3B311E56');
        $this->addSql('ALTER TABLE restaurant ADD CONSTRAINT `restaurant_ibfk_1` FOREIGN KEY (restaurateur_id) REFERENCES restaurateur (id) ON UPDATE CASCADE ON DELETE CASCADE');
        $this->addSql('ALTER TABLE type_cuisine CHANGE logo_url logo_url VARCHAR(255) NOT NULL, CHANGE nom url VARCHAR(255) NOT NULL');
    }
}
