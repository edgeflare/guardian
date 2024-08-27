#!/bin/bash

set -eo pipefail

# Install required packages
sudo apt install -y curl open-iscsi nfs-common

# Get the public IP of the machine
PUBLIC_IP=$(curl -s https://api.ipify.org)

# Set KUBECONFIG environment variable
KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# Function to install K3s if not already installed
install_k3s() {
  if [ ! -f "$KUBECONFIG" ]; then
    curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC=" \
      server \
      --disable=traefik \
      --node-external-ip $PUBLIC_IP \
      --kubelet-arg=allowed-unsafe-sysctls=net.ipv4.ip_forward,net.ipv4.conf.all.src_valid_mark,net.ipv6.conf.all.forwarding \
    " sh -
  fi
}

# Function to install Istio
install_istio() {
  local ISTIO_VERSION=1.23.0

  # Download and install Istioctl
  curl -L https://github.com/istio/istio/releases/download/$ISTIO_VERSION/istioctl-$ISTIO_VERSION-linux-amd64.tar.gz -o istioctl.tar.gz
  sudo tar -C /usr/local/bin/ -xvf istioctl.tar.gz
  rm istioctl.tar.gz

  # Install Istio
  sudo KUBECONFIG=$KUBECONFIG istioctl install --set profile=demo --skip-confirmation --verify

  # Enable Gateway API support in Istiod
  sudo k3s kubectl -n istio-system set env deploy/istiod PILOT_ENABLE_ALPHA_GATEWAY_API=true

  # Create Istio GatewayClass
  cat <<EOF | sudo k3s kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
 name: istio
spec:
 controllerName: istio.io/gateway-controller
EOF
}

# Function to install Cert-Manager
install_cert_manager() {
  local CERT_MANAGER_VERSION=v1.15.3

  # Install Cert Manager
  sudo k3s kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/$CERT_MANAGER_VERSION/cert-manager.yaml

  # Wait for Cert-Manager pods to be ready
  sudo k3s kubectl wait --namespace cert-manager \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/instance=cert-manager \
    --timeout=120s

  # Create a self-signed ClusterIssuer
  cat <<EOF | sudo k3s kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
 name: selfsigned
spec:
 selfSigned: {}
EOF

  # Create letsencrypt-staging ClusterIssuer
#   cat <<EOF | sudo k3s kubectl apply -f -
# apiVersion: cert-manager.io/v1
# kind: ClusterIssuer
# metadata:
#   name: letsencrypt-staging
# spec:
#   acme:
#     email: user@example.com ## <---------------------------- REPLACE EMAIL AND UNCOMMENT
#     server: https://acme-staging-v02.api.letsencrypt.org/directory
#     privateKeySecretRef:
#       name: letsencrypt-staging-clusterissuer-account-key
#     solvers:
#     - http01:
#         ingress:
#           ingressClassName: istio
# EOF

#   # Create letsencrypt-prod ClusterIssuer
#   cat <<EOF | sudo k3s kubectl apply -f -
# apiVersion: cert-manager.io/v1
# kind: ClusterIssuer
# metadata:
#   name: letsencrypt-prod
# spec:
#   acme:
#     email: user@example.com ## <---------------------------- REPLACE EMAIL AND UNCOMMENT
#     server: https://acme-v02.api.letsencrypt.org/directory
#     privateKeySecretRef:
#       name: letsencrypt-prod-clusterissuer-account-key
#     solvers:
#     - http01:
#         ingress:
#           ingressClassName: istio
# EOF
}

# Install K3s
install_k3s

# Install Gateway API
sudo k3s kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.1.0/experimental-install.yaml

# Install Istio
install_istio

# Install Cert-Manager
install_cert_manager

### /usr/local/bin/k3s-uninstall.sh