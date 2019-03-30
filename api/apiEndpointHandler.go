package api

import "net/http"

type ApiHandler interface {
	ServeHttp(userId uint, w http.ResponseWriter, r *http.Request)
}
