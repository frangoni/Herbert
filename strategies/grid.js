const grid = async (pair, interval) => {
	let resistencia;
	let soporte;
	let grids;

	let amplitud = resistencia - soporte;
	let diferenciaGrillas = amplitud / grids;
	let coeficienteGrillas = diferenciaGrillas / amplitud;

	//SOPORTE - RESISTENCIA - CANTIDAD DE GRILLAS
	/*Con esos tres valores calcular porcentaje entre grillas.
      diferenciaPrecioGrilla = (Resistencia - soporte)/ cantidad de grids
      Crear una orden por grilla dependiendo precio actual. 
      Las grillas arriba del precio actual son ordenes de venta, abajo de compra.
      Monto de orden = ((Monto total * palanca)/ cantidad de grids)*margen 
    */
};

module.exports = grid;
