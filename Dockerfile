FROM node:alpine
LABEL authors="arche"

WORKDIR /express_bunny

COPY . /express_bunny

CMD ["npm", "i", "-g", "bun"]
CMD ["bun", "i"]
CMD ["bun", "nodemon", "app.js"]

ENTRYPOINT ["top", "-b"]
