import React, { Component } from 'react';
import './App.css';
import ChartistGraph from 'react-chartist';


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
         ram: 50,
         total: 1024,
         used: 512,
         data: [

         ],
         LineDataRAM: {
            labels: [],
            series: [
               []
            ]
         },
         executing: 36,
         suspended: 2673,
         stopped: 0,
         zombie: 0,
         other: 891,
         totalprocess: 3600
      }
      this.initInterval = this.initInterval.bind(this)
      this.process = this.process.bind(this)
      this.req = this.req.bind(this)
      this.destroyInterval = this.destroyInterval.bind(this)
      this.handleClickKill = this.handleClickKill.bind(this)
      this.handleInpunt = this.handleInpunt.bind(this)
      this.appView = this.appView.bind(this)
   }

   initInterval(e) {
      this.intervalGraphics = setInterval(() => {
         this.req()

      }, 5000)
   }

   req() {
      console.log("pasaron 5 seg")
      let date = new Date()

      this.state.LineDataRAM.labels.push(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds())

      fetch(this.url_api + '/getall').then(res => {
         return res.text()
      }).then((dat) => {
         dat = dat.toString().replace(/,}/g, "}")
         dat = dat.toString().replace(/,]/g, "]")

         var data = JSON.parse(dat)

         this.state.LineDataRAM.series[0].push(data.totalram - data.freeram)
         if (this.state.LineDataRAM.series[0].length > 9) {
            this.state.LineDataRAM.series[0].shift()
            this.state.LineDataRAM.labels.shift()
         }
         this.setState({
            ram: data.usedram,
            total: data.totalram,
            used: data.totalram - data.freeram,
            data: [data.tree],
            LineDataRAM: this.state.LineDataRAM,
            executing: data.executing,
            suspended: data.suspended,
            stopped: data.stopped,
            zombie: data.zombie,
            other: data.other,
            totalprocess: data.total
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

   process(children, parent, padding) {
      //if (children !== null && children !== undefined && children.length > 0)

      return children.map((child, i) => {

         return (

            <div className="" id={"p_" + parent} key={i} style={{ paddingLeft: padding }}>
               <div className="panel list-group font-weight-light">
                  <a href={"#c_" + child.pid} data-parent={"#p_" + parent} data-toggle="collapse" className="list-group-item list-group-item-action m-0 p-0">
                     <div className="row m-0 p-0">
                        <p className="col-1 m-0 p-0"><small>{child.pid}</small></p>
                        <p className="col-5 m-0 p-0"><small>{child.name}</small></p>
                        <p className="col-2 m-0 p-0"><small>{child.state}</small></p>
                        <p className="col-2 m-0 p-0"><small>{child.user}</small></p>
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
            <nav className="navbar navbar-dark bg-dark justify-content-center">
               <span className="navbar-brand">Monitor de Recursos</span>
            </nav>

            <div className="container col-sm-10 col-md-8 mt-4">
               <nav>
                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                     <a className="nav-item nav-link active" id="nav-data-tab" data-toggle="tab" href="#nav-data" role="tab" aria-controls="nav-data" aria-selected="true">Procesos</a>
                     <a className="nav-item nav-link" id="nav-graphics-tab" data-toggle="tab" href="#nav-graphics" role="tab" aria-controls="nav-graphics" aria-selected="false">Monitor de RAM </a>
										 <a className="nav-item nav-link" id="nav-graphics-tab" data-toggle="tab" href="#nav-graphics2" role="tab" aria-controls="nav-graphics" aria-selected="false">Monitor de CPU </a>
                     <a className="nav-item nav-link" id="nav-settings-tab" data-toggle="tab" href="#nav-settings" role="tab" aria-controls="nav-settings" aria-selected="false">Configuracion</a>
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
                              <div className="col-5 m-0 p-0">Nombre</div>
                              <div className="col-2 m-0 p-0">Estado</div>
                              <div className="col-2 m-0 p-0">Usuario</div>
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
                                 <span className="d-block display-4">{this.state.total}</span>
                              </div>
                              <div className="col col-12 col-md-4">
                                 <span className="d-block text-muted">En Uso (MB)</span>
                                 <span className="d-block display-4">{this.state.used}</span>
                              </div>
                              <div className="col col-12 col-md-4">
                                 <span className="d-block text-muted">En Uso (%)</span>
                                 <span className="d-block display-4">{this.state.ram}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">RAM en Uso</h1>
                        </div>
                        <div className="card-body">
                           <ChartistGraph data={this.state.LineDataRAM} options={
                              {
                                 low: 0,
                                 showArea: true
                              }
                           } type={'Line'} />
                           <div className="d-flex justify-content-around mt-4">
                              <label htmlFor="">RAM: {this.state.ram}%</label>
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
                                 <span className="d-block display-4">{this.state.used}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">RAM en Uso</h1>
                        </div>
                        <div className="card-body">
                           <ChartistGraph data={this.state.LineDataRAM} options={
                              {
                                 low: 0,
                                 showArea: true
                              }
                           } type={'Line'} />
                           <div className="d-flex justify-content-around mt-4">
                              <label htmlFor="">RAM: {this.state.ram}%</label>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="tab-pane fade" id="nav-settings" role="tabpanel" aria-labelledby="nav-settings-tab">

                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">API URL</h1>
                        </div>
                        <div className="card-body">
                           <div className="input-group mb-3 mt-4">
                              <input type="text" onChange={this.handleInpunt} name="url_api" value={this.state.url_api} className="form-control" placeholder="" aria-label="" aria-describedby="basic-addon1" />
                           </div>

                           <div className="d-flex justify-content-between">
                              <button onClick={this.initInterval} type="button" className="btn btn-success">Start Real Time</button>
                              <button onClick={this.destroyInterval} type="button" className="btn btn-danger">Stop Real Time</button>
                              <button onClick={()=>{this.setState({logged: false})}} type="button" className="btn btn-info">LogOut</button>
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
