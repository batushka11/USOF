<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Speak About It

Speak About It is a question-and-answer platform designed for both professional and enthusiast programmers. Inspired by the collaborative environment of forums like Stack Overflow, **Speak About It** allows users to share their challenges and solutions through short posts, receive community feedback, and build a reputation based on their contributions. This project, developed with **NestJS**, **Prisma**, **MySQL**, and **Node.js**, is an API-driven solution aimed at fostering knowledge-sharing and community engagement.

## Table of Contents

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

## Features

- **User Registration and Authentication**: Secure user registration and login system.
- **Post Creation and Interaction**: Users can create posts, comment, and interact with others’ posts.
- **Categories**: Organize posts by categories and tags for easy filtering and searching.
- **Subscription System**: Users can subscribe to posts and receive email notifications upon updates.
- **Admin Panel**: Access administrative tools to manage users, posts, and other site configurations.

## Getting Started

Follow these steps to set up the project on your local machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js**: [Download and install Node.js](https://nodejs.org/)
- **MySQL**: [Download and install MySQL](https://www.mysql.com/)

### Installation

1. **Clone the repository**:
   
   ```bash
   git clone https://github.com/yourusername/speak-about-it.git
   ```
2. **Navigate to the Project Folder**:
   
    ```bash
   cd speak-about-it
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

  - [Documentation Site]()

This site provides comprehensive information to help you integrate and test various parts of the API.
Also you can see documentation using URL:
  
  ```bash
   http://localhost:4200/docs
   ```
---
## License

This project is licensed under the MIT License. See the full license text below.



  
