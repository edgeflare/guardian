## Handy commands

generate keys
```shell
wg genkey | tee privatekey | wg pubkey > publickey
```

start and stop
```shell
wg-quick up wg0
wg-quick down wg0
```

start and stop with systemd
```shell
wg-quick down wg0
systemctl enable --now wg-quick@wg0
systemctl restart wg-quick@wg0
```

trobleshoot UDP. on both success and failure, the message `Connection to 10.0.0.1 port 51820 [udp/*] succeeded!` appears, but actual indicator of success is whether the terminal remains occupied (server up) or is released (server down).
```shell
echo "dummy" | nc -u -v 10.0.0.1 51820
```

DNS resolution (with DNSSEC) in CoreDNS using tool like `nslookup`, `dig` etc.

```shell
 $ nslookup wikipedia.org 10.0.0.1
Server:		10.0.0.1
Address:	10.0.0.1#53

Name:	wikipedia.org
Address: 185.15.59.224

 $ dig @10.0.0.1 cloudflare.com +dnssec

; <<>> DiG 9.10.6 <<>> @10.0.0.1 cloudflare.com +dnssec
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 20811
;; flags: qr rd ra ad; QUERY: 1, ANSWER: 3, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags: do; udp: 4096
;; QUESTION SECTION:
;cloudflare.com.                        IN      A

;; ANSWER SECTION:
cloudflare.com.         30      IN      RRSIG   A 13 2 300 20240820031942 20240818011942 34505 cloudflare.com. j3rTeUmZbngdEwllgh5KoTpDTdhrgcNZSPgd5+zOCukOcYCPmX5FWE7/ lPreN+DpsThDpasVehw+QQOhjb3veQ==
cloudflare.com.         30      IN      A       104.16.133.229
cloudflare.com.         30      IN      A       104.16.132.229

;; Query time: 30 msec
;; SERVER: 10.0.0.1#53(10.0.0.1)
;; WHEN: Mon Aug 19 04:21:01 CEST 2024
;; MSG SIZE  rcvd: 227
```

Configure Linux to use CoreDNS by updating `/etc/systemd/resolved.conf`

```shell
DNS=127.0.0.1 1.1.1.1 8.8.8.8 9.9.9.9
DNSSEC=yes
Domains=~. # Prevent resolve by metadata service IP, potentially bypassing CoreDNS
```

```shell
sudo systemctl restart systemd-resolved
resolvectl status
dig com. ns +dnssec
```