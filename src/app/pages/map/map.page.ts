import { Component, Renderer, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalController, PopoverController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { LanguagePopoverComponent } from 'src/app/shared/language-popover/language-popover.component';
import { h3ToGeo, getRes0Indexes, h3ToChildren, h3ToGeoBoundary, h3IsPentagon, geoToH3 } from 'h3-js';
import { geojson2h3, featureToH3Set, h3SetToFeature, h3SetToMultiPolygonFeature, h3SetToFeatureCollection } from 'geojson2h3';
import * as normalize from '@mapbox/geojson-normalize';
import { map, catchError, mergeMap } from 'rxjs/operators'
//import { Geolocation } from '@ionic-native/geolocation/ngx';

/** importo i pacchetti openlayers*/

import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj.js';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay';
import Geolocation from 'ol/Geolocation';
/** layers */
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import LayerGroup from 'ol/layer/Group';
/**sources */
import OSM from 'ol/source/OSM';
import XYZSource from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
/** format */
import GeoJsonFormat from 'ol/format/GeoJSON';

/**sphere */
import { getArea, getLength } from 'ol/sphere.js';
//import GeoJSON from 'ol/format/geojson';
/** geometry */
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon'

/**style */
import Style from 'ol/style/Style';
import StyleFill from 'ol/style/Fill';
import StyleStroke from 'ol/style/Stroke';
import StyleCircle from 'ol/style/Circle';
import StyleIcon from 'ol/style/Icon';
import StyleText from 'ol/style/Text';

/** interaction */
import Snap from 'ol/interaction/Snap';

import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import olSelect from 'ol/interaction/Select';
import LayerSwitcher from 'ol-layerswitcher/dist/ol-layerswitcher';
import { toPng } from 'html-to-image';
import { ExtentComponent } from './../../shared/modals/extent/extent.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, AfterViewInit {
  private map: Map;
  private data;
  private view: View = new View({
    center: fromLonLat([21, 42.61]),
    zoom: 10,
    maxZoom: 19,
  });

  constructor(private popoverCtrl: PopoverController,
    private http: HttpClient,
    private modalController: ModalController) {

  }

  ngOnInit() {
    this.getContentJSON().then(res => {
      res;
      
    });

  }

  getContentJSON() {
    return this.http.get('assets/json/oakland_travel_times.json').pipe(map(response => {
      var aaa: any = response;
      const layer = {};
      
      aaa.features.forEach(feature => {
        const hexagons = geojson2h3.featureToH3Set(feature, 10);
        hexagons.forEach(h3Index => {
          layer[h3Index] = feature.properties.travelTime;
        })
      });
      return layer;
    })).toPromise();

  }

  async openLanguagePopover(evt) {
    const popover = await this.popoverCtrl.create({
      component: LanguagePopoverComponent,
      event: evt
    });
    await popover.present();
  }
  /**
   * initOpenlayersMap
   * init Map object, define and add layers without add features  
   */
  initOpenlayersMap() {
    /**
     * layer OSM
     */
    const osm = new TileLayer({
      title: 'OSM',
      type: 'base',
      visible: false,
      source: new OSM,
    });

    /** 
     * layer esri foto aeree/satellitati
     */
    const Aerial = new TileLayer({
      title: 'Aerial',
      type: 'base',
      visible: true,
      source: new XYZSource({
        attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' + 'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        crossOrigin: "Anonymous"
      })
    });
    /**
     * white map data:image/png;base64,
     * iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDol
     * AAAAA1BMVEX///+nxBvIAAAAH0lEQVQYGe3BAQ0AAADCIPunfg4
     * 3YAAAAAAAAAAA5wIhAAAB9aK9BAAAAABJRU5ErkJggg==
     */
    const White = new TileLayer({
      title: 'White map',
      type: 'base',
      visible: false,
      source: new XYZSource({
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEX///+nxBvIAAAAH0lEQVQYGe3BAQ0AAADCIPunfg43YAAAAAAAAAAA5wIhAAAB9aK9BAAAAABJRU5ErkJggg==',
        crossOrigin: "Anonymous"
      })
    });

    /**
     * layergroup dei layer di base
     */
    const BaseLayers = new LayerGroup({
      title: 'Base maps',
      layers: [White, osm, Aerial]
    });


    /**
     * mappa openlayers
     */
    this.map = new Map({
      layers: [BaseLayers],
      target: 'mappa',
      view: this.view,

    });

    /**
     * render map
     */
    setTimeout(() => {
      this.map.updateSize(); // Now the "this" still references the component
    }, 500);

    const layerSwitcher = new LayerSwitcher();
    this.map.addControl(layerSwitcher);



  }


  ngAfterViewInit() {
    this.initOpenlayersMap();
  }


  mapExport() {

    
    var exportOptions = {
      filter: (element) => {
        return element.className ? element.className.indexOf('ol-control') === -1 : true;
      }
    };

    this.map.once('rendercomplete', () => {
      
      toPng(this.map.getTargetElement(), exportOptions).then((dataURL) => {
        
        var link = <HTMLLinkElement>document.getElementById('image-download');
        link.href = dataURL;
        link.click();
      });
    });
    this.map.renderSync();


  }



}
