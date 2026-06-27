# Donaton Frontend — Despliegue en Amazon EKS

> **Evaluación Parcial N°3 — ISY1101 DevOps**  
> Dupla: Remi García / Ricardo Díaz  
> Rol de este repositorio: **Frontend** (React + Vite + TypeScript + Tailwind CSS)  
> Orquestación: **Amazon EKS** | Pipeline: **GitHub Actions → ECR → EKS**

---

## Descripción general

Este repositorio contiene el frontend de **Donaton**, una plataforma de coordinación de donaciones humanitarias. Para esta evaluación se implementó únicamente la **vista de donaciones**, con el objetivo de demostrar la comunicación real entre el frontend desplegado en EKS y el backend de Ricardo Díaz (desplegado en una cuenta AWS separada y expuesto públicamente via LoadBalancer).

La arquitectura implementada cubre:

- Clúster EKS con Auto Mode en AWS Academy (us-east-1)
- Imagen Docker publicada en Amazon ECR
- Despliegue via manifiestos YAML de Kubernetes (Deployment + Service LoadBalancer)
- Escalamiento automático con HPA (Horizontal Pod Autoscaler)
- Pipeline CI/CD completo con GitHub Actions
- Observabilidad con CloudWatch y kubectl

---

## Arquitectura

```
Usuario
  │
  ▼
[LoadBalancer EKS - Frontend]        [LoadBalancer EKS - Backend (Ricardo)]
  │  donaton-front-eks (us-east-1)     donaton-back-eks (us-east-1)
  │                                      │
  ▼                                      ▼
[Pod: donaton-frontend]  ──HTTP──►  [Pod: donaton-backend]
  ECR: TU_ACCOUNT_ID                  ECR: ACCOUNT_RICARDO
  Imagen: donaton-frontend:eks-v1     Imagen: donaton-backend:eks-v1
```

**Decisión arquitectónica:** al trabajar con cuentas AWS Academy separadas, la comunicación entre servicios se realiza mediante URL pública del LoadBalancer del backend. Esto se configura como variable de entorno `VITE_API_URL` en el Deployment de Kubernetes.

---

## Estructura del repositorio

```
donaton-frontend-eks/
├── src/
│   ├── components/
│   │   └── Donaciones/          # Vista de donaciones (componente principal)
│   └── main.tsx
├── k8s/
│   ├── namespace.yaml           # Namespace: donaton
│   ├── frontend-deployment.yaml # Deployment del frontend
│   ├── frontend-service.yaml    # Service tipo LoadBalancer
│   └── frontend-hpa.yaml        # Horizontal Pod Autoscaler
├── .github/
│   └── workflows/
│       └── deploy-eks.yml       # Pipeline CI/CD
├── Dockerfile                   # Imagen de producción (multi-stage)
├── .env.example                 # Variables de entorno requeridas
└── README.md
```

---

## Requisitos previos

### Herramientas locales

| Herramienta | Version minima | Instalacion |
|---|---|---|
| AWS CLI | v2 | https://aws.amazon.com/cli/ |
| kubectl | v1.30+ | https://kubernetes.io/docs/tasks/tools/ |
| Docker Desktop | v24+ | https://www.docker.com/products/docker-desktop/ |
| Node.js | v18+ | https://nodejs.org/ |

### Variables de entorno

Crear un archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://URL_PUBLICA_BACKEND_RICARDO
```

> Esta URL corresponde al EXTERNAL-IP del LoadBalancer del backend de Ricardo. Se debe actualizar cada vez que la sesion de AWS Academy se reinicie.

---

## Configuracion del cluster EKS

### Cluster creado

| Parametro | Valor |
|---|---|
| Nombre | `donaton-front-eks` |
| Region | `us-east-1` |
| Version Kubernetes | 1.35 |
| Modo | EKS Auto Mode |
| VPC | VPC Predeterminada AWS Academy |
| Subredes | 5 subredes publicas (us-east-1a/b/c/d/f) |
| Endpoint access | Publico y Privado |
| Logs habilitados | api, audit, authenticator, controllerManager, scheduler |

### Roles IAM utilizados

| Rol | Proposito |
|---|---|
| `LabEksClusterRole` | Permite al control plane de EKS gestionar recursos AWS |
| `LabEksNodeRole` | Permite a los nodos EC2 unirse al cluster y acceder a ECR |

**Justificacion:** AWS Academy provee estos roles preconfigurados con los permisos minimos necesarios para operar EKS. El `LabEksClusterRole` se asigna al control plane y el `LabEksNodeRole` a los nodos worker.

### Conectar kubectl al cluster

```powershell
# Configurar credenciales AWS Academy
aws configure
aws configure set aws_session_token "TU_SESSION_TOKEN"

