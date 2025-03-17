IOE324 Introduction to DevOps and Microservices
Assignment-2
BHANU REDDY -BCD26


Jenkins Pipeline Integration for Todo Application
This guide provides a step-by-step walkthrough for setting up a complete CI/CD pipeline using Jenkins for a Todo application with React frontend, Node.js backend, and MongoDB database. The pipeline will include Git integration, building, testing, SonarQube analysis, Docker containerization, and deployment.
Table of Contents
1.	Prerequisites
2.	Project Structure
3.	Jenkins Pipeline Overview
4.	Step 1: Git Repository Integration
5.	Step 2: Building and Testing
6.	Step 3: SonarQube Integration
7.	Step 4: Docker Containerization
8.	Step 5: Deployment
9.	Complete Jenkinsfile
10.	Setup Instructions
11.	Troubleshooting
Prerequisites
Before starting, ensure you have the following installed:
•	Jenkins server (with necessary plugins)
•	Git
•	Node.js and npm
•	Docker
•	SonarQube server
•	MongoDB (for local testing)
Required Jenkins plugins:
•	Git Integration
•	Docker Pipeline
•	SonarQube Scanner
•	JUnit
Project Structure
Todo-Web/
├── web-service/               # Frontend service
│   ├── src/                   # Source code for the frontend
│   │   ├── components/        # React or Vue components (if applicable)
│   │   ├── pages/             # Pages for the application
│   │   └── App.js             # Main entry point for the frontend
│   ├── public/                # Static assets like index.html
│   │   └── index.html         # Frontend entry HTML file
│   ├── package.json           # Frontend dependencies
│   ├── webpack.config.js      # Webpack configuration (if applicable)
│   └── tests/                 # Unit tests for the frontend
│       └── App.test.js        # Example test file
├── worker-service/            # Backend service
│   ├── src/                   # Source code for backend
│   │   ├── models/            # Database models (if applicable)
│   │   ├── routes/            # API routes
│   │   └── server.js          # Main backend server file
│   ├── package.json           # Backend dependencies
│   └── tests/                 # Unit tests for the backend
│       └── server.test.js     # Example test file
├── docker-compose.yml         # Docker Compose configuration file
├── Jenkinsfile                # Jenkins pipeline configuration file
└── README.md                  # Project documentationJenkins Pipeline Overview
 

The pipeline will consist of the following stages:
1.	Checkout: Pull code from the Git repository
2.	SonarQube Analysis: Run code quality analysis
3.	Build: Build the application components
4.	Testing: Run tests for frontend and backend
5.	Docker Build: Create Docker images
6.	Docker Push: Push images to Docker Hub
7.	Deploy: Deploy the application using Docker Compose
Step 1: Git Repository Integration
The pipeline starts by checking out the code from your Git repository:
stage('Checkout') {
    steps {
        cleanWs()
        checkout([
            $class: 'GitSCM',
            branches: [[name: 'main']],
            extensions: [[$class: 'CleanBeforeCheckout']],
            userRemoteConfigs: [[url: 'https://github.com/bhanreddy1973/Todo-Web.git']]
        ])
    }
}
Commands to clone the repository locally:
git clone https://github.com/bhanreddy1973/Todo-Web.git
cd Todo-Web
 
 

Step 2: Building and Testing
For a Node.js application, we'll use npm to build and test both frontend and backend components:
 
stage('Testing Frontend') {
    steps {
        dir('web-service') {
            bat '''
                @echo off
                echo Running npm install in web-service
                npm install || exit /b 1
                echo Running tests in web-service
                npm test || exit /b 1
            '''
        }
    }
    post {
        always {
            junit allowEmptyResults: true, testResults: 'web-service/junit.xml'
        }
    }
}

stage('Testing Backend') {
    steps {
        dir('worker-service') {
            bat '''
                @echo off
                echo Running npm install in worker-service
                npm install || exit /b 1
                echo Running tests in worker-service
                npm test || exit /b 1
            '''
        }
    }
    post {
        always {
            junit allowEmptyResults: true, testResults: 'worker-service/junit.xml'
        }
    }
}
Commands to run the tests locally:
# Frontend tests
cd web-service
npm install
npm test

 

# Backend tests
cd ../worker-service
npm install
npm test
 

