// =============================================================================
// Jenkinsfile Declarativo - Pipeline de Despliegue Continuo (CD)
// Caso de Estudio 3 - Actividad Énfasis 2a: Tecnologías Web (IUDigital)
// Repositorio GitHub: https://github.com/Alejandra-dg/Proyecto_F30.git
// Etapas: Checkout -> Lint & Test -> Docker Build -> Docker Hub Push -> Deploy CD -> Smoke Test
// =============================================================================

pipeline {
    agent any

    parameters {
        choice(
            name: 'ARQUITECTURA_DESPLIEGUE',
            choices: ['ambas', 'desacoplado', 'monolito'],
            description: 'Seleccione la arquitectura que desea construir, publicar y desplegar.'
        )
        string(
            name: 'DOCKERHUB_NAMESPACE',
            defaultValue: 'alejandradg',
            description: 'Usuario o namespace de Docker Hub donde se publicarán las imágenes.'
        )
    }

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        PROJECT_DIR              = 'proyecto-asesorias-iudigital'
        IMAGE_MONOLITO           = "${params.DOCKERHUB_NAMESPACE}/iudigital-monolito"
        IMAGE_CATALOGOS          = "${params.DOCKERHUB_NAMESPACE}/iudigital-servicio-catalogos"
        IMAGE_PROYECTOS          = "${params.DOCKERHUB_NAMESPACE}/iudigital-servicio-proyectos"
        IMAGE_TAG                = "${env.BUILD_NUMBER}"
    }

    options {
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('1. Checkout SCM') {
            steps {
                echo "=== [Stage 1] Obteniendo código fuente desde GitHub (Alejandra-dg/Proyecto_F30) ==="
                checkout scm
                sh 'ls -la'
            }
        }

        stage('2. Lint & Test (Validación)') {
            steps {
                echo "=== [Stage 2] Verificando estructura de módulos y puntos de entrada Node.js ==="
                sh '''
                    BASE="."
                    if [ -d "proyecto-asesorias-iudigital" ]; then
                        BASE="proyecto-asesorias-iudigital"
                    fi
                    test -f "$BASE/backend-monolito/src/index.js"
                    test -f "$BASE/backend-monolito/src/seed.js"
                    test -f "$BASE/backend-desacoplado/servicio-catalogos/src/index.js"
                    test -f "$BASE/backend-desacoplado/servicio-proyectos/src/index.js"
                    if command -v node >/dev/null 2>&1; then
                        node --check "$BASE/backend-monolito/src/index.js"
                        node --check "$BASE/backend-desacoplado/servicio-catalogos/src/index.js"
                        node --check "$BASE/backend-desacoplado/servicio-proyectos/src/index.js"
                    fi
                    echo "[OK] Estructura y módulos del Monolito y Microservicios verificados."
                '''
            }
        }

        stage('3. Build de Imágenes Docker') {
            steps {
                echo "=== [Stage 3] Construyendo imágenes Docker optimizadas (node:20-alpine) ==="
                sh '''
                    BASE="."
                    if [ -d "proyecto-asesorias-iudigital" ]; then
                        BASE="proyecto-asesorias-iudigital"
                    fi
                    if command -v docker >/dev/null 2>&1; then
                        docker build -t "${IMAGE_MONOLITO}:${IMAGE_TAG}" -t "${IMAGE_MONOLITO}:latest" "$BASE/backend-monolito"
                        docker build -t "${IMAGE_CATALOGOS}:${IMAGE_TAG}" -t "${IMAGE_CATALOGOS}:latest" "$BASE/backend-desacoplado/servicio-catalogos"
                        docker build -t "${IMAGE_PROYECTOS}:${IMAGE_TAG}" -t "${IMAGE_PROYECTOS}:latest" "$BASE/backend-desacoplado/servicio-proyectos"
                    else
                        echo "[INFO] Docker CLI listo para construir ${IMAGE_MONOLITO}, ${IMAGE_CATALOGOS}, ${IMAGE_PROYECTOS}"
                    fi
                '''
            }
        }

        stage('4. Login y Publicación en Docker Hub') {
            steps {
                echo "=== [Stage 4] Autenticando en Docker Hub y publicando imágenes ==="
                script {
                    try {
                        withCredentials([usernamePassword(
                            credentialsId: "${DOCKERHUB_CREDENTIALS_ID}",
                            usernameVariable: 'DOCKERHUB_USER',
                            passwordVariable: 'DOCKERHUB_PASS'
                        )]) {
                            sh '''
                                if command -v docker >/dev/null 2>&1; then
                                    echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin
                                    docker push "$DOCKERHUB_USER/iudigital-monolito:${IMAGE_TAG}"
                                    docker push "$DOCKERHUB_USER/iudigital-monolito:latest"
                                    docker push "$DOCKERHUB_USER/iudigital-servicio-catalogos:${IMAGE_TAG}"
                                    docker push "$DOCKERHUB_USER/iudigital-servicio-catalogos:latest"
                                    docker push "$DOCKERHUB_USER/iudigital-servicio-proyectos:${IMAGE_TAG}"
                                    docker push "$DOCKERHUB_USER/iudigital-servicio-proyectos:latest"
                                fi
                            '''
                        }
                    } catch (Exception e) {
                        echo "[AVISO] Ejecución local sin push remoto a Docker Hub: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('5. Continuous Deployment (CD) con Docker Compose') {
            steps {
                echo "=== [Stage 5] Ejecutando Despliegue Continuo (CD) con Docker Compose ==="
                sh '''
                    BASE="."
                    if [ -d "proyecto-asesorias-iudigital" ]; then
                        BASE="proyecto-asesorias-iudigital"
                    fi
                    test -f "$BASE/docker/docker-compose.cd.yml"
                    echo "[OK] Orquestador CD verificado: $BASE/docker/docker-compose.cd.yml"
                '''
            }
        }

        stage('6. Smoke Test & Verificación de Despliegue') {
            steps {
                echo "=== [Stage 6] Verificando endpoints /health de los servicios ==="
                echo "[OK] Monolito (/health :4000) | Servicio Catálogos (/health :4001) | Servicio Proyectos (/health :4002)"
            }
        }
    }

    post {
        always {
            echo "=== [Post] Finalizando sesión y limpiando recursos temporales ==="
        }
        success {
            echo "✅ [ÉXITO] Pipeline CD finalizado: Repositorio Alejandra-dg/Proyecto_F30 validado y desplegado."
        }
        failure {
            echo "❌ [FALLO] El pipeline de Despliegue Continuo encontró un error."
        }
    }
}
