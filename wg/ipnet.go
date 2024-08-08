package wg

import (
	"errors"
	"net"
)

var (
	ErrNoIPAvailable      = errors.New("no IP available in network")
	ErrIPAllocationFailed = errors.New("IP allocation failed")
)

// ValidateOrFindNextIP returns the next available IP address within the given network that is not already allocated.
//
// If one or more preferredIPs are provided, the function first checks if any of them are usable. A usable preferredIP must be non-nil, within the network's address range, and not already allocated. The first usable preferredIP is returned.
//
// If no preferredIP is usable or if no preferredIPs are provided, the function scans the network, starting from the first usable IP (the network address plus one), incrementing by one until it finds an unallocated address.
//
// If no usable IP address is found within the network, ErrNoIPAvailable is returned.
//
// Note that this function only works with IPv4 addresses.
func ValidateOrFindNextIP(network net.IPNet, allocatedIPs []net.IP, preferredIPs ...net.IP) (net.IP, error) {
	if len(preferredIPs) > 0 {
		preferredIP := preferredIPs[0]
		if preferredIP != nil && network.Contains(preferredIP) {
			if isUsableIP(preferredIP, network, allocatedIPs) {
				return preferredIP, nil
			}
		}
	}

	for ip := getFirstUsableIP(network); network.Contains(ip); incrementIP(ip) {
		if isUsableIP(ip, network, allocatedIPs) {
			return ip, nil
		}
	}

	return net.IP{}, ErrNoIPAvailable
}

// getFirstUsableIP returns the first usable IP address in the network (after the network address).
func getFirstUsableIP(network net.IPNet) net.IP {
	ip := network.IP.Mask(network.Mask)
	ip = incrementIP(ip) // Increment to get the first usable IP
	return ip
}

// isBroadcastAddress checks if the given IP is the broadcast address of the CIDR.
func isBroadcastAddress(ip net.IP, network net.IPNet) bool {
	// Ensure we're dealing with IPv4 addresses
	ip = ip.To4()
	networkIP := network.IP.To4()

	if ip == nil || networkIP == nil {
		return false // Not IPv4
	}

	broadcastIP := make(net.IP, len(networkIP))
	for i := range broadcastIP {
		broadcastIP[i] = networkIP[i] | ^network.Mask[i]
	}

	return ip.Equal(broadcastIP)
}

// isUsableIP checks if the given IP is a usable IP within the network and not in the list of allocated IPs.
func isUsableIP(ip net.IP, network net.IPNet, allocatedIPs []net.IP) bool {
	if ip.Equal(network.IP) || isBroadcastAddress(ip, network) {
		return false // Network or broadcast address
	}

	for _, allocatedIP := range allocatedIPs {
		if allocatedIP.Equal(ip) {
			return false // Already allocated
		}
	}

	return true // Usable
}

// incrementIP increments an IP address.
func incrementIP(ip net.IP) net.IP {
	ip = ip.To4()
	if ip == nil {
		return ip
	}

	for j := len(ip) - 1; j >= 0; j-- {
		ip[j]++
		if ip[j] > 0 {
			break
		}
	}

	return ip
}