Step 3: SonarQube Integration
Adding SonarQube analysis to check code quality:
stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('SonarQube') {
            bat '''
                @echo off
                echo Running SonarQube analysis...
                
                # Frontend Analysis
                cd web-service
                sonar-scanner \
                  -Dsonar.projectKey=todo-app-frontend \
                  -Dsonar.projectName="Todo App Frontend" \
                  -Dsonar.sources=. \
                  -Dsonar.exclusions=node_modules/**,coverage/**,build/** \
                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                
                # Backend Analysis
                cd ../worker-service
                sonar-scanner \
                  -Dsonar.projectKey=todo-app-backend \
                  -Dsonar.projectName="Todo App Backend" \
                  -Dsonar.sources=. \
                  -Dsonar.exclusions=node_modules/**,coverage/** \
                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
            '''
        }
    }
}
Commands to run SonarQube analysis locally:
# Install SonarScanner if not already installed
# Frontend analysis
cd web-service
sonar-scanner \
  -Dsonar.projectKey=todo-app-frontend \
  -Dsonar.projectName="Todo App Frontend" \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=your_sonar_token

# Backend analysis
cd ../worker-service
sonar-scanner \
  -Dsonar.projectKey=todo-app-backend \
  -Dsonar.projectName="Todo App Backend" \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=your_sonar_token
 
Step 4: Docker Containerization
Building Docker images for both frontend and backend:
stage('Docker Build') {
    steps {
        bat '''
            @echo off
            echo Building Docker images...
            call "%DOCKER_COMPOSE_PATH%" build || exit /b 1
        '''
    }
}
Docker-related commands:
# Build Docker images
docker-compose build

# List Docker images
docker images

# Test running the containers
docker-compose up -d
 
Step 5: Deployment
Deploying the application using Docker Compose:
stage('Deploy') {
    steps {
        script {
            bat '''
                @echo off
                echo Stopping previous deployment...
                call "%DOCKER_COMPOSE_PATH%" down || true
                echo Starting new deployment...
                call "%DOCKER_COMPOSE_PATH%" up -d || exit /b 1
            '''
        }
    }
}
Deployment commands:
# Stop existing deployment
docker-compose down

# Start new deployment
docker-compose up -d

# Check running containers
docker ps

# Access application
# Frontend: http://localhost:8083
# Backend API: http://localhost:4001
 
