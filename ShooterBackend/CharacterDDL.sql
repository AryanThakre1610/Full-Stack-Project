-- Create Roles
INSERT INTO Role (Name) VALUES
('User'),
('Admin');

-- Create Static Characters
INSERT INTO Character (Level, Health, Name) VALUES
(1, 100, 'Soldier'),
(1, 80, 'Sniper'),
(1, 120, 'Heavy'),
(1, 90, 'Assault'),
(1, 70, 'Scout');

-- Create Global and Character-Specific Items
INSERT INTO Item (Name, Category, Power, Effect, Damage, Value, Duration, Rarity, CharacterID) VALUES
('Pistol', 'Weapon', 15, 0, 15, 100, 0, 1, 10),
('SMG', 'Weapon', 30, 0, 30, 300, 0, 1, 9),
('M16-A4', 'Weapon', 40, -1, 40, 500, 0, 1, 8),
('AK-47', 'Weapon', 60, -2, 60, 800, 0, 1, 7),
('Machine-Gun', 'Weapon', 90, -4, 90, 1500, 0, 1, 6),
('Health', 'PowerUp', 30, 30, 0, 20, 600, 4, NULL),
('Berserk', 'PowerUp', 2, 10, 2, 30, 600, 2, NULL),
('Score', 'PowerUp', 50, 50, 0, 50, 600, 3, NULL),
('Speed', 'PowerUp', 2, 2, 0, 50, 600, 3, NULL),
('Ignite', 'PowerUp', 10, 0, 10, 100, 600, 1, NULL),
('Slowdown', 'PowerUp', 2, 0, 2, 100, 600, 1, NULL)