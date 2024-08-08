package wg

// import (
// 	"net"
// 	"testing"
// )

// func TestGenerateWGConfig(t *testing.T) {
// 	testCases := []struct {
// 		name          string
// 		peer          *Peer
// 		network       *Network
// 		allPeers      []Peer
// 		expected      string
// 		expectedError error
// 	}{
// 		{
// 			name: "Basic Configuration",
// 			peer: &Peer{
// 				PrivKey:    "test_private_key",
// 				Addr:       net.ParseIP("10.0.0.2"),
// 				CIDR:       net.IPNet{IP: net.ParseIP("10.0.0.2"), Mask: net.CIDRMask(32, 32)},
// 				ListenPort: 51820,
// 				MTU:        1420,
// 			},
// 			network: &Network{
// 				DNS: []net.IP{net.ParseIP("1.1.1.1"), net.ParseIP("8.8.8.8")},
// 			},
// 			allPeers: []Peer{}, // No other peers
// 			expected: `[Interface]
// PrivateKey = test_private_key
// ListenPort = 51820
// Address = 10.0.0.2/32
// DNS = 1.1.1.1, 8.8.8.8
// MTU = 1420
// `,
// 		},
// 		{
// 			name: "Multiple Peers",
// 			peer: &Peer{
// 				PrivKey:    "test_private_key",
// 				Addr:       net.ParseIP("10.0.0.2"),
// 				CIDR:       net.IPNet{IP: net.ParseIP("10.0.0.2"), Mask: net.CIDRMask(32, 32)},
// 				ListenPort: 51820,
// 				MTU:        1420,
// 			},
// 			network: &Network{
// 				DNS: []net.IP{net.ParseIP("1.1.1.1"), net.ParseIP("8.8.8.8")},
// 			},
// 			allPeers: []Peer{
// 				{
// 					ID:         "peer2",
// 					PubKey:     "peer2_public_key",
// 					AllowedIPs: []net.IPNet{{IP: net.ParseIP("192.168.1.0"), Mask: net.CIDRMask(24, 32)}},
// 					Endpoint:   "example.com:51820",
// 				},
// 				{ // Test for multiple peers with different allowed IPs
// 					ID:         "peer3",
// 					PubKey:     "peer3_public_key",
// 					AllowedIPs: []net.IPNet{{IP: net.ParseIP("192.168.2.0"), Mask: net.CIDRMask(24, 32)}},
// 					Endpoint:   "example.org:51820",
// 				},
// 			},
// 			expected: `[Interface]
// PrivateKey = test_private_key
// ListenPort = 51820
// Address = 10.0.0.2/32
// DNS = 1.1.1.1, 8.8.8.8
// MTU = 1420

// [Peer]
// PublicKey = peer2_public_key
// AllowedIPs = 192.168.1.0/24
// Endpoint = example.com:51820
// PersistentKeepalive = 25

// [Peer]
// PublicKey = peer3_public_key
// AllowedIPs = 192.168.2.0/24
// Endpoint = example.org:51820
// PersistentKeepalive = 25
// `,
// 		},
// 		{ // Test for multiple AllowedIPs in a single peer
// 			name: "Peer with Multiple Allowed IPs",
// 			peer: &Peer{
// 				// ... (same as in the first test case)
// 			},
// 			network: &Network{
// 				// ... (same as in the first test case)
// 			},
// 			allPeers: []Peer{
// 				{
// 					ID:     "peer2",
// 					PubKey: "peer2_public_key",
// 					AllowedIPs: []net.IPNet{{IP: net.ParseIP("192.168.1.0"), Mask: net.CIDRMask(24, 32)},
// 						{IP: net.ParseIP("10.10.0.0"), Mask: net.CIDRMask(16, 32)}},
// 					Endpoint: "example.com:51820",
// 				},
// 			},
// 			expected: `[Interface]
// PrivateKey = test_private_key
// ListenPort = 51820
// Address = 10.0.0.2/32
// DNS = 1.1.1.1, 8.8.8.8
// MTU = 1420

// [Peer]
// PublicKey = peer2_public_key
// AllowedIPs = 192.168.1.0/24, 10.10.0.0/16
// Endpoint = example.com:51820
// PersistentKeepalive = 25
// `,
// 		},
// 		{ // Test case for the "current peer" check
// 			name: "Current Peer Skipped",
// 			peer: &Peer{
// 				ID:         "peer1",
// 				PrivKey:    "test_private_key",
// 				Addr:       net.ParseIP("10.0.0.2"),
// 				CIDR:       net.IPNet{IP: net.ParseIP("10.0.0.2"), Mask: net.CIDRMask(32, 32)},
// 				ListenPort: 51820,
// 				MTU:        1420,
// 			},
// 			network: &Network{
// 				DNS: []net.IP{net.ParseIP("1.1.1.1"), net.ParseIP("8.8.8.8")},
// 			},
// 			allPeers: []Peer{
// 				{
// 					ID:         "peer1", // Same ID as the main peer
// 					PubKey:     "peer1_public_key",
// 					AllowedIPs: []net.IPNet{{IP: net.ParseIP("192.168.1.0"), Mask: net.CIDRMask(24, 32)}},
// 					Endpoint:   "example.com:51820",
// 				},
// 			},
// 			expected: `[Interface]
// PrivateKey = test_private_key
// ListenPort = 51820
// Address = 10.0.0.2/32
// DNS = 1.1.1.1, 8.8.8.8
// MTU = 1420
// `, // No [Peer] section because it's the current peer
// 		},
// 		// ... add more test cases to cover other scenarios ...
// 	}

// 	for _, tc := range testCases {
// 		t.Run(tc.name, func(t *testing.T) {
// 			result, err := GenerateWGConfig(tc.peer, tc.network, tc.allPeers)
// 			if err != tc.expectedError {
// 				t.Errorf("Unexpected error: got %v, want %v", err, tc.expectedError)
// 			}
// 			if result != tc.expected {
// 				t.Errorf("Incorrect config:\nGot:\n%s\nWant:\n%s", result, tc.expected)
// 			}
// 		})
// 	}
// }
