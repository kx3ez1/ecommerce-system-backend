# Deploying MongoDB Replica Set with Docker Compose

## Introduction

In this guide, we will deploy a MongoDB replica set using Docker Compose. A replica set is a group of MongoDB servers that maintain the same data set, providing redundancy and increasing data availability.

## Prerequisites

- Docker installed on your server. You can follow the guide on [How to Install Docker on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04) to install Docker on your server.
- A server running Ubuntu 18.04 with Docker and Docker Compose installed.

## Step 1 — Creating the Docker Compose File

First, create a new directory for your MongoDB replica set and navigate to it:

```bash
mkdir ~/mongodb-replica-set
cd ~/mongodb-replica-set
```

Next, create a new file named `docker-compose.yml`:

```bash
nano docker-compose.yml
```

Add the following content to the file:

```yaml
version: '3.9'

services:
  mongo1:
    image: mongo:7.0 # Replace with your desired version
    command: --replSet rs0 --auth --bind_ip_all --keyFile /etc/mongo/keyfile
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: PASSWORD
    volumes:
      - ./data1:/data/db
      - ./mongo-keyfile:/etc/mongo/keyfile
    ports:
      - "27017:27017"
    healthcheck: # Example healthcheck
      test: ["CMD", "mongo", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 3
```
    
This file defines a Docker Compose service for each MongoDB server in the replica set. Each service uses the `mongo:latest` image, which is the official MongoDB Docker image. The `command` option specifies the command to run when the container starts. In this case, we are configuring the replica set name, the key file, and the IP address to bind to. The `volumes` option mounts a directory from the host to a directory in the container. This is used to persist the MongoDB data and the key file. The `ports` option maps the container port to the host port. This is used to access the MongoDB server from outside the container.

The `networks` section defines a new bridge network named `mongo`. This network is used to connect the MongoDB servers to each other.

## Step 2 — Creating the Key File

Next, create a key file that will be used to authenticate the MongoDB servers with each other. This key file is used to encrypt the communication between the servers in the replica set.

generate a key file using the `openssl` command:

```bash
openssl rand -base64 741 > mongo-keyfile
```

Next, change the permissions of the key file to make it readable only by the owner:

```bash
chmod 400 mongo-keyfile
```

change the owner of the key file to mongodb:

```bash
sudo chown 999:999 mongo-keyfile
```

Please replace 999:999 with the user and group ID that your MongoDB runs as, if it's different.  Remember to distribute the keyfile to all members of the replica set and to store it in a safe and secure manner.

## Step 3 — Starting the Replica Set

Now that we have created the Docker Compose file and the key file, we can start the MongoDB replica set using Docker Compose.

Start the replica set using the following command:

```bash
docker-compose up -d
```

This command will start the MongoDB servers in the background. The `-d` option tells Docker Compose to run the containers in the background.

## Step 4 — Configuring the Replica Set

Now that the MongoDB servers are running, we can connect to one of the servers and configure the replica set.

First, connect to the `mongo1` container using the `docker exec` command:

```bash
docker exec -it mongodb-replica-set_mongo1_1 mongosh
```

This command will open a MongoDB shell connected to the `mongo1` container.

Next, run the following commands to configure the replica set:

```bash
rs.initiate(
  {
    _id : "rs0",
    members: [
      { _id : 0, host : "mongo1:27017" }
    ]
  }
)
```

This command initializes the replica set with the name `rs0` and adds the three MongoDB servers as members of the replica set.

You should see the following output:

```plaintext
{ ok: 1 }
```

Next, add the other two MongoDB servers to the replica set by running the following commands:

```bash
use admin
rs.add("mongo2:27018")
rs.add("mongo3:27019")
```

You can check the status of the replica set by running the following command:

```bash
rs.status()
```



## Conclusion

In this guide, you deployed a MongoDB replica set using Docker Compose. You also learned how to create a key file to encrypt the communication between the MongoDB servers and how to configure the replica set using the MongoDB shell.

To learn more about MongoDB replica sets, visit the [MongoDB Replica Set Documentation](https://docs.mongodb.com/manual/replication/).


# Step 5 — Testing the Replica Set

To test the replica set, you can connect to one of the MongoDB servers and insert a document into the database. Then, you can connect to another MongoDB server and verify that the document has been replicated.

First, connect to the `mongo1` container using the `docker exec` command:

```bash
docker exec -it mongodb-replica-set_mongo1_1 mongo
```

This command will open a MongoDB shell connected to the `mongo1` container.

Next, switch to the `test` database and insert a document into the `users` collection:

```bash
use test
db.users.insert({ name: "Alice" })
```
You should see the following output:

```plaintext
WriteResult({ "nInserted" : 1 })
```

Next, connect to the `mongo2` container using the `docker exec` command:

```bash
docker exec -it mongodb-replica-set_mongo2_1 mongo
```

This command will open a MongoDB shell connected to the `mongo2` container.

Switch to the `test` database and run the following command to query the `users` collection:

```bash
use test
db.users.find()
```

You should see the following output:

```plaintext
{ "_id" : ObjectId("60a3e3e3e3e3e3e3e3e3e3e3"), "name" : "Alice" }
```

This output confirms that the document has been replicated to the `mongo2` server.

You can also connect to the `mongo3` container and verify that the document has been replicated to the third server.

```bash
docker exec -it mongodb-replica-set_mongo3_1 mongo
```

This command will open a MongoDB shell connected to the `mongo3` container.

Switch to the `test` database and run the following command to query the `users` collection:

```bash
use test
db.users.find()
```

You should see the following output:

```plaintext
{ "_id" : ObjectId("60a3e3e3e3e3e3e3e3e3e3e3"), "name" : "Alice" }
```

This output confirms that the document has been replicated to the `mongo3` server.

In this guide, you deployed a MongoDB replica set using Docker Compose and tested the replica set by inserting a document into the database and verifying that it has been replicated to the other servers.


# Step 6 — Stopping the Replica Set

To stop the MongoDB replica set, you can use the `docker-compose down` command:

```bash
docker-compose down
```

This command will stop and remove the containers, networks, and volumes created by Docker Compose.