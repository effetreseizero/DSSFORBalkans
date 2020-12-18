import { UtilitiesService } from './../../services/utilities/utilities.service';
import { MapinfoComponent } from './../modals/mapinfo/mapinfo.component';
import { DataStoreService } from 'src/app/services/datastore/datastore.service';
import { Component, Renderer, ElementRef, OnInit, AfterViewInit, Input, OnChanges, Output, EventEmitter, ChangeDetectionStrategy, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalController, PopoverController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { LanguagePopoverComponent } from 'src/app/shared/language-popover/language-popover.component';
import { h3ToGeo, polyfill, h3SetToMultiPolygon } from 'h3-js';
import { geojson2h3, featureToH3Set, h3SetToFeature, h3SetToMultiPolygonFeature, h3SetToFeatureCollection } from 'geojson2h3';
import * as normalize from '@mapbox/geojson-normalize';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { FunctionsLetter } from './../../models';

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
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML'
import { defaults as defaultControls, OverviewMap } from 'ol/control';
/**sphere */
import { getArea, getLength } from 'ol/sphere.js';
import { getCenter } from 'ol/extent';
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

import Draw, { createRegularPolygon, createBox } from 'ol/interaction/Draw';
import DragBox from 'ol/interaction/DragBox';
import Modify from 'ol/interaction/Modify';
import olSelect from 'ol/interaction/Select';
import LayerSwitcher from 'ol-layerswitcher/dist/ol-layerswitcher';
import { defaults as defaultInteractions, DoubleClickZoom, DragAndDrop, DragPan, KeyboardPan, KeyboardZoom, MouseWheelZoom, Pointer } from 'ol/interaction';




/** TURF */
import * as turf from '@turf/turf';

import { featureEach } from '@turf/meta';
import {
  Feature as turfFeature,
  FeatureCollection as turfFeatureCollection,
  Point as turfPoint,
  MultiPoint as turfMultiPoint,
  LineString as turfLineString,
  MultiLineString as turfMultiLineString,
  Polygon as turfPolygon,
  MultiPolygon as turfMultiPolygon,
} from '@turf/helpers';

@Component({
  selector: 'app-settings-map',
  templateUrl: './settings-map.component.html',
  styleUrls: ['./settings-map.component.scss'],
})
export class SettingsMapComponent implements OnInit, AfterViewInit, OnChanges {
  // tslint:disable-next-line: no-input-rename
  @Input('actions') actions; //tipo di azione; 
  @Input('extent') extent; // extent mappa
  @Input('project') project; // progetto
  @Input('stakeholders') stakeholders; // dati stakeholder
  @Input('indexHexagon') indexHexagon; // indice dell'esagono
  @Input('scenario') scenarios_layer;
  @Input('resolution') scenarios_resolution;
  @Output() output = new EventEmitter(); // emit della mappa risultante dell'AHP
  @Output() Statistic = new EventEmitter(); // emit della statistica delle aree
  public functionsLetter = FunctionsLetter;
  private map: Map; // inizializzo la mappa con la classe mappa
  private view: View = new View({ // view della mappa centrata nell'area balcani
    center: fromLonLat([21, 42.61]),
    zoom: 10,
    maxZoom: 19,
  });
  public west;
  public south;
  public east;
  public north;


  private extentSource: VectorSource; // source del layer dell'extent
  private extentLayer: VectorLayer; // layer dell'extent
  private projectSource: VectorSource; // source del layer principale
  private projectLayer: VectorLayer; // layer principale
  private secondSource: VectorSource; // source del layer secondario
  private secondLayer: VectorLayer; // layer secondario
  public centroidSource: VectorSource; // source dei centroidi del meetin e dell'ahp
  public centroidsLayers: VectorLayer; // centroidi del meetin e dell'ahp
  private forExportSource: VectorSource; // source del layer da esportare ( @output )
  private forExportLayer: VectorLayer; // layer da esportare ( @output )
  private stakeholder;
  private draw: Draw;
  private selectVector: olSelect;
  private funcSelect: olSelect;
  private functionsLayer = [];
  private facilitator;
  public doubleClickZoom = new DoubleClickZoom();
  public dragAndDrop = new DragAndDrop();
  public dragPan = new DragPan();
  public keyboardPan = new KeyboardPan();
  public keyboardZoom = new KeyboardZoom();
  public mouseWheelZoom = new MouseWheelZoom();

  private zoomSelect = 'zoomSelect';
  public isExtentin: boolean = false;
  public shindexes = [];
  public shindexids;
  public hexind = {};
  private Areas = {}
  public layerSwitcher;
  public maplegend;
  private shownClassName = 'shown';
  private stattype;


  constructor(private datastore: DataStoreService,
    private modalController: ModalController,
    private elementRef: ElementRef,
    private utilities: UtilitiesService) { }

  ngOnInit() {

    if (!this.datastore.isFacilitator()) {
      this.datastore.stakeholderSubject.subscribe(res => {

        this.stakeholder = res; // dati stakelhoder meetin
      });
    }

    /**
     * se faccio meetin o ahp leggo modifiche stakeholders e inizializzo array delle modifiche
     */
    if (this.actions === 'meetinresult' || this.actions === 'ahpresults') {


      this.stakeholders.forEach(sh => {
        let Shs = Object.assign({}, sh);
        Shs.indexes.forEach(i => {
          Object.assign(i, { name: sh.name });
        });
        this.shindexes = this.shindexes.concat(Shs.indexes); // indici modificati
      });

      this.shindexids = this.datastore.getGroupedByKey(this.shindexes, 'id'); // modifiche degli stakeholder raggruppate per id
      this.stattype = this.datastore.todolistSubject.value.filter(x => x.project_id === this.project.id)[0].statistics; // statistica da applicare 
      Object.keys(this.shindexids).forEach(key => {
        /**
         * hexind oggetto che contiene per ogni esagono l'id,
         * in numero di modifiche per ogni funzione
         * e il valore delle modifiche per ogni funzione
         */
        this.hexind[key] = {};
        this.shindexids[key].forEach(index => {
          Object.keys(index.functions).forEach(f => {

            this.hexind[key][f] = [this.shindexids[key].filter(x => x.functions.hasOwnProperty(f)).length, this.shindexids[key].map(x => x.functions[f]).filter(y => y !== undefined)];
          });
        });
      });


    }


  }


  /**
   * initOpenlayersMap
   * init Map object, define and add layers without add features  
   */
  initOpenlayersMap() {
    let olmap = this.elementRef.nativeElement.querySelector('.settingsmap'); // dove deve andare la mappa
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
      target: olmap,
      view: this.view,
    });

    /**
     * render map
     */
    setTimeout(() => {
      this.map.updateSize(); // Now the "this" still references the component
    }, 500);

    this.layerSwitcher = new LayerSwitcher();
    this.map.addControl(this.layerSwitcher);
  }

  refresh(){
    setTimeout(() => {
      this.map.updateSize(); // Now the "this" still references the component
    }, 100);
  }


  ngAfterViewInit() {

    this.initOpenlayersMap();

    if (this.actions === 'extent') {
      this.drawExtent();
    } else
      if (this.actions === 'project') {
        this.drawProject(); //disegno progetto
      } else if (this.actions === 'meetinresult') {
        this.facilitator = this.datastore.stakeholdersSubject.value.filter(x => x.isFacilitator)[0];
        this.drawProject(); //disegno progetto del meetin
      } else if (this.actions === 'drawhexagon') { // esagono nel modale map-info 
        this.map.removeControl(this.layerSwitcher);
        let zoom = this.map.getControls().getArray()[0]; // seleziono bottone zoom
        this.map.removeControl(zoom); // tolgo il bottone zoom
        this.drawHexagon(); // disegno esagono
      } else if (this.actions === 'ahpresults') {
        this.facilitator = this.datastore.stakeholdersSubject.value.filter(x => x.isFacilitator)[0];
        this.drawahpresults(); // disegno risultati ahp
      }


    if (this.actions === 'ahpresults' || this.actions === 'meetinresult') {
      this.maplegend = document.getElementById('maplegend2');

      //se metto il mouse sopra al bottone, mostro il pannello della legenda
      this.maplegend.addEventListener('mouseover', evt => {

        this.showPanel()

      });
      // se tolgo il mouse dal bottone della legenda, nascondo il pannello
      this.maplegend.addEventListener('mouseout', evt => {

        this.hidePanel()

      });
    }


  }

  drawHexagon() {
    const feature = h3SetToFeature([this.indexHexagon]);

    this.projectSource = new VectorSource({});
    this.projectLayer = new VectorLayer({
      title: 'Hexagon',
      source: this.projectSource,
      style: new Style({
        stroke: new StyleStroke({
          color: 'rgba(0,184,230, 2)',
          width: 2
        }),
        fill: new StyleFill({
          color: 'rgba(0,184,230, 0.001)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
      })
    });

    const collection = (new GeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    })).readFeatures(feature);

    this.projectSource.addFeatures(collection);

    this.map.addLayer(this.projectLayer);

    const extent = this.projectSource.getExtent();
    setTimeout(() => {
      this.map.getView().fit(extent);
      this.map.updateSize();
    }, 1000);


  }

  drawMeetinResult() {
    this.secondSource = new VectorSource({});
    this.secondLayer = new VectorLayer({
      title: 'Extent',
      source: this.secondSource,
      style: new Style({
        stroke: new StyleStroke({
          color: 'rgba(0,184,230, 2)',
          width: 3
        }),
        fill: new StyleFill({
          color: 'rgba(0,184,230, 0)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
      })
    });
    this.map.addLayer(this.secondLayer);

    setTimeout(() => {
      this.map.updateSize();
    }, 1000);

  }

  drawExtent() {

    this.projectSource = new VectorSource({});
    this.projectLayer = new VectorLayer({
      title: 'Scenario',
      source: this.projectSource,
      style: new Style({
        stroke: new StyleStroke({
          color: 'rgba(0,184,230, 2)',
          width: 3
        }),
        fill: new StyleFill({
          color: 'rgba(0,184,230, 0)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
      })
    });

 
    let scenario = this.datastore.ScenariesSubject.value.filter(scen => { return scen.name === this.scenarios_layer && scen.resolution === this.scenarios_resolution })[0];
 /**
 * EXPORT layer
 */
    let HEXAGONS = []
    let hex4exp = this.datastore.HexagonsSubject.value[scenario.id];
    hex4exp.forEach(hex => {
      HEXAGONS.push(hex.indexes.id); // inserisco indici esagoni del progetto nell'array hexagons;
    });
   

    const featurecollection = h3SetToFeatureCollection(HEXAGONS);

    const collection = (new GeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    })).readFeatures(featurecollection);

    this.projectSource.clear();
    this.projectSource.addFeatures(collection);

    this.draw = new Draw({
      source: this.secondSource,
      type: 'Circle',
      geometryFunction: createBox()
    });


    var select = new olSelect({
      style: new Style({
        stroke: new StyleStroke({
            color: 'rgba(230,230,10,1.0)',
            lineDash: null,
            lineCap: 'butt',
            lineJoin: 'miter',
            width: 0,
        }),
        fill: new StyleFill({
          color: 'rgba(230,230,10,0.4)',
        }),
    })
    });
    this.map.addInteraction(select);

    var selectedFeatures = select.getFeatures();

    var dragBox = new DragBox({
      style: new Style({
        stroke: new StyleStroke({
            color: 'rgba(230,230,10,1.0)',
            lineDash: null,
            lineCap: 'butt',
            lineJoin: 'miter',
            width: 0,
        }),
        fill: new StyleFill({
          color: 'rgba(230,230,10,0.4)',
        }),
    })
    });

    dragBox.on('boxend', () => {
   
    
      var extent = dragBox.getGeometry().getExtent();
      this.projectSource.forEachFeatureIntersectingExtent(extent,  (feature) => {
        selectedFeatures.push(feature);
      });

      var names = selectedFeatures.getArray().map((feature) => {
        return feature.getId()
      });
      
      if(names.length>0){
        
        this.output.emit(names);
       }
    });

    selectedFeatures.on(['remove'], (event) => {
  
      console.log(JSON.stringify(selectedFeatures.getArray()));
      var names = selectedFeatures.getArray().map((feature) => {
        return feature.getId()
      });
 
     if(names.length>0){
      this.output.emit(names);
     }
    });

    select.on('select',(evt)=>{

      var names = select.getFeatures().getArray().map((feature) => {
        return feature.getId();
      });
      
      if(names.length>0){
        
        this.output.emit(names);
       }
    })

 

    this.map.addLayer(this.projectLayer);

    const modifyLayerBtn = (<HTMLButtonElement>document.getElementById('drawExtent'));
    /**
     * start click centermap
     */
    modifyLayerBtn.addEventListener('click', (evt) => {

      this.map.removeInteraction(this.draw);
      if (this.isExtentin === false) {
        this.isExtentin = true;
        this.map.addInteraction(dragBox);
      } else {
        this.isExtentin = false;
        this.map.removeInteraction(dragBox);
      }
    });

    let extents = this.projectSource.getExtent();

    setTimeout(() => {
      this.map.getView().fit(extents);
      this.map.updateSize();
    }, 1000);

  }

  drawahpresults() {


    this.projectSource = new VectorSource({});
    this.projectLayer = new VectorLayer({
      title: 'AHP',
      source: this.projectSource,
      style: new Style({
        stroke: new StyleStroke({
          color: 'rgba(0,184,230, 2)',
          width: 2
        }),
        fill: new StyleFill({
          color: 'rgba(0,184,230, 0.001)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
      })
    });

    let projectEdgeLayer: VectorLayer;

    projectEdgeLayer = new VectorLayer({
      title: 'Grid',
      source: this.projectSource,
      style: new Style({
        stroke: new StyleStroke({
          color: 'rgba(0,184,230, 2)',
          width: 2
        }),
        fill: new StyleFill({
          color: 'rgba(0,184,230, 0.001)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
      })
    });

    this.map.addLayer(projectEdgeLayer);
    this.map.addLayer(this.projectLayer);

    this.secondSource = new VectorSource({});
    this.secondLayer = new VectorLayer({
      title: 'Modification',
      source: this.secondSource,
      style: new Style({
        image: new StyleCircle({
          radius: 5,
          fill: new StyleFill({
            color: 'rgba(0,0,217, 1)'
          }),

          zIndex: 500
        })

      }),
    });

    this.forExportSource = new VectorSource({});
    this.forExportLayer = new VectorLayer({
      title: 'ExportLayer',
      source: this.forExportSource,
      style: new Style({
        image: new StyleCircle({
          radius: 5,
          fill: new StyleFill({
            color: 'rgba(0,0,217, 1)'
          }),

          zIndex: 500
        })

      }),
    });

    this.map.addLayer(this.secondLayer);

    this.selectVector = new olSelect({ layers: [this.projectLayer, projectEdgeLayer] });

    this.map.addInteraction(this.selectVector);

    this.selectVector.on('select', (evt) => {

      const feature = evt.selected[0]
      const layer = evt.target.getLayer(feature);
      this.infoFeature(feature, 'ahpresults');
    });



    this.datastore.currentahpresult.subscribe(res => {

      this.projectSource.clear();
      
      let indexes = Object.keys(res).map(x => x);
      let hexagons = res;

      const featurecollection = h3SetToFeatureCollection(indexes);

      /**
       * EXPORT layer
       */
      let HEXAGONS = []
      let allhex4exp = this.datastore.HexagonsSubject.value[this.project.scenario_id];
      let hex4exp;
      const hexlist = this.datastore.projectsHexagonsSubject.value.filter(x=>x.project_id === this.project.id)[0]
    
      if(hexlist.all){
        allhex4exp.forEach(hex => {
          HEXAGONS.push(hex.indexes.id); // inserisco indici esagoni del progetto nell'array hexagons;
        });
        hex4exp = allhex4exp;
      }else{
        HEXAGONS = hexlist.hexagons;
        hex4exp = allhex4exp.filter(x => hexlist.hexagons.indexOf(x.indexes.id) > -1);
      }
      
      const layer4export = h3SetToFeatureCollection(HEXAGONS);


      layer4export.features.forEach((feature, ind) => {

        
        this.changeProperties(hex4exp, feature, indexes, 'ahpoutput');
        indexes.forEach(hex => {
          if (feature.id === hex) {
            this.project.functions.map(key => {

              if (hexagons[hex][key] !== undefined) {
                feature.properties[key + '_ahp'] = hexagons[hex][key]
              } else {
                feature.properties[key + '_ahp'] = null;
              }

            })

          }
        });
      });


      /**
       * aggiorno le properties delle feature
       */

      featurecollection.features.forEach(feature => {
        
        // var center_coords = getCenter(feature.getGeometry().getExtent());
        indexes.forEach(hex => {
          if (feature.id === hex) {
            
            feature.properties['functions'] = hexagons[hex];
          }
        });
      })

      let functions = Object.keys(hexagons).map(funct => Object.keys(hexagons[funct]).map(ind => ind)[0]);
      functions = functions.filter((item, pos) => functions.indexOf(item) === pos);
      
      const collection = (new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      })).readFeatures(featurecollection);
   
      this.Areas = {};
      this.Areas['tot'] = 0;
      this.Areas['hotarea'] = 0;
      
      this.Areas['functions'] = functions;
      functions.map(f => {
        this.Areas[f] = {}
        this.Areas[f].area = 0;
        this.Areas[f].func = 0;
        this.Areas[f].areahot = 0;
        this.Areas[f].count = 0;
        this.Areas[f].hot = {};
        this.Areas[f].hot.count = 0;
        this.Areas[f].hot.area = 0;
        this.Areas[f].hot.func = 0;
      })

      collection.map((feat, i) => {
        let feature = feat;
        let area = feat.getGeometry().getArea() / 10000;
        let prop = Object.keys(feat.getProperties().functions).map(x => x)[0];
        this.Areas['tot'] = this.Areas['tot'] + area;
        this.Areas[prop].area = this.Areas[prop].area + area;
        this.Areas[prop].count = this.Areas[prop].count + 1;
        this.Areas[prop].func = this.Areas[prop].func + feat.getProperties().functions[prop];
      });

      this.projectSource.clear();
      this.projectSource.addFeatures(collection);

      const extent = this.projectSource.getExtent();
      
      this.drawhothexagon(hexagons);

      this.projectLayer.setStyle(this.ahpStyle);

      this.Statistic.emit(this.Areas);

      const collection4export = (new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      })).readFeatures(layer4export);


      this.forExportSource.clear();
      this.forExportSource.addFeatures(collection4export);
      let aaa = this.forExportSource.getFeatures();
      aaa.forEach(feat=>{
        
      })
      var geoJSON = new GeoJSON();
      var geojsonStr = geoJSON.writeFeatures(this.forExportSource.getFeatures());
      var geoKML = new KML()
      var geokmlStr =   geoKML.writeFeatures(this.forExportSource.getFeatures(), {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });

      this.output.emit([geojsonStr, geokmlStr]);

      setTimeout(() => {
        this.map.getView().fit(extent);
        this.map.updateSize();

      }, 1000);

    })


  }
  /**
   * metodo per tracciare i centroidi degli esagoni e definire se sono "hot" e quanto
   * @param collection collection degli esagoni
   */
  drawCentroids(collection) {
    
    let centroids = []; // array delle feature dei centroidi
    var standardDeviation = {}; // deviazione standard minima e massima di riferimento per ogni funzione
    let devstd = {}; // deviazione standard degli esagoni modificati
    this.project.functions.forEach(f => {

      devstd[f] = collection.map(feat => feat.getProperties().devStd).filter(x => !this.isEmpty(x)).map(y => y[f] !== undefined ? y[f] : 0);
      standardDeviation[f] = {};
      standardDeviation[f]['min'] = Math.min.apply(null, devstd[f]);
      standardDeviation[f]['max'] = Math.max.apply(null, devstd[f]);

    })

    /**
     * per ogni feature degli esagoni:
     * calcolo le coordinate del centroide,
     * setto tutti i parametri necessari:
     * centroids[i].setGeometry(new Point(center));
     * centroids[i].setId('Cent' + feat.getId());
     * centroids[i].set('devStd', feat.getProperties().devStd);
     * centroids[i].set('minmax', standardDeviation);
     * centroids[i].set('modification', feat.getProperties().modification);
     * centroids[i].set('mods', feat.getProperties().mods);
     * centroids[i].set('mods', maxdevStd(centroids[i].getProperties().devStd, centroids[i].getProperties().minmax, centroids[i].getProperties().mods)
     */
    collection.map((feat, i) => {
      
      var center = getCenter(feat.getGeometry().getExtent());
      centroids[i] = new Feature();
      centroids[i].setGeometry(new Point(center));
      centroids[i].setId('Cent' + feat.getId()); // id
      centroids[i].set('devStd', feat.getProperties().devStd); // deviazione standards delle modifiche
      centroids[i].set('minmax', standardDeviation); // deviazione standard di riferiemento
      centroids[i].set('modification', feat.getProperties().modification); // numero di modifiche
      centroids[i].set('mods', feat.getProperties().mods); // livello di "hot"
      // aggiorno livello di hot in baser alla deviazione standard
      centroids[i].set('mods', maxdevStd(centroids[i].getProperties().devStd, centroids[i].getProperties().minmax, centroids[i].getProperties().mods));

      /**
       * se ci sono modifiche del facilitatore allora mods = 5
       */
      this.facilitator.indexes.forEach(index => {
        if (index.id === feat.getId()) {
          centroids[i].set('mods', 5);

        }
      });
  
      
      let area = feat.getGeometry().getArea() / 10000; //calcolo area in ettari
      let prop = Object.keys(feat.getProperties().functions).map(x => x)[0]; //guardo la "key" della funzione vincente
      if (this.actions === 'ahpresults') { // se sono nell'AHP allora aggiorno le aree inserendo i parametri delle aree hot
        if (centroids[i].getProperties().mods > 1) {

          this.Areas[prop].hot.count = this.Areas[prop].hot.count + 1;
          this.Areas[prop].hot.area = this.Areas[prop].hot.area + area;
          this.Areas[prop].hot.func = this.Areas[prop].hot.func + feat.getProperties().functions[prop];
          this.Areas['hotarea'] = this.Areas['hotarea'] + area;


        }
      }


      /**
       * calcola un livello di deviazione standard interessante, in dipendenza delle
       * massima e minima deviazione standard di tutto il campio di riferimento
       * @param devStd deviazione standard
       * @param minmax parametri di riferimento
       * @param hots livello di hot nel caso in cui le variazioni di dev. st. non fossero interessanti
       */
      function maxdevStd(devStd, minmax, hots) {
        let result;
        if (isEmpty(devStd)) {
          result = 0;
        } else {
          let mod = Object.keys(devStd).map(key => (devStd[key] - minmax[key].min) / (minmax[key].max - minmax[key].min));

          let max = Math.max(...mod);
          if (max > 0.5 && max <= 0.75) { // se lo scostamento assoluto è tra 0,5 e 0,75 mods = 3
            result = 3;
          } else if (max > 0.75 && max <= 1) { // se lo scostamento assoluto è tra 0,75 e 1 mods = 4
            result = 4;
          } else { // altrimenti non cambia nulla
            let mod = Object.keys(hots).map(key => hots[key])
            result = Math.max(...mod);
          }
        }
        return result;
      }
      /**
       * verifico se oggetto è vuoto
       * @param obj 
       */
      function isEmpty(obj) {
        for (var key in obj) {
          if (obj.hasOwnProperty(key))
            return false;
        }
        return true;
      }



    });

    /**
     * in base alla mappa inserisco i centroidi nel layer corretto
     */
    if (this.actions === 'ahpresults') {
      this.secondSource.addFeatures(centroids);
    } else {
      this.projectSource.addFeatures(centroids);
    }

  }

  drawProject() {
    let thisZoom = 11; // setto zoom 
    /**
     * richiamo dal datastore gli esagoni degli scenari per filtrarli con lo scenario del progetto
     */
    this.datastore.HexagonsSubject.subscribe(res => {
      this.projectSource = new VectorSource({}); // inizializzazione la vector source del progetto;
      const allhexagon = res[this.project.scenario_id]; // seleziono solo gli esagoni del progetto;
      let hexagon;
      const hexlist = this.datastore.projectsHexagonsSubject.value.filter(x=>x.project_id === this.project.id)[0]
      let hexagons = []; // inizializzo array degli indici degli esagoni;
      if(hexlist.all){
        allhexagon.forEach(hex => {
          hexagons.push(hex.indexes.id); // inserisco indici esagoni del progetto nell'array hexagons;
        });
        hexagon = allhexagon;
      }else{
        hexagons = hexlist.hexagons;
        hexagon = allhexagon.filter(x => hexlist.hexagons.indexOf(x.indexes.id)  > -1);
      }
      
      
    
      // se ho più di 2500 esagoni imposto lo zoom al livello 13 (zoom ottimale per il pan)
      if (hexagons.length > 2500) {
        thisZoom = 13;
      }
      // if (this.datastore.isFacilitator()) {

      this.project.functions.forEach((func, i) => {
        this.functionsLayer[i] = new VectorLayer({
          minZoom: thisZoom,
          title: this.functionsLetter[func],
          source: this.projectSource,
          visible: false,
        });
        this.functionStyleLayer(this.functionsLayer[i], func);
        this.map.addLayer(this.functionsLayer[i]);
      });



      /**
       * inizializzo il vector layer del progetto con:
       * zoom minimo,
       * titolo del layer con titolo del progetto;
       * la source del progetto
       * e uno stile iniziale;
       */

      this.projectLayer = new VectorLayer({
        minZoom: thisZoom,
        title: 'Stats',
        source: this.projectSource,
        style: new Style({
          stroke: new StyleStroke({
            color: 'rgba(0,184,230, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(0,184,230, 0.001)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
        })
      });

      // layer dell'inviluppo degli esagoni del progetto
      let projectEdgeLayer: VectorLayer;

      if (this.actions === 'meetinresult') { // se il progetto viene disegnato nel meet-in

        /**
         * inizializzo il vector layer dell'inviluppo degli esagoni del progetto con:
         * zoom minimo,
         * titolo del layer con titolo del progetto;
         * la source del progetto
         * e uno stile iniziale;
         */
        projectEdgeLayer = new VectorLayer({
          minZoom: thisZoom,
          title: this.project.name,
          source: this.projectSource,
          style: new Style({
            stroke: new StyleStroke({
              color: 'rgba(0,184,230, 2)',
              width: 2
            }),
            fill: new StyleFill({
              color: 'rgba(0,184,230, 0.001)',
            }),
            image: new StyleCircle({
              radius: 7,
            }),
          })
        });

      }


      /**
       * creo la feature collection con il metodo "h3SetToFeatureCollection(array-indici)" con le geometrie degli esagoni ottenute a partire
       * degli indici uber h3 estratti dagli inidici degli esagoni dello scenario del progetto
       */
      const featurecollection = h3SetToFeatureCollection(hexagons);



      featurecollection.features.forEach((feature, ind) => {
        // var center_coords = getCenter(feature.getGeometry().getExtent());
        let indexes = '';
        if (!this.datastore.isFacilitator()) {
          indexes = this.stakeholder.indexes;
        }
        // aggiorno le properties delle feature
        
        this.changeProperties(hexagon, feature, indexes, '');

      });

      /**
       * proprietà delle feaure degli stakeholder
       */
      const collection = (new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      })).readFeatures(featurecollection);



      if (this.datastore.isFacilitator()) {
        this.selectVector = new olSelect({ layers: [this.projectLayer, this.functionsLayer] });
      } else {
        this.selectVector = new olSelect({ layers: [this.projectLayer] });
      }

      this.map.addInteraction(this.selectVector); // aggiungo interazione select

      this.projectSource.addFeatures(collection); // aggiungo la collection degli esagoni del progetto

      const extent = this.projectSource.getExtent();
      this.selectVector.on('select', (evt) => {

        const feature = evt.selected[0]
        const layer = evt.target.getLayer(feature);
        if (layer.get('title') === 'Stats') {
          this.infoFeature(feature, this.actions);
        } else {
          this.infoFeature(feature, 'infofunctions');
        }


      });


      const hexSource = new VectorSource({});

      const hexLayer = new VectorLayer({
        title: 'Edge',
        source: hexSource,
        style: new Style({
          stroke: new StyleStroke({
            color: 'rgba(0,203,232, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(0,203,232, 0)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 30
        }),
        zIndex: 30

      });



      this.map.addLayer(this.projectLayer);




      if (this.actions === 'meetinresult') {
        this.drawCentroids(collection);
        this.map.addLayer(projectEdgeLayer);
        this.projectLayer.setStyle(this.meetinresultStyle);
      } else if (!this.datastore.isFacilitator()) {
        this.projectLayer.setStyle(this.meetinStyle);
      }
      this.map.addLayer(hexLayer);


      const hexfeature = h3SetToFeature(hexagons);
      const hexfeatures = (new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      })).readFeatures(hexfeature);
      hexSource.addFeatures(hexfeatures);


      var overviewMapControl = new OverviewMap({
        layers: [
          hexLayer
        ],
      });

      this.map.addControl(overviewMapControl);

      setTimeout(() => {
        this.map.getView().fit(extent);
        this.map.updateSize();
      }, 1000);
    });
  }

  /**
   * aggirono le proprietà delle feature
   * @param hexagon esagoni del progetto
   * @param feature feature dell'esagono i-esimo
   * @param indexes indici degli esagoni modificati dagli stakeholders
   * @param type tipo di mappa a cui applicare il cambiamento (meetin, ahp, mappa di output)
   */
  changeProperties(hexagon, feature, indexes, type) {
    
    // se il tipo di mappa è 'ahpoutput' allora preparo tutti i dati per l'output
    if (type === 'ahpoutput') {


      hexagon.forEach(hex => {
        
        if (feature.id === hex.indexes.id) {
          /**
           * seleziono solo le funzioni del progetto (default ci sono tutte le funzioni)
           */
          
          let functs = Object.keys(hex.indexes.defaultproperties).filter(key => this.project.functions.includes(key)).reduce((obj, key) => {
            obj[key] = hex.indexes.defaultproperties[key];
            return obj;
          }, {});
          // assegno alla feature la proprietà divise per funzione
          Object.keys(functs).map((keys, index) => {
            feature.properties[keys] = functs[keys];

          });
          // se è meetin result allora  assegno alla feature la proprietà
          // divise per funzione del risultato del meet-in
          if (this.datastore.ahptypeSubject.value === 'meetin') {
            Object.keys(functs).map((keys, index) => {
              feature.properties[keys + '_meetin'] = functs[keys];
            });
          }


        }

      });

      /**
       * ahpoutput se l'output è per il risultato del meet-in
       */
      if (this.datastore.ahptypeSubject.value === 'meetin') {

        let shindexes = this.datastore.getGroupedBySubKey(this.stakeholders.map(x => x.indexes).flat(), 'id', 'functions');
        if (!this.utilities.isEmpty(shindexes)) {


          let mod_array = Object.keys(shindexes).map(x => { return shindexes[x] }); // array con i valori delle funzioni modificate dagli stakeholders per ogni indice
          let partecipants = this.stakeholders.map(x => x.number).reduce((a, b) => a + b, 0); // numero di partecipanti totali
          let func_array = {} // soglia che rende un esagono interessante
          let aarr = {} // array di tutte le modifiche per ogni funzione
          let mod_num = 0;
          mod_num = mod_array.flat().map(x => Object.keys(x).map(y => x[y]).length).reduce((a, b) => a + b, 0) // numero di modifche agli esagoni



          this.project.functions.forEach(f => {
            aarr[f] = mod_array.map(x => x.map(y => y[f]).length)
            if (aarr[f].length === 0 || partecipants === 0) {
              func_array[f] = 0;
            } else {
              /**
               * calcolo del valore soglia per rendere un esagono interessante,
               * media del numero di modifiche per la funzione i-esima per ogni esagono modificiato per il numero 
               * di modifiche per la funzione i-esima
               * diviso il numero di partecipanti per il numero totale di modifiche
               */

              func_array[f] = (this.utilities.getMean(aarr[f]) * aarr[f].length) / (partecipants * mod_num);

            }

          });

          /**
           * hexmods oggetto che contiene solo gli indici  
           * che hanno superato la soglia per essere ritenuti interessanti
           * in funzione del numero di modifiche vs partecipanti ed esagoni modificati
           * hexmods: es. {F1:[numero modifiche, superamento valore soglia (true / false), valori delle modifiche]}
           */
          let hexmods = {};
          Object.keys(this.shindexids).forEach(key => {
            hexmods[key] = {};
            this.shindexids[key].forEach(index => {
              Object.keys(index.functions).forEach(f => {
                hexmods[key][f] = [this.shindexids[key].filter(x => x.functions.hasOwnProperty(f)).length,
                (this.shindexids[key].filter(x => x.functions.hasOwnProperty(f)).length * aarr[f].length) / (partecipants * mod_num) >= func_array[f],
                this.shindexids[key].map(x => x.functions[f]).filter(y => y !== undefined)];
              });
            });
          });

          /**
           * 
           */
          Object.keys(this.hexind).forEach(index => {
            if (feature.id === index) {
              this.project.functions.forEach(funct => {

                console.log(JSON.stringify(hexmods[index][funct]));
                if (hexmods[index][funct] === undefined) {
                  return;
                } else if (hexmods[index][funct][0] === 1) {

                  if (hexmods[index][funct][1]) {
                    // se esagono è hot ma ho una sola modifica
                    feature.properties[funct + '_meetin'] = hexmods[index][funct][2]
                  } else {
                    return;
                  }


                } else if (hexmods[index][funct][0] > 1) {
                  // se esagono è hot e ho più modifiche allora applico anche la statistica
                  if (hexmods[index][funct][1]) {

                    if (this.stattype === 'mean') {
                      feature.properties[funct + '_meetin'] = this.utilities.getMean(hexmods[index][funct][2])

                    } else if (this.stattype === 'mode') {
                      feature.properties[funct + '_meetin'] = this.utilities.getMode(hexmods[index][funct][2])

                    } else if (this.stattype === 'median') {
                      feature.properties[funct + '_meetin'] = this.utilities.getMedian(hexmods[index][funct][2])

                    }
                  } else {
                    return;
                  }


                } else {
                  return;
                }


              });
            }
          });

        }
      }

    } else {
      // cambio le proprietà delle feature per meet-in e ahp

      hexagon.forEach(hex => {
        
        if (feature.id === hex.indexes.id) {
          
          feature.properties['functions'] = Object.keys(hex.indexes.defaultproperties).filter(key => this.project.functions.includes(key)).reduce((obj, key) => {
            obj[key] = hex.indexes.defaultproperties[key];
            return obj;
          }, {});

          /**
          * filter con this.project.functions
          */
          feature.properties['mods'] = {};
        }
      });
      /**
       * se è meet-in result allora aggiorno proprietà
       */
      if (this.actions === 'meetinresult' || this.actions === 'ahpresults') {
        
        feature.properties['modification'] = {}; // numero di modifiche 
        feature.properties['devStd'] = {}; // deviazione standard delle modifiche
        feature.properties['hot'] = {}; // se esagono è hot

        let shindexes = this.datastore.getGroupedBySubKey(this.stakeholders.map(x => x.indexes).flat(), 'id', 'functions');
        if (!this.isEmpty(shindexes)) {

          let mod_array = Object.keys(shindexes).map(x => { return shindexes[x] }); // array con i valori delle funzioni modificate dagli stakeholders per ogni indice
          let partecipants = this.stakeholders.map(x => x.number).reduce((a, b) => a + b, 0); // numero di partecipanti totali
          let func_array = {} // soglia che rende un esagono interessante
          let aarr = {} // array di tutte le modifiche per ogni funzione
          let mod_num = 0;
          mod_num = mod_array.flat().map(x => Object.keys(x).map(y => x[y]).length).reduce((a, b) => a + b, 0) // numero di modifche agli esagoni



          this.project.functions.forEach(f => {
            aarr[f] = mod_array.map(x => x.map(y => y[f]).length)
            if (aarr[f].length === 0 || partecipants === 0) {
              func_array[f] = 0;
            } else {
              /**
               * calcolo del valore soglia per rendere un esagono interessante,
               * media del numero di modifiche per la funzione i-esima per ogni esagono modificiato per il numero 
               * di modifiche per la funzione i-esima
               * diviso il numero di partecipanti per il numero totale di modifiche
               */

              func_array[f] = (this.utilities.getMean(aarr[f]) * aarr[f].length) / (partecipants * mod_num);

            }

          });

          /**
           * hexmods oggetto che contiene solo gli indici  
           * che hanno superato la soglia per essere ritenuti interessanti
           * in funzione del numero di modifiche vs partecipanti ed esagoni modificati
           * hexmods: es. {F1:[numero modifiche, superamento valore soglia (true / false), valori delle modifiche]}
           */
          let hexmods = {};
          Object.keys(this.shindexids).forEach(key => {
            hexmods[key] = {};
            this.shindexids[key].forEach(index => {
              Object.keys(index.functions).forEach(f => {
                hexmods[key][f] = [this.shindexids[key].filter(x => x.functions.hasOwnProperty(f)).length,
                (this.shindexids[key].filter(x => x.functions.hasOwnProperty(f)).length * aarr[f].length) / (partecipants * mod_num) >= func_array[f],
                this.shindexids[key].map(x => x.functions[f]).filter(y => y !== undefined)];
              });
            });
          });


          Object.keys(this.hexind).forEach(index => {
            if (feature.id === index) {
              Object.keys(hexmods[index]).forEach(funct => {
                feature.properties['modification'][funct] = hexmods[index][funct][0]; // numero di modifiche
                feature.properties['hot'][funct] = hexmods[index][funct][1]; // valore di hot
                feature.properties['mods'][funct] = hexmods[index][funct][1] ? 2 : 1; // se è hot allora do valore 2 altrimenti 1 (2 entra nella statistica, 1 non entra nella statistica)
                if (this.hexind[index][funct][1].length > 1) {
                  //se ho più valori calcolo deviazione standard
                  feature.properties['devStd'][funct] = this.utilities.getDS(hexmods[index][funct][2], feature.properties.functions[funct])
                } else {
                  feature.properties['devStd'][funct] = 0;
                }
              });
            }
          });
        }

      }

      if (!this.datastore.isFacilitator()) {
        // se il layer è modificato da uno stakeholder allora cambio le proprietà della feature per far vedere quelle modificate
        feature.properties['changed'] = 0;
        feature.properties['changedfunctions'] = Object.assign({}, feature.properties['functions']);
        indexes.forEach(hex => {
          if (feature.id === hex.id) {
            feature.properties['changed'] = 1;
            Object.assign(feature.properties['changedfunctions'], hex.functions);
          }
        });

      }
    }

  }

  /**
   * metodo per evidenziare i centroidi degli esagoni hot
   */
  drawhothexagon(hexs) {
    
    let type = this.datastore.ahptypeSubject.value; // tipo di elaborazione ahp
    this.secondSource.clear(); // ripulisco la source del vettore

    if (type === 'meetin') {
      
      // seleziono gli esagoni
      const allhexagon = this.datastore.HexagonsSubject.value[this.project.scenario_id];
      const hexlist = this.datastore.projectsHexagonsSubject.value.filter(x=>x.project_id === this.project.id)[0]
      let hexagons = []; // inizializzo array degli indici degli esagoni;
      let hexagon;
      if(hexlist.all){
        allhexagon.forEach(hex => {
          hexagons.push(hex.indexes.id); // inserisco indici esagoni del progetto nell'array hexagons;
        });
        hexagon = allhexagon;
      }else{
        hexagons = hexlist.hexagons;
        hexagon = allhexagon.filter(x=>hexlist.hexagons.indexOf(x.indexes.id)>-1);
      }
      
      // feature collection con il metodo h3SetToFeatureCollection della libreria h3-js
      const featurecollection = h3SetToFeatureCollection(hexagons);
      featurecollection.features.forEach(feature => {

        this.changeProperties(hexagon, feature, '', '');
      });


      const collection = (new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      })).readFeatures(featurecollection);
      
      collection.map((feat, i) => {
        
        feat.set('functions', hexs[feat.getId()]);
      });

      /**
       * richiamo il metodo per disegnare i centroidi sulla mappa
       */
      this.drawCentroids(collection);
      this.secondLayer.setStyle(this.meetinresultStyle);
      let extent = this.secondSource.getExtent();
      setTimeout(() => {
        this.map.getView().fit(extent);
        this.map.updateSize();
      }, 1000);
    } else {
      this.secondSource.clear();
    }


  }



  hotdsStyle(feature, resolution) {


    const properties = feature.getProperties();
    let devStd = properties.devStd;
    let minmax = properties.minmax;
    let mods = properties.mods;

    function maxdevStd(devStd, minmax) {
      let result;
      if (isEmpty(devStd)) {
        result = 0;
      } else {
        let mod = Object.keys(devStd).map(key => (devStd[key] - minmax[key].min) / (minmax[key].max - minmax[key].min));

        let max = Math.max(...mod);
        if (max <= 0.25) {
          result = 0;
        } else if (max > 0.25 && max <= 0.5) {
          result = 1;
        } else if (max > 0.5 && max <= 0.75) {
          result = 2;
        } else if (max > 0.75 && max <= 1) {
          result = 3;
        }
      }

      return result;
    }

    function isEmpty(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key))
          return false;
      }
      return true;
    }

    let style = {
      0: new Style({
        image: new StyleCircle({
          radius: 6,
          fill: new StyleFill({
            color: 'rgba(0,0,217, 0)'
          }),

          zIndex: 500
        })

      }),
      1: new Style({
        image: new StyleCircle({
          radius: 10,
          fill: new StyleFill({
            color: 'rgba(155 ,155,155, 1)'
          }),
          stroke: new StyleStroke({
            color: 'rgba(255,255,255, 1)',
            width: 1
          }),
          zIndex: 500
        })

      }),
      2: new Style({
        image: new StyleCircle({
          radius: 10,
          fill: new StyleFill({
            color: 'rgba(255,255,53, 1)'
          }),
          stroke: new StyleStroke({
            color: 'rgba(255,255,255, 1)',
            width: 1
          }),
          zIndex: 500
        })

      }),
      3: new Style({
        image: new StyleCircle({
          radius: 10,
          fill: new StyleFill({
            color: 'rgba(255,150,20, 1)'
          }),
          stroke: new StyleStroke({
            color: 'rgba(255,255,255, 1)',
            width: 1
          }),
          zIndex: 500
        })
      }),
      4: new Style({
        image: new StyleCircle({
          radius: 10,
          fill: new StyleFill({
            color: 'rgba(255,0,0, 1)'
          }),
          stroke: new StyleStroke({
            color: 'rgba(255,255,255, 1)',
            width: 1
          }),
          zIndex: 500
        })
      }),
      5: new Style({
        image: new StyleCircle({
          radius: 10,
          fill: new StyleFill({
            color: 'rgba(0,0,255, 1)'
          }),
          stroke: new StyleStroke({
            color: 'rgba(255,255,255, 1)',
            width: 1
          }),
          zIndex: 500
        })
      })
    }

    return style[mods];

  }

  /**
   * style per il risultato del meet in.
   * @param feature feature dell'esagono del progetto
   * @param resolution 
   */
  meetinresultStyle(feature, resolution) {

    let feattype = feature.getGeometry().getType();

    const properties = feature.getProperties();

    const hotstyle = {
      Polygon: new Style({
        stroke: new StyleStroke({
          color: 'rgba(0,203,232, 1)',
          width: 2
        }),
        fill: new StyleFill({
          color: 'rgba(0,203,232, 0.1)',
        }),
        image: new StyleCircle({
          radius: 7,
          color: 'rgba(0,168,120, 1)',
        }),
        zIndex: 10
      }),
      Point: {
        0: new Style({
          image: new StyleCircle({
            radius: 1,
            fill: new StyleFill({
              color: 'rgba(0,0,217, 0)'
            }),

            zIndex: 500
          })

        }),
        1: new Style({
          image: new StyleCircle({
            radius: 4,
            fill: new StyleFill({
              color: 'rgba(200 ,200,200, 0.75)'
            }),
            stroke: new StyleStroke({
              color: 'rgba(255,255,255, 1)',
              width: 1
            }),
            zIndex: 500
          })

        }),
        2: new Style({
          image: new StyleCircle({
            radius: 4,
            fill: new StyleFill({
              color: 'rgba(255,255,53, 1)'
            }),
            stroke: new StyleStroke({
              color: 'rgba(255,255,255, 1)',
              width: 1
            }),
            zIndex: 500
          })

        }),
        3: new Style({
          image: new StyleCircle({
            radius: 4,
            fill: new StyleFill({
              color: 'rgba(255,150,20, 1)'
            }),
            stroke: new StyleStroke({
              color: 'rgba(255,255,255, 1)',
              width: 1
            }),
            zIndex: 500
          })
        }),
        4: new Style({
          image: new StyleCircle({
            radius: 4,
            fill: new StyleFill({
              color: 'rgba(255,0,0, 1)'
            }),
            stroke: new StyleStroke({
              color: 'rgba(255,255,255, 1)',
              width: 1
            }),
            zIndex: 500
          })
        }),
        5: new Style({
          image: new StyleCircle({
            radius: 4,
            fill: new StyleFill({
              color: 'rgba(0,0,255, 1)'
            }),
            stroke: new StyleStroke({
              color: 'rgba(255,255,255, 1)',
              width: 1
            }),
            zIndex: 500
          })
        })
      }
    }


    function isEmpty(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key))
          return false;
      }
      return true;
    }
    if (feattype === 'Polygon') {
      return hotstyle[feattype];
    } else if (feattype === 'Point') {
      return hotstyle[feattype][properties.mods];
    }



  }

  functionStyleLayer(layer, func) {


    let style = {
      'F1':
      {
        0: new Style({
          stroke: new StyleStroke({
            color: 'rgba(255,255,204, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(255,255,204, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 1
        }),
        1: new Style({
          stroke: new StyleStroke({
            color: 'rgba(255,250,180, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(255,250,180, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 5
        }),
        2: new Style({
          stroke: new StyleStroke({
            color: 'rgba(255,237,160, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(255,237,160, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 10
        }),
        3: new Style({
          stroke: new StyleStroke({
            color: 'rgba(254,217,118, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(254,217,118, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 15
        }),
        4: new Style({
          stroke: new StyleStroke({
            color: 'rgba(254,178,76, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(254,178,76, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 20
        }),
        5: new Style({
          stroke: new StyleStroke({
            color: 'rgba(253,141,60, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(253,141,60, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 25
        }),
        6: new Style({
          stroke: new StyleStroke({
            color: 'rgba(253,110,10, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(253,110,10, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 30
        }),
        7: new Style({
          stroke: new StyleStroke({
            color: 'rgba(252,78,42, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(252,78,42,1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 35
        }),
        8: new Style({
          stroke: new StyleStroke({
            color: 'rgba(227,26,28, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(227,26,28, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 40
        }),
        9: new Style({
          stroke: new StyleStroke({
            color: 'rgba(189,0,38, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(189,0,38, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 45
        }),
        10: new Style({
          stroke: new StyleStroke({
            color: 'rgba(128,0,38, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(128,0,38, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 50
        }),

      },
      'F2':
      {
        0: new Style({
          stroke: new StyleStroke({
            color: 'rgba(255,255,217, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(255,255,217, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 1
        }),
        1: new Style({
          stroke: new StyleStroke({
            color: 'rgba(245,251,195, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(245,251,195, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 5
        }),
        2: new Style({
          stroke: new StyleStroke({
            color: 'rgba(237,248,177, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(237,248,177, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 10
        }),
        3: new Style({
          stroke: new StyleStroke({
            color: 'rgba(199,233,180, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(199,233,180, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 15
        }),
        4: new Style({
          stroke: new StyleStroke({
            color: 'rgba(127,205,187, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(127,205,187, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 20
        }),
        5: new Style({
          stroke: new StyleStroke({
            color: 'rgba(65,182,196, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(65,182,196, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 25
        }),
        6: new Style({
          stroke: new StyleStroke({
            color: 'rgba(45,160,194, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(45,160,194, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 30
        }),
        7: new Style({
          stroke: new StyleStroke({
            color: 'rgba(29,145,192, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(29,145,192,1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 35
        }),
        8: new Style({
          stroke: new StyleStroke({
            color: 'rgba(34,94,168, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(34,94,168, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 40
        }),
        9: new Style({
          stroke: new StyleStroke({
            color: 'rgba(37,52,148, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(37,52,148, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 45
        }),
        10: new Style({
          stroke: new StyleStroke({
            color: 'rgba(8,29,88, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(8,29,88, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 50
        }),

      },
      'F3':
      {
        0: new Style({
          stroke: new StyleStroke({
            color: 'rgba(255,255,240, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(255,255,240, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 1
        }),
        1: new Style({
          stroke: new StyleStroke({
            color: 'rgba(255,255,229, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(255,255,229, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 5
        }),
        2: new Style({
          stroke: new StyleStroke({
            color: 'rgba(247,252,185, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(247,252,185, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 10
        }),
        3: new Style({
          stroke: new StyleStroke({
            color: 'rgba(217,240,163, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(217,240,163, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 15
        }),
        4: new Style({
          stroke: new StyleStroke({
            color: 'rgba(173,221,142, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(173,221,142, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 20
        }),
        5: new Style({
          stroke: new StyleStroke({
            color: 'rgba(120,198,121, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(120,198,121, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 25
        }),
        6: new Style({
          stroke: new StyleStroke({
            color: 'rgba(100,180,98, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(100,180,98, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 30
        }),
        7: new Style({
          stroke: new StyleStroke({
            color: 'rgba(65,171,93, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(65,171,93,1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 35
        }),
        8: new Style({
          stroke: new StyleStroke({
            color: 'rgba(35,132,67, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(35,132,67, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 40
        }),
        9: new Style({
          stroke: new StyleStroke({
            color: 'rgba(0,104,55, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(0,104,55, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 45
        }),
        10: new Style({
          stroke: new StyleStroke({
            color: 'rgba(0,69,41, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(0,69,41, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 50
        }),

      },
      'F4':
      {
        0: new Style({
          stroke: new StyleStroke({
            color: 'rgba(252,250,249, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(252,250,249, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 1
        }),
        1: new Style({
          stroke: new StyleStroke({
            color: 'rgba(247,244,249, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(247,244,249, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 5
        }),
        2: new Style({
          stroke: new StyleStroke({
            color: 'rgba(231,225,239, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(231,225,239, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 10
        }),
        3: new Style({
          stroke: new StyleStroke({
            color: 'rgba(212,185,218, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(212,185,218, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 15
        }),
        4: new Style({
          stroke: new StyleStroke({
            color: 'rgba(201,148,199, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(201,148,199, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 20
        }),
        5: new Style({
          stroke: new StyleStroke({
            color: 'rgba(223,101,176, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(223,101,176, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 25
        }),
        6: new Style({
          stroke: new StyleStroke({
            color: 'rgba(231,41,138, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(231,41,138, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 30
        }),
        7: new Style({
          stroke: new StyleStroke({
            color: 'rgba(206,18,86, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(206,18,86,1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 35
        }),
        8: new Style({
          stroke: new StyleStroke({
            color: 'rgba(152,0,67, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(152,0,67, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 40
        }),
        9: new Style({
          stroke: new StyleStroke({
            color: 'rgba(103,0,31, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(103,0,31, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 45
        }),
        10: new Style({
          stroke: new StyleStroke({
            color: 'rgba(90,0,20, 2)',
            width: 2
          }),
          fill: new StyleFill({
            color: 'rgba(90,0,20, 1)',
          }),
          image: new StyleCircle({
            radius: 7,
          }),
          zIndex: 50
        }),

      }

    }
    let functionStyle = (feature, res) => {
      const properties = feature.getProperties();
      let feattype = feature.getGeometry().getType();
      if (feattype === 'Polygon') {
        return style[func][Math.round(properties.functions[func])]
      } else if (feattype === 'Point') {
        return
      }


    }

    layer.setStyle(functionStyle);


  }

  ahpStyle(feature, result) {
    const properties = feature.getProperties();
    const funct = Object.keys(properties.functions)[0];
    const value = properties.functions[funct]



    let style = {
      'F1': new Style({
        stroke: new StyleStroke({
          color: 'rgba(253,141,60, 1)',
          width: 2
        }),
        fill: new StyleFill({
          color: 'rgba(253,141,60, 0.5)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
        zIndex: 25
      }),
      'F2': new Style({
        stroke: new StyleStroke({
          color: 'rgba(65,182,196, 1)',
          width: 2
        }),
        fill: new StyleFill({
          color: 'rgba(65,182,196, 0.5)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
        zIndex: 25
      }),
      'F3': new Style({
        stroke: new StyleStroke({
          color: 'rgba(65,171,93, 1)',
          width: 2
        }),
        fill: new StyleFill({
          color: 'rgba(65,171,93, 0.5)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
        zIndex: 25
      }),
      'F4': new Style({
        stroke: new StyleStroke({
          color: 'rgba(206,18,86,1)',
          width: 2
        }),
        fill: new StyleFill({
          color: 'rgba(206,18,86,0.5)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
        zIndex: 25
      })


    }
    return style[funct];
  }

  meetinStyle(feature, result) {
    const properties = feature.getProperties();
    let changed = properties.changed;

    const style = {
      0: new Style({
        stroke: new StyleStroke({
          color: 'rgba(0,203,232, 2)',
          width: 2
        }),
        fill: new StyleFill({
          color: 'rgba(0,203,232, 0.02)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
        zIndex: 10
      }),
      1: new Style({
        stroke: new StyleStroke({
          color: 'rgba(0,255,45, 1)',
          width: 2.5
        }),
        fill: new StyleFill({
          color: 'rgba(0,255,45, 0.1)',
        }),
        image: new StyleCircle({
          radius: 7,
        }),
        zIndex: 20
      }),

    }

    return style[changed];
  }

  infoFeature(feature, action) {
    let indexes = '';
    if (!this.datastore.isFacilitator()) {
      action = 'meetinuser';

    } else if (this.actions === 'meetinresult') {
      indexes = this.shindexids[feature.getId()];
    }

    const self = this;
    async function Infomodal() {
      const StatusModal = await self.modalController.create({
        component: MapinfoComponent,
        componentProps: { properties: feature.getProperties(), Action: action, Indexes: indexes, hexindex: feature.getId() },
        // backdropDismiss: false,
      });
      await StatusModal.present();
      return await StatusModal.onDidDismiss().then(res => {
        if (self.isEmpty(res.data)) {
          self.selectVector.getFeatures().clear();


          return
        } else {
          /**
           * se mi ritorna un oggetto non nullo,
           * allora:
           */
          let data = res.data; // leggo il dato
          if (!self.datastore.isFacilitator()) {
            let indexes = self.stakeholder.indexes; // mi leggo l'array degli indici degli esagoni già modificati dallo stakeholder
            Object.assign(feature.getProperties().changedfunctions, data);
            feature.set('changed', 1); // aggiungo il dato modificato (changedfunction) alla feature.
            let feature_id = feature.getId(); // leggo l'id della feature (id univoco hexagon uber)
            let existingindexes = indexes.filter(x => x.id === feature_id)[0] // mi prendo solo l'esagono con l'id della feature selezionata (se esiste, altrimenti ritorna undefined)
            let index = {
              id: feature_id,
              functions: data
            }; // creo un nuovo oggetto index da inserire o modificare nell'array degli indici degli esagoni

            if (existingindexes !== undefined) {
              Object.assign(existingindexes.functions, index.functions); // se l'indice esiste allora aggiungo il valore modificiato
            } else {
              indexes.push(index); // se l'indice non esiste allora inserisco il nuovo indice
            }


            // salvo nel database le modifiche effettuate.
            self.datastore.updateStakeholder(self.stakeholder).subscribe(res => {
              self.projectLayer.setStyle(self.meetinStyle);
              self.selectVector.getFeatures().clear();
            });

          } else {

            let indexes = self.facilitator.indexes;
            let feature_id = feature.getId(); // leggo l'id della feature (id univoco hexagon uber)
            let existingindexes = indexes.filter(x => x.id === feature_id)[0]; // mi prendo solo l'esagono con l'id della feature selezionata (se esiste, altrimenti ritorna undefined)
            if (data !== 'resetvalues') {

              const index = {
                id: feature_id,
                functions: data
              }; // creo un nuovo oggetto index da inserire o modificare nell'array degli indici degli esagoni
              if (existingindexes !== undefined) {
                Object.assign(existingindexes.functions, index.functions); // se l'indice esiste allora aggiungo il valore modificiato
              } else {
                indexes.push(index); // se l'indice non esiste allora inserisco il nuovo indice
              }

              self.projectSource.getFeatureById('Cent' + feature_id).set('mods', 5);

            } else {
              self.facilitator.indexes = indexes.filter(el => el.id !== feature_id);


            }

            self.datastore.updateStakeholder(self.facilitator).subscribe(res => {

              self.projectLayer.setStyle(self.meetinresultStyle);
              self.selectVector.getFeatures().clear();
            });


          }


        }




      });
    }
    if (feature !== undefined) {
      Infomodal();
    }


  }

  infoFunctions(feature, action) {
    let indexes = '';

    const self = this;
    async function Infomodal() {
      const StatusModal = await self.modalController.create({
        component: MapinfoComponent,
        componentProps: { properties: feature.getProperties(), Action: action },
        // backdropDismiss: false,
      });
      await StatusModal.present();
      return await StatusModal.onDidDismiss().then(res => {

        self.selectVector.getFeatures().clear();
      });
    }
    if (feature !== undefined) {
      Infomodal();
    }


  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  ngOnChanges() {
    
    console.log('change');
  }

  showPanel() {
    if (!this.maplegend.classList.contains(this.shownClassName)) {
      this.maplegend.classList.add(this.shownClassName);
    }
  }

  hidePanel() {
    if (this.maplegend.classList.contains(this.shownClassName)) {
      this.maplegend.classList.remove(this.shownClassName);
    }
  }



}
