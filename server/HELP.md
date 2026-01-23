## Database ERD
**URL**: https://dbdiagram.io/d/green-life-shop-696b68c9d6e030a024504ff4

---
## Prisma Mongo
- URL: https://www.prisma.io/docs/getting-started/prisma-orm/add-to-existing-project/mongodb

---
## MongoDB Docs
**Configuration File**
- Linux: `/etc/mongod.conf`
- Use the configuration file: `mongod --config /etc/mongod.conf`

---
## Isuse
**ReferenceError: exports is not defined in ES module scope**
- Github: https://github.com/prisma/prisma/issues/27556
- Prisma: https://www.prisma.io/docs/orm/prisma-schema/overview/generators#field-reference-1

**ConnectorError: AuthenticationFailed**
- Github: https://github.com/prisma/prisma/discussions/9994

**Prisma needs to perform transactions, MongoDB server to be run as a replica set**
- Youtube: https://www.youtube.com/watch?v=KTSBybt1JbY

---
## Docker CLI
```bash
docker run \
--name mongodb-container \
--network mongo-net \-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=NDuong205 \
-v ./mongo_data:/data/db \
-v ./mongo_config:/data/configdb \
-v ./mongo-keyfile:/mongo-keyfile:ro \
mongo:latest \
--replSet rs0 \
--bind_ip_all \
--auth \
--keyFile /mongo-keyfile
```
