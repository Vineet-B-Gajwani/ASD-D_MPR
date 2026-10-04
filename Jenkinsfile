
pipeline {
    agent any

    environment {
        PATH = "/Users/aryankashid/.docker/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out Logistics project source code'
                checkout scm
            }
        }

        stage('Verify Development Tools') {
            steps {
                echo 'Checking development environment'

                sh 'java -version'
                sh 'git --version'
                sh 'node --version'
                sh 'npm --version'

                echo 'Checking Docker CLI'
                sh 'docker --version'
                sh 'docker compose version'

                echo 'Checking Docker Engine connectivity'
                sh 'docker info'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies'
                sh 'npm ci'
            }
        }

        stage('Validate Application') {
            steps {
                echo 'Checking Node.js application syntax'
                sh 'node --check server.js'
            }
        }

        stage('Validate Docker Compose') {
            steps {
                echo 'Validating Docker Compose configuration'
                sh 'docker compose config --quiet'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Logistics application images'
                sh 'docker compose build'
            }
        }

stage('Deploy Application') {
    steps {
        echo 'Deploying Logistics application'
        sh 'docker compose up -d'
    }
}

stage('Verify Deployment') {
    steps {
        echo 'Verifying deployed containers'
        sh 'docker compose ps'
    }
}
    }

    post {
        success {
            echo 'SUCCESS: Logistics CI Pipeline completed!'
        }

        failure {
            echo 'FAILED: Please check Jenkins Console Output.'
        }

        always {
            echo 'Jenkins pipeline execution finished.'
        }
    }
}