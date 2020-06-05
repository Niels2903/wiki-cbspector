docker network create wikinet

case $TEST_MATRIX in
postgres)
  echo "Using PostgreSQL..."
  docker run -d -p 5432:5432 --name db --network=wikinet -h db -e "POSTGRES_PASSWORD=Password123!" -e "POSTGRES_USER=wiki" -e "POSTGRES_DB=wiki" postgres:11
  docker run -d -p 3000:3000 --name wiki --network=wikinet -h wiki -e "DB_TYPE=postgres" -e "DB_HOST=db" -e "DB_PORT=5432" -e "DB_NAME=wiki" -e "DB_USER=wiki" -e "DB_PASS=Password123!" requarks/wiki:canary-2.4.89
  docker logs wiki
  sleep 10
  docker logs wiki
  ;;
mysql)
  echo "Using MySQL..."
  docker run -d -p 3306:3306 --name db --network=wikinet -h db -e "MYSQL_ROOT_PASSWORD=Password123!" -e "MYSQL_USER=wiki" -e "MYSQL_PASSWORD=Password123!" -e "MYSQL_DATABASE=wiki" mysql:8
  docker run -d -p 3000:3000 --name wiki --network=wikinet -h wiki -e "DB_TYPE=mysql" -e "DB_HOST=db" -e "DB_PORT=3306" -e "DB_NAME=wiki" -e "DB_USER=wiki" -e "DB_PASS=Password123!" requarks/wiki:canary-2.4.89
  docker logs wiki
  sleep 10
  docker logs wiki
  ;;
mariadb)
  echo "Using MariaDB..."
  docker run -d -p 3306:3306 --name db --network=wikinet -h db -e "MYSQL_ROOT_PASSWORD=Password123!" -e "MYSQL_USER=wiki" -e "MYSQL_PASSWORD=Password123!" -e "MYSQL_DATABASE=wiki" mariadb:10
  docker run -d -p 3000:3000 --name wiki --network=wikinet -h wiki -e "DB_TYPE=mariadb" -e "DB_HOST=db" -e "DB_PORT=3306" -e "DB_NAME=wiki" -e "DB_USER=wiki" -e "DB_PASS=Password123!" requarks/wiki:canary-2.4.89
  docker logs wiki
  sleep 10
  docker logs wiki
  ;;
mssql)
  echo "Using MS SQL Server..."
  docker run -d -p 1433:1433 --name db --network=wikinet -h db -e "SA_PASSWORD=Password123!" -e "ACCEPT_EULA=wiki" -e "MYSQL_PASSWORD=Password123!" -e "MYSQL_DATABASE=wiki" mcr.microsoft.com/mssql/server:2019-latest
  docker exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Password123!" -Q 'CREATE DATABASE wiki'
  docker run -d -p 3000:3000 --name wiki --network=wikinet -h wiki -e "DB_TYPE=mssql" -e "DB_HOST=db" -e "DB_PORT=1433" -e "DB_NAME=wiki" -e "DB_USER=SA" -e "DB_PASS=Password123!" requarks/wiki:canary-2.4.89
  docker logs wiki
  sleep 10
  docker logs wiki
  ;;
sqlite)
  echo "Using SQLite..."
  docker run -d -p 3000:3000 --name wiki --network=wikinet -h wiki -e "DB_TYPE=sqlite" -e "DB_FILEPATH=db.sqlite" requarks/wiki:canary-2.4.89
  ;;
*)
  echo "Invalid DB Type!"
  ;;
esac
