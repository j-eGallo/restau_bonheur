<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260528171526 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE horaire DROP FOREIGN KEY `horaire_ibfk_1`');
        $this->addSql('ALTER TABLE horaire ADD CONSTRAINT FK_BBC83DB6B1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurant (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE photo DROP FOREIGN KEY `photo_ibfk_1`');
        $this->addSql('ALTER TABLE photo ADD CONSTRAINT FK_14B78418B1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurant (id)');
        $this->addSql('ALTER TABLE plat CHANGE id_categorie categorie_id INT NOT NULL');
        $this->addSql('ALTER TABLE plat ADD CONSTRAINT FK_2038A207B1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurant (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE plat ADD CONSTRAINT FK_2038A207BCF5E72D FOREIGN KEY (categorie_id) REFERENCES categorie (id)');
        $this->addSql('CREATE INDEX IDX_2038A207BCF5E72D ON plat (categorie_id)');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C8495519EB6921 FOREIGN KEY (client_id) REFERENCES client (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C84955B1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurant (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE restaurant DROP FOREIGN KEY `restaurant_ibfk_1`');
        $this->addSql('ALTER TABLE restaurant ADD CONSTRAINT FK_EB95123F3B311E56 FOREIGN KEY (restaurateur_id) REFERENCES restaurateur (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE horaire DROP FOREIGN KEY FK_BBC83DB6B1E7706E');
        $this->addSql('ALTER TABLE horaire ADD CONSTRAINT `horaire_ibfk_1` FOREIGN KEY (restaurant_id) REFERENCES restaurant (id) ON UPDATE CASCADE ON DELETE CASCADE');
        $this->addSql('ALTER TABLE photo DROP FOREIGN KEY FK_14B78418B1E7706E');
        $this->addSql('ALTER TABLE photo ADD CONSTRAINT `photo_ibfk_1` FOREIGN KEY (restaurant_id) REFERENCES restaurant (id) ON UPDATE CASCADE ON DELETE CASCADE');
        $this->addSql('ALTER TABLE plat DROP FOREIGN KEY FK_2038A207B1E7706E');
        $this->addSql('ALTER TABLE plat DROP FOREIGN KEY FK_2038A207BCF5E72D');
        $this->addSql('DROP INDEX IDX_2038A207BCF5E72D ON plat');
        $this->addSql('ALTER TABLE plat CHANGE categorie_id id_categorie INT NOT NULL');
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C8495519EB6921');
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C84955B1E7706E');
        $this->addSql('ALTER TABLE restaurant DROP FOREIGN KEY FK_EB95123F3B311E56');
        $this->addSql('ALTER TABLE restaurant ADD CONSTRAINT `restaurant_ibfk_1` FOREIGN KEY (restaurateur_id) REFERENCES restaurateur (id) ON UPDATE CASCADE ON DELETE CASCADE');
    }
}
