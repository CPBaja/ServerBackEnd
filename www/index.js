let map = L.map('map', {zoomControl: false, attributionControl:false}).setView([35.3, -120.6597], 15);
L.tileLayer('/t/{id}/{z}/{x}/{y}', {
    maxZoom: 20,
    id: 'mapbox.streets'
}).addTo(map);

$('.ui.dropdown')
    .dropdown()
;