/* global alert, google, $, FileReader */
// In the following example, markers appear when the user clicks on the map.
// Each marker is labeled with a single alphabetical character.
import $ from 'jquery'
import sampledata from './sampledata'
import toDataUrl from './base64Image'
import R from 'ramda'
import issueMarkers from './issue_markers'
import makeThumbnail from './make-thumbnail'


var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
var labelIndex = 0

let map
let user
let currentPosition
let issuePoints = []

const dataSet = R.clone(sampledata)

const mapHtml = `
<nav class="header">
    <img class="header-icon" src="images/touch/picker_128.png" height="40px" width="40px"></img>
    <h1 class="page-title">TrackUP</h1>
</nav>
<div id="map"></div>

<div class="footer" id="buttons">
  <div class="row">
    <div class="col-xs-6">
      <span class="fileUpload">
          <button class="btn btn-block btn-default"><span class="glyphicon glyphicon-bullhorn"></span> Report Issue</button>
          <input type="file" multiple="false" accept="image/*" id="imageUpload" class="upload">
      </span>
    </div>
    <div class="col-xs-6">
      <button class="btn btn-block btn-default"><span class="glyphicon glyphicon-warning-sign"></span> Emergency</button>
    </div>
  </div>
</div>
`

const textHtml = `
<div class='row' id="textcapture">
    <div class='col-xs-12'>
        <h1>Describe the problem</h1>
        <textarea style="width:100%; height:300px;" id="notes"></textarea>
    </div>
    <div class='col-xs-12'>
        <div class='btn btn-block btn-success' id="send"><span class="glyphicon glyphicon-envelope"></span> Send</div>
    </div>
 </div>
`

const thankyouHtml =
`
<div id="thankyou">
<h1>Thank you!</h1>
<div class='btn btn-block btn-success' id="back">Back to Map</div>
</div>
`

function initMap () {
  $('body').html(mapHtml)

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
      // issueMarkers(map)
    })
  } else {
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: -34.397, lng: 150.644 }, //position,
      zoom: 14
    })
    map.data.loadGeoJson('Council_Walkways_and_MTB_Trails.geojson')
  }
  $(document).on('change', '#imageUpload', readPhoto)
  $(document).on('click', '#send', tellTheWorld)
  $(document).on('click', '#back', () => {
    $('#thankyou').addClass('hidden')
    $('#map').removeClass('hidden')
    $('#buttons').removeClass('hidden')
  })
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

function readPhoto () {
  if (this.files && this.files[0]) {
    var fileReader = new FileReader()
    fileReader.onload = function (e) {
      var img = document.createElement("img")
      img.src = e.target.result
      let canvas = makeThumbnail(img, 0.3)
      $('#map').addClass('hidden')
      $('#buttons').addClass('hidden')
      $('body').append(textHtml)
      // $('.header-icon').attr('src', canvas.toDataURL('image/jpeg'))
      dataSet[0].Photo = canvas.toDataURL('image/jpeg')
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
  dataSet[0].Notes = $('#notes').val()
  if (!dataSet[0].Latitude || !dataSet[0].Longitude) return alert('Upload a file')

  $.ajax({
    url: 'https://trackup.azurewebsites.net/api/Post',
    method: 'POST',
    data: JSON.stringify(dataSet),
    headers: {
      AuthToken: 'H4O0v4oHE4MB19hoA2Tsrgzb9SkYWk646MDN69W54y62DE4L15h183V4xyEvH4O0v4oHE4MB19'
    }
  }).done(data => {
    $('#textcapture').addClass('hidden')
    $('body').append(thankyouHtml)
  }).fail(jqXHR => {
    $('#textcapture').addClass('hidden')
    $('body').append(thankyouHtml)
  })
}



window.initMap = initMap

/**
 * TODO:
 * 1. Snap the user, or the coordinates, to the nearest trail
 * 2.
 */

