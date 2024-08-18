Example IPv4 Private Address Ranges:
- 10.0.0.0/8:     10.0.0.0 to 10.255.255.255
- 172.16.0.0/12:  172.16.0.0 to 172.31.255.255
- 192.168.0.0/16: 192.168.0.0 to 192.168.255.255

IPv6 Unique Local Addresses:
- fc00::/7: fc00:: to fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
- fd00::/8: Commonly used for site-local communications

Typical WireGuard CIDR Blocks:
- 10.0.0.0/24 or 10.1.0.0/24: 256 addresses, suitable for small/medium VPNs
- 192.168.1.0/24: Common in home/small office networks
- fd00::/64: Large IPv6 address space for local use
