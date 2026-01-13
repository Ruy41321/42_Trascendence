extends Node

## LogManager - Centralized logging system for Pew Pew game
##
## This singleton manages all logging with different severity levels.
## Add this script as an autoload in Project Settings.

enum LogLevel {
	DEBUG,   # Detailed information for debugging
	INFO,    # General information about game state
	WARNING, # Warning messages that don't stop execution
	ERROR    # Error messages for critical issues
}

# Configuration
@export var current_log_level: LogLevel = LogLevel.DEBUG
@export var enable_console_output: bool = true
@export var enable_file_output: bool = false
@export var log_file_path: String = "user://pew_pew.log"

# Internal state
var log_file: FileAccess = null
var log_buffer: Array[String] = []


func _ready() -> void:
	if enable_file_output:
		_open_log_file()
	
	info("LogManager initialized")


func _exit_tree() -> void:
	if log_file:
		log_file.close()


## Log a debug message (only shown if log level is DEBUG)
func debug(message: String, context: String = "") -> void:
	_log(LogLevel.DEBUG, message, context)


## Log an informational message
func info(message: String, context: String = "") -> void:
	_log(LogLevel.INFO, message, context)


## Log a warning message
func warning(message: String, context: String = "") -> void:
	_log(LogLevel.WARNING, message, context)


## Log an error message
func error(message: String, context: String = "") -> void:
	_log(LogLevel.ERROR, message, context)


## Internal logging function
func _log(level: LogLevel, message: String, context: String = "") -> void:
	if level < current_log_level:
		return
	
	var timestamp: String = Time.get_datetime_string_from_system()
	var level_str: String = _get_level_string(level)
	var context_str: String = ("[%s] " % context) if context else ""
	var log_entry: String = "[%s] %s%s: %s" % [timestamp, context_str, level_str, message]
	
	# Output to console
	if enable_console_output:
		match level:
			LogLevel.DEBUG:
				print(log_entry)
			LogLevel.INFO:
				print(log_entry)
			LogLevel.WARNING:
				push_warning(log_entry)
			LogLevel.ERROR:
				push_error(log_entry)
	
	# Output to file
	if enable_file_output and log_file:
		log_file.store_line(log_entry)
		log_file.flush()
	
	# Store in buffer (for potential UI display)
	log_buffer.append(log_entry)
	if log_buffer.size() > 100:
		log_buffer.pop_front()


## Open the log file for writing
func _open_log_file() -> void:
	log_file = FileAccess.open(log_file_path, FileAccess.WRITE)
	if not log_file:
		push_error("Failed to open log file: %s" % log_file_path)
		enable_file_output = false


## Convert log level to string
func _get_level_string(level: LogLevel) -> String:
	match level:
		LogLevel.DEBUG:
			return "DEBUG"
		LogLevel.INFO:
			return "INFO"
		LogLevel.WARNING:
			return "WARNING"
		LogLevel.ERROR:
			return "ERROR"
		_:
			return "UNKNOWN"


## Get recent log entries
func get_recent_logs(count: int = 10) -> Array[String]:
	var start_index: int = max(0, log_buffer.size() - count)
	return log_buffer.slice(start_index)


## Clear the log buffer
func clear_logs() -> void:
	log_buffer.clear()


## Set the current log level
func set_log_level(level: LogLevel) -> void:
	current_log_level = level
	info("Log level changed to: %s" % _get_level_string(level))
