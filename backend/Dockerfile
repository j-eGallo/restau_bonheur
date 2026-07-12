FROM php:8.3-cli

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
  git \
  unzip \
  zip \
  libicu-dev \
  libzip-dev \
  && docker-php-ext-install pdo pdo_mysql intl zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]