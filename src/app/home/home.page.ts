import { Component, OnInit } from '@angular/core';
/**importar librerías */
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingController } from '@ionic/angular';
import { MarcadorI } from '../model/Marcador.interface';
import { WayPoint } from '../model/WayPoint';
import { ApiService } from '../api.service';

declare var google;


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  //coordenadas: (Lat: 53.46319946467559, Lng: -2.291306490754285)
  lat: number = 53.46319946467559;
  lng: number = -2.291306490754285;

  //Desde Craven DR 5
  origen = { lat: 53.4690783348864, lng: -2.2810199388163097 }
  //Hasta Old Trafford
  destino = { lat: 53.46319946467559, lng: -2.291306490754285 }

  map = null;

  //Crear un servicio de manejo de ruta
  direccionService = new google.maps.DirectionsService();
  //Crear un servicio de Render (Dibujado de ruta en el mapa)
  direccionDibuja = new google.maps.DirectionsRenderer();

  //Declarar variable donde se recupera dirección
  dire: string;

  constructor(
    private geoLoca: Geolocation,
    private loadingCtrl: LoadingController,
    private api: ApiService) { }

  ngOnInit() {
    this.cargarMapa();
  }

  async cargarMapa() {
    const cargar = await this.loadingCtrl.create({
      message: "Cargando mapa..."
    });
    await cargar.present();
    const ubicacion = {
      lat: this.lat,
      lng: this.lng
    };
    const mapaHtml: HTMLElement = document.getElementById("map");
    this.map = new google.maps.Map(mapaHtml, {
      center: ubicacion,
      zoom: 20
    });
    this.direccionDibuja.setMap(this.map);
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      cargar.dismiss();
      this.calcularRuta();

      const marcador = new google.maps.Marker({
        position: {
          lat: ubicacion.lat,
          lng: ubicacion.lng
        },
        zoom: 8,
        map: this.map,
        title: 'Old Trafford'
      });
      this.cargarMarcadores();
    });
  }

  //método que permite calcular ruta
  private calcularRuta() {
    this.direccionService.route({
      origin: this.origen,
      destination: this.destino,
      travelMode: google.maps.TravelMode.DRIVING,
      waypoints: this.WayPoints,
      optimizeWaypoints: true
    }, (response, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        this.direccionDibuja.setDirections(response);
      }
      else {
        console.log("Error al cargar la ruta " + status);
      }
    });
  }
  ///////////////////////////////////////////////////////
  cargarMarcadores() {
    this.listaMarcadores.forEach(item => {
      this.agregarMarcadores(item);
    })
  }

  agregarMarcadores(ubicacion: MarcadorI) {
    const marcador = new google.maps.Marker({
      position: {
        lat: ubicacion.position.lat,
        lng: ubicacion.position.lng
      },
      zoom: 8,
      map: this.map,
      title: ubicacion.title
    });
  }

  //Lista de puntos/paradas sobre mi ruta 
  //1-(53.464386662113085, -2.289076295636486)
  //2-(53.46813021160321, -2.2830857030428855)
  WayPoints: WayPoint[] = [
    {
      location: {
        lat: 53.464386662113085, lng: -2.289076295636486
      },
      stopover: true
    },
    {
      location: {
        lat: 53.46813021160321, lng: -2.2830857030428855
      },
      stopover: true
    }
  ]

  listaMarcadores: MarcadorI[] = [
    {
      position: {
        lat: 53.46709966529158,
        lng: -2.2949973568121584
      },
      title: 'Car Park'
    },
    {
      position: {
        lat: 53.4690783348864,
        lng: -2.2810199388163097
      },
      title: 'Craven DR 5'
    }]

  //método que busca la dirección
  private Direccion() {
    console.log(this.dire);
    this.api.getDireccion(this.dire).subscribe(
      (data) => {
        console.log(data);
      },
      (e) => {
        console.log(e);
      }
    )
  }
}
