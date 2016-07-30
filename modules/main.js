/* global alert, google, $, FileReader */
// In the following example, markers appear when the user clicks on the map.
// Each marker is labeled with a single alphabetical character.
import $ from 'jquery'
import sampledata from './sampledata'
import toDataUrl from './base64Image'
import R from 'ramda'


var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
var labelIndex = 0

let map
let user
let currentPosition
let issuePoints = []

const dataSet = R.clone(sampledata)

const mapHtml = `
<div id="map"></div>
<div class="container">
<div class="row">
  <div class="col-xs-6">
    <span class="fileUpload">
        <button class="btn btn-success" style="width: 100%">Report Issue</button>
        <input type="file" multiple="false" accept="image/*" id="imageUpload" class="upload">
    </span>
  </div><div class="col-xs-6">
    <button class="btn btn-danger" style="width: 100%">Emergency</button>
  </div>
</div>
</div>
`

const textHtml = `
"<div class='row'>
    <div class='col-lg-12'>
        <h1>What would you like to say?</h1>
        <textarea style='width:100%; height:300px;'></textarea>
    </div>
    <div class='col-lg-12'>
        <div class='btn btn-block btn-success'>Send</div>
    </div>
 </div>";
    
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
      map.data.setStyle({
        strokeColor: 'black',
        strokeWeight: 4,
        strokeOpacity: 0.4
      })
      google.maps.event.addListener(map, 'maptypeid_changed', function (event) {
        var strokeColour = map.data.style.strokeColor === 'black' ? 'yellow' : 'black'
        map.data.setStyle({
          strokeColor: strokeColour,
          strokeWeight: 4,
          strokeOpacity: 0.4
        })
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
  $(document).on('change', '#imageUpload', readFile)
  $(document).on('click', '#send', tellTheWorld)
}

function getCurrentPosition (cb) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords
      console.log(`Latitude: ${latitude},  Longitude: ${longitude}`)
      dataSet[0].Latitude = latitude
      dataSet[0].Longitude = longitude
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

function addUserMarker (position) {
  currentPosition = R.clone(position)
  dataSet[0].Latitude = position.lat
  dataSet[0].Longitude = position.lng
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
}

function readFile () {
  if (this.files && this.files[0]) {
    var fileReader = new FileReader()
    fileReader.onload = function (e) {
      $('#map-container').html(textHtml)
      dataSet[0].Photo = e.target.result
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

function tellTheWorld () {
  if (!dataSet[0].Latitude || !dataSet[0].Longitude) return alert('Upload a file')

  $.ajax({
    url: 'https://trackup.azurewebsites.net/api/Post',
    method: 'POST',
    data: JSON.stringify(dataSet),
    headers: {
      AuthToken: 'H4O0v4oHE4MB19hoA2Tsrgzb9SkYWk646MDN69W54y62DE4L15h183V4xyEvH4O0v4oHE4MB19'
    }
  }).done(data => {
    alert(data)
  }).fail(jqXHR => {
    console.log(jqXHR)
  })
}

function listen() {
  $.ajax({
    url: 'https://trackup.azurewebsites.net/api/Get',
    method: 'GET',
    headers: {
      AuthToken: 'H4O0v4oHE4MB19hoA2Tsrgzb9SkYWk646MDN69W54y62DE4L15h183V4xyEvH4O0v4oHE4MB19'
    }
  }).done(data => {
    setMapOnAll(null)
    issuePoints = []

  })

}

function setMapOnAll(map) {
  for (var i = 0; i < issuePoints.length; i++) {
    issuePoints[i].issuePoints(map);
  }
}

window.initMap = initMap
