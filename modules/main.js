/* global alert, google, $, FileReader */
// In the following example, markers appear when the user clicks on the map.
// Each marker is labeled with a single alphabetical character.
import $ from 'jquery'
import sampledata from './sampledata'
import toDataUrl from './base64Image'
import R from 'ramda'


var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
var labelIndex = 0

var map
let user, currentPosition

const dataSet = R.clone(sampledata)

const mapHtml = `
<div id="map"></div>
<input type="file" accept="image/*" id="imageUpload">
`

const textHtml = `
<textarea id="notes"></textarea>
<button id="send">Send</button>
`

function initMap () {
  $('#map-container').html(mapHtml)

  if (navigator.geolocation) {
    getCurrentPosition().then(position => {
      map = new google.maps.Map(document.getElementById('map'), {
        center: position,
        zoom: 14
      })
      addUserMarker(position)
      map.data.loadGeoJson('Council_Walkways_and_MTB_Trails.geojson')
      google.maps.event.addListener(map, 'click', function (event) {
        tellTheWorld(event.latLng)
      })
      setInterval(updateLocation, 1000)
    })
  } else {
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: -34.397, lng: 150.644 }, //position,
      zoom: 14
    })
    map.data.loadGeoJson('Council_Walkways_and_MTB_Trails.geojson')
  }

  google.maps.event.addListener(map, 'click', function (event) {
    tellTheWorld(event, event.latLng)
    // addMarker(event.latLng, map)
  })
  // $('#sendData').on('click', tellTheWorld)
  $('#imageUpload').on('change', readFile)
}

function getCurrentPosition (cb) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords
      console.log(`Latitude: ${latitude},  Longitude: ${longitude}`)
      dataSet.Latitude = latitude
      dataSet.Longitude = longitude
      resolve({lat: latitude, lng: longitude})
    }, reject)
  })
}

function updateLocation () {
  getCurrentPosition().then(position => {
    if (currentPosition.lat !== position.lat ||
      currentPosition.lng !== position.lng) {
      addUserMarker(position)
    }
  })
}

// // Adds a marker to the map.
// function addMarker (location, map) {
//   // Add the marker at the clicked location, and add the next-available label
//   // from the array of alphabetical characters.
//   var marker = new google.maps.Marker({
//     position: location,
//     label: labels[labelIndex++ % labels.length],
//     map: map
//   })
//
//   dataSet.Latitude = location.lat
//   dataSet.Longitude = location.lng
// }

function addUserMarker (position) {
  currentPosition = R.clone(position)
  if (user) user.setMap(null)
  user = new google.maps.Marker({
    position: position,
    label: '',
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10
    }
  })
  debugger
}

function readFile () {
  if (this.files && this.files[0]) {
    var fileReader = new FileReader()
    fileReader.onload = function (e) {
      captureLocation()
      $('#map-container').html(textHtml)
      // dataSet.Photo = e.target.result
      // EL('img').src       = e.target.result
      // EL('b64').innerHTML = e.target.result
    }
    fileReader.readAsDataURL(this.files[0])
  }
}

function captureLocation () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(tellTheWorld, (err) => alert(err.message));
  } else {
    alert('geolocation not supported');
  }
}

function tellTheWorld (position) {
  let lat, lng
  if (position.lat) {
    lat = position.lat()
    lng = position.lng()
  } else {
    debugger
  }
  console.log(`Latitude: ${lat},  Longitude: ${lng}`)
  dataSet[0].Latitude = lat
  dataSet[0].Longitude = lng
  if (!dataSet[0].Latitude || !dataSet[0].Longitude) return alert('Upload a file')
  // sampledata.image = fileData
  $.ajax({
    url: 'https://trackup.azurewebsites.net/api/Post',
    method: 'POST',
    data: JSON.stringify(dataSet),
    headers: {
      Authtoken: 'H4O0v4oHE4MB19hoA2Tsrgzb9SkYWk646MDN69W54y62DE4L15h183V4xyEvH4O0v4oHE4MB19'
    }
  }).done(data => {
    alert(data)
  }).fail(jqXHR => {
    console.log(jqXHR)
  })
}

window.initMap = initMap