# Descargar kubeconfig
aws eks update-kubeconfig --region us-east-1 --name donaton-front-eks

# Verificar conexion
kubectl get nodes
```

---

## Imagen Docker

### Dockerfile (multi-stage)

```dockerfile
# Etapa 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Etapa 2: Produccion con Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Publicar imagen en ECR

```bash
# Login ECR
aws ecr get-login-password --region us-east-1 | docker login \
  --username AWS \
  --password-stdin TU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build, tag y push
docker build -t donaton-frontend \
  --build-arg VITE_API_URL=http://URL_BACKEND_RICARDO .

docker tag donaton-frontend:latest \
  TU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/donaton-frontend:eks-v1

docker push \
  TU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/donaton-frontend:eks-v1
```

> Reemplazar `TU_ACCOUNT_ID` con el ID de 12 digitos de tu cuenta AWS.

---

## Manifiestos de Kubernetes

### Despliegue completo

```bash
cd k8s/

# 1. Crear namespace
kubectl apply -f namespace.yaml

# 2. Desplegar frontend
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# 3. Configurar autoscaling
kubectl apply -f frontend-hpa.yaml

# Verificar
kubectl get pods -n donaton
kubectl get svc -n donaton
kubectl get hpa -n donaton
```

### frontend-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: donaton-frontend
  namespace: donaton
spec:
  replicas: 1
  selector:
    matchLabels:
      app: donaton-frontend
  template:
    metadata:
      labels:
        app: donaton-frontend
    spec:
      containers:
        - name: donaton-frontend
          image: TU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/donaton-frontend:eks-v1
          ports:
            - containerPort: 80
          env:
            - name: VITE_API_URL
              value: "http://URL_PUBLICA_BACKEND_RICARDO"
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
```

### frontend-service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: donaton-frontend
  namespace: donaton
spec:
  type: LoadBalancer
  selector:
    app: donaton-frontend
  ports:
    - port: 80
      targetPort: 80
```

### frontend-hpa.yaml

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: donaton-frontend-hpa
  namespace: donaton
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: donaton-frontend
  minReplicas: 1
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

**Justificacion del umbral 70% CPU:** valor recomendado para aplicaciones web stateless. Permite absorber picos de trafico antes de que la latencia se degrade, sin escalar prematuramente. Con minimo 1 replica y maximo 5, el sistema puede multiplicar su capacidad hasta 5x automaticamente.

---

## Pipeline CI/CD

### Secrets configurados en GitHub

| Secret | Descripcion |
|---|---|
| `AWS_ACCESS_KEY_ID` | Credencial de acceso AWS Academy |
| `AWS_SECRET_ACCESS_KEY` | Credencial secreta AWS Academy |
| `AWS_SESSION_TOKEN` | Token de sesion AWS Academy (renovar cada sesion) |
| `AWS_REGION` | `us-east-1` |
| `AWS_ACCOUNT_ID` | ID de cuenta AWS (12 digitos) |
| `EKS_CLUSTER_NAME` | `donaton-front-eks` |
| `ECR_REPOSITORY` | `donaton-frontend` |
| `VITE_API_URL` | URL publica del backend de Ricardo |

> Los valores sensibles nunca se exponen en el codigo. Se gestionan exclusivamente como Secrets en GitHub Actions.

### Flujo del pipeline (.github/workflows/deploy-eks.yml)

```
Push a main
    │
    ▼
[1. Checkout codigo]
    │
    ▼
[2. Configurar credenciales AWS]
    │
    ▼
[3. Login en Amazon ECR]
    │
    ▼
[4. Docker build + tag + push → ECR]
    │
    ▼
[5. Actualizar kubeconfig]
    │
    ▼
[6. kubectl apply → EKS]
    │
    ▼
[Aplicacion actualizada en cluster]
```

### deploy-eks.yml

