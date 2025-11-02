// Definimos un ejemplo de GameState en JSON para los test

export const GameState = {
    "_id": "XXXX",
    "channelId": "ID_del_canal_de_discord",
    "gameName": "El tesoro escondido",
    "lastInteractionTime": "timestamp",
    "gameState": {
        "playerId": "playerTest",
        "posicion": "exterior cueva",
        "inventario": [
            "manzana electrica",
            "script acceso lvl_3"
        ],
        "eventos": [
            "codigo activado puerta"
        ],
        "sala_actual": {
            "id": "exterior cueva",
            "descripcion": "Estás frente a una tosca entrada que recuerda a una cueva...",
            "alias": ["exterior cueva", "fuera cueva"],
            "objetos_en_sala": ["manzana electrica"],
            "entorno_en_sala": {
                "gronk_mcc": {
                    "id": "Gronk",
                    "alias": ["gronk", "cyclope"],
                    "descripcion": "GRONK, ahora vibra con una luz verde tenue...",
                    "iteracciones": [  ]
                }
            },
            "salidas": {
                "norte": "cueva magica tecno",
                "sur": "bosque"
            },
            "retos_asociados": [
                {
                    "id": "bypass gronk abierto",
                    "gatillo": ["pasar", "ir norte"],
                    "condiciones": {"requiere evento": "gronk bypass exitoso"},
                    "efectos": {"desbloquea salida": "norte"}
                }
            ]
        }
    }
}