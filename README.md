![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)


# Speak About It

Speak About It is a question-and-answer platform designed for both professional and enthusiast programmers. Inspired by the collaborative environment of forums like Stack Overflow, **Speak About It** allows users to share their challenges and solutions through short posts, receive community feedback, and build a reputation based on their contributions. This project, developed with **NestJS**, **Prisma**, **MySQL**, **Node.js** and **AWS**, is an API-driven solution aimed at fostering knowledge-sharing and community engagement.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
  - [Accessing the Admin Panel](#accessing-the-admin-panel)
  - [Documentation](#documentation)
- [License](#license)

---

## Technology Stack

The project is built using the following technologies:

- **NestJS**: The primary framework used for building the API, providing a robust structure and modular approach.
- **TypeScript**: Ensures type safety and improves code maintainability across the project.
- **Prisma**: An ORM (Object-Relational Mapper) used for seamless interaction with the MySQL database.
- **Node.js**: The JavaScript runtime environment that powers the backend, enabling scalable and efficient server-side execution.
- **AWS**: Used for storing user avatars securely, leveraging Amazon Web Services' storage solutions.
- **Swagger**: Offers API documentation to simplify endpoint testing and integration for developers.
- **NPM**: The Node Package Manager, used for managing project dependencies.
- **JWT**: JSON Web Tokens are used for secure user authentication, ensuring a safe login experience.

---

## Features

- **User Registration and Authentication**: Secure user registration and login system.
- **Post Creation and Interaction**: Users can create posts, comment, and interact with others’ posts.
- **Categories**: Organize posts by categories and tags for easy filtering and searching.
- **Sorting and Filtering of Posts**: Flexible sorting and filtering options to help users find relevant posts.
- **Favorites**: Users can mark posts as favorites for quick access later.
- **Email Notifications via Gmail**: Notifications are sent to users' Gmail accounts when there are updates to subscribed posts.
- **Avatar Storage in AWS**: User avatars are securely stored in AWS for reliable access and storage.
- **User Status (Online/Offline)**: Users have a visible status indicator to show if they are online or offline.
- **User Roles (User and Admin)**: Role-based access control, with separate permissions for regular users and admins.
- **Subscription System**: Users can subscribe to posts and receive email notifications upon updates.
- **Admin Panel**: Access administrative tools to manage users, posts, and other site configurations.

## Getting Started

Follow these steps to set up the project on your local machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js**: [Download and install Node.js](https://nodejs.org/)
- **MySQL**: [Download and install MySQL](https://www.mysql.com/)
- **NPM**: [Download and install NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/batushka11/USOF.git
   ```

2. **Navigate to the Project Folder**:

   ```bash
   cd USOF
   ```

3. **Set Up Environment Variables**: An .env.example file is provided with all the required environment variables. Create a .env file by copying .env.example and then fill in the necessary values.

   ```bash
   cp .env.example .env
   ```

4. **Install dependencies**: Install all necessary dependencies for the project by running:

   ```bash
   npm install
   ```

5. **Generate Prisma Client**: Prisma is used for database management. Generate the Prisma client to interact with your MySQL database:

   ```bash
   npx prisma generate
   ```

6. **Create the Database**: Use Prisma to create the initial database schema:

   ```bash
   npx prisma db push
   ```

7. **Migrate the Database**: Apply database migrations to ensure your MySQL database schema matches the project structure:

   ```bash
   npx prisma migrate dev
   ```

8. **Seed the Database**: Populate the database with initial data by running:

   ```bash
   npx run seed
   ```

---

## Usage

### Running the Application

Start the application using:

```bash
 npm run start
```

By default, the app will be available at http://localhost:4200

### Accessing the Admin Panel

1. **To access the admin panel, navigate to**:

   ```bash
   http://localhost:4200/admin
   ```

2. **Log in using the administrator panel by provided email and password**.

   ```bash
   email: admin@example.com
   password: 12345678
   ```

### Documentation

For detailed information on API endpoints, request parameters, and usage examples, visit the API documentation site:

- [SwaggerHub](https://app.swaggerhub.com/apis/switcha236/SpeakAboutIt/1.0.0)

This site provides comprehensive information to help you integrate and test various parts of the API.
Also you can see documentation using URL:

```bash
 http://localhost:4200/docs
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](./License.md) file for more details.
