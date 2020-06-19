# updated: 2020-6-20 1:22:27
# by chenjk110

FROM node:12

EXPOSE 3000

ENV SRC_DIR ./dist

ENV DIST_DIR /var/www/app

ADD ${SRC_DIR} ${DIST_DIR}

WORKDIR ${DIST_DIR}

RUN [ "npm", "install" ]

CMD [ "node", "bootstrap.js" ]
