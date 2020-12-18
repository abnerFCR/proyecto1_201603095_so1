package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"syscall"
	"time"

	"./mux"
)

var archivoCPU = "/proc/cpu_201603095"
var archivoRAM = "/proc/memo_201603095"

//Usuario es un struct que contiene la informacion obtenida del fichero
type Usuario struct {
	Username string `json:"userName"`
}

//cpuInfo informacion del cpu
type cpuInfo struct {
	Usocpu float64 `json:"usoCpu"`
}

//funcion que lee el archivo y lo reenvia al cliente
func getall(res http.ResponseWriter, req *http.Request) {
	data, err := ioutil.ReadFile(archivoCPU)
	if err != nil {
		fmt.Println("error1:", err)
	}
	res.Header().Set("Content-Type", "application/json")
	res.Header().Set("Access-Control-Allow-Origin", "*")
	res.Write(data)
}

func getRAM(res http.ResponseWriter, req *http.Request) {
	data, err := ioutil.ReadFile(archivoRAM)
	if err != nil {
		fmt.Println("error2:", err)
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
	}
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

	res.Header().Set("Access-Control-Allow-Origin", "*")

}
func getnameuser(res http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	uid, err := strconv.Atoi(vars["uid"])

	if err != nil {
		fmt.Fprintf(res, "ID invalido en kill")
		return
	}
	//res.Header().Set("Content-Type", "application/json")
	res.Header().Set("Access-Control-Allow-Origin", "*")

	cmd, error := exec.Command("grep", "x:"+strconv.FormatInt(int64(uid), 10), "/etc/passwd").Output()

	if error != nil {
		usuario := &Usuario{
			Username: "----",
		}
		crearjson, e := json.Marshal(usuario)
		if e != nil {
			fmt.Println(e)
			return
		}
		res.Write(crearjson)
		return
	}

	usuarioaux := strings.Split(string(cmd), ":")[0]

	usuario := &Usuario{
		Username: usuarioaux,
	}
	crearjson, e := json.Marshal(usuario)
	if e != nil {
		fmt.Println(e)
		return
	}
	res.Write(crearjson)
}

func getCPUInfo(w http.ResponseWriter, r *http.Request) {
	var prevIdleTime, prevTotalTime uint64
	var cpuUsage = 0.0
	for i := 0; i < 8; i++ {
		file, err := os.Open("/proc/stat")
		if err != nil {
			log.Fatal(err)
		}
		scanner := bufio.NewScanner(file)
		scanner.Scan()
		firstLine := scanner.Text()[5:] // get rid of cpu plus 2 spaces
		file.Close()
		if err := scanner.Err(); err != nil {
			log.Fatal(err)
		}
		split := strings.Fields(firstLine)
		idleTime, _ := strconv.ParseUint(split[3], 10, 64)
		totalTime := uint64(0)
		for _, s := range split {
			u, _ := strconv.ParseUint(s, 10, 64)
			totalTime += u
		}
		if i > 0 {
			deltaIdleTime := idleTime - prevIdleTime
			deltaTotalTime := totalTime - prevTotalTime
			cpuUsage = (1.0 - float64(deltaIdleTime)/float64(deltaTotalTime)) * 100.0
			//fmt.Printf("%d : %6.3f\n", i, cpuUsage)
		}

		prevIdleTime = idleTime
		prevTotalTime = totalTime
		time.Sleep(time.Second)
	}

	cpuObj := &cpuInfo{math.Round(cpuUsage*100) / 100}
	jsonResponse, errorjson := json.Marshal(cpuObj)
	if errorjson != nil {
		http.Error(w, errorjson.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(jsonResponse))

}

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/getall", getall).Methods("GET", "OPTIONS")
	router.HandleFunc("/getram", getRAM).Methods("GET", "OPTIONS")
	router.HandleFunc("/getcpuinfo", getCPUInfo).Methods("GET", "OPTIONS")
	router.HandleFunc("/getusername/{uid}", getnameuser).Methods("GET", "OPTIONS")

	router.HandleFunc("/kill/{id}", killing).Methods("GET", "OPTIONS")

	fmt.Println("El servidor esta escuchando en el puerto 5000")
	http.ListenAndServe(":5000", router)
}
