package wg

import (
	"encoding/json"
	"fmt"
	"net"
	"time"

	"github.com/edgeflare/pgo/pkg/util/rand"
	"github.com/google/uuid"
)

// PeerType represents the type of a peer. It can be a gateway, node, or client.
type PeerType string

const (
	PeerTypeGateway PeerType = "gateway"
	PeerTypeNode    PeerType = "node"
	PeerTypeClient  PeerType = "client"
)

// Peer represents a WireGuard peer.
type Peer struct {
	ID           string          `json:"id,omitempty"` // SELECT RIGHT(uuid::TEXT, 12);
	Name         string          `json:"name,omitempty"`
	Addr         net.IP          `json:"addr,omitempty"`
	CIDR         net.IPNet       `json:"cidr,omitempty"`
	DNS          []net.IP        `json:"dns,omitempty"`
	NetworkID    string          `json:"network_id,omitempty"`
	AllowedIPs   []net.IPNet     `json:"allowed_ips,omitempty"`
	Endpoint     string          `json:"endpoint,omitempty"`
	Enabled      bool            `json:"enabled,omitempty"`
	Type         PeerType        `json:"type,omitempty"`
	PubKey       string          `json:"pubkey,omitempty"`
	PrivKey      string          `json:"privkey,omitempty"`
	PresharedKey string          `json:"presharedkey,omitempty"`
	Info         json.RawMessage `json:"info,omitempty"`
	UserID       string          `json:"user_id,omitempty"`
	ListenPort   int             `json:"listen_port,omitempty"`
	MTU          int             `json:"mtu,omitempty"`
	CreatedAt    time.Time       `json:"created_at,omitempty"`
	UpdatedAt    time.Time       `json:"updated_at,omitempty"`
	UUID         uuid.UUID       `json:"uuid,omitempty"`
	// Add6         net.IPNet       `json:"addr6,omitempty"`
}

// NewDefaultPeer creates a new peer with default values.
func NewDefaultPeer(p Peer, n Network, allocatedIPs []net.IP) (Peer, error) {
	var addrErr error
	if p.Name == "" {
		p.Name = rand.NewName()
	}
	// IP allocation
	preferredIP := p.Addr
	p.Addr, addrErr = ValidateOrFindNextIP(n.Addr, allocatedIPs, preferredIP)
	if addrErr != nil {
		return Peer{}, fmt.Errorf("%w: %v", ErrIPAllocationFailed, addrErr)
	}
	if p.Addr == nil {
		return Peer{}, fmt.Errorf("%w: failed to get a valid IP", ErrIPAllocationFailed)
	}
	if p.CIDR.IP == nil {
		p.CIDR = net.IPNet{
			IP:   n.Addr.IP,
			Mask: n.Addr.Mask,
		}
	}
	// _, defaultAddr6, _ := net.ParseCIDR("::1/128")
	if p.DNS == nil {
		p.DNS = []net.IP{net.ParseIP("1.1.1.1"), net.ParseIP("8.8.8.8"), net.ParseIP("9.9.9.9")}
	}
	if p.Endpoint == "" {
		p.Endpoint = "0.0.0.0:51820"
	}
	if p.NetworkID == "" {
		p.NetworkID = n.ID
	}
	if p.Type == "" {
		p.Type = PeerTypeClient
	}
	if p.PubKey == "" {
		privKey, pubKey, err := generateKeyPair()
		if err != nil {
			return Peer{}, fmt.Errorf("failed to generate key pair: %w", err)
		}
		p.PrivKey, p.PubKey = privKey, pubKey
	}
	// if p.ListenPort < 1 || p.ListenPort > 65535 {
	// 	return Peer{}, errors.New("invalid listen port")
	// }
	// if p.MTU < 576 { // Adjust minimum MTU if needed
	// 	return Peer{}, errors.New("invalid MTU")
	// }
	if p.CreatedAt.IsZero() {
		p.CreatedAt = time.Now()
	}
	if p.UpdatedAt.IsZero() {
		p.UpdatedAt = time.Now()
	}
	if p.UUID == uuid.Nil {
		p.UUID = uuid.New()
	}
	// if not provided, use the network's CIDR
	if p.AllowedIPs == nil {
		p.AllowedIPs = []net.IPNet{n.Addr}
	} else if len(p.AllowedIPs) == 0 {
		p.AllowedIPs = []net.IPNet{n.Addr}
	}

	return p, addrErr
}