Complete Jenkinsfile
Here's the complete Jenkinsfile with all stages integrated:
pipeline {
    agent any
    
    environment {
        // Docker Configuration
        DOCKER_IMAGE_FRONTEND = 'bhanureddy1973/todo-app-frontend'
        DOCKER_IMAGE_BACKEND = 'bhanureddy1973/todo-app-backend'
        DOCKER_IMAGE_MONGO = 'mongo'
        
        // Path to compose-bridge.exe (using short path if needed)
        DOCKER_COMPOSE_PATH = 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\compose-bridge.exe'
        
        // SonarQube configuration
        SONAR_HOST_URL = 'http://localhost:9000'
    }
    
    stages {
        // Stage 1: Checkout Code with Retry
        stage('Checkout') {
            steps {
                cleanWs()
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'main']],
                    extensions: [[$class: 'CleanBeforeCheckout']],
                    userRemoteConfigs: [[url: 'https://github.com/bhanreddy1973/Todo-Web.git']]
                ])
            }
        }
        
        // Stage 2: SonarQube Analysis
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat '''
                        @echo off
                        echo Running SonarQube analysis...
                        
                        cd web-service
                        sonar-scanner ^
                          -Dsonar.projectKey=todo-app-frontend ^
                          -Dsonar.projectName="Todo App Frontend" ^
                          -Dsonar.sources=. ^
                          -Dsonar.exclusions=node_modules/**,coverage/**,build/**
                        
                        cd ../worker-service
                        sonar-scanner ^
                          -Dsonar.projectKey=todo-app-backend ^
                          -Dsonar.projectName="Todo App Backend" ^
                          -Dsonar.sources=. ^
                          -Dsonar.exclusions=node_modules/**,coverage/**
                    '''
                }
            }
        }
        
        // Stage 3: Build Docker Images
        stage('Build') {
            steps {
                bat '''
                    @echo off
                    echo Building Docker images...
                    call "%DOCKER_COMPOSE_PATH%" build || exit /b 1
                '''
            }
        }
        
        // Stage 4: Testing - Frontend
        stage('Testing Frontend') {
            steps {
                dir('web-service') {
                    bat '''
                        @echo off
                        echo Running npm install in web-service
                        npm install || exit /b 1
                        echo Running tests in web-service
                        npm test || exit /b 1
                    '''
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'web-service/junit.xml'
                }
            }
        }
        
        // Stage 5: Testing - Backend
        stage('Testing Backend') {
            steps {
                dir('worker-service') {
                    bat '''
                        @echo off
                        echo Running npm install in worker-service
                        npm install || exit /b 1
                        echo Running tests in worker-service
                        npm test || exit /b 1
                    '''
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'worker-service/junit.xml'
                }
            }
        }
        
        // Stage 6: Docker Push with fixed credential variables
        stage('Docker Push') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        bat '''
                            @echo off
                            echo Logging in to Docker Hub...
                            :: Create a temporary file with the password
                            echo %DOCKER_PASS% > docker_password.txt
                            
                            :: Use the file for non-interactive login
                            type docker_password.txt | docker login -u %DOCKER_USER% --password-stdin
                            
                            :: Remove the temporary file immediately
                            del docker_password.txt
                            
                            echo Tagging images...
                            docker tag %DOCKER_IMAGE_FRONTEND% %DOCKER_IMAGE_FRONTEND%:latest
                            docker tag %DOCKER_IMAGE_BACKEND% %DOCKER_IMAGE_BACKEND%:latest
                            
                            echo Pushing images to Docker Hub...
                            docker push %DOCKER_IMAGE_FRONTEND%:latest
                            docker push %DOCKER_IMAGE_BACKEND%:latest
                            
                            echo Logging out from Docker Hub...
                            docker logout
                        '''
                    }
                }
            }
        }
        
        // Stage 7: Deployment
        stage('Deploy') {
            steps {
                script {
                    bat '''
                        @echo off
                        echo Stopping previous deployment...
                        call "%DOCKER_COMPOSE_PATH%" down || true
                        echo Starting new deployment...
                        call "%DOCKER_COMPOSE_PATH%" up -d || exit /b 1
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully. Access application at http://localhost:8083'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
        cleanup {
            script {
                bat '''
                    @echo off
                    echo Cleaning up Docker resources...
                    call "%DOCKER_COMPOSE_PATH%" down || true
                '''
            }
        }
    }
}
 
Setup Instructions
1. Jenkins Setup
1.	Install Jenkins:
2.	# Download and install Jenkins from https://www.jenkins.io/download/
3.	# Start Jenkins service
4.	Install Required Plugins:
o	Go to Jenkins Dashboard > Manage Jenkins > Manage Plugins
o	Install: Git Integration, Docker Pipeline, SonarQube Scanner, JUnit
5.	Configure Jenkins Credentials:
o	Go to Jenkins Dashboard > Manage Jenkins > Manage Credentials
o	Add Docker Hub credentials with ID 'dockerhub-creds'
2. SonarQube Setup
1.	Install SonarQube:
2.	# Download and install SonarQube from https://www.sonarqube.org/downloads/
3.	# Start SonarQube server
4.	Configure SonarQube in Jenkins:
o	Go to Jenkins Dashboard > Manage Jenkins > Configure System
o	Find SonarQube section and add your SonarQube server details
 
3. Docker Setup
1.	Install Docker:
2.	# Download and install Docker Desktop from https://www.docker.com/products/docker-desktop
3.	Verify Docker Installation:
4.	docker --version
5.	docker-compose –version
 
 
4. Jenkins Pipeline Setup
1.	Create a New Pipeline:
o	Go to Jenkins Dashboard > New Item
o	Enter name and select "Pipeline"
o	Click "OK"
2.	Configure Pipeline:
o	In the pipeline configuration page, scroll down to the "Pipeline" section
o	Select "Pipeline script" and paste the complete Jenkinsfile
3.	Run the Pipeline:
o	Click "Save" and then "Build Now"
 
 
 
 
Troubleshooting
Common Issues and Solutions
1.	Docker Login Fails:
o	Ensure your Docker Hub credentials are correctly configured in Jenkins
o	Check if Docker is running on the Jenkins server
2.	SonarQube Analysis Fails:
o	Verify SonarQube server is running and accessible
o	Check if SonarQube token is correctly configured
o	Ensure sonar-scanner is installed on the Jenkins server
3.	npm Tests Fail:
o	Verify Node.js and npm are installed on the Jenkins server
o	Check if the test scripts are correctly configured in package.json
4.	Docker Compose Path Issues:
o	Update the DOCKER_COMPOSE_PATH variable in the Jenkinsfile to match your system's path
o	For Windows, ensure you're using the correct path format
5.	Deployment Fails:
o	Check if ports are already in use (8083, 4001, 27017)
o	Verify Docker Compose file is valid
o	Ensure Docker has enough resources allocated
6.	Git Checkout Fails:
o	Verify the Git repository URL is correct
o	Check if Jenkins has proper network access to reach GitHub
o	Ensure Jenkins has necessary permissions to clone the repository
7.	JUnit Test Results Not Showing:
o	Make sure your test framework is configured to output JUnit XML reports
o	Verify the path to JUnit XML files in the Jenkinsfile
Docker Configuration Details
Docker Compose File
The project uses a Docker Compose file to define and run the multi-container application:
version: '3.8'

services:
  web-service:
    build:
      context: ./web-service
    container_name: bhanu-bcd26-web-service
    image: bhanureddy1973/todo-app-frontend:latest
    ports:
      - "8083:3000"  # Host:Container (Access frontend on host port 8083)
    environment:
      - CHOKIDAR_USEPOLLING=true
    depends_on:
      - worker-service
    restart: unless-stopped

  worker-service:
    build:
      context: ./worker-service
    container_name: bhanu-bcd26-worker-service
    image: bhanureddy1973/todo-app-backend:latest
    ports:
      - "4001:4001"  # Host:Container (Access backend on host port 4001)
    environment:
      - MONGO_URI=mongodb://mongo:27017/todo_db
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo
    container_name: bhanu-bcd26-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
Frontend Dockerfile
The frontend Dockerfile builds a Node.js application:
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
Backend Dockerfile
The backend Dockerfile builds a Node.js server:
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4001

CMD ["node", "server.js"]
Understanding the Pipeline Flow
1.	Checkout Stage:
o	Cleans the workspace to ensure a fresh start
o	Clones the Git repository to get the latest code
2.	SonarQube Analysis Stage:
o	Runs static code analysis on both frontend and backend
o	Identifies code quality issues, bugs, and vulnerabilities
o	Generates reports that can be viewed in the SonarQube dashboard
3.	Build Stage:
o	Uses Docker Compose to build images for both frontend and backend
o	Creates containerized versions of the application components
4.	Testing Stages:
o	Runs npm tests for both frontend and backend
o	Generates JUnit XML reports for test results visualization
o	Ensures code quality and functionality
5.	Docker Push Stage:
o	Securely logs into Docker Hub using credentials
o	Tags the built images with the latest tag
o	Pushes the images to Docker Hub for storage and distribution
6.	Deploy Stage:
o	Stops any existing deployment
o	Starts a new deployment using Docker Compose
o	Makes the application accessible at http://localhost:8083
Monitoring and Maintenance
Checking Container Status
# List all running containers
docker ps

# Check logs for frontend
docker logs bhanu-bcd26-web-service

# Check logs for backend
docker logs bhanu-bcd26-worker-service

# Check logs for MongoDB
docker logs bhanu-bcd26-mongo
Scaling the Application
To scale the application for higher loads:
# Scale up the backend service
docker-compose up -d --scale worker-service=3

# Note: You'll need to adjust the docker-compose.yml to remove the container_name
# and use a load balancer for proper scaling
Backup and Restore MongoDB Data
# Backup MongoDB data
docker exec bhanu-bcd26-mongo sh -c 'mongodump --archive' > mongodb_backup.dump

# Restore MongoDB data
docker exec -i bhanu-bcd26-mongo sh -c 'mongorestore --archive' < mongodb_backup.dump
Security Considerations
1.	Docker Hub Credentials:
o	Store Docker Hub credentials securely in Jenkins
o	Use temporary files for passwords and delete them immediately
2.	Container Security:
o	Use official Docker images as base
o	Regularly update base images to get security patches
o	Scan images for vulnerabilities using tools like Docker Scout
3.	Access Control:
o	Restrict access to the Jenkins server
o	Use HTTPS for all communications
o	Implement proper authentication for the Todo application
Conclusion
This Jenkins pipeline successfully integrates Git, npm, SonarQube, Docker, and deployment processes for a Todo application. The pipeline ensures code quality through automated testing and static analysis, containerizes the application for consistent deployment, and makes it accessible through Docker containers.
The setup provides a solid foundation for continuous integration and deployment that can be extended with additional stages like:
•	Automated user acceptance testing
•	Performance testing
•	Canary deployments
•	Monitoring integration
By following this guide, you can establish a robust CI/CD pipeline that improves development velocity while maintaining code quality and deployment reliability.
________________________________________
Command Reference Sheet
Git Commands
git clone https://github.com/bhanreddy1973/Todo-Web.git
git checkout main
git pull
Docker Commands
# Build images
docker-compose build

# List images
docker images

# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# List running containers
docker ps

# View container logs
docker logs [container_name]

# Login to Docker Hub
docker login -u [username]

# Push images
docker push [image_name]:[tag]

# Logout from Docker Hub
docker logout
Node.js Commands
# Install dependencies
npm install

# Run tests
npm test

# Start application
npm start
SonarQube Commands
# Run SonarQube analysis
sonar-scanner \
  -Dsonar.projectKey=[project_key] \
  -Dsonar.projectName="[project_name]" \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=[sonar_token]
Jenkins Commands
# Start Jenkins (Windows)
net start jenkins

# Stop Jenkins (Windows)
net stop jenkins


