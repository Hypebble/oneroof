#!/usr/bin/env bash

#you can actually get rid of the sudo -E every time beacuse vagrant already does that for you

#DONT FORGET TO DO REDIS

# Provisioning script for the authentication challenge
echo "Hello World!"

# use noninteractive mode since script is automated
export DEBIAN_FRONTEND=noninteractive

#update the package database
#-E passes in the environmental variables to the new shell that sudo runs
sudo -E apt-get update

# install git
# -y immediately puts in a yes w/o user input
sudo -E apt-get install -y git

sudo -E apt-get install build-essential

sudo -E apt-get install -y tcl8.5

# install node
# curl returns the stuff stored at a https
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo -E apt-get install -y nodejs

sudo -E apt-get install -y build-essential

#allow Node.js servers to bind to low ports
sudo -E apt-get install -y chase
sudo -E apt-get install -y libcap2-bin
sudo -E setcap cap_net_bind_service=+ep $(chase $(which node))

#install MySQL
sudo -E apt-get install -y mysql-server

mysql -u root <<-EOF
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.db WHERE Db='test' OR Db='test\_%';
FLUSH PRIVILEGES;
EOF

# install MariaDB 10.1
apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xcbcb082a1bb943db
add-apt-repository 'deb [arch=amd64,i386] http://sfo1.mirrors.digitalocean.com/mariadb/repo/10.1/ubuntu trusty main'
apt-get update
apt-get install -y mariadb-server

# set the loglevel for npm to show errors only
npm config set loglevel error -g


#install mongo
sudo -E apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo -E tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo -E apt-get update
sudo -E apt-get install -y mongodb-org

# kerberos library which is needed to build Mongo on node during npm install
sudo -E apt-get install -y libkrb5-dev

sudo -E npm install --no-bin-links