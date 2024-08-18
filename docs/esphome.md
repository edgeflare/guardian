# ESP32 as Wireguard client with ESPHome

Mount wireguard conf in `/config/wg-conf-esp32-01.h` for esphome to include it in the main config.

```c
#include <WireGuard-ESP32.h>

char private_key[] = "UIhZvKvqsfHdXklaYaVOrbS4qjiuDxzxoQqawATV9FQ=";    // [Interface] PrivateKey
IPAddress local_ip(10,0,0,4);                                           // [Interface] Address
char public_key[] = "68Zri1RdsEcQJkYg+Utt3/59qVW/86gKXZq0+eiZoxM=";     // [Peer] PublicKey
char endpoint_address[] = "34.91.243.186";                              // [Peer] Endpoint
int endpoint_port = 51820;                                              // [Peer] Endpoint

static WireGuard wg;
```

Example esphome config:

```yaml
esphome:
  name: esp32-wireguard-01
  libraries:
  - ciniml/WireGuard-ESP32
  includes:
  - wg-conf-esp32-01.h

esp32:
  board: esp32dev
  framework:
    type: arduino

logger:
  level: DEBUG

api:

ota:
  password: "ota-pw"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  use_address: 10.0.0.4
  reboot_timeout: 1min
  manual_ip:
    static_ip: 192.168.1.4
    gateway: 192.168.1.1
    subnet: 255.255.255.0
    dns1: 10.0.0.1
    dns2: 1.1.1.1
  ap:
    ssid: "Esp32-Wireguard Fallback Hotspot"
    password: "wifi-ap-pw"

captive_portal:

web_server:
  port: 8080

http_request:
  useragent: esphome/device
  timeout: 10s

time:
- platform: sntp
  timezone: Europe/Amsterdam
  on_time_sync:
    then:
    - logger.log: "Setting up Wireguard..."
    - lambda: |
        wg.begin(local_ip, private_key, endpoint_address, public_key, endpoint_port);
# Check connectivity, within WG network, by accessing envoy admin page using private IP
  on_time:
  - cron: '/5 * * * * *' # every 5 seconds
    then:
    - http_request.get:
        url: http://10.0.0.1:9901
        verify_ssl: false
        on_response:
          then:
          - logger.log:
              format: "Response status: %d"
              args:
              - status_code
```
