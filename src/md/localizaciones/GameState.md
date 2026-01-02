# Game State
## jugador
- nombre: Viktor
## inventario
- script exploit-2sP: en python
## localizacion actual
- nombre: exterior cueva
- descripcion: El exterior de la cueva es un lugar húmedo y oscuro.
   Lleno de silvas y rocas cubiertas de musgo, con una atmósfera misteriosa.
### objetos localizacion
- manzana: roja y apetitosa
### escenario
- Grok: un troll que vigila ferozmente la entrada de la cueva
### salidas
- norte: cueva magica
  -reto
    - nombre: "Gronk no deja pasar"
    - descripcion: Gronk no deja pasar por la salida norte a no ser que el jugador le de la manzana
    - condiciones: darle la manzana a Gronk para que se calme deje pasar a la salida norte
    - objetos necesarios: manzana
    - esta completado: false
    - sur: bosque encantado
### retos
- Gronk no deja pasar:
    