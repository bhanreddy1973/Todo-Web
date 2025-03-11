pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', // Replace 'main' with your branch name
                    url: 'https://github.com/bhanreddy1973/Todo-Web.git',
                    credentialsId: 'github-credentials' // Replace with your credentials ID
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                // Add your build commands here
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                // Add test commands here
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying...'
                // Add deployment commands here
            }
        }
    }
}
