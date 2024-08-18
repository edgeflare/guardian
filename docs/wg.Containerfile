FROM alpine:3.20
RUN apk add --no-cache wireguard-tools
# modify wg-quick to disable auto_su
RUN sed -i '/auto_su$/s/^/#/' /usr/bin/wg-quick
EXPOSE 51820/udp
CMD ["/bin/sh"]
