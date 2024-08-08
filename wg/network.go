package wg

import (
	"encoding/json"
	"net"
	"time"

	"github.com/edgeflare/pgo/pkg/util/rand"
	"github.com/google/uuid"
)

type Network struct {
	ID        string          `json:"id,omitempty"`
	Name      string          `json:"name"`
	Addr      net.IPNet       `json:"addr"`
	Addr6     net.IPNet       `json:"addr6,omitempty"`
	DNS       []net.IP        `json:"dns,omitempty"`
	UserID    string          `json:"user_id,omitempty"`
	Info      json.RawMessage `json:"info,omitempty"`
	Domains   []string        `json:"domains,omitempty"`
	CreatedAt time.Time       `json:"created_at,omitempty"`
	UpdatedAt time.Time       `json:"updated_at,omitempty"`
	UUID      uuid.UUID       `json:"uuid,omitempty"`
}

// NewDefaultNetwork creates a new Network with default values for empty or missing fields
func NewDefaultNetwork(n Network) Network {
	_, defaultAddr6, _ := net.ParseCIDR("::1/128") // vs ::/0

	if n.Name == "" {
		n.Name = rand.NewName()
	}
	if n.Addr6.IP == nil || n.Addr6.Mask == nil {
		n.Addr6 = *defaultAddr6
	}
	if n.DNS == nil {
		n.DNS = []net.IP{net.ParseIP("1.1.1.1"), net.ParseIP("8.8.8.8"), net.ParseIP("9.9.9.9")}
	}
	if len(n.Info) == 0 {
		n.Info = json.RawMessage(`{}`)
	}
	if n.Domains == nil {
		n.Domains = []string{}
	}
	if n.UUID == uuid.Nil {
		n.UUID = uuid.New()
	}
	if n.CreatedAt.IsZero() {
		n.CreatedAt = time.Now()
	}
	if n.UpdatedAt.IsZero() {
		n.UpdatedAt = time.Now()
	}

	return n
}

// Custom marshalling to handle net.IPNet
func (n Network) MarshalJSON() ([]byte, error) {
	type Alias Network
	return json.Marshal(&struct {
		Addr  string `json:"addr"`
		Addr6 string `json:"addr6,omitempty"`
		Name  string `json:"name"`
		*Alias
	}{
		Addr:  n.Addr.String(),
		Addr6: n.Addr6.String(),
		Name:  n.Name,
		Alias: (*Alias)(&n),
	})
}

// Custom unmarshalling to handle net.IPNet
func (n *Network) UnmarshalJSON(data []byte) error {
	type Alias Network
	aux := &struct {
		Addr  string `json:"addr"`
		Addr6 string `json:"addr6,omitempty"`
		Name  string `json:"name"`
		*Alias
	}{
		Alias: (*Alias)(n),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	if aux.Addr != "" {
		_, ipnet, err := net.ParseCIDR(aux.Addr)
		if err != nil {
			return err
		}
		n.Addr = *ipnet
	}

	if aux.Addr6 != "" {
		_, ipnet6, err := net.ParseCIDR(aux.Addr6)
		if err != nil {
			return err
		}
		n.Addr6 = *ipnet6
	}

	n.Name = aux.Name

	return nil
}
