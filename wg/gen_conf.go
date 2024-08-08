package wg

import (
	"fmt"
	"strconv"
	"strings"
)

// GenerateWGConfig generates a WireGuard configuration file for a peer
func GenerateWGConfig(peer *Peer, network *Network, allPeers []Peer) (string, error) {
	var sb strings.Builder

	// [Interface] Section
	sb.WriteString("[Interface]\n")
	sb.WriteString("PrivateKey = " + peer.PrivKey + "\n")
	if peer.ListenPort != 0 { // Check if ListenPort is set
		sb.WriteString("ListenPort = " + strconv.Itoa(peer.ListenPort) + "\n")
	}

	ones, _ := peer.CIDR.Mask.Size()
	sb.WriteString(fmt.Sprintf("Address = %s/%v\n", peer.Addr.String(), ones))

	// DNS Configuration (From Network)
	if len(network.DNS) > 0 {
		dnsStrings := make([]string, len(network.DNS))
		for i, ip := range network.DNS {
			dnsStrings[i] = ip.String()
		}
		dnsString := strings.Join(dnsStrings, ", ")
		sb.WriteString("DNS = " + dnsString + "\n")
	}
	if peer.MTU != 0 { // Check if MTU is set
		sb.WriteString("MTU = " + strconv.Itoa(peer.MTU) + "\n")
	}

	// [Peer] Sections (For Each Peer in the Network)
	for _, p := range allPeers {
		if p.ID == peer.ID { // Skip the current peer
			continue
		}

		sb.WriteString("\n[Peer]\n")
		sb.WriteString("PublicKey = " + p.PubKey + "\n")
		allowedIPs := make([]string, len(p.AllowedIPs))
		for i, cidr := range p.AllowedIPs {
			allowedIPs[i] = cidr.String()
		}
		sb.WriteString("AllowedIPs = " + strings.Join(allowedIPs, ", ") + "\n")

		if p.Endpoint != "" { // Check if Endpoint is provided
			sb.WriteString("Endpoint = " + p.Endpoint + "\n")
		}
		sb.WriteString("PersistentKeepalive = 25\n") // Standard value
	}

	return sb.String(), nil
}