```yaml
name: CI/CD Donaton Frontend EKS

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout codigo
        uses: actions/checkout@v3

      - name: Configurar credenciales AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-session-token: ${{ secrets.AWS_SESSION_TOKEN }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Login en Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build y push imagen Docker
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: eks-v1
        run: |
          docker build \
            --build-arg VITE_API_URL=${{ secrets.VITE_API_URL }} \
            -t $ECR_REGISTRY/${{ secrets.ECR_REPOSITORY }}:$IMAGE_TAG .
          docker push $ECR_REGISTRY/${{ secrets.ECR_REPOSITORY }}:$IMAGE_TAG

      - name: Actualizar kubeconfig
        run: |
          aws eks update-kubeconfig \
            --region ${{ secrets.AWS_REGION }} \
            --name ${{ secrets.EKS_CLUSTER_NAME }}

      - name: Desplegar en EKS
        run: |
          kubectl apply -f k8s/namespace.yaml
          kubectl apply -f k8s/frontend-deployment.yaml
          kubectl apply -f k8s/frontend-service.yaml
          kubectl apply -f k8s/frontend-hpa.yaml
          kubectl rollout status deployment/donaton-frontend -n donaton
```

---

## Validacion del despliegue

### Verificar pods y servicios

```bash
# Estado de pods
kubectl get pods -n donaton

# Obtener URL publica del frontend
kubectl get svc donaton-frontend -n donaton

# Logs del pod
kubectl logs -l app=donaton-frontend -n donaton

# Metricas de uso
kubectl top pods -n donaton
kubectl top nodes
```

### Resultado esperado

```
NAME                                  READY   STATUS    RESTARTS   AGE
donaton-frontend-xxxx-xxxx            1/1     Running   0          2m

NAME                TYPE           EXTERNAL-IP                        PORT(S)
donaton-frontend    LoadBalancer   abc123.us-east-1.elb.amazonaws.com 80:XXXXX/TCP
```

Abrir el EXTERNAL-IP en el navegador para acceder al frontend. La vista de donaciones debe cargar y enviar datos al backend de Ricardo correctamente.

---

## Autoscaling — HPA

### Validar HPA

```bash
kubectl get hpa -n donaton
```

### Simular carga para activar escalado

```bash
# Entrar al pod
kubectl exec -it <nombre-pod> -n donaton -- sh

# Ejecutar loop de carga
while true; do wget -q -O- http://localhost:80 > /dev/null; done
```

### Desde otra terminal, observar el escalado

```bash
kubectl get hpa -n donaton -w
```

Resultado esperado: el HPA aumenta replicas de 1 → 2 → 3 segun el uso de CPU supere el 70%.

---

## Tolerancia a fallos (Auto-healing)

```bash
# Obtener pods actuales
kubectl get pods -n donaton -l app=donaton-frontend

# Eliminar un pod (simula fallo)
kubectl delete pod <nombre-pod> -n donaton

# Observar como Kubernetes crea uno nuevo automaticamente
kubectl get pods -n donaton -w
```

El ReplicaSet detecta que hay menos replicas de las deseadas y crea un pod nuevo en segundos.

---

## Observabilidad

### CloudWatch — Logs del control plane

1. Ir a **CloudWatch → Logs → Log groups**
2. Buscar: `/aws/eks/donaton-front-eks/cluster`
3. Revisar logs de: `kube-apiserver`, `audit`, `scheduler`, `controllerManager`

### Metricas desde kubectl

```bash
kubectl top nodes
kubectl top pods -n donaton
```

---

## Comunicacion Frontend → Backend

La vista de donaciones del frontend realiza llamadas HTTP a la API del backend de Ricardo mediante la variable de entorno `VITE_API_URL`. Esta URL corresponde al EXTERNAL-IP del LoadBalancer de su cluster EKS en su cuenta AWS separada.

**Endpoint utilizado:** `GET /api/donaciones` — retorna el listado de donaciones registradas.

Para actualizar la URL del backend (cuando cambia la sesion de AWS Academy):
1. Actualizar el Secret `VITE_API_URL` en GitHub → Settings → Secrets
2. Hacer un nuevo push a `main` para que el pipeline redespliegue con la nueva URL

---

## Problemas encontrados y soluciones

| Problema | Solucion aplicada |
|---|---|
| Cuentas AWS separadas impiden DNS interno | Comunicacion via URL publica del LoadBalancer |
| Session token de AWS Academy expira | Secrets en GitHub se actualizan al inicio de cada sesion |
| `VITE_API_URL` debe estar en build time | Se pasa como `--build-arg` en el Dockerfile y como secret en el pipeline |

---

## Autores

| Nombre | Rol | GitHub |
|---|---|---|
| Remi Garcia | Frontend — EKS, ECR, Pipeline CI/CD | @rem-garcia |
| Ricardo Diaz | Backend — EKS, ECR, Pipeline CI/CD | @usuario-ricardo |

---

*Innovatech Chile — DuocUC 2025*