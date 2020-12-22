const multer = require('multer')
const shortid = require('shortid')
const fs = require('fs')
const Enlaces = require('../models/Enlace')

exports.subirArchivo = async (req, res) => {
  const configuracionMulter = {
    limits: {
      fileSize : req.usuario ? 1024 * 1024 * 10 : 1024 * 1024
    },
    storage: fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, __dirname + '/../uploads')
      },
      filename: (req, file, cb) => {
        // const extension = file.mimetype.split('/')[1]
        const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length)
        cb(null, `${shortid.generate()}${extension}`)
      }/*,
      fileFilter: (req, file, cb) => {
        if(file.mimetype === "application/pdf") {
          return cb(null, true)
        }
      }*/
    })
  }
  
  const upload = multer(configuracionMulter).single('archivo')

  upload(req, res, async (error) => {
    //console.log(req.file)
    if(!error) {
      res.json({archivo : req.file.filename})
    } else {
      console.log(error)
      return next()
    }
  })
}

exports.eliminarArchivo = async (req, res) => {
  console.log(req.archivo)
  try {
    fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`)
    console.log('Archivo eliminado')
  } catch (error) {
    console.log(error)
  }
}

//descarga un archivo
exports.descargar = async (req, res, next) => {

  //obtiene el enlace

  const {archivo} = req.params
  const enlace = await Enlaces.findOne({nombre: archivo})

  const archivoDescarga = __dirname + '/../uploads/' + archivo
  res.download(archivoDescarga)

  //eliminar el archivo y la entrada de la bd
  
  //si las descargas son iguales a 1 - borrar la entrada y archivo
  const {descargas, nombre} = enlace
  if(descargas===1) {

    //eliminar el archivo
    req.archivo = nombre

    //eliminar la entrada de las bases de datos
    await Enlaces.findOneAndRemove(enlace.id)
    next()

  } else {
    // si las descargas son > a 1 - restar 1
    enlace.descargas--
    await enlace.save()
    console.log('aun hay descargas')
  }
  

}