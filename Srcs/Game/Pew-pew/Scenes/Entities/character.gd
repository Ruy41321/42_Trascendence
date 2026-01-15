extends CharacterBody2D

class_name Character

## Base class for all characters (Player and NPC)
##
## Handles common behavior like health, damage, death, respawn, and shooting

var player_id: int = 0  # Unique character identifier
var respawn_location: Vector2 = Vector2.ZERO  # To be set on respawn
var character_name: String = "Character"
var last_killer: Character = null  # Reference to character who killed this one

# Movement parameters
@export var speed: float = 200.0

# Health parameters
@export var max_hp: int = 1
@export var respawn_delay: float = 2.0

# Projectile parameters
@export var projectile_scene: PackedScene = Constants.projectile_scene
@export var fire_rate: float = 0.2  # Seconds between shots
@export var projectile_spawn_offset: float = 300.0  # Distance from center to spawn projectile
var last_fire_time: float = 0.0

# State variables
var current_hp: int
var is_alive: bool = true
var kill_count: int = 0

# Node references
var shader_material: ShaderMaterial


func _ready() -> void:
	current_hp = max_hp
	setup_character()


## Virtual method to be overridden by subclasses
func setup_character() -> void:
	pass


## Executes shooting action
func shoot(direction: Vector2) -> void:
	if not projectile_scene:
		LogManager.warning("Projectile scene not assigned", get_class())
		return
	
	# Calculate spawn position with offset from character center
	var spawn_position: Vector2 = global_position + (direction.normalized() * projectile_spawn_offset)
	
	# Create projectile instance
	var projectile: Projectile = projectile_scene.instantiate()
	# Initialize projectile with spawn position, direction, and player ID
	projectile.initialize(spawn_position, direction, self)
	get_parent().add_child(projectile)


## Receives damage and updates health
func take_hit(damage: int = 1) -> void:
	if not is_alive:
		return
	
	current_hp -= damage
	LogManager.info("%s took hit! Remaining HP: %d" % [get_class(), current_hp], get_class())
	
	if current_hp <= 0:
		die()


## Handles character death
func die() -> void:
	is_alive = false
	LogManager.info("%s died" % get_class(), get_class())
	
	# Show death notification in HUD if this is the local player (player_id 0)
	var level_manager = get_parent()
	if level_manager and level_manager.has_method("get_game_hud"):
		var game_hud = level_manager.get_game_hud()
		if game_hud and player_id == 0 and last_killer:  # Only show for local player
			game_hud.show_death_notification(last_killer.character_name, respawn_delay)
	
	# Death effects
	set_collision_layer_value(1, false)
	set_collision_mask_value(1, false)
	
	# Fade out effect
	if shader_material:
		var shader_progress = 0.0
		while shader_progress < 1.0:
			shader_progress += 0.01
			shader_material.set_shader_parameter("progress", shader_progress)
			await get_tree().create_timer(0.01).timeout
	
	visible = false
	
	# Respawn after delay (no extra wait after fade)
	await get_tree().create_timer(respawn_delay).timeout
	respawn()


## Respawns the character
func respawn() -> void:
	LogManager.info("%s respawned" % get_class(), get_class())
	
	# Reset variables
	current_hp = max_hp
	is_alive = true
	velocity = Vector2.ZERO
	
	# Show character again
	visible = true
	set_collision_mask_value(1, true)
	
	# Return to spawn position
	global_position = respawn_location
	
	# Fade in effect
	if shader_material:
		var shader_progress = 0.7
		while shader_progress > 0:
			shader_progress -= 0.01
			shader_material.set_shader_parameter("progress", shader_progress)
			await get_tree().create_timer(0.01).timeout
	
	set_collision_layer_value(1, true)


## Awards a kill to this character
func add_kill(victim_name: String = "") -> void:
	kill_count += 1
	LogManager.info("%s got a kill! Total kills: %d" % [get_class(), kill_count], get_class())
	
	var level_manager = get_parent()
	# Show kill notification in HUD if this is the local player (player_id 0)
	if victim_name != "":
		if level_manager and level_manager.has_method("get_game_hud"):
			var game_hud = level_manager.get_game_hud()
			if game_hud and player_id == ClientManager.my_peer_id:  # Only show for local player
				game_hud.show_kill_notification(victim_name)
	
	# Notify level manager
	if level_manager and level_manager.has_method("on_player_kill"):
		level_manager.on_player_kill(self)


## Get character's display name
func get_display_name() -> String:
	return character_name
