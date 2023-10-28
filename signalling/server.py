import traceback
import copy
import random
import itertools

from flask import Flask, request

from flask_socketio import SocketIO, emit, join_room, send

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
        suits = ["s","c","h","d"]
        faces = ["2","3","4","5","6","7","8","9","10","j","q","k","a"]
        cards_room_details[game_id] = list(itertools.product(faces, suits))
        random.shuffle(cards_room_details[game_id])
    
    print(cards_room_details[game_id])
    print(player_seat)
    print(player_seat*13,player_seat*13+13)
    print(cards_room_details[game_id][player_seat*13:player_seat*13 + 13])
    emit("get_cards", cards_room_details[game_id][player_seat*13:player_seat*13 + 13], to=request.sid)


    

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


@socketio.on("join")
def join(message):
    player_id = message["player_id"]
    player_name = message["player_name"]
    player_seat = int(message["player_seat"])
    game_id = message["game_id"]
    if game_id in game_room_details:
        # checking for duplicate player name and seat
        if any(
            [
                player_name == existing_player.get("player_name")
                or player_seat == existing_player.get("player_seat")
                for existing_player in game_room_details[game_id]
            ]
        ):
            emit("invalid_player_name_or_player_seat", to=request.sid)
            return
        else:
            game_room_details[game_id][player_seat] = {
                "player_id": player_id,
                "player_name": player_name,
                "socket_id": request.sid,
            }

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

@socketio.on("data")
def transfer_data(message):
    print(message)
    payload = {
        "data": message["data"],
        "sender_seat": message["sender_seat"]
    }
    emit("data", payload, to=message["to"], skip_sid=request.sid)


@socketio.on_error_default
def default_error_handler(err):
    print(f"error: {err}")
    print(traceback.format_exc())


if __name__ == "__main__":
    socketio.run(app, debug=True, port=5001)
