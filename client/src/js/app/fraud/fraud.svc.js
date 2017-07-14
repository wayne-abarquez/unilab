(function(){
'use strict';

angular.module('demoApp.fraud')
    .factory('fraudService', ['$q', 'MARKER_BASE_URL', 'Fraud', 'gmapServices', fraudService]);

    function fraudService ($q, MARKER_BASE_URL, Fraud, gmapServices) {
        var service = {};

        var fraudMarkerUrl = MARKER_BASE_URL + 'fraud.png';
        var fraudMarkers = [],
            fraudInfowindow;

        service.uploadEmployeeData = uploadEmployeeData;
        service.showFraudDataOnMap = showFraudDataOnMap;
        service.showMarker = showMarker;

        function uploadEmployeeData (file) {
            var dfd = $q.defer();

            if (!file) {
                dfd.reject();
            } else {
                file.upload = Fraud.uploadEmployeeData(file);

                file.upload.then(function (response) {
                        file.result = response.data;
                        dfd.resolve(response.data);
                }, function (error) {
                    dfd.reject(error);
                }, function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));

                });
            }

            return dfd.promise;
        }

        function showFraudDataOnMap (list) {
            if (!fraudInfowindow) fraudInfowindow = gmapServices.createInfoWindow('', {pixelOffset: new google.maps.Size(0, 20)});

            var marker;

            // TODO: need to fix date and time before to add on info
            var except = ['latlng'];

            list.forEach(function(item, idx){
               if (item.latlng) {
                   marker = gmapServices.initMarker(
                       item.latlng,
                       fraudMarkerUrl
                   );

                   marker.content = '<div>';
                   for (var k in item) {
                       if (except.indexOf(k) === -1) {
                           marker.content += '<p style="margin:0;padding:0;"><b>' + k.capitalize() + '</b> : ' + (item[k] ? item[k] : '') + '</p>';
                       }

                       if (k.indexOf('address') > -1) {
                           item['merchant_address'] = angular.copy(item[k]);
                           delete item[k];
                       } else if(k.indexOf('station') > -1) {
                           item['merchant_name'] = angular.copy(item[k]);
                           delete item[k];
                       } else if(k == 'transaction type') {
                           item['type'] = angular.copy(item[k])
                           delete item[k];
                       }
                   }
                   marker.content += '</div>';

                   marker.id = idx;
                   marker.data = angular.copy(item);

                   gmapServices.addListener(marker, 'click', function () {
                       fraudInfowindow.open(gmapServices.map, this);
                       fraudInfowindow.setContent(this.content);
                   });

                   fraudMarkers.push(marker);
               }
            });

            return fraudMarkers;
        }

        function showMarker (id) {
            var found = _.findWhere(fraudMarkers, {id: id});
            if (found) {
                if (!found.getMap()) found.setMap(gmapServices.map);

                gmapServices.setZoomIfGreater(14);
                gmapServices.panToMarker(found);

                // show infowindow
                gmapServices.triggerEvent(found, 'click');
            }
        }

        return service;
    }
}());