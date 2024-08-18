# WireGuard peer config in a mesh network

```shell
# Peer1 (Gateway)
[Interface]
Address = 10.0.0.1/24
PrivateKey = <PRIVATE_KEY>
ListenPort = 51820
MTU = 1420

[Peer]
PublicKey = <PUBLIC_KEY>
AllowedIPs = 10.0.0.2/32
Endpoint = <PEER2_PUBLIC_IP>:51820

[Peer]
PublicKey = <PUBLIC_KEY>
AllowedIPs = 10.0.0.3/32

[Peer]
PublicKey = <PUBLIC_KEY>
AllowedIPs = 10.0.0.4/32
---------------
# Peer2 (Node)
[Interface]
Address = 10.0.0.2/24
PrivateKey = <PRIVATE_KEY>
ListenPort = 51820
MTU = 1420

[Peer]
PublicKey = <PUBLIC_KEY>
AllowedIPs = 10.0.0.1/32
Endpoint = <PEER1_PUBLIC_IP>:51820

[Peer]
PublicKey = <PUBLIC_KEY>
AllowedIPs = 10.0.0.3/32

[Peer]
PublicKey = <PUBLIC_KEY>
AllowedIPs = 10.0.0.4/32
---------------
# Peer3 (Client)
[Interface]
Address = 10.0.0.3/24
PrivateKey = <PRIVATE_KEY>
ListenPort = 51820
MTU = 1420

[Peer]
PublicKey = <PUBLIC_KEY>
AllowedIPs = 10.0.0.1/32, 10.0.0.4/32
Endpoint = <PEER1_PUBLIC_IP>:51820
PersistentKeepalive = 25

[Peer]
PublicKey = <PUBLIC_KEY>
AllowedIPs = 10.0.0.2/32, 10.0.0.4/32
# Endpoint = <PEER2_PUBLIC_IP>:51820 # uncomment if Peer2 is a gateway
PersistentKeepalive = 25
---------------
# Peer4 (Client)
[Interface]
Address = 10.0.0.4/24
PrivateKey = <PRIVATE_KEY>
ListenPort = 51820
MTU = 1420

[Peer]
PublicKey = <PUBLIC_KEY>
AllowedIPs = 10.0.0.1/32, 10.0.0.3/32
Endpoint = <PEER1_PUBLIC_IP>:51820
PersistentKeepalive = 25

[Peer]
PublicKey = <PUBLIC_KEY>
AllowedIPs = 10.0.0.2/32, 10.0.0.3/32
# Endpoint = <PEER2_PUBLIC_IP>:51820 # uncomment if Peer2 is a gateway
PersistentKeepalive = 25
---------------
```
