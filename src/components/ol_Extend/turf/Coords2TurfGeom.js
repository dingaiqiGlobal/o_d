import * as turf from '@turf/turf'
let Coords2TurfGeom = {
    Point: (coords) =>{
        return turf.point(coords);
    },
    MultiPoint: (coords) =>{
        return turf.multiPoint(coords);
    },
    LineString: (coords) =>{
        return turf.lineString(coords);
    },
    MultiLineString: (coords)=> {
        return turf.multiLineString(coords);
    },
    Polygon: (coords) =>{
        return turf.polygon(coords);
    },
    MultiPolygon: (coords) =>{
        return turf.multiPolygon(coords);
    },
}
export default Coords2TurfGeom;