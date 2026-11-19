FROM dunglas/frankenphp:latest-php8.4-alpine

# Install PHP extensions required by Laravel
RUN install-php-extensions \
    pdo_mysql \
    gd \
    intl \
    zip \
    opcache \
    pcntl \
    bcmath

# Set Caddy / FrankenPHP environment variables
ENV SERVER_NAME=":80"
ENV APP_ENV="production"
ENV APP_DEBUG="false"

WORKDIR /app

# Copy application files
COPY . /app

# Install Composer dependencies with ignore-platform-reqs for safety
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
    composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-req=php+

# Fix permissions for Laravel storage and bootstrap cache
RUN chmod -R 777 /app/storage /app/bootstrap/cache

EXPOSE 80

CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]

