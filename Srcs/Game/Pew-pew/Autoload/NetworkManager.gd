extends Node
## NetworkManager - Handles WebSocket communication with backend API
## Designed for future multiplayer support, currently works in offline mode

# Signals for network events
signal connected_to_server()
signal disconnected_from_server()
signal connection_error(message: String)
signal lobby_list_received(lobbies: Array)
signal lobby_joined(lobby_data: Dictionary)
signal lobby_left()
signal lobby_updated(lobby_data: Dictionary)
signal player_joined_lobby(player_data: Dictionary)
signal player_left_lobby(player_id: String)
signal game_started(game_data: Dictionary)
signal game_state_received(state: Dictionary)

# Connection state
enum ConnectionState { DISCONNECTED, CONNECTING, CONNECTED }
var connection_state: ConnectionState = ConnectionState.DISCONNECTED

# WebSocket client
var _socket: WebSocketPeer = null
var _server_url: String = "ws://localhost:8080/ws"

# Player data
var player_name: String = ""
var player_id: String = ""

# Current lobby
var current_lobby: Dictionary = {}
var is_lobby_owner: bool = false

# Offline mode flag
var offline_mode: bool = true

# Fake lobbies for offline testing
var _offline_lobbies: Array[Dictionary] = []
var _offline_lobby_id_counter: int = 0


func _ready() -> void:
	LogManager.info("NetworkManager initialized")
	_generate_offline_player_id()


func _process(_delta: float) -> void:
	if _socket != null and connection_state != ConnectionState.DISCONNECTED:
		_socket.poll()
		_handle_socket_state()


func _generate_offline_player_id() -> void:
	# Generate a random player ID for offline mode
	player_id = "player_" + str(randi() % 10000)


## Connect to the game server
func connect_to_server(url: String = "") -> void:
	if offline_mode:
		LogManager.info("Offline mode enabled, skipping server connection")
		connection_state = ConnectionState.CONNECTED
		connected_to_server.emit()
		return
	
	if url != "":
		_server_url = url
	
	_socket = WebSocketPeer.new()
	var err = _socket.connect_to_url(_server_url)
	
	if err != OK:
		LogManager.error("Failed to connect to server: " + str(err))
		connection_error.emit("Failed to connect to server")
		return
	
	connection_state = ConnectionState.CONNECTING
	LogManager.info("Connecting to server: " + _server_url)


## Disconnect from the server
func disconnect_from_server() -> void:
	if offline_mode:
		connection_state = ConnectionState.DISCONNECTED
		disconnected_from_server.emit()
		return
	
	if _socket != null:
		_socket.close()
		_socket = null
	
	connection_state = ConnectionState.DISCONNECTED
	disconnected_from_server.emit()


func _handle_socket_state() -> void:
	if _socket == null:
		return
	
	var state = _socket.get_ready_state()
	
	match state:
		WebSocketPeer.STATE_OPEN:
			if connection_state == ConnectionState.CONNECTING:
				connection_state = ConnectionState.CONNECTED
				LogManager.info("Connected to server")
				connected_to_server.emit()
			
			# Process incoming messages
			while _socket.get_available_packet_count() > 0:
				var packet = _socket.get_packet()
				_handle_message(packet.get_string_from_utf8())
		
		WebSocketPeer.STATE_CLOSING:
			pass
		
		WebSocketPeer.STATE_CLOSED:
			var code = _socket.get_close_code()
			var reason = _socket.get_close_reason()
			LogManager.warning("WebSocket closed. Code: %d, Reason: %s" % [code, reason])
			connection_state = ConnectionState.DISCONNECTED
			_socket = null
			disconnected_from_server.emit()


func _handle_message(message: String) -> void:
	var json = JSON.new()
	var error = json.parse(message)
	
	if error != OK:
		LogManager.error("Failed to parse server message: " + message)
		return
	
	var data: Dictionary = json.data
	var msg_type: String = data.get("type", "")
	
	match msg_type:
		"lobby_list":
			lobby_list_received.emit(data.get("lobbies", []))
		"lobby_joined":
			current_lobby = data.get("lobby", {})
			is_lobby_owner = data.get("is_owner", false)
			lobby_joined.emit(current_lobby)
		"lobby_updated":
			current_lobby = data.get("lobby", {})
			lobby_updated.emit(current_lobby)
		"player_joined":
			player_joined_lobby.emit(data.get("player", {}))
		"player_left":
			player_left_lobby.emit(data.get("player_id", ""))
		"game_start":
			game_started.emit(data.get("game_data", {}))
		"game_state":
			game_state_received.emit(data.get("state", {}))
		_:
			LogManager.warning("Unknown message type: " + msg_type)


func _send_message(data: Dictionary) -> void:
	if offline_mode:
		return
	
	if _socket == null or connection_state != ConnectionState.CONNECTED:
		LogManager.warning("Cannot send message: not connected")
		return
	
	var json_string = JSON.stringify(data)
	_socket.send_text(json_string)


## Set player name
func set_player_name(new_name: String) -> void:
	player_name = new_name
	LogManager.info("Player name set to: " + new_name)


## Request lobby list from server
func request_lobby_list() -> void:
	if offline_mode:
		# Return fake lobbies for offline testing
		lobby_list_received.emit(_offline_lobbies)
		return
	
	_send_message({
		"type": "get_lobbies"
	})


