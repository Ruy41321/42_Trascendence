extends CharacterBody2D

class_name Player

## Player controller for local player movement, rotation, and shooting
##
## Handles WASD movement with directional speed multipliers, mouse aiming,
## and basic shooting mechanics. Health and respawn system included.

# Movement parameters
@export var speed: float = 200.0
@export var forward_speed_mult: float = 1.0
@export var sideways_speed_mult: float = 0.8
@export var backward_speed_mult: float = 0.6

# Health parameters
@export var max_hp: int = 1
@export var respawn_delay: float = 2.0

# State variables
var current_hp: int
var is_alive: bool = true

# Node references
@onready var animation_player = $AnimationPlayer  # Optional: if you have animations


func _ready() -> void:
	current_hp = max_hp
	LogManager.info("Player initialized with %d HP" % current_hp, "Player")


func _physics_process(delta: float) -> void:
	if not is_alive:
		return
	
	# Rotation towards mouse
	look_at_mouse()
	
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


## Handles shooting input
func handle_shooting() -> void:
	if Input.is_action_just_pressed("left_click"):
		shoot()


## Executes shooting action
func shoot() -> void:
	LogManager.debug("Player fired weapon", "Player")
	# TODO: Implement shooting logic
	# - Create projectile
	# - Add sound/visual effects


## Receives damage and updates health
func take_hit(damage: int = 1) -> void:
	if not is_alive:
		return
	
	current_hp -= damage
	LogManager.info("Player took hit! Remaining HP: %d" % current_hp, "Player")
	
	if current_hp <= 0:
		die()


## Handles player death
func die() -> void:
	is_alive = false
	LogManager.info("Player died", "Player")
	
	# Death effects
	# - Hide the player
	# - Disable collisions
	# - Start death animation
	
	visible = false
	set_collision_layer_value(0, false)
	set_collision_mask_value(0, false)
	
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
	set_collision_layer_value(0, true)
	set_collision_mask_value(0, true)
	
	# Return to initial position (if needed)
	# global_position = Vector2(640, 360)  # Adjust to your coordinates
