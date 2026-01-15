extends Character

class_name Player

## Player controller for local player movement, rotation, and shooting
##
## Handles WASD movement with directional speed multipliers, mouse aiming,
## and basic shooting mechanics. Inherits common behavior from Character.

# Movement parameters (specific to player)
@export var forward_speed_mult: float = 1.0
@export var sideways_speed_mult: float = 0.8
@export var backward_speed_mult: float = 0.6

# Laser sight parameters
@export var laser_sight_max_length: float = 5000.0

# Node references
@onready var laser_sight: Line2D = $LaserSight
@onready var laser_raycast: RayCast2D = $LaserRayCast

@onready var skin_1: Node2D = $Skin1
@onready var skin_2: Node2D = $Skin2
@onready var skin_3: Node2D = $Skin3
@onready var skin_4: Node2D = $Skin4


func setup_character() -> void:
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
		# Check if menu is open - don't shoot if menu is visible
		var level_manager: LevelManager = get_parent() as LevelManager
		var game_hud = level_manager.game_hud if level_manager else null
		if game_hud and game_hud.is_menu_open():
			return
		
		var current_time = Time.get_ticks_msec() / 1000.0
		if current_time - last_fire_time >= fire_rate:
			shoot_player()
			last_fire_time = current_time


## Executes shooting action (Player-specific override)
func shoot_player() -> void:
	# Calculate firing direction (where the player is looking)
	var fire_direction: Vector2 = Vector2.from_angle(rotation + PI / 2)
	
	# Call base class shoot method
	shoot(fire_direction)

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
