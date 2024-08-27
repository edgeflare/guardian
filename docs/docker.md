# Running WireGuard in Docker

## 1. generate keys. required for each of WireGuard peers

```shell
wg genkey | tee p1_privatekey | wg pubkey > p1_publickey
wg genkey | tee p2_privatekey | wg pubkey > p2_publickey
wg genkey | tee p3_privatekey | wg pubkey > p3_publickey
```

## 2. create WireGuard configuration file

```shell
cat <<EOF > wg0.conf
[Interface]
PrivateKey = $(cat p1_privatekey)
ListenPort = 51820
Address = 10.0.0.1/24 # server's private IP, adjust as needed
DNS = 10.0.0.1, 1.1.1.1, 8.8.8.8, 9.9.9.9 # DNS servers, adjust as needed
MTU = 1420

[Peer]
PublicKey = $(cat p2_publickey)
AllowedIPs = 10.0.0.2/32
# Endpoint = 0.0.0.0:51820 # if peer is reachable publicly, replace 0.0.0.0 with peer's public IP
PersistentKeepalive = 25

[Peer]
PublicKey = $(cat p3_publickey)
AllowedIPs = 10.0.0.3/32
# Endpoint = 0.0.0.0:51820 # peer's public IP
PersistentKeepalive = 25

# more peers can be added here
EOF
```

## 3. ensure Corefile

```shell
cat <<EOF > Corefile
.:53 {
  errors
  health
  ready
  forward . 10.0.0.1 1.1.1.1 8.8.8.8 9.9.9.9
  cache 30
  loop
  reload
  dnssec
  loadbalance
}
EOF
```

```shell
curl -OL https://raw.githubusercontent.com/edgeflare/guardian/main/docs/docker-compose.yaml
docker compose up -d
```
