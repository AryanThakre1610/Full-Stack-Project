// =======================
// BACKEND CRUD INTEGRATION
// =======================
let playerCharacter = null;
let playerCharacterId = null; // will store after login
let currentUserId = null;
let currentUser = null;
const API_BASE = "http://localhost:5000/api";
let jwtToken = null;

window.addEventListener("DOMContentLoaded", async () => {
    const storedToken = localStorage.getItem("token");
    if (isJwtValid(storedToken)) {
        showLoading("Restoring session...");
        hideAuthModal();
        jwtToken = storedToken;
        currentUserId = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        try {
            await fetchUserContext();
            await fetchEntities();
            showHomeScreen();
        } catch (err) {
            console.error("Error restoring session:", err);
            showAuthModal(); // fallback to login
        }
        finally {
            hideLoading();
        }
    } else {
        showAuthModal();
    }
});
    
function showAuthModal() {
    document.getElementById("authModal").style.display = "flex";
}
function hideAuthModal() {
    document.getElementById("authModal").style.display = "none";
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (err) {
        return null;
    }
}

function isJwtValid(token) {
    if (!token) return false;
    claims = parseJwt(token);
    if (!claims || !claims.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < claims.exp;
}

async function fetchEntities() {
    await fetchCharacters();
    await fetchPowerups();
    await loadScoreCard();
}

async function startGame() {
    if (!jwtToken || !currentUserId) {
        console.warn("Cannot start game: Not logged in or character ID missing");
        showAuthModal();
        return;
    }

    // Load assets first
    await loadAssets();
}

function showLoading(text = "Loading...") {
    const overlay = document.getElementById("loadingOverlay");
    overlay.querySelector("p").innerText = text;
    overlay.style.display = "flex";
}

function hideLoading() {
    document.getElementById("loadingOverlay").style.display = "none";
}

let characters = []; // Will store characters fetched from API
let items = []; // Will store global items fetched from API
let scores = []; // Will store scores fetched from API
let inventory = []; // Will store weapons for selected character
let userScore = 0;
const inventoryModal = document.getElementById("inventoryModal");
const inventoryList = document.getElementById("inventoryList");
const rarities = {};
const damageValues = {};
const effectValues = {};
const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");
const profileModal = document.getElementById("profileModal");
const closeProfileBtn = document.getElementById("closeProfile");
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");

helpBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    helpModal.style.display = "flex";
});

closeHelp.addEventListener("click", () => {
    helpModal.style.display = "none";
});

// Optional: close when clicking outside
helpModal.addEventListener("click", (e) => {
    if (e.target === helpModal) {
        helpModal.style.display = "none";
    }
});

profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.style.display =
        profileDropdown.style.display === "flex" ? "none" : "flex";
});

document.addEventListener("click", () => {
    profileDropdown.style.display = "none";
});

document.getElementById("viewProfileBtn").addEventListener("click", async () => {
    profileDropdown.style.display = "none";
    showLoading("Loading profile...");
    await openProfilePage();
    hideLoading();
});

closeProfileBtn.addEventListener("click", () => {
    profileModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === profileModal) profileModal.style.display = "none";
});

async function openProfilePage() {
    if (!currentUser) return;

    // Basic info
    document.getElementById("profilePageUsername").innerText = currentUser.username;
    document.getElementById("profilePageEmail").innerText = currentUser.email;
    document.getElementById("profilePageCash").innerText = currentUser.cash;

    // Total score (sum or max, adjust as needed)
    const totalScore = userScore
    document.getElementById("profilePageScore").innerText = totalScore;

    // Characters
    // const container = document.getElementById("profileCharacters");
    // container.innerHTML = "";

    // characters.forEach(char => {
    //     const div = document.createElement("div");
    //     div.className = "profile-character-item";
    //     div.innerHTML = `
    //         <strong>${char.name}</strong><br>
    //         Level: ${char.level} | HP: ${char.health}
    //     `;
    //     container.appendChild(div);
    // });

    profileModal.style.display = "flex";
}

// --------------------
// Fetch Data Functions
// --------------------
async function fetchCharacters() {
    try {
        const res = await fetch(`${API_BASE}/characters`);
        if (!res.ok) throw new Error("Failed to fetch characters");
        characters = await res.json();
    } catch (err) {
        console.error(err);
        alert("Error fetching characters: " + err.message);
    }
}

