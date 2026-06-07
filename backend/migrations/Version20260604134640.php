<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260604134640 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX IDX_8F91ABF019EB6921 ON avis');
        $this->addSql('DROP INDEX IDX_8F91ABF0B1E7706E ON avis');
        $this->addSql('DROP INDEX UNIQ_8F91ABF0B83297E7 ON avis');
        $this->addSql('ALTER TABLE avis MODIFY id INT NOT NULL');
        $this->addSql('ALTER TABLE avis ADD id_client INT NOT NULL, ADD id_restaurant INT NOT NULL, ADD id_reservation INT NOT NULL, DROP client_id, DROP restaurant_id, DROP reservation_id, CHANGE id id_avis INT AUTO_INCREMENT NOT NULL, DROP PRIMARY KEY, ADD PRIMARY KEY (id_avis)');
        $this->addSql('ALTER TABLE avis ADD CONSTRAINT FK_8F91ABF0E173B1B8 FOREIGN KEY (id_client) REFERENCES client (id)');
        $this->addSql('ALTER TABLE avis ADD CONSTRAINT FK_8F91ABF04E1F92E8 FOREIGN KEY (id_restaurant) REFERENCES restaurant (id)');
        $this->addSql('ALTER TABLE avis ADD CONSTRAINT FK_8F91ABF05ADA84A2 FOREIGN KEY (id_reservation) REFERENCES reservation (id)');
        $this->addSql('CREATE INDEX IDX_8F91ABF0E173B1B8 ON avis (id_client)');
        $this->addSql('CREATE INDEX IDX_8F91ABF04E1F92E8 ON avis (id_restaurant)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8F91ABF05ADA84A2 ON avis (id_reservation)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE avis DROP FOREIGN KEY FK_8F91ABF0E173B1B8');
        $this->addSql('ALTER TABLE avis DROP FOREIGN KEY FK_8F91ABF04E1F92E8');
        $this->addSql('ALTER TABLE avis DROP FOREIGN KEY FK_8F91ABF05ADA84A2');
        $this->addSql('DROP INDEX IDX_8F91ABF0E173B1B8 ON avis');
        $this->addSql('DROP INDEX IDX_8F91ABF04E1F92E8 ON avis');
        $this->addSql('DROP INDEX UNIQ_8F91ABF05ADA84A2 ON avis');
        $this->addSql('ALTER TABLE avis MODIFY id_avis INT NOT NULL');
        $this->addSql('ALTER TABLE avis ADD client_id INT NOT NULL, ADD restaurant_id INT NOT NULL, ADD reservation_id INT NOT NULL, DROP id_client, DROP id_restaurant, DROP id_reservation, CHANGE id_avis id INT AUTO_INCREMENT NOT NULL, DROP PRIMARY KEY, ADD PRIMARY KEY (id)');
        $this->addSql('CREATE INDEX IDX_8F91ABF019EB6921 ON avis (client_id)');
        $this->addSql('CREATE INDEX IDX_8F91ABF0B1E7706E ON avis (restaurant_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8F91ABF0B83297E7 ON avis (reservation_id)');
    }
}
