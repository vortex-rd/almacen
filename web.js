var mongodb = require('mongodb');
var libVortex = require("vortexjs");
var vx = libVortex.Vortex;

var FiltroXEjemplo = libVortex.FiltrosYTransformaciones.FiltroXEjemplo;


vx.start({verbose:true});
vx.conectarPorWebSockets({
    url:'https://router-vortex.herokuapp.com' 
    //url:'http://localhost:3000'
});   


/*
vx.enviarMensaje({
	tipoDeMensaje: 'chota',
	dato1: 'uhuhuhuhuhu',
	dato2: 'aaaaahhhhhhhh'
});
*/

// obtenemos el server MongoDB que dejamos corriendo
// *** el puerto 27017 es el default de MongoDB
var server = new mongodb.Server("127.0.0.1", 27017, {});
 
// obtenemos la base de datos de prueba que creamos
var db = new mongodb.Db('basePrueba', server, {})
 
// abrimos la base pasando el callback para cuando esté lista para usar
db.open(function (error, client) {
	
	if (error) throw error;
	
	//en el parámetro client recibimos el cliente para comenzar a hacer llamadas
	//este parámetro sería lo mismo que hicimos por consola al llamar a mongo
	
	//Obtenemos la coleccion personas que creamos antes
	var collection = new mongodb.Collection(client, 'mensajes');
	
	vx.pedirMensajes({
		filtro: new FiltroXEjemplo({
			tipoDeMensaje: "vortex.almacen.persistencia"
		}),
		callback: function(mensaje){
			
			//buscar si existe
			//db.mensajes.update({de: mensaje.de}, mensaje, true, true);
			
			/*
			collection.find({de: mensaje.de}).toArray(function(err, docs) {
				if(docs.length>0){
					
				}else{
					collection.insert(mensaje, {w:1}, function(err, result) {
						console.log(err);
						console.log(result);
					});
				}
			});
			
			*/
			
			collection.insert(mensaje, {w:1}, function(err, result) {
				console.log(err);
				console.log(result);
			});
			
			vx.enviarMensaje({
				tipoDeMensaje: 'vortex.almacen.persistencia.estado',
				para: mensaje.de,
				idrespuesta: mensaje.idrespuesta,
				estado: "ok"
			});
		}
	});
	
	vx.pedirMensajes({
		filtro: new FiltroXEjemplo({
			tipoDeMensaje: "vortex.almacen.consulta"
		}),
		callback: function(mensaje){
			
			
			var consulta;
			if(mensaje.consulta){
				consulta = mensaje.consulta;
			}else{
				consulta = {de: mensaje.de};
			}
			
			collection.find(consulta).toArray(function(err, docs) {
				vx.enviarMensaje({
					tipoDeMensaje: 'vortex.almacen.consulta.resultado',
					para: mensaje.de,
					idrespuesta: mensaje.idrespuesta,
					resultado: docs
				});
				
			});
			
		}
	});
	
});
