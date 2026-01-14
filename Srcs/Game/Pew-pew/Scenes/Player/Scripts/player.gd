extends CharacterBody2D

class_name Player

## Player controller for local player movement, rotation, and shooting
##
## Handles WASD movement with directional speed multipliers, mouse aiming,
## and basic shooting mechanics. Health and respawn system included.

var player_id: int = 0  # Unique player identifier
var respawn_location: Vector2 = Vector2.ZERO  # To be set on respawn

# Movement parameters
@export var speed: float = 200.0
@export var forward_speed_mult: float = 1.0
@export var sideways_speed_mult: float = 0.8
@export var backward_speed_mult: float = 0.6

# Health parameters
@export var max_hp: int = 1
@export var respawn_delay: float = 2.0

# Projectile parameters
@export var projectile_scene: PackedScene = Constants.projectile_scene
@export var fire_rate: float = 0.2  # Seconds between shots
@export var projectile_spawn_offset: float = 300.0  # Distance from player center to spawn projectile
var last_fire_time: float = 0.0

# Laser sight parameters
@export var laser_sight_max_length: float = 5000.0

# State variables
var current_hp: int
var is_alive: bool = true
var kill_count: int = 0

# Node references
@onready var laser_sight: Line2D = $LaserSight
@onready var laser_raycast: RayCast2D = $LaserRayCast

@onready var skin_1: Node2D = $Skin1
@onready var skin_2: Node2D = $Skin2
@onready var skin_3: Node2D = $Skin3
@onready var skin_4: Node2D = $Skin4

var shader_material: ShaderMaterial


func _ready() -> void:	
	LogManager.info("Player initialized with %d HP" % current_hp, "Player")
	set_skin()
	respawn()

func _physics_process(delta: float) -> void:
	if not is_alive or ClientManager.my_peer_id != player_id:
		if laser_sight:
			laser_sight.visible = false
		return

	# Rotation towards mouse
	look_at_mouse()
	
	# Update laser sight
	update_laser_sight()
	
	# Handle input movement
	handle_movement(delta)
	
	# Handle shooting
	handle_shooting()
	
	# Move the player
	move_and_slide()


## Handles player movement with WASD with directional speed multipliers
func handle_movement(delta: float) -> void:
	var input_direction: Vector2 = Vector2.ZERO
	
	if Input.is_action_pressed("ui_up"):
		input_direction.y -= 1
	if Input.is_action_pressed("ui_down"):
		input_direction.y += 1
	if Input.is_action_pressed("ui_left"):
		input_direction.x -= 1
	if Input.is_action_pressed("ui_right"):
		input_direction.x += 1
	
	if input_direction == Vector2.ZERO:
		velocity = Vector2.ZERO
		return
	
	input_direction = input_direction.normalized()
	
	# Calculate angle between movement direction and player facing direction
	# rotation + PI/2 because look_at() rotates by -PI/2 from the default axis
	var player_forward: Vector2 = Vector2(cos(rotation + PI / 2), sin(rotation + PI / 2))
	var dot_product: float = player_forward.dot(input_direction)
	
	# Calculate speed multiplier based on alignment
	# dot_product =  1 (forward)  -> forward_speed_mult
	# dot_product =  0 (sideways) -> sideways_speed_mult
	# dot_product = -1 (backward) -> backward_speed_mult
	var speed_multiplier: float
	if dot_product > 0:
		# Interpolate between sideways and forward
		speed_multiplier = lerp(sideways_speed_mult, forward_speed_mult, dot_product)
	else:
		# Interpolate between sideways and backward
		speed_multiplier = lerp(sideways_speed_mult, backward_speed_mult, abs(dot_product))

	velocity = input_direction * (speed * 300) * speed_multiplier * delta


## Rotates the player towards the mouse position
func look_at_mouse() -> void:
	var mouse_position: Vector2 = get_global_mouse_position()
	look_at(mouse_position)
	rotation -= PI / 2  # Compensate for 90 degree offset


