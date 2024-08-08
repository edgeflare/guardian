package main

import (
	"net"
	"net/http"

	"github.com/edgeflare/guardian/wg"
	"github.com/edgeflare/pgo"
	"github.com/jackc/pgx/v5"
	"github.com/skip2/go-qrcode"
)

func postPeerHandler(w http.ResponseWriter, r *http.Request) {
	reqPeer := wg.Peer{}
	if err := pgo.BindOrRespondError(r, w, &reqPeer); err != nil {
		return
	}

	user, _ := pgo.OIDCUser(r)
	reqPeer.UserID = user.Subject
	networkID := r.PathValue("network")
	reqPeer.NetworkID = networkID

	peerAddrs := []net.IPNet{}
	peerAddrs, err := pgo.Select(r, "SELECT addr FROM peers WHERE network_id = $1 AND user_id = $2",
		[]any{r.PathValue("network"), user.Subject}, func(row pgx.CollectableRow) (net.IPNet, error) {
			var addr net.IPNet
			if err := row.Scan(&addr); err != nil {
				return addr, err
			}
			return addr, nil
		}, true)
	if err != nil {
		pgo.RespondError(w, pgo.PgErrorCodeToHTTPStatus(err.Error()), err.Error())
		return
	}

	allocatedIPs := []net.IP{}
	for _, ipnet := range peerAddrs {
		allocatedIPs = append(allocatedIPs, ipnet.IP)
	}

	network, _ := pgo.SelectRow[wg.Network](r, `SELECT id, name, addr, addr6, dns, user_id, info, domains, created_at,
	updated_at, uuid FROM networks WHERE id = $1`, []any{networkID}, pgx.RowToStructByPos[wg.Network], true)

	newPeer, errPeer := wg.NewDefaultPeer(reqPeer, *network, allocatedIPs)
	if errPeer != nil {
		pgo.RespondError(w, http.StatusInternalServerError, errPeer.Error())
		return
	}
	newPeerMap := pgo.RowMap(newPeer) // Convert the updated peer into a map

	if _, pgErr := pgo.InsertRow(r, "peers", newPeerMap); pgErr != nil {
		pgo.RespondError(w, pgo.PgErrorCodeToHTTPStatus(pgErr.Error()), pgErr.Error())
		return
	}

	pgo.RespondJSON(w, http.StatusCreated, newPeer)
}

func handlePeerConfig(w http.ResponseWriter, r *http.Request, handleResponse func(http.ResponseWriter, string)) {
	peerQuery := `SELECT id, name, addr, cidr, dns, network_id, allowed_ips, endpoint,
        enabled, type, pubkey, privkey, presharedkey, info, user_id, listen_port, mtu, created_at, updated_at,
        uuid FROM peers WHERE user_id = $1 AND network_id = $2`

	user, ok := pgo.OIDCUser(r)
	if !ok {
		pgo.RespondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	peerID := r.PathValue("peer")
	if peerID == "" {
		pgo.RespondError(w, http.StatusBadRequest, "Missing peer ID")
		return
	}

	networkID := r.PathValue("network")
	if networkID == "" {
		pgo.RespondError(w, http.StatusBadRequest, "Missing network ID")
		return
	}

	peer, pgErr := pgo.SelectRow[wg.Peer](r, peerQuery+` AND id = $3`, []any{user.Subject, networkID, peerID}, pgx.RowToStructByPos[wg.Peer], true)
	if pgErr != nil {
		pgo.RespondError(w, http.StatusInternalServerError, "Error fetching peer")
		return
	}

	network, _ := pgo.SelectRow[wg.Network](r, `SELECT id, name, addr, addr6, dns, user_id, info, domains, created_at,
        updated_at, uuid FROM networks WHERE id = $1`, []any{networkID}, pgx.RowToStructByPos[wg.Network], true)

	peers, pgErr := pgo.Select[wg.Peer](r, peerQuery, []any{user.Subject, networkID}, pgx.RowToStructByPos[wg.Peer])
	if pgErr != nil {
		pgo.RespondError(w, http.StatusInternalServerError, "Error fetching peers")
		return
	}

	// pointerize peers?
	// peerPtrs := make([]*wg.Peer, len(peers))
	// for i := range peers {
	// 	peerPtrs[i] = &peers[i]
	// }

	wgConf, err := wg.GenerateWGConfig(peer, network, peers)
	if err != nil {
		pgo.RespondError(w, http.StatusInternalServerError, "Error generating WireGuard config")
		return
	}

	handleResponse(w, wgConf)
}

func getPeerConfigHandler(w http.ResponseWriter, r *http.Request) {
	handlePeerConfig(w, r, func(w http.ResponseWriter, wgConf string) {
		pgo.RespondText(w, http.StatusOK, wgConf)
	})
}

func getPeerConfigQrHandler(w http.ResponseWriter, r *http.Request) {
	handlePeerConfig(w, r, func(w http.ResponseWriter, wgConf string) {
		qrCode, err := qrcode.Encode(wgConf, qrcode.Medium, 512)
		if err != nil {
			pgo.RespondError(w, http.StatusInternalServerError, "Error generating QR code")
			return
		}
		pgo.RespondBinary(w, http.StatusOK, qrCode, "image/png")
	})
}

func deletePeerHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := pgo.OIDCUser(r)
	if !ok {
		pgo.RespondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	netID := r.PathValue("network")
	peerId := r.PathValue("peer")

	query := `DELETE FROM peers WHERE user_id = $1 AND network_id = $2 AND id = $3`

	_, pgErr := pgo.ExecRow(r, query, []any{user.Subject, netID, peerId})
	if pgErr != nil {
		pgo.RespondError(w, pgo.PgErrorCodeToHTTPStatus(pgErr.Error()), pgErr.Error())
		return
	}
	pgo.RespondJSON(w, http.StatusNoContent, nil)
}

func deleteNetworkHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := pgo.OIDCUser(r)
	if !ok {
		pgo.RespondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	netID := r.PathValue("network")

	query := `DELETE FROM networks WHERE user_id = $1 AND id = $2`

	_, pgErr := pgo.ExecRow(r, query, []any{user.Subject, netID})
	if pgErr != nil {
		pgo.RespondError(w, pgo.PgErrorCodeToHTTPStatus(pgErr.Error()), pgErr.Error())
		return
	}
	pgo.RespondJSON(w, http.StatusNoContent, nil)
}
