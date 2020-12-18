import React, { Component } from 'react';
import './App.css';
import ChartistGraph from 'react-chartist';
import request from 'superagent'

class App extends Component {

   url_api = 'http://localhost:5000'
   
   obj = {
      method: 'GET',
      headers: {
         "Accept": 'application/json',
         "Content-Type": 'application/json',
         //"Access-Control-Allow-Origin": "*",
         //"Access-Control-Allow-Methods": "GET, OPTIONS"
      }
   }
   intervalGraphics = 0

   constructor() {
      super()
      this.state = {
         email: "",
         password: "",
         logged: false,
         url_api: this.url_api,
         ram: 0,
         total: 0,
         used: 0,
         usocpu:0,
         data: [

         ],
         mi_ram  :{
            totalRam: 0,
            ramLibre: 0,
            LineDataRAM: {
               labels: [],
               series: [
                  []
               ]
            },
         },
         LineDataCPU:{
            labels:[],
            series:[
               []
            ]
         },
         userName:'--',
         executing: 0,
         suspended: 0,
         stopped: 0,
         zombie: 0,
         other: 0,
         totalprocess: 0
      }
      this.initInterval = this.initInterval.bind(this)
      this.process = this.process.bind(this)
      this.req = this.req.bind(this)
      this.destroyInterval = this.destroyInterval.bind(this)
      this.handleClickKill = this.handleClickKill.bind(this)
      //this.handleInpunt = this.handleInpunt.bind(this)
      this.appView = this.appView.bind(this)
      this.initInterval(this);
   }

   initInterval(e) {
      console.log("aca jalasjdflkasjd");
      this.intervalGraphics = setInterval(() => {
         this.req()

      }, 5000)
   }

   req() {
      //console.log("pasaron 5 seg")
      let date = new Date()

      this.state.mi_ram.LineDataRAM.labels.push(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds())
      
      fetch(this.url_api + '/getram').then(res => {
         return res.text()
      }).then((dat) => {
         dat = dat.toString().replace(/,}/g, "}")
         dat = dat.toString().replace(/,]/g, "]")
         var data = JSON.parse(dat)

         

         if (this.state.mi_ram.LineDataRAM.series[0].length > 9) {
            this.state.mi_ram.LineDataRAM.series[0].shift()
            this.state.mi_ram.LineDataRAM.labels.shift()
         }

         this.state.mi_ram.totalRam = (data.totalRam/1024).toFixed(2);
         this.state.mi_ram.ramLibre = (data.ramLibre/1024).toFixed(2);
         this.state.mi_ram.LineDataRAM = this.state.mi_ram.LineDataRAM;   
         this.setState(this.state); 
         this.state.mi_ram.LineDataRAM.series[0].push(((this.state.mi_ram.totalRam - this.state.mi_ram.ramLibre)/this.state.mi_ram.totalRam)*100)
      })

      fetch(this.url_api + '/getcpuinfo').then(res => {
         return res.text()
      }).then((dat) => {
         dat = dat.toString().replace(/,}/g, "}")
         dat = dat.toString().replace(/,]/g, "]")
         var data = JSON.parse(dat)

         if (this.state.LineDataCPU.series[0].length > 9) {
            this.state.LineDataCPU.series[0].shift()
            this.state.LineDataCPU.labels.shift()
         }

         this.state.usocpu = (data.usoCpu).toFixed(2);
         this.state.LineDataCPU = this.state.LineDataCPU;   
         this.setState(this.state); 
         this.state.LineDataCPU.series[0].push(this.state.usocpu)
      })

      //console.log(this.state.mi_ram.LineDataRAM);
      

   
      fetch(this.url_api + '/getall').then(res => {
         return res.text()
      }).then((dat) => {
         dat = dat.toString().replace(/,}/g, "}")
         dat = dat.toString().replace(/,]/g, "]")

         var data2 = JSON.parse(dat)

         /*
         this.state.LineDataCPU.series[0].push(data.totalram - data.freeram)
         if (this.state.LineDataRAM.series[0].length > 9) {
            this.state.LineDataRAM.series[0].shift()
            this.state.LineDataRAM.labels.shift()
         }
         */
         console.log(data2);
         this.setState({
            ram: data2.usedram,
            total: data2.totalram,
            used: data2.totalram - data2.freeram,
            data: [data2.tree],
            LineDataCPU: this.state.LineDataCPU,
            executing: data2.executing,
            suspended: data2.suspended,
            stopped: data2.stopped,
            zombie: data2.zombie,
            other: data2.other,
            totalprocess: data2.total
         })
      })
      
      
   }

   destroyInterval(e) {
      clearInterval(this.intervalGraphics)
   }


   async handleClickKill(e) {
      e.preventDefault()
      fetch(this.url_api + '/kill/' + e.currentTarget.value, this.obj).then(res => {
         return res.json()
      }).then(data => {
         /*this.setState({
            data: data
         })*/
         this.req();
         console.log(data)
      })
   }

   traerNombre(e) {
      e.preventDefault()
     
      fetch('http://localhost:5000/getusername/'+e.currentTarget.value).then(res => {
         return res.text()
      }).then((dat1) => {
         var data3
         try{
            data3= JSON.parse(dat1)
           
            alert(data3.userName)
         }catch(e){
            alert("Indefinido")
            //nombre_usuario_actual = '*****'
         }
      })
   }

