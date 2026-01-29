import pygame
import random
import os

pygame.init()
pygame.mixer.init()  # For sound effects

# Window
WIDTH, HEIGHT = 400, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Flappy Game")

clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

# Colors
BLUE = (135, 206, 235)
GREEN = (0, 200, 0)
WHITE = (255, 255, 255)
YELLOW = (255, 255, 0)  # For coins
RED = (255, 0, 0)  # For level backgrounds

# Levels
levels = [
    {"score_threshold": 0, "pipe_speed": 4, "pipe_gap": 160, "bg_color": BLUE},
    {"score_threshold": 5, "pipe_speed": 5, "pipe_gap": 140, "bg_color": (173, 216, 230)},  # Light blue
    {"score_threshold": 10, "pipe_speed": 6, "pipe_gap": 120, "bg_color": (255, 182, 193)},  # Light pink
    {"score_threshold": 15, "pipe_speed": 7, "pipe_gap": 100, "bg_color": (144, 238, 144)},  # Light green
]

current_level = 0

# High Score
highscore_file = "highscore.txt"
if os.path.exists(highscore_file):
    with open(highscore_file, "r") as f:
        high_score = int(f.read().strip())
else:
    high_score = 0

# Sound placeholders (add actual .wav files if available)
try:
    jump_sound = pygame.mixer.Sound("jump.wav")
    collision_sound = pygame.mixer.Sound("collision.wav")
    coin_sound = pygame.mixer.Sound("coin.wav")
except:
    jump_sound = None
    collision_sound = None
    coin_sound = None

# Coins
coins = []
coin_size = 15

# Bird
bird_x, bird_y = 80, 300
bird_vel = 0
gravity = 3.5
jump = -8
bird_size = 20

# Pipes
pipe_width = 60
pipe_gap = 160
pipe_speed = 4
pipes = []

def new_pipe():
    h = random.randint(150, 450)
    pipe = [
        pygame.Rect(WIDTH, h, pipe_width, HEIGHT),
        pygame.Rect(WIDTH, 0, pipe_width, h - pipe_gap)
    ]
    # Add coin randomly
    if random.random() < 0.3:  # 30% chance
        coin_x = WIDTH + pipe_width // 2 - coin_size // 2
        coin_y = h - pipe_gap // 2 - coin_size // 2
        coins.append(pygame.Rect(coin_x, coin_y, coin_size, coin_size))
    return pipe

pipes.append(new_pipe())

score = 0
bg_color = BLUE
running = True

while running:
    clock.tick(60)
    screen.fill(bg_color)

    # Update level
    for i, level in enumerate(levels):
        if score >= level["score_threshold"]:
            current_level = i
            pipe_speed = level["pipe_speed"]
            pipe_gap = level["pipe_gap"]
            bg_color = level["bg_color"]

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
            bird_vel = jump
            if jump_sound:
                jump_sound.play()

    # Bird movement
    bird_vel += gravity
    bird_y += bird_vel
    bird_rect = pygame.Rect(bird_x, bird_y, bird_size, bird_size)
    # Draw bird as a yellow circle
    pygame.draw.circle(screen, YELLOW, (bird_x + bird_size // 2, bird_y + bird_size // 2), bird_size // 2)

    # Pipes
    for pipe in pipes:
        for p in pipe:
            p.x -= pipe_speed
            pygame.draw.rect(screen, GREEN, p)
            if bird_rect.colliderect(p):
                if collision_sound:
                    collision_sound.play()
                running = False

    # Coins
    for coin in coins[:]:
        coin.x -= pipe_speed
        pygame.draw.rect(screen, YELLOW, coin)
        if bird_rect.colliderect(coin):
            coins.remove(coin)
            score += 5  # Bonus points
            if coin_sound:
                coin_sound.play()

    if pipes[0][0].x < -pipe_width:
        pipes.pop(0)
        pipes.append(new_pipe())
        score += 1

    if bird_y < 0 or bird_y > HEIGHT:
        if collision_sound:
            collision_sound.play()
        running = False

    # Display
    score_text = font.render(f"Score: {score}", True, WHITE)
    level_text = font.render(f"Level: {current_level + 1}", True, WHITE)
    screen.blit(score_text, (10, 10))
    screen.blit(level_text, (10, 50))

    pygame.display.update()

# Game Over Screen
if score > high_score:
    high_score = score
    with open(highscore_file, "w") as f:
        f.write(str(high_score))

game_over = True
while game_over:
    screen.fill(BLUE)
    game_over_text = font.render("Game Over", True, WHITE)
    score_text = font.render(f"Final Score: {score}", True, WHITE)
    highscore_text = font.render(f"High Score: {high_score}", True, WHITE)
    restart_text = font.render("Press SPACE to Restart", True, WHITE)
    screen.blit(game_over_text, (WIDTH // 2 - game_over_text.get_width() // 2, HEIGHT // 2 - 80))
    screen.blit(score_text, (WIDTH // 2 - score_text.get_width() // 2, HEIGHT // 2 - 30))
    screen.blit(highscore_text, (WIDTH // 2 - highscore_text.get_width() // 2, HEIGHT // 2 + 10))
    screen.blit(restart_text, (WIDTH // 2 - restart_text.get_width() // 2, HEIGHT // 2 + 50))
    pygame.display.update()

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            game_over = False
        if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
            # Reset game
            bird_y = 300
            bird_vel = 0
            pipes = [new_pipe()]
            coins = []
            score = 0
            current_level = 0
            pipe_speed = 4
            pipe_gap = 160
            bg_color = BLUE
            running = True
            game_over = False

pygame.quit()
