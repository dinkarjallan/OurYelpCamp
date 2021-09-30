mapboxgl.accessToken = mapToken; // called from declaration on other script tag
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10', // style URL
    center: campground.geometry.coordinates, // plugging in the coordinates of the campground in the map
    zoom: 10 // starting zoom
});

// adding controls
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h6>${campground.title}</h6><p>${campground.location}</p>`
        )
    )
    .addTo(map);