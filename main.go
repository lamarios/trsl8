package main

import (
	"flag"
	"github.com/gorilla/mux"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/lamarios/translator/api"
	"github.com/lamarios/translator/dao"
	"net/http"
)

func main() {
	dao.SetUp()
	DefineRoutes()
}

func DefineRoutes() {
	r := mux.NewRouter()
	api.DefineEndPoints(r)

	var dir string

	flag.StringVar(&dir, "dir", "./static", "the directory to serve files from. Defaults to the current dir")
	flag.Parse()
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(dir))))

	http.Handle("/", r)

	http.ListenAndServe(":8000", r)
}
