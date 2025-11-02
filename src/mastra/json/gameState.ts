// Definimos un ejemplo de GameState en JSON para los test

export const GameState = {
    "_id": "XXXX",
    "channelId": "ID_del_canal_de_discord",
    "gameName": "El tesoro escondido",
    "lastInteractionTime": "timestamp",
    "gameState": {
        "playerId": "identificador_unico_del_jugador_o_sesion",
        "posicion": "id_de_la_sala_actual",
        "inventario": [
            "manzana_electrica",
            "script_acceso_lvl_3"
        ],
        "eventos": [
            "gronk_bypass_exitoso",
            "codigo_activado_puerta"
        ],
        "sala_actual": {
            "id": "exterior_cueva_mcc",
            "descripcion": "Estás frente a una tosca entrada que recuerda a una cueva...",
            "alias": ["exterior cueva mcc", "fuera cueva"],
            "objetos_en_sala": ["manzana electrica"],
            "entorno_en_sala": {
                "gronk_mcc": {
                    "id": "gronk_mcc",
                    "alias": ["gronk", "mcc", "cyclope"],
                    "descripcion": "GRONK, el colosal MCC, ahora vibra con una luz verde tenue...",
                    "estado_operacional": "bypass_exitoso",
                    "interacciones": [  ]
                }
            },
            "salidas": {
                "norte": "cueva magica tecno",
                "sur": "bosque"
            },
            "retos_asociados": [
                {
                    "id": "bypass_gronk_abierto",
                    "gatillo": ["pasar", "ir norte"],
                    "condiciones": {"requiere_evento": "gronk_bypass_exitoso"},
                    "efectos": {"desbloquea_salida": "norte"}
                }
            ]
        }
    }
}