pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'maulang18/aduanas.cf:latest'
        CONTAINER_NAME_DEV = 'AduanasCFDev'
        PORT_DEV = '10114'
        PORT_CONTAINER = '80'
        COMPOSE_NAME = '/home/administrador/docker-compose-castrofallas.yml'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials-id'
        WORKSPACE_TMP_DIR = '/tmp/jenkins'
    }

    stages {
        stage('Check Dev Container Running') {
            steps {
                script {
                    def devContainerRunning = sh(script: "docker ps -q -f name=${CONTAINER_NAME_DEV}", returnStdout: true).trim()
                    if (devContainerRunning) {
                        env.DEV_CONTAINER_RUNNING = "true"
                    } else {
                        env.DEV_CONTAINER_RUNNING = "false"
                    }
                }
            }
        }

        stage('Docker Build') {
            when {
                expression { env.DEV_CONTAINER_RUNNING == 'false' }
            }
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE} ."
                }
            }
        }

        stage('Docker Run (Development)') {
            when {
                expression { env.GIT_BRANCH == 'origin/develop' }
            }
            steps {
                script {
                    if (env.DEV_CONTAINER_RUNNING == 'true') {
                        echo 'Development container is already running.'
                    } else {
                        sh "docker run -d -p ${PORT_DEV}:${PORT_CONTAINER} --name ${CONTAINER_NAME_DEV} ${DOCKER_IMAGE}"
                    }
                }
            }
        }

        stage('Docker Compose Up (Production)') {
            when {
                expression { env.GIT_BRANCH == 'origin/master' }
            }
            steps {
                script {
                    def devContainerRunning = sh(script: "docker ps -q -f name=${CONTAINER_NAME_DEV}", returnStdout: true).trim()
                    if (devContainerRunning) {
                        sh "docker stop ${CONTAINER_NAME_DEV} || true"
                        sh "docker rm ${CONTAINER_NAME_DEV} || true"
                    }
                    dir('/home/administrador') {
                        sh "docker-compose -f ${COMPOSE_NAME} up -d"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                echo 'Cleaning up unused Docker images...'
                sh "docker image prune -f"
            }
        }

        success {
            script {
                echo 'Pipeline succeeded!'
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}"
                    sh "docker push ${DOCKER_IMAGE}"
                }
            }
        }

        failure {
            script {
                echo 'Pipeline failed!'
            }
        }
    }
}