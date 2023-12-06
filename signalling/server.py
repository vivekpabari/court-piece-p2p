import traceback
import copy
import random

from flask import Flask, request

from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"

socketio = SocketIO(app, cors_allowed_origins="*")

game_room_details = dict()
cards_room_details = dict()

@socketio.on("get_cards")
def get_cards(message):
    game_id = message["game_id"]
    player_seat = int(message["player_seat"])

    if game_id not in cards_room_details:
        cards_room_details[game_id] = ['2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS', 'AS', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC',
                                       'KC', 'AC', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH', 'AH', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD', 'AD']
        random.shuffle(cards_room_details[game_id])

    emit("get_cards", cards_room_details[game_id]
         [player_seat*13:player_seat*13 + 13], to=request.sid)


@socketio.on("get_users_details")
def get_users_details(message):
    game_id = message["game_id"]
    if game_id in game_room_details:  # send players detail if present
        payload = copy.deepcopy(game_room_details[game_id])
        for p in payload:
            if "player_id" in p:
                del p["player_id"]
        emit(
            "get_users_details", payload, to=request.sid
        )
    else:
        emit(
            "get_users_details", [{}, {}, {}, {}], to=request.sid
        )


@socketio.on("join")
def join(message):
    player_id = message["player_id"]
    player_name = message["player_name"]
    player_seat = int(message["player_seat"])
    game_id = message["game_id"]
    if game_id in game_room_details:
        # checking for duplicate player seat
        if len(game_room_details[game_id][player_seat].keys()) > 0 and game_room_details[game_id][player_seat].get("player_id") != player_id:
            emit("invalid_player_seat", to=request.sid)
            return

        # checking for duplicate player name
        if any(
            [
                player_name == existing_player.get("player_name")
                and player_id != existing_player.get("player_id")
                for existing_player in game_room_details[game_id]
            ]
        ):
            print("emiting invalid_player_name")
            emit("invalid_player_name", to=request.sid)
            return

        game_room_details[game_id][player_seat] = {
            "player_id": player_id,
            "player_name": player_name,
            "socket_id": request.sid,
        }
        emit("valid_player_name_and_player_seat", to=request.sid)
    else:  # for player0
        game_room_details[game_id] = [{}, {}, {}, {}]
        game_room_details[game_id][player_seat] = {
            "player_id": player_id,
            "player_name": player_name,
            "socket_id": request.sid,
        }
    join_room(game_id)
    print("RoomEvent: {} has joined the room {}\n".format(player_name, game_id))
    payload = {
        "player_name": player_name,
        "player_seat": player_seat,
        "socket_id": request.sid
    }
    emit(
        "join",
        payload,
        to=game_id,
        skip_sid=request.sid,
    )
    emit("valid_player_name_and_player_seat", to=request.sid)


@socketio.on("data")
def transfer_data(message):
    payload = {
        "data": message["data"],
        "sender_seat": message["sender_seat"],
        "sender_socket_id": request.sid
    }
    emit("data", payload, to=message["to"])


@socketio.on_error_default
def default_error_handler(err):
    print(f"error: {err}")
    print(traceback.format_exc())


if __name__ == "__main__":
    socketio.run(app)
