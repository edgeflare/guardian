package wg

import (
	"net"
	"testing"
)

func TestValidateOrFindNextIP(t *testing.T) {
	testCases := []struct {
		name          string
		network       net.IPNet
		allocatedIPs  []net.IP
		preferredIPs  []net.IP
		expectedIP    net.IP
		expectedError error
	}{
		{
			name:          "Valid Preferred IP",
			network:       net.IPNet{IP: net.ParseIP("10.0.0.0"), Mask: net.CIDRMask(24, 32)},
			allocatedIPs:  []net.IP{net.ParseIP("10.0.0.1")},
			preferredIPs:  []net.IP{net.ParseIP("10.0.0.2")},
			expectedIP:    net.ParseIP("10.0.0.2"),
			expectedError: nil,
		},
		{
			name:          "Invalid Preferred IP",
			network:       net.IPNet{IP: net.ParseIP("10.0.0.0"), Mask: net.CIDRMask(24, 32)},
			allocatedIPs:  []net.IP{net.ParseIP("10.0.0.1")},
			preferredIPs:  []net.IP{net.ParseIP("10.0.1.2")}, // Outside the network
			expectedIP:    net.ParseIP("10.0.0.2"),           // First usable IP in the network
			expectedError: nil,
		},
		{
			name:          "Preferred IP Already Allocated",
			network:       net.IPNet{IP: net.ParseIP("10.0.0.0"), Mask: net.CIDRMask(24, 32)},
			allocatedIPs:  []net.IP{net.ParseIP("10.0.0.1"), net.ParseIP("10.0.0.2")},
			preferredIPs:  []net.IP{net.ParseIP("10.0.0.2")},
			expectedIP:    net.ParseIP("10.0.0.3"), // Should find the next available
			expectedError: nil,
		},
		{
			name:          "No Preferred IP, Next Available Found",
			network:       net.IPNet{IP: net.ParseIP("10.0.0.0"), Mask: net.CIDRMask(24, 32)},
			allocatedIPs:  []net.IP{net.ParseIP("10.0.0.1")},
			preferredIPs:  nil,
			expectedIP:    net.ParseIP("10.0.0.2"),
			expectedError: nil,
		},
		{
			name:          "No IP Available",
			network:       net.IPNet{IP: net.ParseIP("10.0.0.0"), Mask: net.CIDRMask(30, 32)}, // Only 2 usable IPs
			allocatedIPs:  []net.IP{net.ParseIP("10.0.0.1"), net.ParseIP("10.0.0.2")},
			preferredIPs:  nil,
			expectedIP:    nil,
			expectedError: ErrNoIPAvailable,
		},
		{
			name:          "Network Address",
			network:       net.IPNet{IP: net.ParseIP("10.0.0.0"), Mask: net.CIDRMask(24, 32)},
			allocatedIPs:  []net.IP{},
			preferredIPs:  []net.IP{net.ParseIP("10.0.0.0")}, // Network address
			expectedIP:    net.ParseIP("10.0.0.1"),           // Should skip network address
			expectedError: nil,
		},
		{
			name:          "Broadcast Address",
			network:       net.IPNet{IP: net.ParseIP("10.0.0.0"), Mask: net.CIDRMask(24, 32)},
			allocatedIPs:  []net.IP{},
			preferredIPs:  []net.IP{net.ParseIP("10.0.0.255")}, // Broadcast address
			expectedIP:    net.ParseIP("10.0.0.1"),             // Should skip broadcast address
			expectedError: nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resultIP, resultErr := ValidateOrFindNextIP(tc.network, tc.allocatedIPs, tc.preferredIPs...)

			if resultIP != nil && !resultIP.Equal(tc.expectedIP) {
				t.Errorf("Unexpected IP: got %v, want %v", resultIP, tc.expectedIP)
			}
			if resultErr != tc.expectedError {
				t.Errorf("Unexpected error: got %v, want %v", resultErr, tc.expectedError)
			}
		})
	}
}
