// Definimos un ejemplo de GameState en JSON para los test

export const GameState = {
    "_id": "XXXX",
    "channelId": "ID_del_canal_de_discord",
    "gameName": "El tesoro escondido",
    "lastInteractionTime": "timestamp",
    "gameState": {
        "playerId": "playerTest",
        "inventario": [
            "manzana electrica",
            "script acceso lvl_3"
        ],
        "localizacion actual": {
            "id": "exterior cueva",
            "descripcion": "Estás frente a una tosca entrada que recuerda a una cueva...",
            "alias": ["exterior cueva", "fuera cueva"],
            "objetos localizacion": ["manzana electrica"],
            "entorno localizacion": {
                "gronk_mcc": {
                    "id": "Gronk",
                    "alias": ["gronk", "cyclope"],
                    "descripcion": "GRONK, ahora vibra con una luz verde tenue...",
                    "iteracciones": [  ]
                }
            },
            "salidas": {
                "norte": {
                    "localizacion": "cueva magica tecno",
                    "reto": "bypass gronk abierto",
                },
                "sur": {
                    "localizacion": "bosque"
                }
            },
            "retos": [
                {
                    "id": "bypass gronk abierto",
                    "gatillo": ["pasar", "ir norte", "entrar cueva"],
                    "condiciones": "darle la manzana electrica a gronk",
                    "isCompleted": false,
                }
            ]
        },
    }
}