extends Node2D

class_name LevelManager

## Level Manager handles player spawning, game timer, and win conditions
##
## Manages the match state, tracks kills, and determines winners

# Game settings
@export var match_duration: float = 120.0  # 2 minutes
@export var kills_to_win: int = 2 # Increse to 10 after debugging
@export var players_amount: int = 3

# Game state
var game_time_remaining: float = 0.0
var game_started: bool = false
var game_ended: bool = false

# References
var game_hud: CanvasLayer = null
var players: Array[Player] = []


func _ready() -> void:
	LogManager.info("Level Manager initialized", "LevelManager")
	
	# Load and add GameHUD
	var hud_scene: PackedScene = load("res://Scenes/UI/GameHUD.tscn")
	game_hud = hud_scene.instantiate()
	add_child(game_hud)
	
	spawn_players()
	start_match()


func _process(delta: float) -> void:
	if game_started and not game_ended:
		# Update timer
		game_time_remaining -= delta
		
		if game_time_remaining <= 0:
			game_time_remaining = 0
			end_match_by_time()
		
		# Update HUD timer
		if game_hud:
			game_hud.update_timer(game_time_remaining)


## Starts the match
func start_match() -> void:
	game_time_remaining = match_duration
	game_started = true
	LogManager.info("Match started - Duration: %.0f seconds" % match_duration, "LevelManager")


## Spawns all players
func spawn_players() -> void:
	var respawn_points: Array[RespawnPoint] = []
	for child in get_children():
		if child is RespawnPoint:
			respawn_points.append(child)
	
	if players_amount > respawn_points.size():
		LogManager.error("Not enough respawn points for the number of players!", "LevelManager")
		return
	
	for i in players_amount:
		var player_scene: PackedScene = ResourceLoader.load("res://Scenes/Player/Player.tscn")
		var player_instance: Player = player_scene.instantiate() as Player
		player_instance.player_id = i
		player_instance.respawn_location = respawn_points[i].global_position
		add_child(player_instance)
		players.append(player_instance)
		
		# Connect to player's kill signal
		player_instance.tree_exited.connect(_on_player_removed.bind(player_instance))
		
		# Initialize HUD for this player
		if game_hud:
			game_hud.update_player_kills(i, "Player %d" % i, 0)


## Called when a player gets a kill
func on_player_kill(player: Player) -> void:
	if game_ended:
		return
	
	# Update HUD
	if game_hud:
		game_hud.update_player_kills(player.player_id, "Player %d" % player.player_id, player.kill_count)
	
	# Check win condition
	if player.kill_count >= kills_to_win:
		end_match_by_kills(player)


## Ends match when a player reaches kill limit
func end_match_by_kills(winner: Player) -> void:
	if game_ended:
		return
	
	game_ended = true
	game_started = false
	
	LogManager.info("Match ended - Player %d won by kills (%d kills)" % [winner.player_id, winner.kill_count], "LevelManager")
	
	if game_hud:
		game_hud.show_game_end("Player %d" % winner.player_id)


## Ends match when time runs out
func end_match_by_time() -> void:
	if game_ended:
		return
	
	game_ended = true
	game_started = false
	
	# Find player with most kills
	var winner: Player = null
	var max_kills: int = -1
	
	for player in players:
		if player and player.kill_count > max_kills:
			max_kills = player.kill_count
			winner = player
	
	if winner:
		LogManager.info("Match ended - Time's up! Player %d won with %d kills" % [winner.player_id, winner.kill_count], "LevelManager")
		if game_hud:
			game_hud.show_game_end("Player %d" % winner.player_id)
	else:
		LogManager.info("Match ended - Time's up! No winner (tie)", "LevelManager")
		if game_hud:
			game_hud.show_game_end("Draw")


## Handle player removal
func _on_player_removed(player: Player) -> void:
	players.erase(player)


func get_players_amount() -> int:
	return players_amount
