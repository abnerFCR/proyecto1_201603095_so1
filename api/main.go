package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"syscall"

	"github.com/gorilla/mux"
)

var archivo_json = "/proc/proyecto1_sopes1"

//funcion que lee el archivo y lo reenvia al cliente
func getall(res http.ResponseWriter, req *http.Request) {
	data, err := ioutil.ReadFile(archivo_json)
	if err != nil {
		fmt.Println("error1:", err)
	}
	res.Header().Set("Content-Type", "application/json")
	res.Header().Set("Access-Control-Allow-Origin", "*")
	res.Write(data)
}

//funcion que mata el proceso
func killing(res http.ResponseWriter, req *http.Request) {

	vars := mux.Vars(req)
	pid, err := strconv.Atoi(vars["id"])
	fmt.Println(pid)

	if err != nil {
		fmt.Fprintf(res, "ID invalido en kill")
		return
	} else {
		fmt.Printf("Se procedera a matar al proceso: %d \n", pid)
		process, err := os.FindProcess(pid)
		if err != nil {
			fmt.Println("error:", err)
		}
		err = process.Signal(syscall.Signal(0))
		if err != nil {
			fmt.Println("error:", err)
		}
		err = process.Kill()
		if err != nil {
			fmt.Println("error:", err)
		}
	}
	res.Header().Set("Access-Control-Allow-Origin", "*")

}

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/getall", getall).Methods("GET", "OPTIONS")
	router.HandleFunc("/kill/{id}", killing).Methods("GET", "OPTIONS")
	http.ListenAndServe(":5000", router)
}

/*

package main

import (
	"fmt"
	"html/template"
	"net/http"
)

func index(w http.ResponseWriter, r *http.Request) {
	template, err := template.ParseFiles("templates/index.html")
	if err != nil {
		fmt.Fprintf(w, "Pagina inexistente")
	} else {
		template.Execute(w, nil)
	}
}

func monitorCPU(w http.ResponseWriter, r *http.Request) {
	template, err := template.ParseFiles("templates/monitorCPU.html")
	if err != nil {
		fmt.Fprintf(w, "Pagina inexistente")
	} else {
		template.Execute(w, nil)
	}
}

func monitorRAM(w http.ResponseWriter, r *http.Request) {
	template, err := template.ParseFiles("templates/monitorRAM.html")
	if err != nil {
		fmt.Fprintf(w, "Pagina inexistente")
	} else {
		template.Execute(w, nil)
	}
}

func main() {
	http.HandleFunc("/", index)
	http.HandleFunc("/monitorCPU", monitorCPU)
	http.HandleFunc("/monitorRAM", monitorRAM)

	fmt.Println("El servidor esta escuchando en el puerto 5000")
	http.ListenAndServe(":5000", nil)
}
*/
