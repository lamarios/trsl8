package main

import (
	"fmt"
	"github.com/gorilla/mux"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/lamarios/trsl8/api"
	"github.com/lamarios/trsl8/dao"
	"github.com/lamarios/trsl8/utils"
	"github.com/rs/cors"
	"log"
	"net/http"
)

func main() {
	go api.StringWorker(api.JobChan)
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
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		Debug:            true,
	})

	fmt.Println("Server ready on port 8000")

	log.Fatal(http.ListenAndServe(":"+utils.GetEnv("PORT", "8000"), c.Handler(r)))
}
