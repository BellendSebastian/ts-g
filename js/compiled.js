var Renderer = (function () {
    function Renderer(width, height, tileSize) {
        this.container = document.getElementById('container');
        this.WIDTH = this.container.offsetWidth;
        this.HEIGHT = this.container.offsetHeight;
        this.VIEW_ANGLE = 45;
        this.ASPECT = this.WIDTH / this.HEIGHT;
        this.NEAR = 0.1;
        this.FAR = 10000;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.camera = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR);
        this.scene = new THREE.Scene();

        this.container.appendChild(this.renderer.domElement);

        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;

        var light = new THREE.SpotLight(0xffffff, 0.8);
        light.angle = Math.PI / 2;
        light.castShadow = true;
        light.position.set(0, 0, 100);
        this.scene.add(light);

        this.camera.position.set(0, 0, 50);
    }
    Renderer.prototype.draw = function () {
        this.renderer.render(this.scene, this.camera);
    };

    Renderer.prototype.moveCamera = function (vector) {
        this.camera.position.x = vector.x;
        this.camera.position.y = vector.y;
    };

    Renderer.prototype.update = function () {
    };
    return Renderer;
})();
var Input = (function () {
    function Input() {
        this.keys = [];
        document.addEventListener('keydown', this.keyDown.bind(this), false);
        document.addEventListener('keyup', this.keyUp.bind(this), false);
    }
    Input.prototype.keyDown = function (event) {
        event.preventDefault();
        this.keys[event.keyCode] = true;
    };

    Input.prototype.keyUp = function (event) {
        event.preventDefault();
        this.keys[event.keyCode] = false;
    };

    Input.prototype.isPressed = function (keyCode) {
        return this.keys[keyCode];
    };
    return Input;
})();
var AssetManager = (function () {
    function AssetManager() {
    }
    return AssetManager;
})();
var Item = (function () {
    function Item() {
    }
    return Item;
})();
var ItemFactory = (function () {
    function ItemFactory() {
    }
    return ItemFactory;
})();
var Creature = (function () {
    function Creature() {
    }
    Creature.prototype.update = function () {
    };

    Creature.prototype.draw = function () {
    };

    Creature.prototype.getModel = function () {
        return this.model;
    };

    Creature.prototype.getPosition = function () {
        return this.pos;
    };

    Creature.prototype.setPosition = function (pos) {
        this.pos = pos;
    };

    Creature.prototype.getSpeed = function () {
        return this.speed;
    };

    Creature.prototype.move = function (x, y) {
        this.pos.x += x;
        this.pos.y += y;
    };
    return Creature;
})();
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        _super.call(this);
        var size = 4;
        var geometry = new THREE.CubeGeometry(size, size, size);
        var shadeMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
        var edgeMat = new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true, transparent: true, wireframeLinewidth: 3 });
        this.model = THREE.SceneUtils.createMultiMaterialObject(geometry, [shadeMat, edgeMat]);
        this.pos = new THREE.Vector3(12.5, 12.5, 2);
        this.speed = 0.7;
        this.model.position = this.pos;
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.fired = false;
        this.firingCooldown = 0;
    }
    Player.prototype.update = function () {
        if (this.firingCooldown > 0) {
            this.firingCooldown -= 1;
        } else {
            this.fired = false;
        }
        this.model.position = this.pos;
    };

    Player.prototype.hasFired = function () {
        return this.fired;
    };

    Player.prototype.firing = function () {
        this.firingCooldown = 50;
        this.fired = true;
    };
    return Player;
})(Creature);
var CreatureFactory = (function () {
    function CreatureFactory() {
    }
    CreatureFactory.prototype.spawnPlayer = function (vector) {
        var player = new Player();
        player.setPosition(vector);
        return player;
    };
    return CreatureFactory;
})();
var Projectile = (function () {
    function Projectile(vector, velX, velY, velZ) {
        this.pos = new THREE.Vector3(vector.x, vector.y, vector.z);
        var geometry = new THREE.SphereGeometry(1, 10, 10);
        var shadeMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
        var edgeMat = new THREE.MeshBasicMaterial({ color: 0xFF0000, wireframe: true, transparent: true, wireframeLinewidth: 3 });
        this.model = THREE.SceneUtils.createMultiMaterialObject(geometry, [shadeMat, edgeMat]);

        this.model.position = this.pos;
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.velocity = {
            x: velX,
            y: velY,
            z: 0
        };
    }
    Projectile.prototype.update = function () {
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
        if (this.pos.z - this.velocity.z > 0) {
            this.pos.z += this.velocity.z;
        }
        this.model.position = this.pos;
    };

    Projectile.prototype.getModel = function () {
        return this.model;
    };
    return Projectile;
})();
var TestWorld = (function () {
    function TestWorld(texture, width, height, tileSize) {
        this.bound = tileSize;
        this.width = width;
        this.height = height;
        this.texture = texture;

        this.world = [];
        this.meshes = [];

        for (var i = 0; i < this.height; i++) {
            this.world[i] = [];
            this.meshes[i] = [];
        }

        this.generateWorld();
        this.generateMeshes();
    }
    TestWorld.prototype.generateWorld = function () {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.world[y][x] = 1;
            }
        }
    };

    TestWorld.prototype.generateMeshes = function () {
        var geometry = new THREE.CubeGeometry(this.bound, this.bound, 1);
        var material = new THREE.MeshPhongMaterial({ map: this.texture });
        var material2 = new THREE.MeshBasicMaterial({ wireframe: true, wireframeLinewidth: 3 });
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.meshes[y][x] = THREE.SceneUtils.createMultiMaterialObject(geometry, [material, material2]);
                this.meshes[y][x].position = new THREE.Vector3(x * this.bound, y * this.bound, -5);
                this.meshes[y][x].receiveShadow = true;
                this.meshes[y][x].castShadow = true;
            }
        }
    };

    TestWorld.prototype.getModel = function (x, y) {
        return this.meshes[y][x];
    };
    return TestWorld;
})();
var Game = (function () {
    function Game() {
        this.assets = new AssetManager();

        this.width = 13;
        this.height = 7;
        this.tileSize = 5;

        var spawnPos = new THREE.Vector3(((this.width * this.tileSize) / 2) - (this.tileSize / 2), ((this.height * this.tileSize) / 2) - (this.tileSize / 2), 0);
        console.log(spawnPos);

        this.renderer = new Renderer(this.width, this.height, this.tileSize);
        this.input = new Input();
        this.cf = new CreatureFactory();
        this.if = new ItemFactory();
        this.player = this.cf.spawnPlayer(spawnPos);
        this.tw = new TestWorld(THREE.ImageUtils.loadTexture('../assets/test.png'), this.width, this.height, this.tileSize);
        this.entities = [];

        this.renderer.scene.add(this.player.getModel());

        for (var y = 0; y < this.tw.height; y++) {
            for (var x = 0; x < this.tw.width; x++) {
                this.renderer.scene.add(this.tw.getModel(x, y));
            }
        }

        this.entities.push(this.player);
        this.renderer.moveCamera(this.player.getPosition());
        this.loop();
    }
    Game.prototype.loop = function () {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop.bind(this));
    };

    Game.prototype.draw = function () {
        this.renderer.draw();
    };

    Game.prototype.update = function () {
        this.entities.forEach(function (entity) {
            entity.update();
        });
        this.handleKeys();
        this.renderer.update();
    };

    Game.prototype.handleKeys = function () {
        var projectile = null;
        if (this.input.isPressed('65')) {
            this.player.move(-0.3, 0);
            this.renderer.moveCamera(this.player.getPosition());
        }
        if (this.input.isPressed('68')) {
            this.player.move(0.3, 0);
            this.renderer.moveCamera(this.player.getPosition());
        }
        if (this.input.isPressed('83')) {
            this.player.move(0, -0.3);
            this.renderer.moveCamera(this.player.getPosition());
        }
        if (this.input.isPressed('87')) {
            this.player.move(0, 0.3);
            this.renderer.moveCamera(this.player.getPosition());
        }

        if (this.input.isPressed('37') && !this.player.hasFired()) {
            projectile = new Projectile(this.player.getPosition(), -this.player.getSpeed(), 0, 0);
            this.entities.push(projectile);
            this.renderer.scene.add(projectile.getModel());
            this.player.firing();
        }
        if (this.input.isPressed('39') && !this.player.hasFired()) {
            projectile = new Projectile(this.player.getPosition(), this.player.getSpeed(), 0, 0);
            this.entities.push(projectile);
            this.renderer.scene.add(projectile.getModel());
            this.player.firing();
        }
        if (this.input.isPressed('38') && !this.player.hasFired()) {
            projectile = new Projectile(this.player.getPosition(), 0, this.player.getSpeed(), 0);
            this.entities.push(projectile);
            this.renderer.scene.add(projectile.getModel());
            this.player.firing();
        }
        if (this.input.isPressed('40') && !this.player.hasFired()) {
            projectile = new Projectile(this.player.getPosition(), 0, -this.player.getSpeed(), 0);
            this.entities.push(projectile);
            this.renderer.scene.add(projectile.getModel());
            this.player.firing();
        }
    };
    return Game;
})();
var g = new Game();