## Updates the laser sight line
func update_laser_sight() -> void:
	if not laser_sight or not laser_raycast:
		return
	
	# Raycast is already rotated with the player, so use local coordinates
	# Point straight up in local space (which is where the player is looking after compensation)
	laser_raycast.target_position = Vector2(0, laser_sight_max_length)
	laser_raycast.force_raycast_update()
	
	# Start point of laser (offset from player center to simulate weapon position)
	var fire_direction: Vector2 = Vector2(0, 1)  # Local up direction
	var start_point: Vector2 = fire_direction * projectile_spawn_offset
	
	# End point of laser
	var end_point: Vector2
	if laser_raycast.is_colliding():
		# Stop at collision point (convert to local coordinates)
		end_point = laser_raycast.to_local(laser_raycast.get_collision_point())
	else:
		# Extend to max length
		end_point = fire_direction * laser_sight_max_length
	
	# Update Line2D points
	laser_sight.points = [start_point, end_point]
	laser_sight.visible = true


## Handles shooting input
func handle_shooting() -> void:
	if Input.is_action_just_pressed("left_click"):
		var current_time = Time.get_ticks_msec() / 1000.0
		if current_time - last_fire_time >= fire_rate:
			shoot()
			last_fire_time = current_time


## Executes shooting action
func shoot() -> void:
	if not projectile_scene:
		LogManager.warning("Projectile scene not assigned", "Player")
		return
	
	#LogManager.debug("Player fired weapon", "Player")
	
	# Calculate firing direction (where the player is looking)
	var fire_direction: Vector2 = Vector2.from_angle(rotation + PI / 2)
	
	# Calculate spawn position with offset from player center
	var spawn_position: Vector2 = global_position + (fire_direction * projectile_spawn_offset)
	
	# Create projectile instance
	var projectile: Projectile = projectile_scene.instantiate()
	# Initialize projectile with spawn position, direction, player ID, and killer reference
	projectile.initialize(spawn_position, fire_direction, player_id, self)
	get_parent().add_child(projectile)
	

## Receives damage and updates health
func take_hit(damage: int = 1) -> void:
	if not is_alive:
		return
	
	current_hp -= damage
	LogManager.info("Player took hit! Remaining HP: %d" % current_hp, "Player")
	
	if current_hp <= 0:
		die()


## Awards a kill to this player
func add_kill() -> void:
	kill_count += 1
	LogManager.info("Player %d got a kill! Total kills: %d" % [player_id, kill_count], "Player")


## Handles player death
func die() -> void:
	is_alive = false
	LogManager.info("Player died", "Player")
	
	# Death effects
	# - Hide the player
	# - Disable collisions
	# - Start death animation
	
	set_collision_layer_value(1, false)
	set_collision_mask_value(1, false)
	
	var shader_progress = 0.0
	while (shader_progress < 1.0):
		shader_progress += 0.01
		shader_material.set_shader_parameter("progress", shader_progress)
		await get_tree().create_timer(0.01).timeout

	visible = false
	# Respawn after delay
	await get_tree().create_timer(respawn_delay).timeout
	respawn()


## Respawns the player
func respawn() -> void:
	LogManager.info("Player respawned", "Player")
	
	# Reset variables
	current_hp = max_hp
	is_alive = true
	velocity = Vector2.ZERO
	
	# Show player again
	visible = true
	set_collision_mask_value(1, true)
	
	# Return to initial position
	global_position = respawn_location

	var shader_progress = 0.7
	while (shader_progress > 0):
		shader_progress -= 0.01
		shader_material.set_shader_parameter("progress", shader_progress)
		await get_tree().create_timer(0.01).timeout
	
	set_collision_layer_value(1, true)


func set_skin() -> void:
	LogManager.info("Setting skin for Player ID: %d" % player_id, "Player")
	# Create a unique copy of the shader material for this player
	shader_material = ($Skin1/Back.material as ShaderMaterial).duplicate()

	var skins: Array[Node2D] = [skin_1, skin_2, skin_3, skin_4]
	for i in skins.size():
		skins[i].visible = (i == player_id % skins.size())
		for part in skins[i].get_children():
			if part is Sprite2D:
				part.set_material(shader_material)
