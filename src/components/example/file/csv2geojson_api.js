cnpm i csv2geojson--save

方法：
1.auto - 解析为数组对象（不常用）
2.csv - 解析为数组对象（不常用）
3.csv2geojson - 分析CSV文件并从中生成GeoJSON FeatureCollection对象。
如果无法检测到纬度和经度值，或者文件中存在无效行，则错误。
分隔符可以是CSV的“，”或TSV的“\t”或“|”和其他分隔符。
csv2geojson.csv2geojson(
    csvString,
    {

        lonfield: "lon",//经度
        latfield: "lat",//纬度
        delimiter: ",",//分隔符
    },
    (err, data) => {
        this.addGeojsonLayer(data);
    }
);

4.dsv -（不常用）
5.guessLatHeader - 猜测纬度头 （不常用）
6.guessLonHeader - 猜测经度头 （不常用）
7.isLat - 是否存在纬度（不常用）
8.isLon - 是否存在经度（不常用）
9.toLine - 给定一个由点组成的GeoJSON文件，按照给定的顺序导出一个由具有这些点坐标的多边形或直线组成的文件
10.toPolygon - 给定一个由点组成的GeoJSON文件，按照给定的顺序导出一个由具有这些点坐标的多边形或直线组成的文件


11.tsv - (Tab - separated values, 制表符分隔值)：制表符（Tab,’\t’）作为字段值的分隔符（不常用）
   csv(Comma - separated values, 逗号分隔值)：用半角逗号（’,’）作为字段值的分隔符



