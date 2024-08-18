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

DNS resolution in CoreDNS using tool like `nslookup`, `dig` etc.
```shell
 $ nslookup wikipedia.org 10.0.0.1
Server:		10.0.0.1
Address:	10.0.0.1#53

Name:	wikipedia.org
Address: 185.15.59.224

 $ dig @10.0.0.1 cloudflare.com   

; <<>> DiG 9.10.6 <<>> @10.0.0.1 cloudflare.com
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 55785
;; flags: qr aa rd ra ad; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;cloudflare.com.			IN	A

;; ANSWER SECTION:
cloudflare.com.		12	IN	A	104.16.133.229
cloudflare.com.		12	IN	A	104.16.132.229

;; Query time: 22 msec
;; SERVER: 10.0.0.1#53(10.0.0.1)
;; WHEN: Sun Aug 18 11:00:29 CEST 2024
;; MSG SIZE  rcvd: 103
```
