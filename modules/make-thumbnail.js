module.exports  = function (original, scale) {
  var canvas = document.createElement("canvas")

  canvas.width = original.width * scale
  canvas.height = original.height * scale

  canvas.getContext("2d").drawImage
  (original, 0, 0, canvas.width, canvas.height)

  return canvas
}