## Create a new lobby
func create_lobby(lobby_name: String = "") -> void:
	var display_name = lobby_name if lobby_name != "" else player_name + "'s Lobby"
	
	if offline_mode:
		_offline_lobby_id_counter += 1
		current_lobby = {
			"id": "lobby_" + str(_offline_lobby_id_counter),
			"name": display_name,
			"owner_id": player_id,
			"owner_name": player_name,
			"players": [
				{
					"id": player_id,
					"name": player_name,
					"is_owner": true,
					"is_npc": false
				}
			],
			"npcs": [],
			"max_players": 4,
			"status": "waiting"
		}
		is_lobby_owner = true
		_offline_lobbies.append(current_lobby)
		lobby_joined.emit(current_lobby)
		LogManager.info("Created offline lobby: " + display_name)
		return
	
	_send_message({
		"type": "create_lobby",
		"name": display_name,
		"player_id": player_id,
		"player_name": player_name
	})


## Join an existing lobby
func join_lobby(lobby_id: String) -> void:
	if offline_mode:
		# Find lobby in offline list
		for lobby in _offline_lobbies:
			if lobby.id == lobby_id:
				if lobby.players.size() + lobby.npcs.size() >= lobby.max_players:
					LogManager.warning("Lobby is full")
					return
				
				lobby.players.append({
					"id": player_id,
					"name": player_name,
					"is_owner": false,
					"is_npc": false
				})
				current_lobby = lobby
				is_lobby_owner = false
				lobby_joined.emit(current_lobby)
				return
		
		LogManager.error("Lobby not found: " + lobby_id)
		return
	
	_send_message({
		"type": "join_lobby",
		"lobby_id": lobby_id,
		"player_id": player_id,
		"player_name": player_name
	})


## Leave current lobby
func leave_lobby() -> void:
	if offline_mode:
		if current_lobby.is_empty():
			return
		
		# Remove player from lobby
		if is_lobby_owner:
			# If owner leaves, remove the lobby
			_offline_lobbies = _offline_lobbies.filter(func(l): return l.id != current_lobby.id)
		else:
			# Remove player from the lobby
			for lobby in _offline_lobbies:
				if lobby.id == current_lobby.id:
					lobby.players = lobby.players.filter(func(p): return p.id != player_id)
					break
		
		current_lobby = {}
		is_lobby_owner = false
		lobby_left.emit()
		return
	
	_send_message({
		"type": "leave_lobby",
		"lobby_id": current_lobby.get("id", ""),
		"player_id": player_id
	})


## Add NPC to current lobby (owner only)
func add_npc() -> void:
	if not is_lobby_owner:
		LogManager.warning("Only lobby owner can add NPCs")
		return
	
	var total_players = current_lobby.players.size() + current_lobby.npcs.size()
	if total_players >= current_lobby.max_players:
		LogManager.warning("Lobby is full, cannot add NPC")
		return
	
	if offline_mode:
		var npc_number = current_lobby.npcs.size() + 1
		var npc_data = {
			"id": "npc_" + str(randi() % 10000),
			"name": "Bot_" + str(npc_number),
			"is_npc": true
		}
		current_lobby.npcs.append(npc_data)
		lobby_updated.emit(current_lobby)
		LogManager.info("Added NPC: " + npc_data.name)
		return
	
	_send_message({
		"type": "add_npc",
		"lobby_id": current_lobby.get("id", "")
	})


## Remove NPC from current lobby (owner only)
func remove_npc(npc_id: String) -> void:
	if not is_lobby_owner:
		LogManager.warning("Only lobby owner can remove NPCs")
		return
	
	if offline_mode:
		current_lobby.npcs = current_lobby.npcs.filter(func(n): return n.id != npc_id)
		lobby_updated.emit(current_lobby)
		return
	
	_send_message({
		"type": "remove_npc",
		"lobby_id": current_lobby.get("id", ""),
		"npc_id": npc_id
	})


## Start the game (owner only)
func start_game() -> void:
	if not is_lobby_owner:
		LogManager.warning("Only lobby owner can start the game")
		return
	
	var total_players = current_lobby.players.size() + current_lobby.npcs.size()
	if total_players < 2:
		LogManager.warning("Need at least 2 players to start")
		return
	
	if offline_mode:
		var game_data = {
			"lobby_id": current_lobby.id,
			"players": current_lobby.players,
			"npcs": current_lobby.npcs,
			"map": "default"
		}
		game_started.emit(game_data)
		return
	
	_send_message({
		"type": "start_game",
		"lobby_id": current_lobby.get("id", "")
	})


## Send player input to server (for multiplayer sync)
func send_player_input(input_data: Dictionary) -> void:
	if offline_mode:
		return
	
	_send_message({
		"type": "player_input",
		"player_id": player_id,
		"input": input_data
	})


## Send player position update
func send_position_update(position: Vector2, rotation: float) -> void:
	if offline_mode:
		return
	
	_send_message({
		"type": "position_update",
		"player_id": player_id,
		"position": {"x": position.x, "y": position.y},
		"rotation": rotation
	})


## Send shoot event
func send_shoot_event(direction: Vector2) -> void:
	if offline_mode:
		return
	
	_send_message({
		"type": "shoot",
		"player_id": player_id,
		"direction": {"x": direction.x, "y": direction.y}
	})


## Get total player count in current lobby
func get_lobby_player_count() -> int:
	if current_lobby.is_empty():
		return 0
	return current_lobby.players.size() + current_lobby.npcs.size()


## Check if can add more players/NPCs
func can_add_to_lobby() -> bool:
	return get_lobby_player_count() < current_lobby.get("max_players", 4)


## Check if game can start
func can_start_game() -> bool:
	return is_lobby_owner and get_lobby_player_count() >= 2