async function fetchPowerups() {
    try {
        const res = await fetch(`${API_BASE}/items/powerups`);
        if (!res.ok) throw new Error("Failed to fetch power-ups");
        items = await res.json();
        console.log("Power-ups:", items);
    } catch (err) {
        console.error(err);
        alert("Error fetching power-ups: " + err.message);
    }
}

async function fetchInventory(characterId) {
    try {
        const response = await fetch(`${API_BASE}/characters/${characterId}/inventory`);
        if (!response.ok) throw new Error("Failed to fetch inventory");
        inventory = await response.json();
        console.log("Inventory:", inventory);
    } catch (err) {
        console.error(err);
        alert("Error fetching inventory: " + err.message);
    }
}

// --------------------
// Display Home Screen
// --------------------
async function showHomeScreen() {
    document.getElementById("homeScreen").style.display = "block";    
    const characterListDiv = document.getElementById("characterList");
    const profileUsername = document.getElementById("profileUsername");

    const cashEl = document.getElementById("playerCash");
    if (cashEl) cashEl.textContent = currentUser.cash;
    characterListDiv.innerHTML = "";
    profileUsername.textContent = claims["sub"] || "Guest";
    // await fetchCharacters();
    // await fetchPowerups();
    // await loadScoreCard();

    characters.forEach(char => {
        const card = document.createElement("div");
        card.classList.add("character-card");
        card.disabled = true;
        // Character Name
        const name = document.createElement("div");
        name.classList.add("character-name");
        name.textContent = char.name;
        card.appendChild(name);

        // Character Stats
        const mul = 3 * ( 1 / char.level );
        const stats = document.createElement("div");
        stats.classList.add("character-stats");
        // stats.innerHTML = `<div>RANK: ${char.level}</div><div>HP: ${char.health}</div><div>MULTIPLIER: ${mul.toFixed(2)}</div>`;
        stats.innerHTML = `
                                <div class="stat">
                                    <span class="stat-label">Rank</span>
                                    <span class="stat-value">${char.level}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">HP</span>
                                    <span class="stat-value">${char.health}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Multiplier</span>
                                    <span class="stat-value">x${mul.toFixed(2)}</span>
                                </div>
                                `;
card.appendChild(stats);

        // Card click - select character
        card.addEventListener("click", () => {
            playerCharacter = char;
            playerCharacterId = char.id;
            fetchInventory(playerCharacterId);

            document.querySelectorAll(".character-card").forEach(c => {
                c.classList.remove("selected");
                const btn = c.querySelector(".inventoryBtn");
                if (btn) btn.remove();
            });

            card.classList.add("selected");
            document.getElementById("startGameBtn").disabled = false;

            // Add inventory button inside selected card
            const inventoryBtn = document.createElement("button");
            inventoryBtn.textContent = "Inventory";
            inventoryBtn.classList.add("inventoryBtn");

            inventoryBtn.addEventListener("click", async (e) => {
                e.stopPropagation();

                inventoryList.innerHTML = inventory.map(item => `
                    <div class="inventory-item">
                        <strong>${item.name}</strong> (${item.type})<br>
                        Power: ${item.power}, Value: ${item.value}
                    </div>
                `).join("");

                inventoryModal.style.display = "flex";
            });

            card.appendChild(inventoryBtn);
        });

        characterListDiv.appendChild(card);
    });
}

