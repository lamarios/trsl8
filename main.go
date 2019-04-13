package main

import (
	"github.com/gorilla/mux"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/lamarios/trsl8/api"
	"github.com/lamarios/trsl8/dao"
	"github.com/lamarios/trsl8/utils"
	"net/http"
)

func main() {
	dao.SetUp()
	DefineRoutes()
}

func DefineRoutes() {
	r := mux.NewRouter()
	api.DefineEndPoints(r)

	//var dir string
	//dir = "./static"

	//flag.StringVar(&dir, "dir", "./static", "the directory to serve files from. Defaults to the current dir")
	//flag.Parse()
	//r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(dir))))

	http.Handle("/", r)

	http.ListenAndServe(":"+utils.GetEnv("PORT", "8000"), r)
}
