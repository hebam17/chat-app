# MERN STACK chat app

## Description

A real time chat app that you can create account into and start chatting with other users and create chat groups too

## Technologies

- React
- Node
- MongoDB
- React router
- Tailwind
- JWT
- and more

## Current features

- Add users => to be contacts
- Create group chats
- delete contacts
- auth
- remove a single message
- newAuth => new branch with more advanced authentication - deal with auth using FRESHTOKEN, ACCESSTOKEN and http only cookies with no local storage

## upcoming features

- profile page with the appility to upload photo
- add the ability to block a user
- update a single message
- etc

## Branches

- main => will have all these features
- newAuth => more advanced JWT auth system

## Getting started

- git clone https://github.com/hebam17/chat-app

1- Open a first terminal and run

```
cd ./client
npm install
npm run dev
```

2- create a .env file and fill the needed variables => mentioned in ** env-map.json **

3- Open your second terminal and run

```
cd ./api
npm install
npm run dev
```

4- create a .env file and fill the needed variables => mentioned in ** env-map.json **

Now you run the project

![login-page](./proShots/login-page.png)
![users-list](./proShots/users-list.png)
![contacts](./proShots/contacts.png)
![chat](./proShots/chat.png)
![create-group](./proShots/create-group.png)
![search-user](./proShots/search-user.png)