// --------------------
// Load Scorecard
// --------------------
async function loadScoreCard() {
    try {
        const response = await fetch(`${API_BASE}/scores`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwtToken ? `Bearer ${jwtToken}` : ""
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch scores");
            return;
        }

        scores = await response.json();
        const tbody = document.querySelector("#scoreCard tbody");
        tbody.innerHTML = "";

        scores.forEach((score, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="padding:8px; border:1px solid #555;">${index + 1}</td>
                <td style="padding:8px; border:1px solid #555;">${score.user.username}</td>
                <td style="padding:8px; border:1px solid #555;">${score.value}</td>
            `;
            tbody.appendChild(tr);
            
            if (score.user.username == currentUser.username) {
                userScore = score.value;
            }
        });
    } catch (err) {
        console.error("Error loading scorecard:", err);
    }
}

// --------------------
// Modal Close Handlers
// --------------------
const modalClose = inventoryModal.querySelector(".close");

modalClose.addEventListener("click", () => {
    inventoryModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === inventoryModal) inventoryModal.style.display = "none";
});

// --------------------
// Start Game Button
// --------------------
document.getElementById("startGameBtn").addEventListener("click", () => {
    if (!playerCharacterId) return;
    document.getElementById("homeScreen").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";
    startGame();
});


// Logout function
function logout() {
    // Clear JWT from localStorage
    localStorage.removeItem("token");

    // Clear any other game state
    localStorage.removeItem("playerCharacterId");
    localStorage.removeItem("score");

    // Hide game / home screens
    document.getElementById("homeScreen").style.display = "none";
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "none";

    // Show login modal
    showAuthModal();
}

document.getElementById("logoutBtn").addEventListener("click", logout);

async function fetchUserContext(){
    try {
        const userRes = await fetch(`${API_BASE}/users/${currentUserId}`, {
            headers: { "Authorization": `Bearer ${jwtToken}` }
        });

        if (!userRes.ok) throw new Error("Failed to fetch user context");
        const userContext = await userRes.json();

        currentUser = userContext;
    } catch (err) {
        console.error("Error fetching user context:", err);
    }
}

async function login(username, password) {
    showLoading("Logging in...");
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.text();
        if (!res.ok) throw new Error(data.message || "Login failed");

        const jsonData = JSON.parse(data);

        localStorage.setItem("token", jsonData.token);
        jwtToken = jsonData.token;


        claims = parseJwt(jwtToken);
        currentUserId = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

        await fetchUserContext();
        await fetchEntities();
        hideAuthModal();
        showHomeScreen();

    } catch (err) {
        document.getElementById("authError").innerText = err.message;
    }
    finally {
        hideLoading();
    }
}

async function register(username, email, password) {
    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        if (res.ok) {
            document.getElementById("authError").innerText = 
                "Registration successful! Please login.";
        } else {
            const errorText = await res.text();
            document.getElementById("authError").innerText = errorText || "Registration failed.";
        }

    } catch (err) {
        document.getElementById("authError").innerText = "Network or server error: " + err.message;
    }
}


if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.getElementById("loginForm").onsubmit = function(e) {
        e.preventDefault();
        login(
            document.getElementById("loginUsername").value,
            document.getElementById("loginPassword").value
        );
    };
    document.getElementById("registerForm").onsubmit = function(e) {
        e.preventDefault();
        register(
            document.getElementById("registerUsername").value,
            document.getElementById("registerEmail").value,
            document.getElementById("registerPassword").value
        );
    };

}

function setParams() {
    // Set player stats 
    player.health = playerCharacter.health;
    player.maxHealth = playerCharacter.health;

    jsoninventory = inventory[0];
    weaponDamage = jsoninventory.power;
    weaponValue = jsoninventory.value;

    scoreMultiplier = 3 * ( 1 / playerCharacter.level );
    
    for (let power of items) {
        pname = power.name.toLowerCase();
        rarities[pname] = power.rarity;
        damageValues[pname] = power.damage;
        effectValues[pname] = power.effect;
    }
}

// Pick item weighted by rarity value (higher = more common)
function pickWeightedItem(rarities) {
    console.log(rarities);

    var len = (Object.keys(rarities)).length;
    console.log(len);

    var prob = Math.random();
    var fair_prob = 1/len;
    var rar = 0; 
    for (item in rarities) {
        rar = Number(rarities[item]);
        console.log(fair_prob*rar);
        if (prob > fair_prob*rar) {
            console.log("enter");
            return item;
        }
    }
    console.log("fallback");
    return rarities[len - 1]; // fallback
}


let playerImg, fishMonster, snakeMonster, lizardMonster, bgImg, portalImg, bossImg, healthImg, berserkImg, scoreImg, speedImg, igniteImg, slowdownImg;

let canvas, ctx;
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
}

// =======================
// ASSET LOADING
// =======================
function loadImage(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
    });
}

async function loadAssets() {
    const [images] = await Promise.all([
        Promise.all([
            loadImage("./assets/img/player.png"),
            loadImage("./assets/img/enemies/fishMonster.png"),
            loadImage("./assets/img/enemies/snakeMonster.png"),
            loadImage("./assets/img/enemies/lizardMonster.png"),
            loadImage("./assets/img/background.png"),
            loadImage("./assets/img/enemies/portal.png"),
            loadImage("./assets/img/enemies/boss.png"),
            loadImage("./assets/img/collectables/health.png"),
            loadImage("./assets/img/collectables/berserk.png"),
            loadImage("./assets/img/collectables/score.png"),
            loadImage("./assets/img/collectables/speed.png"),
            loadImage("./assets/img/collectables/ignite.png"),
            loadImage("./assets/img/collectables/slowdown.png")
        ])
    ]);

    [playerImg, fishMonster, snakeMonster, lizardMonster, bgImg, portalImg, bossImg, healthImg, 
        berserkImg, scoreImg, speedImg, igniteImg, slowdownImg] = images;
    loadingLoop();
}

async function saveScore(scoreValue) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("No JWT token found, user  must log in.");
        return;
    }
    const payload = {
        value: scoreValue,
        userId: currentUserId
    };

    try {
        const response = await fetch(`${API_BASE}/scores`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.log(response);
            const errorData = await response.json();
            console.error("Failed to save score:", errorData);
            return;
        }

        console.log("Score saved successfully");

    } catch (err) {
        console.error("Error saving score:", err);
    }
}

// Loading screen
async function loadingLoop() {
    if (!playerCharacterId) return; // don't start loading screen without login

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Loading...", 300 + Math.sin(Date.now()/200) * 20, 250);

    if (playerImg && fishMonster && snakeMonster && lizardMonster && bgImg && portalImg) {
        initGame();
        gameLoop();
    } else {
        requestAnimationFrame(loadingLoop);
    }
}

function endGame(isVictory = false) {
    if (gameOver) return;

    gameOver = true;
    victory = isVictory;

    if (isVictory) {
        document.querySelector("#gameOverScreen h2").innerText = "YOU WIN!";
    } else {
        document.querySelector("#gameOverScreen h2").innerText = "GAME OVER";
    }

    document.getElementById("finalScore").innerText = score;
    document.getElementById("gameOverScreen").style.display = "flex";

    // Save high score
    saveScore(score);
}


// =======================
// PLAYER CLASS
// =======================
class Player {
    constructor() {
        // Provide fallback
        const defaultHeight = 600;
        this.x = 40;
        this.y = (typeof canvas !== 'undefined' && canvas && canvas.height ? canvas.height : defaultHeight) / 2 - 60;
        this.width = 80;
        this.height = 120;
        this.speed = 5;
        this.health = 100;
        this.maxHealth = 100;
        this.facing = "right";
        this.damage = 1; // Normal mode damage
    }

    draw() {
        ctx.save();
        if (this.facing === "left") {
            // Flip the image horizontally
            ctx.translate(this.x + this.width / 2, 0);
            ctx.scale(-1, 1); 
            ctx.drawImage(playerImg, -this.width / 2, this.y, this.width, this.height);
        } else {
            ctx.drawImage(playerImg, this.x, this.y, this.width, this.height);
        }

        ctx.restore();        
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y - 12, this.width, 6);
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y - 12, this.width * (this.health / this.maxHealth), 6);
    }

    move(keys) {
        // ---- Vertical movement
        if (keys['KeyW'] && this.y > 0) this.y -= this.speed;
        if (keys['KeyS'] && this.y < canvas.height - this.height) this.y += this.speed;

        // ---- Horizontal movement
        if (keys['KeyA'] && this.x > 0) {
            this.x -= this.speed;
            this.facing = "left";
        }

        if (keys['KeyD']) {
            // Determine max X allowed
            let maxX = canvas.width - this.width; 
            if (boss) {
                maxX = boss.x - this.width; 
            }

            if (this.x + this.speed < maxX) {
                this.x += this.speed;
                this.facing = "right";
            } else {
                this.x = maxX; 
            }
        }
    }

}

// =======================
// ENEMY CLASS
// =======================
class Enemy {
    constructor(type = 1) {
        // Provide fallback
        const defaultWidth = 800;
        const defaultHeight = 600;
        this.type = type;
        this.width = 80;
        this.height = 120;
        this.x = (typeof canvas !== 'undefined' && canvas && canvas.width ? canvas.width : defaultWidth) + 50;
        this.y = Math.random() * ((typeof canvas !== 'undefined' && canvas && canvas.height ? canvas.height : defaultHeight) - this.height);

        if (type === 1) { this.baseSpeed = 4; this.health = 50; this.award = Math.floor(10 * scoreMultiplier); }
        else if (type === 2) { this.baseSpeed = 2; this.health = 90; this.award = Math.floor(30 * scoreMultiplier); }
        else { this.baseSpeed = 6; this.health = 40; this.award = Math.floor(20 * scoreMultiplier); }

        this.maxHealth = this.health;
        this.direction = 1;
        this.speed = this.baseSpeed*speedMultiplier
        
        this.baseY = this.y;           // reference point for sine wave
        this.waveAmplitude = 30 + Math.random() * 40; // height of wave (30–70 px)
        this.waveFrequency = 0.0005 + Math.random() * 0.0005; // speed of wave motion
        this.waveOffset = 0; // random phase offset
    }

    draw() {
        const img = this.type === 1 ? fishMonster : this.type === 2 ? snakeMonster : lizardMonster;
        ctx.drawImage(img, this.x, this.y, this.width, this.height);

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y - 12, this.width, 6);
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y - 12, this.width * (this.health / this.maxHealth), 6);
    }

    update(){



    }
    move() {
        // horizontal movement (left)
        this.x -= this.speed;

        // sinusoidal vertical movement
        this.y = this.baseY + Math.sin(Date.now() * this.waveFrequency + this.waveOffset) * this.waveAmplitude;

        if (this.x + this.width < 0) {
            this.x = canvas.width + Math.random() * 200;
            this.baseY = Math.random() * (canvas.height - this.height);
        }
    }

}

// =======================
// BULLET CLASS
// =======================
class Bullet {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 10;
        this.height = 6;
        this.speed = 9;
        this.active = false;
        this.direction = "right";
        this.damage = weaponDamage;
        console.log("Bullet damage set to:", this.damage);
    }

    activate(x, y, direction = "right") {
        this.x = x;
        this.y = y;
        this.active = true;
        this.direction = direction;
    }

    deactivate() { this.active = false; }

    update() {
        if (!this.active) return;
        this.x += this.direction === "right" ? this.speed : -this.speed;
        if (this.x > canvas.width || this.x < 0) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// =======================
// PORTAL CLASS
// =======================
class Portal {
    constructor(type = 1, index = 0, totalPortals = 3, enemiesArray = null) {
        // Provide fallback
        const defaultWidth = 800;
        const defaultHeight = 600;
        this.type = type;
        this.width = 100;
        this.height = 100;
        const cWidth = (typeof canvas !== 'undefined' && canvas && canvas.width ? canvas.width : defaultWidth);
        const cHeight = (typeof canvas !== 'undefined' && canvas && canvas.height ? canvas.height : defaultHeight);
        this.x = Math.min(Math.max(900, cWidth * 0.6 + Math.random() * (cWidth * 0.4 - this.width)), cWidth - this.width);
        const availableHeight = cHeight - (this.height * totalPortals);
        const gap = availableHeight / (totalPortals + 1);
        this.y = gap + index * (this.height + gap);        
        this.health = 150;
        this.maxHealth = this.health;
        this.spawnTimer = Math.floor(Math.random() * 180);    
        this._enemies = enemiesArray || (typeof enemies !== 'undefined' ? enemies : []);
    }

    draw() {
        ctx.drawImage(portalImg, this.x, this.y, this.width, this.height);
        ctx.strokeStyle = "purple";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y - 10, this.width, 6);
        ctx.fillStyle = "purple";
        ctx.fillRect(this.x, this.y - 10, this.width * (this.health / this.maxHealth), 6);
    }

    update() {
        this.spawnTimer++;
        if (this.spawnTimer > 180 && enemies.length < maxEnemies) { // spawn enemy every 3s
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
    }

    spawnEnemy() {
        const type = Math.floor(Math.random()*3) + 1;
        const enemy = new Enemy(type);
        enemy.x = this.x + this.width/2 - enemy.width/2;
        enemy.y = this.y + this.height/2 - enemy.height/2;
        this._enemies.push(enemy);
    }
}

// =======================
// BOSS CLASS
// =======================
class Boss {
    constructor() {
        // Provide fallback
        const defaultWidth = 800;
        const defaultHeight = 600;
        this.width = 200;
        this.height = 200;
        const cWidth = (typeof canvas !== 'undefined' && canvas && canvas.width ? canvas.width : defaultWidth);
        const cHeight = (typeof canvas !== 'undefined' && canvas && canvas.height ? canvas.height : defaultHeight);
        this.x = cWidth - this.width - 50;
        this.y = cHeight / 2 - this.height / 2;

        this.health = 1200;
        this.maxHealth = 1200;

        this.moveTimer = 0;
        this.targetY = this.y;

        this.shootTimer = 0;
        this.maxDeathTime = 120;

        // Charge attack properties
        this.isCharging = false;
        this.chargeProb = 0.003
        this.chargeDirection = -1; // -1 = left, 1 = right
        this.chargeSpeed = 15;
        this.chargeTimer = 0;
        this.shakeTimer = 0;
        this.chargeCooldown = 0;
        this.opacity = 1; // needed for death animation
    }

    startCharge() {
        this.isCharging = true;
        this.shakeTimer = 30;    // telegraph for 0.5 seconds
        // this.chargeTimer = 80;   // actual charge duration
        this.chargeDirection = -1;
        this.chargeCooldown = 240;
    }

    tryCharge() {
        if (!this.isCharging && Math.random() < this.chargeProb && this.chargeCooldown === 0) {
            this.startCharge();
        }
    }

    update(player) {
        if ((this.health/this.maxHealth) < 0.5) {
            this.chargeProb = 0.3;
            this.chargeSpeed = 30;
        }
            // ----------------------------
        // 💀 DEATH ANIMATION MODE
        // ----------------------------
        if (this.isDying) {
            this.deathTimer++;

            // shake effect
            this.x += Math.sin(this.deathTimer * 0.5) * 5;
            this.y += Math.cos(this.deathTimer * 0.4) * 5;

            // fade out
            this.opacity = 1 - (this.deathTimer / this.maxDeathTime);

            // when animation finishes -> YOU WIN
            if (this.deathTimer >= this.maxDeathTime) {
                this.opacity = 0;
                endGame(true);
            }

            return;
        }

        // ----------------------------
        // ⚡ CHARGE ATTACK
        // ----------------------------
        if (this.isCharging) {
            if (this.shakeTimer > 0) {
                this.shakeTimer--;
                this.x += Math.random() * 4 - 2;
            } else if (this.x > 0) {
                // Actual charge movement
                // if (this.x > 0)
                this.x += this.chargeDirection * this.chargeSpeed;
                this.chargeTimer--;
                if (checkCollision(this,player)) {
                    // Apply damage
                    player.health -= 1;
                }
                // Bounce off screen edges
                if (this.x < 0) this.chargeDirection = 1;
                if (this.x + this.width > canvas.width) this.chargeDirection = -1;
            } else {
                // End charge
                this.isCharging = false;
                this.x = canvas.width - this.width - 50;
            }
        } else {
            // Normal movement
            this.moveTimer++;
            if (this.moveTimer > 60) { 
                this.targetY = Math.random() * (canvas.height - this.height);
                this.moveTimer = 0;
            }

            if (this.y < this.targetY) this.y += 2;
            if (this.y > this.targetY) this.y -= 2;

            // Shooting
            this.shootTimer++;
            if (this.shootTimer > 70) {
                this.shoot();
                this.shootTimer = 0;
            }
            if(this.chargeCooldown > 0) this.chargeCooldown--;
            // Randomly try to start a charge attack
            this.tryCharge();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(bossImg, this.x, this.y, this.width, this.height);
        ctx.restore();

        // draw HP bar ONLY when alive
        if (!this.isDying) {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y - 18, this.width, 12);

            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y - 15, this.width * (this.health / this.maxHealth), 6);
        }
    }

    shoot() {
        for (let b of bossBullets) {
            if (!b.active) {
                b.active = true;
                b.x = this.x;
                b.y = this.y + this.height / 2;
                break;
            }
        }
    }
}

class Collectable {
    constructor(type, x = null, y = null) {
        this.type = type;
        this.width = 50;
        this.height = 50;
        this.x = x !== null ? x : Math.random() * (canvas.width - this.width);
        this.y = y !== null ? y : Math.random() * (canvas.height - this.height);
        this.active = true;
        this.duration = 600; // lasts for 10 seconds
        this.bobOffset = Math.random() * 100;
    }

    draw() {
        if (!this.active) return;

        let img;
        switch (this.type) {
            case "health": img = healthImg; break;
            case "berserk": img = berserkImg; break;
            case "score": img = scoreImg; break;
            case "speed": img = speedImg; break;
            case "ignite": img = igniteImg; break;
            case "slowdown": img = slowdownImg; break;
            default: img = null;
        }

        if (img) {
            // bobbing effect
            const bob = Math.sin(Date.now() / 300 + this.bobOffset) * 5;
            ctx.drawImage(img, this.x, this.y + bob, this.width, this.height);
        }   
    }

    update() {
        if (!this.active) return;
        this.duration--;
        if (this.duration <= 0) this.active = false;

        // Check collision with player
        if (
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y
        ) {
            var effect = Number(effectValues[this.type])
            var damage = damageValues[this.type]
            this.applyEffect(effect,damage);
        }
    }

    applyEffect(effect,damage) {
        switch(this.type) {
            case "health":
                console.log("Health effect:", effect);
                player.health = Math.min(player.maxHealth, player.health + effect);
                console.log("Health effect:", player.health);
                break;
            case "berserk":
                player.damage = damage; // double damage
                player.health -= effect; // slight health cost
                setTimeout(() => player.damage = 1, 10000); // lasts 10 seconds
                break;
            case "score":
                score += effect; 
                break;
            case "speed":
                player.speed += effect; 
                setTimeout(() => player.speed -= effect, 5000); // lasts 5 seconds
                break;
            case "ignite":
                for (let e of enemies) {
                    e.health -= damage; // damage all enemies slightly
                }
                break;
            case "slowdown":
                speedMultiplier = 1/damage;
                setTimeout(() => {
                    speedMultiplier = 1;
                }, 5000);
                break;
        }
        this.active = false;
    }
}

// =======================
// GAME STATE
// =======================
let player = new Player();
let bulletPool = [];
let enemies = [];
let portals = [];
let keys = {};
let score = 0;
let gameOver = false;
let boss = null;
let bossBullets = [];
let collectables = [];
let speedMultiplier = 1; // 1 = normal speed, <1 = slowed
let maxEnemies = 10;
let numPortals = 4;
let weaponDamage = 25;
let scoreMultiplier = 1;

// Create bullet pool (Boss)
const MAX_BOSS_BULLETS = 20;
const MAX_BULLETS = 30;

function poolInit(pool, maxBullets = MAX_BULLETS) {
    for (let i = 0; i < maxBullets; i++) {
        pool.push(new Bullet())
    }
}



// Input (only in browser)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener("keydown", e => keys[e.code] = true);
    document.addEventListener("keyup", e => keys[e.code] = false);
    document.addEventListener("mousedown", shoot);
    const restartBtn = document.getElementById("restartBtn");
    if (restartBtn) {
        restartBtn.addEventListener("click", () => location.reload());
    }
}

// =======================
// GAME FUNCTIONS
// =======================
function shoot() {
    if (gameOver) return;
    for (let b of bulletPool) {
        if (!b.active) {
            const startX = player.facing === "right" ? player.x + player.width : player.x - 10;
            const startY = player.y + player.height / 2 - 3;
            b.activate(startX, startY, player.facing);
            return;
        }
    }
}

// =======================
// SPAWN COLLECTABLES
// =======================
function checkCollision(a,b){
    return (a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y)
}

// =======================
// SPAWN COLLECTABLES
// =======================
function spawnCollectable(type, x = null, y = null) {
    collectables.push(new Collectable(type, x, y));
}

// =======================
// REMOVE ENEMY
// =======================
function removeEnemy(i) {
    const last = enemies.length-1;
    [enemies[i], enemies[last]] = [enemies[last], enemies[i]];
    enemies.pop();
}

function initGame() {
    setParams();
    poolInit(bulletPool);
    poolInit(bossBullets, MAX_BOSS_BULLETS);

    // Spawn 3 portals initially
    for (let i=0; i<numPortals; i++) {
        const type = 1;
        portals.push(new Portal(type, i, numPortals));
    }
}

// =======================
// UPDATE GAME LOGIC
// =======================
function update() {
    if (gameOver) return;
    player.move(keys);
    // Update bullets
    for (let b of bulletPool) b.update();
    for (let c of collectables) c.update();

    // Update enemies
    if (!boss) {
        for (let ei=enemies.length-1; ei>=0; ei--) {
            const e = enemies[ei];
            e.speed = e.baseSpeed*speedMultiplier
            e.move();


            // Enemy hits player
            if (checkCollision(e,player)) player.health -= 0.5;

            for (let b of bulletPool) {
                if (!b.active) continue;
                if (checkCollision(b,e)){
                    b.active = false;
                    e.health -= b.damage * player.damage; // Check for Berserk mode
                    if (e.health <= 0) { 
                        score += e.award; 
                        removeEnemy(ei); 

                        // Usage in drop logic
                        if (Math.random() < 0.2) { // base chance to drop
                            let type = null;

                            if (player.health < 30) {
                                type = "health"; // always drop health if low
                            } else {
                                type = pickWeightedItem(rarities);
                            }
                            spawnCollectable(type, e.x + e.width / 2 - 20, e.y + e.height / 2 - 20);
                        }
                        break; 
                    }
                }
            }
        }

        // Update portals
        for (let pi=portals.length-1; pi>=0; pi--) {
            const p = portals[pi];
            p.update();

            for (let b of bulletPool) {
                if (!b.active) continue;
                if (checkCollision(b,p))
                {
                    b.active = false;
                    p.health -= b.damage * player.damage; // Check for Berserk mode
                    if (p.health <= 0) { 
                        portals.splice(pi, 1); 
                        score += 100; 
                        break; 
                    }
                }
            }
        }
    }
    else {
        boss.update(player);

        // boss bullet movement + collision
        for (let b of bossBullets) {
            if (!b.active) continue;

            b.x -= b.speed;

            // hit player
            if (
                checkCollision(b,player)
            ) {
                b.active = false;
                player.health -= 5;
            }
            if (b.x < 0) b.active = false;
        }

        // player bullets hit boss
        for (let pBullet of bulletPool) {
            if (!pBullet.active) continue;

            if (
                checkCollision(pBullet,boss)
            ) {
                pBullet.active = false;
                boss.health -= pBullet.damage;

                if (boss.health <= 0 && !boss.isDying) {
                    score += 500;
                    boss.isDying = true;
                    boss.deathTimer = 0;
                }
            }
        }
    }

    document.getElementById("score").innerText = score;
    document.getElementById("playerHealth").innerText = Math.max(0, Math.floor(player.health));

    if (portals.length === 0 && enemies.length === 0 && !boss) {
        boss = new Boss();
    }


    if (player.health <= 0) endGame();
}

// =======================
// DRAW GAME
// =======================
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    player.draw();
    for (let b of bulletPool) b.draw();
    for (let p of portals) p.draw();
    for (let e of enemies) e.draw();
    for (let c of collectables) c.draw();

    // === 🚨 BOSS AND BOSS BULLETS GO HERE === //
    if (boss) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial Black";
        ctx.textAlign = "center";
        ctx.fillText("FINAL BOSS!", canvas.width / 2, 150);
        
        boss.draw();

        for (let b of bossBullets) {
            if (b.active) {
                ctx.fillStyle = "red";
                ctx.fillRect(b.x, b.y, b.width, b.height);
            }
        }
    }
}

// =======================
// GAME LOOP
// =======================
function gameLoop() {
    update();
    draw();
    if (!gameOver) requestAnimationFrame(gameLoop);
}

// Start loading assets only in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    loadAssets();
}

// Export classes for Jest testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player, Enemy, Bullet, Portal, Boss, Collectable };
}
