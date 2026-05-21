<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260520212131 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE reservation CHANGE id_restaurant restaurant_id INT NOT NULL');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C84955B1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurant (id)');
        $this->addSql('CREATE INDEX IDX_42C84955B1E7706E ON reservation (restaurant_id)');
        $this->addSql('ALTER TABLE restaurant ADD CONSTRAINT FK_EB95123F3B311E56 FOREIGN KEY (restaurateur_id) REFERENCES restaurateur (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C84955B1E7706E');
        $this->addSql('DROP INDEX IDX_42C84955B1E7706E ON reservation');
        $this->addSql('ALTER TABLE reservation CHANGE restaurant_id id_restaurant INT NOT NULL');
        $this->addSql('ALTER TABLE restaurant DROP FOREIGN KEY FK_EB95123F3B311E56');
    }
}