/*
   handleInpunt(e) {
      var { value, name } = e.target
      if (this.state.logged) {
         if (value.endsWith("/")) {
            value = value.substring(0, value.length - 1);
         }
         if (!value.toLocaleLowerCase().startsWith("http://")) {
            value = "http://" + value
         }
         this.url_api = e.value
      }
      this.setState({
         [name]: value
      })
   }
*/
   process(children, parent, padding) {
      //if (children !== null && children !== undefined && children.length > 0)

      return children.map((child, i) => {
         
         

         /*
         fetch(this.url_api + '/getusername/'+child.user).then(res => {
            return res.text()
         }).then((dat1) => {
            var data3
            try{
               data3= JSON.parse(dat1)
               this.setState(
                  {
                     userName: data3.userName
                  }
               )
               //nombre_usuario_actual = data3.userName;
            }catch(e){
               this.setState(
                  {
                     userName: '*-*-*-*-'
                  }
               )
               //nombre_usuario_actual = '*****'
            }
            
         })
         */
         return (
            
            <div className="" id={"p_" + parent} key={i} style={{ paddingLeft: padding }}>
               <div className="panel list-group font-weight-light">
                  <a href={"#c_" + child.pid} data-parent={"#p_" + parent} data-toggle="collapse" className="list-group-item list-group-item-action m-0 p-0">
                     <div className="row m-0 p-0">
                        <p className="col-1 m-0 p-0"><small>{child.pid}</small></p>
                        <p className="col-3 m-0 p-0"><small>{child.name}</small></p>
                        <p className="col-2 m-0 p-0"><small>{(child.state==="S"?"Spleeping":child.state === "D"? "Stopped": child.state==="E"? "Running": child.state==="Z"?"Zombie":"Other")}</small></p>
                        <p className="col-2 m-0 p-0"><small>{child.user}</small></p>
                        <button onClick={this.traerNombre} value={child.user} type="button" className="col-2 btn rounded-circle p-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-90deg-up" viewBox="0 0 16 16">
                           <path fill-rule="evenodd" d="M4.854 1.146a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L4 2.707V12.5A2.5 2.5 0 0 0 6.5 15h8a.5.5 0 0 0 0-1h-8A1.5 1.5 0 0 1 5 12.5V2.707l3.146 3.147a.5.5 0 1 0 .708-.708l-4-4z"/>
                        </svg>
                        </button>
                        <p className="col-1 m-0 p-0"><small>{child.memory}</small></p>
                        <button onClick={this.handleClickKill} value={child.pid} type="button" className="col-1 btn rounded-circle p-0"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" className="bi bi-trash" viewBox="0 0 16 16">
                           <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                           <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                        </svg></button>
                     </div>
                  </a>
                  <div className="collapse" id={"c_" + child.pid}>
                     {
                        (child.children !== null && child.children !== undefined && child.children instanceof Array && child.children.length > 0) ? this.process(child.children, child.pid, padding + 10) : <div className="row"><div className="col-12">Without Children</div></div>

                     }
                  </div>

               </div>
            </div>
         );


      });
   }

   render() {
      //this.initInterval()
      //this.req()
      return (
         this.appView()
      );
   }
   appView() {
      return (
         <div className="App">
            <nav className="navbar navbar-dark bg-primary justify-content-center">
               <span className="navbar-brand">Monitor de Recursos</span>
            </nav>

            <div className="container col-sm-10 col-md-8 mt-4">
               <nav>
                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                     <a className="nav-item nav-link active" id="nav-data-tab" data-toggle="tab" href="#nav-data" role="tab" aria-controls="nav-data" aria-selected="true">Procesos</a>
                     <a className="nav-item nav-link" id="nav-graphics-tab" data-toggle="tab" href="#nav-graphics" role="tab" aria-controls="nav-graphics" aria-selected="false">Monitor de RAM </a>
										 <a className="nav-item nav-link" id="nav-graphics-tab" data-toggle="tab" href="#nav-graphics2" role="tab" aria-controls="nav-graphics" aria-selected="false">Monitor de CPU </a>
                  </div>
               </nav>
               <div className="tab-content" id="nav-tabContent">
                  <div className="tab-pane fade show active" id="nav-data" role="tabpanel" aria-labelledby="nav-data-tab">

                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">Informacion</h1>
                        </div>
                        <div className="card-body">
                           <div className="row">
                              <div className="col col-12 col-md-4">
                                 <span className="d-block text-muted">Total</span>
                                 <span className="d-block display-4">{this.state.totalprocess}</span>
                              </div>
                              <div className="col col-12 col-md-4">
                                 <span className="d-block text-muted">Running</span>
                                 <span className="d-block display-4">{this.state.executing}</span>
                              </div>
                              <div className="col col-12 col-md-4">
                                 <span className="d-block text-muted">Sleeping</span>
                                 <span className="d-block display-4">{this.state.suspended}</span>
                              </div>
                              <div className="col col-12 col-md-4 mt-3">
                                 <span className="d-block text-muted">Stopped</span>
                                 <span className="d-block display-4">{this.state.stopped}</span>
                              </div>
                              <div className="col col-12 col-md-4 mt-3">
                                 <span className="d-block text-muted">Zombie</span>
                                 <span className="d-block display-4">{this.state.zombie}</span>
                              </div>
                              <div className="col col-12 col-md-4 mt-3">
                                 <span className="d-block text-muted">Otros</span>
                                 <span className="d-block display-4">{this.state.other}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="card mt-4 mb-5">
                        <div className="card-header ml-0 pl-0 pr-0">
                           <div className="row m-0 p-0">
                              <div className="col-1 m-0 p-0"><small>PID</small></div>
                              <div className="col-3 m-0 p-0">Nombre</div>
                              <div className="col-2 m-0 p-0">Estado</div>
                              <div className="col-2 m-0 p-0">Usuario</div>
                              <div className="col-2 m-0 p-0">Mostrar</div>
                              <div className="col-1 m-0 p-0"><small>% RAM.</small></div>
                              <div className="col-1 m-0 p-0"><small>Accion</small></div>
                           </div>
                        </div>
                        {
                           this.process(this.state.data, "accordion", 0)
                        }
                     </div>
                  </div>
                  <div className="tab-pane fade" id="nav-graphics" role="tabpanel" aria-labelledby="nav-graphics-tab">
                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">Estado de RAM</h1>
                        </div>
                        <div className="card-body">
                           <div className="row">
                              <div className="col col-12 col-md-4">
                                 <span className="d-block text-muted">Total (MB)</span>
                                 <span className="d-block display-4">{this.state.mi_ram.totalRam}</span>
                              </div>
                              <div className="col col-12 col-md-4">
                                 <span className="d-block text-muted">En Uso (MB)</span>
                                 <span className="d-block display-4">{(this.state.mi_ram.totalRam - this.state.mi_ram.ramLibre).toFixed(2)}</span>
                              </div>
                              <div className="col col-12 col-md-4">
                                 <span className="d-block text-muted">En Uso (%)</span>
                                 <span className="d-block display-4">{(((this.state.mi_ram.totalRam - this.state.mi_ram.ramLibre)/this.state.mi_ram.totalRam)*100).toFixed(2)}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">RAM en Uso</h1>
                        </div>
                        <div className="card-body">
                           <ChartistGraph data={this.state.mi_ram.LineDataRAM} options={
                              {
                                 low: 0,
                                 showArea: true
                              }
                           } type={'Line'} />
                           <div className="d-flex justify-content-around mt-4">
                              <label htmlFor="">RAM: {(((this.state.mi_ram.totalRam - this.state.mi_ram.ramLibre)/this.state.mi_ram.totalRam)*100).toFixed(2)}%</label>
                           </div>
                        </div>
                     </div>
                  </div>

									<div className="tab-pane fade" id="nav-graphics2" role="tabpanel" aria-labelledby="nav-graphics-tab">
                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">Estado del CPU</h1>
                        </div>
                        <div className="card-body">
                           <div className="row">
                              <div className="col col-12 col-md-12">
                                 <span className="d-block text-muted">En Uso (%)</span>
                                 <span className="d-block display-4">{this.state.usocpu}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">CPU en Uso</h1>
                        </div>
                        <div className="card-body">
                           <ChartistGraph data={this.state.LineDataCPU} options={
                              {
                                 low: 0,
                                 showArea: true
                              }
                           } type={'Line'} />
                           <div className="d-flex justify-content-around mt-4">
                              <label htmlFor="">CPU: {this.state.usocpu}%</label>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </div>

      )
   }
}

export default App;
