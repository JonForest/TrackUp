const FREQUENCY = 10000
let map
let issuePoints = []

const pinColor  = "FE7569";
let pinImage
let pinShadow

module.exports = function (mapArg) {
  map = mapArg

  pinImage = new google.maps.MarkerImage("https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34));
  pinShadow = new google.maps.MarkerImage("https://chart.apis.google.com/chart?chst=d_map_pin_shadow",
    new google.maps.Size(40, 37),
    new google.maps.Point(0, 0),
    new google.maps.Point(12, 35));
  setInterval(listen, FREQUENCY)
}

function listen () {
  $.ajax({
    url: 'https://trackup.azurewebsites.net/api/Get',
    method: 'GET',
    headers: {
      AuthToken: 'H4O0v4oHE4MB19hoA2Tsrgzb9SkYWk646MDN69W54y62DE4L15h183V4xyEvH4O0v4oHE4MB19'
    }
  }).done(data => {
    debugger
    setMapOnAll(null)
    issuePoints = []
    data.forEach(addMarker)
  })

}

function setMapOnAll(map) {
  for (var i = 0; i < issuePoints.length; i++) {
    issuePoints[i].setMap(map);
  }
}


function addMarker ({Latitude, Longitude, Notes, Emergency}) {
  if (Emergency) {
    issuePoints.push(new google.maps.Marker({
      position: { lat: Latitude, lng: Longitude },
      label: '',
      map: map,
      icon: pinImage,
      shadow: pinShadow
    }))
  } else {
    issuePoints.push(new google.maps.Marker({
      position: { lat: Latitude, lng: Longitude },
      label: '',
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10
      }
    }))
  }
}
