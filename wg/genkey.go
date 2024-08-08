package wg

import "golang.zx2c4.com/wireguard/wgctrl/wgtypes"

// generateKeyPair generates a WireGuard keypair
func generateKeyPair() (string, string, error) {
	privateKey, err := wgtypes.GeneratePrivateKey()
	if err != nil {
		return "", "", err
	}

	publicKey := privateKey.PublicKey()
	return privateKey.String(), publicKey.String(), nil
}
