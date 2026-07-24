FROM php:8.3-cli

WORKDIR /var/www/html

# Installation des dépendances système et extensions PHP
RUN apt-get update && apt-get install -y \
  git \
  unzip \
  zip \
  libicu-dev \
  libzip-dev \
  && docker-php-ext-install \
  pdo \
  pdo_mysql \
  intl \
  zip \
  opcache \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copie des fichiers Composer avant le reste du projet
COPY composer.json composer.lock ./

# Installation des dépendances Symfony en production
RUN composer install \
  --no-dev \
  --optimize-autoloader \
  --no-interaction \
  --no-progress \
  --prefer-dist \
  --no-scripts

# Copie du projet
COPY . .

RUN touch .env


# Exécution des scripts Composer après la copie complète
RUN composer run-script post-install-cmd \
  --no-interaction || true

# Création des dossiers Symfony
RUN mkdir -p var/cache var/log \
  && chmod -R 777 var

ENV APP_ENV=prod
ENV APP_DEBUG=0

EXPOSE 10000

# Utilisation du port fourni par Render
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public public/index.php"]