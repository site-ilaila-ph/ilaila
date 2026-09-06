export NODE_ENV="development"
export DEBUG="1"
export DIRECT_URL="postgres://postgres:postgres@localhost:5432/app?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/app?pgbouncer=true&sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"