import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

    const canvas = document.querySelector('#world');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb8e6e8);
    scene.fog = new THREE.Fog(0xb8e6e8, 150, 330);

    const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 360);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.HemisphereLight(0xe8faff, 0x68884c, 2.05));
    const sunlight = new THREE.DirectionalLight(0xfff0cc, 2.5);
    sunlight.position.set(-24, 42, -20);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(1024, 1024);
    sunlight.shadow.camera.left = -55;
    sunlight.shadow.camera.right = 55;
    sunlight.shadow.camera.top = 55;
    sunlight.shadow.camera.bottom = -55;
    scene.add(sunlight);

    const playerWorldPosition = new THREE.Vector3(0, 1.7, -28);
    let cameraDistance = 17;
    let cameraYaw = 0;
    let cameraPitch = .46;
    camera.position.set(
      playerWorldPosition.x + Math.sin(cameraYaw) * cameraDistance,
      playerWorldPosition.y + .6 + Math.tan(cameraPitch) * cameraDistance,
      playerWorldPosition.z + Math.cos(cameraYaw) * cameraDistance
    );
    camera.lookAt(playerWorldPosition.x, playerWorldPosition.y + .6, playerWorldPosition.z);

    const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .88, ...extra });
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    function block(parent, x, y, z, sx, sy, sz, color, options = {}) {
      const mesh = new THREE.Mesh(cubeGeometry, material(color, options));
      mesh.position.set(x, y, z);
      mesh.scale.set(sx, sy, sz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    function setInstanceTransform(mesh, index, x, y, z, sx, sy, sz) {
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion(),
        new THREE.Vector3(sx, sy, sz)
      );
      mesh.setMatrixAt(index, matrix);
    }
    const avatarLooks = {
      forest: { shirt: 0x4a9b61, accent: 0xf1c85b },
      ocean: { shirt: 0x358bd2, accent: 0xe8f0df },
      sunset: { shirt: 0xd7674e, accent: 0xf4ca62 }
    };
    let selectedAvatar = 'ocean';
    const playerAvatar = new THREE.Group();
    playerAvatar.scale.setScalar(.78);
    const playerBody = block(playerAvatar, 0, 1.35, 0, .9, 1, .6, avatarLooks[selectedAvatar].shirt);
    function makeLimb(x, y, width, height, depth, color, hand = false) {
      const limb = new THREE.Group();
      limb.position.set(x, y, 0);
      block(limb, 0, -height / 2, 0, width, height, depth, color);
      if (hand) block(limb, 0, -height - .1, .04, width * .92, .2, depth * .9, 0xe7b68d);
      playerAvatar.add(limb);
      return limb;
    }
    const playerArms = [
      makeLimb(-.61, 1.8, .27, .86, .38, avatarLooks[selectedAvatar].shirt, true),
      makeLimb(.61, 1.8, .27, .86, .38, avatarLooks[selectedAvatar].shirt, true)
    ];
    block(playerAvatar, 0, 2.2, 0, .68, .68, .65, 0xe7b68d);
    block(playerAvatar, 0, 2.57, -.02, .72, .18, .7, 0x49392d);
    const playerEyes = [
      block(playerAvatar, -.15, 2.22, .34, .08, .08, .05, 0x273b3a),
      block(playerAvatar, .15, 2.22, .34, .08, .08, .05, 0x273b3a)
    ];
    block(playerAvatar, 0, 2.04, .35, .2, .055, .05, 0x7b4437);
    block(playerAvatar, -.1, 2.06, .35, .055, .045, .05, 0x7b4437);
    block(playerAvatar, .1, 2.06, .35, .055, .045, .05, 0x7b4437);
    const playerAccent = block(playerAvatar, 0, 1.35, .31, .12, .55, .04, avatarLooks[selectedAvatar].accent);
    const playerLegs = [
      makeLimb(-.23, .94, .38, .86, .42, 0x374b51),
      makeLimb(.23, .94, .38, .86, .42, 0x374b51)
    ];
    playerLegs.forEach(leg => block(leg, 0, -.86, .05, .4, .16, .55, 0x283438));
    playerAvatar.visible = false;
    scene.add(playerAvatar);
    function applyPlayerAvatar(avatar) {
      const look = avatarLooks[avatar];
      playerBody.material.color.setHex(look.shirt);
      playerArms.forEach(arm => arm.material.color.setHex(look.shirt));
      playerAccent.material.color.setHex(look.accent);
    }
    function flatBox(x, z, width, length, color, y = .025, angle = 0) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, .05, length), material(color));
      mesh.position.set(x, y, z);
      mesh.rotation.y = angle;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    }

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), material(0x8ddc59));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -.08;
    ground.receiveShadow = true;
    scene.add(ground);
    const riverCenterAt = x => -38 + Math.sin(x * .075) * 1.1;
    const riverHalfWidth = 4.6;

    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, .16, 16), material(0xe5cf97));
    plaza.position.set(0, .01, 0);
    plaza.receiveShadow = true;
    scene.add(plaza);
    const plazaGreen = new THREE.Mesh(new THREE.CylinderGeometry(8.7, 8.7, .07, 16), material(0x8bd264));
    plazaGreen.position.set(0, .12, 0);
    plazaGreen.receiveShadow = true;
    scene.add(plazaGreen);
    flatBox(0, 0, 2.5, 10.5, 0xe9d89f, .17);

    const hillLocations = [{ x: -103, z: 5, scale: 1 }, { x: 72, z: 96, scale: .9 }];
    const treePositions = [];
    function makeTree(x, z, scale = 1) {
      treePositions.push({ x, z, scale, clearance: 2.1 * scale });
    }
    for (let i = 0; i < 26; i++) {
      const angle = i * 2.399;
      const radius = 49 + (i % 4) * 4.2;
      const treeX = i === 28 ? -53 : Math.cos(angle) * radius;
      const treeZ = i === 28 ? -5 : Math.sin(angle) * radius;
      if (Math.abs(treeX) < 7 && treeZ > -46 && treeZ < -30) continue;
      if (Math.abs(treeZ - riverCenterAt(treeX)) < riverHalfWidth + 2.5) continue;
      if (hillLocations.some(hill => Math.hypot(treeX - hill.x, treeZ - hill.z) < 44 * hill.scale)) continue;
      makeTree(treeX, treeZ, .78 + (i % 4) * .12);
    }
    const outerClearings = [[69, 29], [88, 31], [92, 8], [84, -17], [71, -55], [88, -55], [108, -55], [52, -28], [68, -27], [107, 33]];
    for (let i = 0; i < 48; i++) {
      const angle = i * 2.399 + .7;
      const radius = 115 + (i % 4) * 4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (outerClearings.some(([clearX, clearZ]) => Math.hypot(x - clearX, z - clearZ) < 15)) continue;
      if (Math.abs(z - riverCenterAt(x)) < riverHalfWidth + 2.5) continue;
      if (hillLocations.some(hill => Math.hypot(x - hill.x, z - hill.z) < 44 * hill.scale)) continue;
      makeTree(x, z, .9 + (i % 3) * .12);
    }
    const hills = [];
    function makeHill(x, z, scale = 1) {
      const baseHalf = 36 * scale;
      const stepInset = .6 * scale;
      const stepHeight = .4 * scale;
      const levels = 50;
      const hill = new THREE.Group();
      hill.position.set(x, 0, z);
      const tiers = new THREE.InstancedMesh(
        cubeGeometry,
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .92 }),
        levels
      );
      const stairs = new THREE.InstancedMesh(
        cubeGeometry,
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .88 }),
        levels
      );
      const matrix = new THREE.Matrix4();
      const rotation = new THREE.Quaternion();
      for (let level = 0; level < levels; level++) {
        const halfSize = baseHalf - level * stepInset;
        matrix.compose(
          new THREE.Vector3(0, (level + .5) * stepHeight, 0),
          rotation,
          new THREE.Vector3(halfSize * 2, stepHeight, halfSize * 2)
        );
        tiers.setMatrixAt(level, matrix);
        tiers.setColorAt(level, new THREE.Color(level % 5 < 2 ? 0x69ae56 : 0x72b95d));
        matrix.compose(
          new THREE.Vector3(0, (level + 1) * stepHeight - .05 * scale, halfSize - stepInset / 2),
          rotation,
          new THREE.Vector3(4.2 * scale, .1 * scale, stepInset + .08 * scale)
        );
        stairs.setMatrixAt(level, matrix);
        stairs.setColorAt(level, new THREE.Color(level % 2 ? 0xc3a36a : 0xd0b478));
      }
      tiers.instanceMatrix.needsUpdate = true;
      tiers.instanceColor.needsUpdate = true;
      stairs.instanceMatrix.needsUpdate = true;
      stairs.instanceColor.needsUpdate = true;
      tiers.receiveShadow = true;
      stairs.receiveShadow = true;
      hill.add(tiers, stairs);
      scene.add(hill);
      hills.push({ x, z, baseHalf, stepInset, stepHeight, levels, height: levels * stepHeight });
      return hills[hills.length - 1];
    }
    const powerHill = makeHill(hillLocations[0].x, hillLocations[0].z, hillLocations[0].scale);
    makeHill(hillLocations[1].x, hillLocations[1].z, hillLocations[1].scale);

    function makePowerTower(hill) {
      const tower = new THREE.Group();
      tower.position.set(hill.x, hill.height, hill.z);
      const steel = 0x687880;
      const addStrut = (from, to, thickness = .22) => {
        const start = new THREE.Vector3(...from);
        const direction = new THREE.Vector3(...to).sub(start);
        const length = direction.length();
        const midpoint = start.clone().addScaledVector(direction, .5);
        const strut = block(tower, midpoint.x, midpoint.y, midpoint.z, thickness, length, thickness, steel);
        strut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        strut.castShadow = false;
      };
      const halfAt = y => 2.4 - 1.5 * (y / 9);
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          addStrut([sx * 2.4, 0, sz * 2.4], [sx * .9, 9, sz * .9], .3);
        }
      }
      for (const y of [2.5, 5, 7.5]) {
        const half = halfAt(y);
        for (const side of [-1, 1]) {
          block(tower, 0, y, side * half, half * 2, .2, .2, steel);
          block(tower, side * half, y, 0, .2, .2, half * 2, steel);
        }
      }
      for (const [low, high] of [[.25, 2.5], [2.5, 5], [5, 7.5]]) {
        const lowHalf = halfAt(low);
        const highHalf = halfAt(high);
        for (const side of [-1, 1]) {
          addStrut([-lowHalf, low, side * lowHalf], [highHalf, high, side * highHalf], .14);
          addStrut([lowHalf, low, side * lowHalf], [-highHalf, high, side * highHalf], .14);
          addStrut([side * lowHalf, low, -lowHalf], [side * highHalf, high, highHalf], .14);
          addStrut([side * lowHalf, low, lowHalf], [side * highHalf, high, -highHalf], .14);
        }
      }
      block(tower, 0, 10.6, 0, .42, 4.4, .42, steel);
      block(tower, 0, 9.7, 0, 9.6, .28, .32, steel);
      block(tower, 0, 11.6, 0, 7.2, .28, .32, steel);
      for (const [armY, positions] of [[9.45, [-3.6, 0, 3.6]], [11.35, [-2.7, 0, 2.7]]]) {
        for (const x of positions) {
          block(tower, x, armY - .32, 0, .24, .55, .24, 0xb9d7d4);
          block(tower, x, armY - .62, 0, .32, .12, .32, steel);
        }
      }
      block(tower, 0, 13.1, 0, .18, .8, .18, steel);
      scene.add(tower);
    }
    makePowerTower(powerHill);

    function makeCloud(x, y, z, scale = 1) {
      const cloud = new THREE.Group();
      cloud.position.set(x, y, z);
      const puffs = [
        [0, 0, 0, 4.6, 1.15, 2],
        [-1.4, .45, 0, 2.6, 1.8, 2],
        [1.25, .6, -.05, 2.8, 2, 2.15],
        [2.8, .12, 0, 2.1, 1.2, 1.8],
        [-1.1, -.28, 1.15, 2.25, .72, 1.15]
      ];
      const cloudMaterial = material(0xfafdfb);
      for (const [px, py, pz, sx, sy, sz] of puffs) {
        const puff = new THREE.Mesh(cubeGeometry, cloudMaterial);
        puff.position.set(px * scale, py * scale, pz * scale);
        puff.scale.set(sx * scale, sy * scale, sz * scale);
        puff.castShadow = false;
        puff.receiveShadow = false;
        cloud.add(puff);
      }
      scene.add(cloud);
      return cloud;
    }
    const clouds = [
      makeCloud(-6, 15, -62, 1.15),
      makeCloud(8, 18, -78, 1.2),
      makeCloud(-42, 14, 12, .95),
      makeCloud(43, 17, 28, 1)
    ];

    const npcData = [
      {
        name: 'Kak Bima', place: 'Gapura Desa', topic: 'Pergaulan Remaja Sehat',
        pos: [0, -46.5], item: [-3, -44.5], itemName: 'Buku Pedoman', itemColor: 0x358be1, kind: 'bima',
        pages: [
          'Pergaulan sehat dimulai dari sikap saling menghargai. Dengarkan pendapat orang lain, jaga batasan diri, dan perlakukan teman dengan hormat.',
          'Teman yang baik mendukung prestasi dan kegiatan positif. Berani berkata “tidak” pada tekanan teman adalah bentuk menjaga diri, bukan tanda tidak setia kawan.',
          'Pilih tindakan yang sesuai dengan nilai keluarga, norma agama, dan hukum. Jika menghadapi situasi yang membuat tidak nyaman, bicaralah dengan orang dewasa tepercaya.',
          'Persahabatan sehat memberi ruang untuk berkata jujur, meminta maaf, dan berkembang. Teman yang baik tidak memaksa atau mengancam.'
        ]
      },
      {
        name: 'Bu Ratna', place: 'Taman Kampung', topic: 'Risiko Pergaulan Berisiko',
        pos: [-22, -13], item: [-19, -9], itemName: 'Pita Komitmen', itemColor: 0xf08fbb, kind: 'ratna',
        pages: [
          'Keputusan yang terburu-buru karena tekanan teman dapat membawa dampak panjang. Tawuran bisa menyebabkan cedera dan masalah hukum.',
          'Rokok dan minuman beralkohol memiliki risiko bagi kesehatan dan dapat mengganggu belajar serta rencana masa depan. Kamu berhak menolak ajakan yang tidak aman.',
          'Bangun pertemanan dengan batasan yang sehat dan saling menghormati. Isi waktu dengan kegiatan yang kamu sukai dan mintalah bantuan saat merasa tertekan.',
          'Jika kamu atau teman mulai merokok atau minum alkohol, jangan menghakimi. Ajak bicara orang dewasa tepercaya atau tenaga kesehatan agar mendapat dukungan yang aman.'
        ]
      },
      {
        name: 'Dokter Sari', place: 'Pos Kesehatan', topic: 'Kesehatan Fisik & Reproduksi',
        pos: [22, -12], item: [25, -9], itemName: 'Kotak P3K Edukasi', itemColor: 0xf0f1e7, kind: 'sari',
        pages: [
          'Kesehatan tubuh perlu dijaga dengan informasi yang benar dan kebiasaan yang aman. Infeksi menular seksual, termasuk HIV, memerlukan pencegahan dan layanan kesehatan yang tepat.',
          'HIV tidak menular lewat pelukan, berbagi makanan, atau berjabat tangan. Informasi akurat membantu kita menghindari stigma dan mendukung orang yang membutuhkan perawatan.',
          'Kehamilan pada usia remaja dapat membawa risiko kesehatan dan tantangan besar. Tenaga kesehatan dan orang dewasa tepercaya dapat memberi informasi serta dukungan tanpa menghakimi.',
          'Jangan mendiagnosis diri dari unggahan internet. Untuk pertanyaan kesehatan pribadi, gunakan layanan kesehatan yang tepercaya dan jaga kerahasiaan informasi.'
        ]
      },
      {
        name: 'Bu Dina', place: 'Balai Konseling', topic: 'Kesehatan Psikologis & Sosial',
        pos: [23, 16], item: [26, 19], itemName: 'Lentera Harapan', itemColor: 0xffdf55, kind: 'dina',
        pages: [
          'Tekanan, konflik, atau pengalaman yang tidak aman dapat membuat seseorang merasa stres, cemas, atau kehilangan percaya diri. Perasaan itu layak didengarkan.',
          'Masalah yang dibiarkan dapat memengaruhi hubungan, konsentrasi, dan semangat bersekolah. Meminta pertolongan bukan kelemahan dan kamu tidak harus menghadapinya sendirian.',
          'Bicaralah kepada keluarga, guru BK, konselor, atau tenaga profesional yang kamu percaya. Dukungan yang tepat dapat membantu menyusun langkah kecil untuk pulih.',
          'Jika seseorang merasa sangat putus asa atau tidak aman, dampingi tanpa menghakimi dan segera libatkan orang dewasa atau layanan profesional.'
        ]
      },
      {
        name: 'Pak Hendra', place: 'Area Sekolah', topic: 'Strategi Pencegahan',
        pos: [-20, 19], item: [-23, 22], itemName: 'Perisai Prinsip', itemColor: 0xc6d4df, kind: 'hendra',
        pages: [
          'Pilih teman yang menghormati batasan dan mengajak pada hal positif. Kamu tetap boleh berteman dengan banyak orang sambil menentukan pilihanmu sendiri.',
          'Ikut ekstrakurikuler, olahraga, seni, atau hobi yang kamu sukai membantu membangun keterampilan dan lingkungan pertemanan yang mendukung.',
          'Latih kalimat tegas dan sopan untuk menolak ajakan yang berisiko. Jika situasi terasa mengancam, menjauh dan cari bantuan orang dewasa tepercaya.',
          'Rencana sederhana—siapa yang bisa dihubungi, bagaimana pulang, dan tempat aman yang dituju—membantu saat menghadapi tekanan.'
        ]
      },
      {
        name: 'Kak Raka', place: 'Pos Literasi Digital', topic: 'Bijak Bermedia Sosial',
        pos: [-27, 4], item: [-30, 7], itemName: 'Kacamata Bijak', itemColor: 0x6fd4ee, kind: 'raka',
        pages: [
          'Di internet, jangan sembarang membuka atau membagikan konten seksual, data pribadi, maupun tautan mencurigakan. Tutup konten yang membuat tidak nyaman dan beri tahu orang dewasa tepercaya.',
          'Perundungan siber tetap bisa menyakiti meskipun terjadi lewat layar. Jangan ikut menyebarkan; simpan bukti dengan aman, blokir atau laporkan, lalu cari dukungan.',
          'Periksa sumber, tanggal, dan bukti sebelum percaya pada unggahan. Algoritma tidak selalu menunjukkan informasi yang seimbang; jeda sejenak sebelum membagikan sesuatu.',
          'Gunakan fitur blokir dan lapor jika diperlukan. Simpan bukti perundungan dengan aman dan mintalah bantuan, bukan membalas atau menyebarkannya.'
        ]
      },
      {
        name: 'Ustadz Arif', place: 'Pendopo Warga', topic: 'Ketahanan Keluarga & Nilai Moral',
        pos: [5, 28], item: [8, 31], itemName: 'Gulungan Nilai Moral', itemColor: 0xe9b83e, kind: 'arif',
        pages: [
          'Keluarga yang tangguh dibangun lewat kasih sayang, komunikasi terbuka, tanggung jawab, dan saling menjaga. Nilai agama dan keyakinan keluarga dapat menjadi panduan dalam mengambil keputusan.',
          'Setiap orang memiliki martabat dan berhak diperlakukan dengan aman serta hormat. Perbedaan identitas bukan alasan untuk merundung atau mengucilkan seseorang.',
          'Jaga nilai yang kamu yakini sambil berbicara dengan santun dan berempati. Jika ada persoalan keluarga atau kesehatan, carilah pendamping tepercaya dan informasi dari tenaga profesional.',
          'Keluarga dapat berbeda dalam kebiasaan dan keyakinan. Mendengar dengan hormat dan menyelesaikan masalah tanpa kekerasan membantu menjaga hubungan.'
        ]
      },
      {
        name: 'Bu Maya', place: 'Perpustakaan Desa', topic: 'Privasi & Jejak Digital',
        pos: [12, -23], item: [15, -20], itemName: 'Kartu Jejak Digital', itemColor: 0x5bc5b3, kind: 'maya',
        pages: [
          'Setiap unggahan, komentar, dan foto dapat membentuk jejak digital. Pikirkan dampaknya sebelum membagikan sesuatu karena konten dapat disimpan atau disebarkan orang lain.',
          'Jangan pernah membagikan kata sandi, alamat rumah, lokasi langsung, atau data pribadi kepada orang yang tidak dikenal. Gunakan pengaturan privasi dan kata sandi yang kuat serta berbeda.',
          'Mintalah izin sebelum mengunggah foto atau informasi tentang orang lain. Menghapus unggahan tidak selalu menghapus semua salinannya.',
          'Jika ada orang yang meminta foto pribadi atau membuatmu tidak nyaman, hentikan percakapan dan cari bantuan orang dewasa yang kamu percaya.'
        ]
      },
      {
        name: 'Kak Nisa', place: 'Lapangan Olahraga', topic: 'Batasan Diri & Persetujuan',
        pos: [-8, 21], item: [-11, 24], itemName: 'Lencana Batas Sehat', itemColor: 0xe6759f, kind: 'nisa',
        pages: [
          'Setiap orang berhak menentukan batasan untuk tubuh, barang, waktu, dan ruang pribadinya. Batasan yang sehat membantu kita merasa aman dan dihargai.',
          'Persetujuan harus diberikan dengan bebas, jelas, dan tanpa tekanan. Diam, takut, atau pernah setuju sebelumnya bukan berarti selalu setuju.',
          'Kita juga perlu menghormati batasan orang lain. Jika seseorang berkata tidak atau tampak tidak nyaman, berhenti dan jangan memaksa.',
          'Bila batasanmu dilanggar, menjauhlah jika aman lalu ceritakan kepada orang dewasa tepercaya atau tenaga profesional.'
        ]
      },
      {
        name: 'Pak Dedi', place: 'Rumah Aman Warga', topic: 'Tekanan Teman & Pilihan Aman',
        pos: [38, -5], item: [41, -2], itemName: 'Kartu Berani Menolak', itemColor: 0x78a4da, kind: 'dedi',
        pages: [
          'Tekanan teman dapat membuat keputusan terasa sulit. Kamu tetap berhak memilih hal yang aman walaupun teman-teman memilih berbeda.',
          'Siapkan jawaban singkat seperti “Tidak, terima kasih” atau “Aku memilih pulang”. Kamu tidak perlu berdebat panjang untuk mempertahankan batasanmu.',
          'Jauhi situasi yang terasa berbahaya dan hubungi keluarga, guru, atau orang dewasa yang dipercaya. Rencana pulang dan teman pendamping dapat membantu.',
          'Alkohol, rokok, dan zat lain dapat berdampak buruk pada kesehatan serta keselamatan. Jika ada yang mengkhawatirkanmu, cari bantuan lebih awal.'
        ]
      },
      {
        name: 'Kak Lala', place: 'Sanggar Kreatif', topic: 'Komunikasi & Konflik Sehat',
        pos: [38, 20], item: [41, 23], itemName: 'Buku Dialog Baik', itemColor: 0xe8a94b, kind: 'lala',
        pages: [
          'Perbedaan pendapat adalah hal wajar dalam pertemanan. Cobalah mendengarkan sampai selesai sebelum memberi tanggapan.',
          'Sampaikan perasaan dengan kalimat “aku merasa…” dan jelaskan kebutuhanmu tanpa menghina atau mengancam orang lain.',
          'Jika emosi meningkat, ambil jeda sejenak lalu lanjutkan pembicaraan saat semua pihak lebih tenang. Fokus pada masalah, bukan menyerang pribadi.',
          'Minta bantuan guru, konselor, atau orang dewasa netral jika konflik berulang, melibatkan ancaman, atau sulit diselesaikan sendiri.'
        ]
      },
      {
        name: 'Bu Tini', place: 'Warung Sehat', topic: 'Kebiasaan Sehat Sehari-hari',
        pos: [20, 78.5], item: [17, 81.5], itemName: 'Bekal Sehat', itemColor: 0x80be65, kind: 'tini',
        pages: [
          'Makan beragam makanan, minum air yang cukup, bergerak aktif, dan beristirahat merupakan kebiasaan yang mendukung kesehatan.',
          'Tidur yang cukup membantu tubuh beristirahat dan mendukung konsentrasi. Buat rutinitas tidur yang teratur dan kurangi layar menjelang waktu tidur.',
          'Kebutuhan setiap orang bisa berbeda. Hindari membandingkan tubuh atau pola makan; mintalah saran tenaga kesehatan jika punya pertanyaan.',
          'Kesehatan juga mencakup perasaan dan hubungan sosial. Sisihkan waktu untuk kegiatan yang menyenangkan dan berbicara dengan orang yang kamu percaya.'
        ]
      },
      {
        name: 'Kak Fajar', place: 'Pos Sahabat Sekolah', topic: 'Mencegah Perundungan',
        pos: [-40, 13], item: [-43, 16], itemName: 'Lencana Sahabat', itemColor: 0xb38bdb, kind: 'fajar',
        pages: [
          'Perundungan adalah tindakan menyakiti atau merendahkan yang berulang atau melibatkan ketimpangan kuasa. Itu bukan sekadar bercanda jika seseorang merasa takut atau terluka.',
          'Jika melihat perundungan, jangan ikut menertawakan atau menyebarkan rekamannya. Temani orang yang terdampak dan ajak mencari bantuan.',
          'Laporkan kejadian kepada guru atau orang dewasa tepercaya. Ceritakan apa yang kamu lihat secara faktual dan jangan menghadapi situasi berbahaya sendirian.',
          'Orang yang mengalami perundungan tidak bersalah atas perlakuan tersebut. Dukungan dan tindakan orang dewasa dapat membantu menjaga keselamatan.'
        ]
      },
      {
        name: 'Pak Joko', place: 'Kebun Warga', topic: 'Gotong Royong & Kepedulian',
        pos: [20, 42], item: [23, 45], itemName: 'Benih Kepedulian', itemColor: 0xd7b64f, kind: 'joko',
        pages: [
          'Gotong royong berarti bekerja bersama untuk kebaikan bersama. Setiap orang dapat berkontribusi sesuai kemampuan dan minatnya.',
          'Kepedulian dimulai dengan mendengarkan kebutuhan orang lain, tidak merendahkan, dan menawarkan bantuan dengan menghormati pilihan mereka.',
          'Ikut kegiatan lingkungan, sekolah, seni, atau olahraga dapat memperkuat rasa kebersamaan dan memberi pengalaman baru.',
          'Bekerja sama juga berarti bertanggung jawab, berbagi tugas secara adil, dan menyelesaikan perbedaan dengan musyawarah.'
        ]
      },
      {
        name: 'Mbak Intan', place: 'Pos Relawan', topic: 'Mencari Bantuan & Keselamatan',
        pos: [-38, 38], item: [-39, 41], itemName: 'Kartu Bantuan', itemColor: 0xe07161, kind: 'intan',
        pages: [
          'Mintalah bantuan saat merasa tidak aman, tertekan, sakit, atau bingung. Pilih orang dewasa yang mendengarkan dan menanggapi dengan serius.',
          'Jika orang pertama belum membantu, teruslah bercerita kepada orang tepercaya lain seperti keluarga, guru, konselor, atau tenaga kesehatan.',
          'Dalam keadaan darurat, segera cari tempat aman dan hubungi orang dewasa atau layanan darurat setempat. Jangan menghadapi ancaman sendirian.',
          'Kamu boleh meminta ditemani saat berbicara dengan tenaga profesional. Mencari bantuan adalah langkah berani untuk menjaga diri.'
        ]
      }
    ];

    const buildingPalette = [
      { color: 0xe9a64e, roof: 0xb95039 },
      { color: 0xd98972, roof: 0x8c4d64 },
      { color: 0xc9dce0, roof: 0x6b9eb1 },
      { color: 0xe8c878, roof: 0x99713b },
      { color: 0xd2a879, roof: 0x75513b },
      { color: 0xa8d5ca, roof: 0x417c75 },
      { color: 0xc7b5dc, roof: 0x745a91 }
    ];
    function makeSignTexture(text, background = '#f7d77c') {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = background; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#283b34'; ctx.font = 'bold 84px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, c.width / 2, c.height / 2, 960);
      const texture = new THREE.CanvasTexture(c);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    }
    const buildingColliders = [];
    function makeBuilding(name, x, z, color, roofColor, width = 8, depth = 7) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      block(group, 0, 1.65, 0, width, 3.3, depth, color);
      const rearRoof = block(group, 0, 4, -depth * .23, width + 1, .42, depth * .62, roofColor);
      const frontRoof = block(group, 0, 4, depth * .23, width + 1, .42, depth * .62, roofColor);
      rearRoof.rotation.x = -.42;
      frontRoof.rotation.x = .42;
      block(group, 0, .95, depth / 2 + .035, 1.3, 1.9, .12, 0x80533b);
      for (const wx of [-width * .3, width * .3]) {
        block(group, wx, 2.15, depth / 2 + .08, 1.15, 1, .14, 0x9ee3e6, { metalness: .1, roughness: .3 });
        block(group, wx, 2.15, depth / 2 + .17, .12, 1.12, .08, 0xf3e6c6);
      }
      block(group, 0, .08, depth / 2 + .75, 2.3, .16, 1.2, 0xd8c79b);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(width - .6, 7.4), 1.05), new THREE.MeshBasicMaterial({ map: makeSignTexture(name), side: THREE.DoubleSide }));
      sign.position.set(0, 4.55, depth / 2 + .55);
      group.add(sign);
      scene.add(group);
      buildingColliders.push({ x, z, halfWidth: width / 2 + .55, halfDepth: depth / 2 + .45 });
      return group;
    }

    function makeSportsField(x, z, width, length) {
      const lineColor = 0xf5f2df;
      const lineWidth = .2;
      flatBox(x, z, width, length, 0x43894b, .025);
      flatBox(x, z - length / 2, width, lineWidth, lineColor, .085);
      flatBox(x, z + length / 2, width, lineWidth, lineColor, .085);
      flatBox(x - width / 2, z, lineWidth, length, lineColor, .085);
      flatBox(x + width / 2, z, lineWidth, length, lineColor, .085);
      flatBox(x, z, width, lineWidth, lineColor, .085);

      const penaltyWidth = 12;
      const penaltyDepth = 5;
      for (const end of [-1, 1]) {
        const goalLine = z + end * length / 2;
        const boxLine = goalLine - end * penaltyDepth;
        flatBox(x, boxLine, penaltyWidth, lineWidth, lineColor, .085);
        for (const side of [-1, 1]) {
          flatBox(x + side * penaltyWidth / 2, goalLine - end * penaltyDepth / 2, lineWidth, penaltyDepth, lineColor, .085);
          block(scene, x + side * 2, .95, goalLine, .16, 1.9, .16, lineColor);
        }
        block(scene, x, 1.9, goalLine, 4.16, .16, .16, lineColor);
      }

      const centerCircle = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.4, 32), material(lineColor));
      centerCircle.rotation.x = -Math.PI / 2;
      centerCircle.position.set(x, .09, z);
      scene.add(centerCircle);
      return { x, z, width, length };
    }

    const gate = new THREE.Group();
    gate.position.set(0, 0, -47);
    block(gate, -7, 3, 0, 1.8, 6, 1.8, 0xcf9d54);
    block(gate, 7, 3, 0, 1.8, 6, 1.8, 0xcf9d54);
    block(gate, 0, 6.05, 0, 16, 1.8, 2, 0x9f613d);
    const gateSign = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 1.5), new THREE.MeshBasicMaterial({ map: makeSignTexture('DESA REMAJA', '#ffe28c'), side: THREE.DoubleSide }));
    gateSign.position.set(0, 6.08, 1.06);
    gate.add(gateSign);
    scene.add(gate);
    buildingColliders.push(
      { x: -7, z: -47, halfWidth: 1.35, halfDepth: 1.35 },
      { x: 7, z: -47, halfWidth: 1.35, halfDepth: 1.35 }
    );

    makeBuilding('TAMAN WARGA', -22, -20, 0xc0daa1, 0x5c995b, 8, 7);
    makeBuilding('POS KESEHATAN', 25, -19, 0xdce9e7, 0x76aebe, 9, 7);
    makeBuilding('BALAI KONSELING', 26, 10, 0xf0c285, 0xc4753d, 10, 8);
    makeBuilding('SEKOLAH', -22, 12, 0xf0d191, 0xa45740, 9, 8);
    makeBuilding('LITERASI DIGITAL', -32, -17, 0xb4e1d3, 0x488b83, 9, 7);
    const examLocation = { x: 84, z: 54 };
    makeBuilding('PENDOPO WARGA', -2, 36, 0xe9d9b2, 0x927345, 10, 8);
    makeBuilding('GEDUNG UJIAN', examLocation.x, examLocation.z, 0xa6c8d6, 0x4c718e, 10, 8);
    makeBuilding('BALAI TAMAN', -26, 30, 0xc7dda4, 0x648f4d, 8, 7);
    makeBuilding('PERPUSTAKAAN', 12, -30, 0xd4c59f, 0x7d6953, 8, 7);
    const sportsField = makeSportsField(20, 56, 28, 18);
    makeBuilding('RUMAH AMAN', 38, -2, 0xe2c6b3, 0x97635c, 8, 7);
    makeBuilding('SANGGAR KREATIF', 38, 12, 0xeac88c, 0xb56748, 8, 7);
    makeBuilding('WARUNG SEHAT', 20, 74, 0xe6d6a5, 0x9e7447, 8, 7);
    makeBuilding('POS SAHABAT', -40, 5, 0xb8d8dd, 0x638795, 8, 7);
    makeBuilding('KEBUN WARGA', 20, 34, 0xc8d89a, 0x69864c, 8, 7);
    makeBuilding('POS RELAWAN', -38, 30, 0xe0c2b9, 0x9c5e56, 8, 7);
    const villageOffice = makeBuilding('KANTOR DESA', 69, 29, 0xd8c28c, 0x547b62, 11, 9);
    makeBuilding('RUMAH WARGA 1', 88, 31, 0xdcae82, 0x9e5942, 8, 7);
    makeBuilding('RUMAH WARGA 2', 92, 8, 0xc8d9ad, 0x648356, 8, 7);
    makeBuilding('RUMAH WARGA 3', 84, -17, 0xd5b5a0, 0x8c6258, 8, 7);
    makeBuilding('RUMAH WARGA 4', 107, 33, 0xe2cc9c, 0x8d7046, 8, 7);
    makeBuilding('KANDANG AYAM', 71, -55, 0xd4c29b, 0x856844, 10, 8);
    makeBuilding('KANDANG SAPI', 52, -28, 0xcdbb91, 0x735b42, 12, 10);
    makeBuilding('KOPERASI DESA', 88, -55, 0xc9d9a8, 0x63814b, 10, 8);
    makeBuilding('DAPUR SPPG', 108, -55, 0xe7d2a4, 0x9b6949, 12, 10);
    function collidesWithBuilding(x, z) {
      const playerRadius = .45;
      return buildingColliders.some(building =>
        Math.abs(x - building.x) < building.halfWidth + playerRadius
        && Math.abs(z - building.z) < building.halfDepth + playerRadius
      );
    }
    block(villageOffice, -3.2, 5.1, 5.05, .18, 1.4, .18, 0x8b5338);
    block(villageOffice, -3.2, 5.85, 5.05, .9, .55, .08, 0xe8c75c);

    const roadSegments = [];
    function makeRoadBetween(x1, z1, x2, z2, width = 4.2) {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const centerX = (x1 + x2) / 2;
      const centerZ = (z1 + z2) / 2;
      roadSegments.push({ x1, z1, x2, z2, width });
      flatBox(centerX, centerZ, width + .55, length + .35, 0xd2c18d, .012, angle);
      flatBox(centerX, centerZ, width, length, 0xf2dfa2, .045, angle);
    }

    function makeRoadRoute(points, width = 4.2) {
      for (let i = 1; i < points.length; i++) {
        makeRoadBetween(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], width);
      }
    }

    makeRoadRoute([[0, -49], [0, -12]], 4.4);
    makeRoadRoute([[-46, -10], [-8, -10]], 4.2);
    makeRoadRoute([[8, -10], [46, -10]], 4.2);
    makeRoadRoute([[-48, -23], [-48, 32], [-53, 32], [-53, 44], [-48, 44]], 4);
    makeRoadRoute([[-15, -10], [-15, 42]], 3.8);
    makeRoadRoute([[-26, -10], [-26, 6.4]], 2.5);
    makeRoadRoute([[7, -10], [7, 12]], 3.8);
    makeRoadRoute([[7, 12], [8, 12], [8, 29], [0, 29]], 3.8);
    makeRoadRoute([[8, 26], [46, 26]], 4.2);
    makeRoadRoute([[46, -20.5], [46, 30]], 4);
    makeRoadRoute([[-48, 44], [28, 44]], 4);
    makeRoadRoute([[-38, 44], [-38, 35]], 2.8);
    makeRoadRoute([[20, 44], [20, 39]], 2.8);
    makeRoadRoute([[7, 32], [7, 44]], 3.4);
    makeRoadRoute([[0, 44], [0, 68], [20, 68]], 3.2);
    makeRoadRoute([[76, 40], [76, 60.5], [84, 60.5]], 3.2);
    makeRoadRoute([[26, 26], [26, 15.5]], 2.8);
    makeRoadRoute([[-48, 13], [-40, 13]], 2.5);
    makeRoadRoute([[-48, -20], [-39, -20], [-39, -24.2]], 2.5);
    makeRoadRoute([[-39, -20], [-39, -11], [-32, -11]], 2.8);
    makeRoadRoute([[-48, -23], [-31, -23], [-31, -24.5], [-29, -24.5]], 2.8);
    makeRoadRoute([[46, 4], [38, 4]], 2.5);
    makeRoadRoute([[46, 17.5], [38, 17.5]], 2.5);
    makeRoadRoute([[6.4, -31.2], [6.4, -23]], 2.5);
    makeRoadRoute([[6.4, -23], [12, -23]], 2.5);
    makeRoadRoute([[0, -31.2], [6.4, -31.2]], 2.5);
    makeRoadRoute([[12, -23], [12, -25.5]], 2.5);
    makeRoadRoute([[46, 28], [60, 28], [60, 40], [115, 40]], 4);
    makeRoadRoute([[69, 40], [69, 35]], 2.8);
    makeRoadRoute([[88, 40], [88, 35.5]], 2.8);
    makeRoadRoute([[107, 40], [107, 37]], 2.8);
    makeRoadRoute([[115, 40], [115, -24]], 3.8);
    makeRoadRoute([[115, 8], [100, 8], [100, 14], [92, 14]], 3);
    makeRoadRoute([[92, 14], [92, 13.6]], 3);
    makeRoadRoute([[60, -17], [76, -17], [76, -10], [84, -10]], 3);
    makeRoadRoute([[76, -17], [76, 2.2], [115, 2.2]], 3);
    makeRoadRoute([[46, -20.5], [52, -20.5]], 3);
    makeRoadRoute([[60, 40], [60, -29], [60, -46.5], [115, -46.5]], 3.4);
    makeRoadRoute([[0, -49], [10, -49], [14, -45]], 3);

    function distanceToRoad(x, z, segment) {
      const dx = segment.x2 - segment.x1;
      const dz = segment.z2 - segment.z1;
      const lengthSquared = dx * dx + dz * dz;
      const amount = lengthSquared ? THREE.MathUtils.clamp(((x - segment.x1) * dx + (z - segment.z1) * dz) / lengthSquared, 0, 1) : 0;
      return Math.hypot(x - (segment.x1 + amount * dx), z - (segment.z1 + amount * dz));
    }

    const buildingKeepouts = [
      [-22, -20], [25, -19], [26, 10], [-22, 12], [-32, -17], [-2, 36], [examLocation.x, examLocation.z],
      [-26, 30], [12, -30], [20, 56], [38, -2], [38, 12], [20, 74],
      [-40, 5], [20, 34], [-38, 30], [69, 29], [88, 31], [92, 8], [84, -17],
      [107, 33], [71, -55], [88, -55], [108, -55], [52, -28]
    ];
    for (let index = treePositions.length - 1; index >= 0; index--) {
      const tree = treePositions[index];
      const canopyClearance = 1.35 * tree.scale + .3;
      const onRoad = roadSegments.some(segment =>
        distanceToRoad(tree.x, tree.z, segment) < segment.width / 2 + canopyClearance
      );
      const nearBuilding = buildingColliders.some(building =>
        Math.abs(tree.x - building.x) < building.halfWidth + canopyClearance
        && Math.abs(tree.z - building.z) < building.halfDepth + canopyClearance
      );
      const nearField = Math.abs(tree.x - sportsField.x) < sportsField.width / 2 + canopyClearance
        && Math.abs(tree.z - sportsField.z) < sportsField.length / 2 + canopyClearance;
      if (onRoad || nearBuilding || nearField) treePositions.splice(index, 1);
    }
    const treeTrunks = new THREE.InstancedMesh(
      cubeGeometry, material(0x80502e), treePositions.length
    );
    const treeCanopies = new THREE.InstancedMesh(
      cubeGeometry, material(0x3c9850), treePositions.length
    );
    treePositions.forEach((tree, index) => {
      setInstanceTransform(treeTrunks, index, tree.x, ground.position.y + 2 * tree.scale, tree.z, .62 * tree.scale, 4 * tree.scale, .62 * tree.scale);
      setInstanceTransform(treeCanopies, index, tree.x, ground.position.y + 5 * tree.scale, tree.z, 2.7 * tree.scale, 2.4 * tree.scale, 2.45 * tree.scale);
    });
    treeTrunks.instanceMatrix.needsUpdate = true;
    treeCanopies.instanceMatrix.needsUpdate = true;
    treeTrunks.castShadow = true;
    treeCanopies.castShadow = true;
    scene.add(treeTrunks, treeCanopies);
    const flowerColors = [0xf8e16c, 0xf3a4b8, 0xf5f2e7, 0xf3a35a, 0xb9a4ed];
    const flowers = [];
    for (let row = -5; row <= 5; row++) {
      for (let column = -5; column <= 5; column++) {
        const x = column * 9 + Math.sin(row * 2.7 + column) * 2.2;
        const z = row * 9 + Math.cos(column * 1.8 - row) * 2.2;
        if (Math.hypot(x, z) < 16 || Math.abs(z + 38) < 4) continue;
        if (Math.abs(z - riverCenterAt(x)) < riverHalfWidth + .8) continue;
        if (roadSegments.some(segment => distanceToRoad(x, z, segment) < segment.width / 2 + 1.8)) continue;
        if (buildingKeepouts.some(([bx, bz]) => Math.hypot(x - bx, z - bz) < 9)) continue;
        if (Math.abs(x - sportsField.x) < sportsField.width / 2 + 1 && Math.abs(z - sportsField.z) < sportsField.length / 2 + 1) continue;
        if (npcData.some(npc => Math.hypot(x - npc.pos[0], z - npc.pos[1]) < 3.8)) continue;
        if (treePositions.some(tree => Math.hypot(x - tree.x, z - tree.z) < tree.clearance)) continue;
        flowers.push({ x, z, colorIndex: (row * 3 + column * 5 + 60) % flowerColors.length });
      }
    }
    const flowerStems = new THREE.InstancedMesh(
      cubeGeometry, material(0x4c9a48), flowers.length
    );
    const flowerPetals = new THREE.InstancedMesh(
      cubeGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .88 }), flowers.length * 4
    );
    const flowerCenters = new THREE.InstancedMesh(
      cubeGeometry, material(0xf8e16c), flowers.length
    );
    flowers.forEach((flower, index) => {
      setInstanceTransform(flowerStems, index, flower.x, ground.position.y + .2, flower.z, .1, .4, .1);
      setInstanceTransform(flowerCenters, index, flower.x, ground.position.y + .41, flower.z, .12, .14, .12);
      for (const [petalIndex, [petalX, petalZ]] of [[-.14, 0], [.14, 0], [0, -.14], [0, .14]].entries()) {
        const instance = index * 4 + petalIndex;
        setInstanceTransform(flowerPetals, instance, flower.x + petalX, ground.position.y + .37, flower.z + petalZ, .22, .12, .22);
        flowerPetals.setColorAt(instance, new THREE.Color(flowerColors[flower.colorIndex]));
      }
    });
    for (const mesh of [flowerStems, flowerPetals, flowerCenters]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    }
    flowerPetals.instanceColor.needsUpdate = true;
    scene.add(flowerStems, flowerPetals, flowerCenters);

    function makePen(x, z, width, depth) {
      const postSpacing = 3;
      for (const side of [-1, 1]) {
        for (let offset = -width / 2; offset <= width / 2; offset += postSpacing) {
          block(scene, x + offset, .58, z + side * depth / 2, .16, 1.16, .16, 0x805431);
        }
        block(scene, x, .48, z + side * depth / 2, width, .15, .16, 0x9b7046);
      }
      for (const side of [-1, 1]) {
        for (let offset = -depth / 2; offset <= depth / 2; offset += postSpacing) {
          block(scene, x + side * width / 2, .58, z + offset, .16, 1.16, .16, 0x805431);
        }
        block(scene, x + side * width / 2, .48, z, .16, .15, depth, 0x9b7046);
      }
    }

    function makeChicken(x, z, scale = 1) {
      const chicken = new THREE.Group();
      chicken.position.set(x, 0, z);
      const legs = [];
      block(chicken, 0, .52 * scale, 0, .72 * scale, .72 * scale, .9 * scale, 0xf3ead1);
      block(chicken, 0, 1.05 * scale, .22 * scale, .48 * scale, .48 * scale, .48 * scale, 0xf8efdc);
      block(chicken, 0, 1.38 * scale, .23 * scale, .22 * scale, .2 * scale, .18 * scale, 0xd75043);
      block(chicken, 0, 1.03 * scale, .53 * scale, .3 * scale, .16 * scale, .28 * scale, 0xe5a63d);
      block(chicken, -.14 * scale, 1.12 * scale, .46 * scale, .06 * scale, .06 * scale, .04 * scale, 0x273b3a);
      block(chicken, .14 * scale, 1.12 * scale, .46 * scale, .06 * scale, .06 * scale, .04 * scale, 0x273b3a);
      for (const xOffset of [-.17, .17]) {
        const leg = new THREE.Group();
        leg.position.set(xOffset * scale, .27 * scale, 0);
        block(leg, 0, -.13 * scale, 0, .1 * scale, .26 * scale, .1 * scale, 0xe5a63d);
        chicken.add(leg);
        legs.push(leg);
      }
      scene.add(chicken);
      return {
        group: chicken, legs, homeX: x, homeZ: z, radiusX: 1.5 * scale, radiusZ: 1.1 * scale,
        speed: .9, phase: 0, scale, lastX: x, lastZ: z, walkPhase: 0
      };
    }

    function makeCow(x, z, scale = 1) {
      const cow = new THREE.Group();
      cow.position.set(x, 0, z);
      const legs = [];
      block(cow, 0, .95 * scale, 0, 1.7 * scale, 1.05 * scale, 2.25 * scale, 0xf3eee1);
      block(cow, 0, 1.55 * scale, 1.12 * scale, .9 * scale, .85 * scale, .82 * scale, 0xf3eee1);
      block(cow, 0, 1.25 * scale, 1.58 * scale, .7 * scale, .36 * scale, .18 * scale, 0xd58c82);
      block(cow, -.42 * scale, 2.02 * scale, 1.2 * scale, .18 * scale, .34 * scale, .18 * scale, 0xe9c87a);
      block(cow, .42 * scale, 2.02 * scale, 1.2 * scale, .18 * scale, .34 * scale, .18 * scale, 0xe9c87a);
      block(cow, -.18 * scale, 1.7 * scale, 1.55 * scale, .08 * scale, .08 * scale, .06 * scale, 0x273b3a);
      block(cow, .18 * scale, 1.7 * scale, 1.55 * scale, .08 * scale, .08 * scale, .06 * scale, 0x273b3a);
      block(cow, -.48 * scale, 1.12 * scale, -.36 * scale, .62 * scale, .5 * scale, .18 * scale, 0x514b43);
      block(cow, .44 * scale, .72 * scale, .58 * scale, .48 * scale, .4 * scale, .18 * scale, 0x514b43);
      for (const legX of [-.56, .56]) {
        for (const legZ of [-.72, .72]) {
          const leg = new THREE.Group();
          leg.position.set(legX * scale, .57 * scale, legZ * scale);
          block(leg, 0, -.31 * scale, 0, .24 * scale, .62 * scale, .26 * scale, 0xf3eee1);
          cow.add(leg);
          legs.push(leg);
        }
      }
      const tail = new THREE.Group();
      tail.position.set(0, 1.22 * scale, -1.05 * scale);
      block(tail, 0, .3 * scale, -.06 * scale, .12 * scale, .64 * scale, .12 * scale, 0x514b43);
      block(tail, 0, .02 * scale, -.06 * scale, .18 * scale, .2 * scale, .18 * scale, 0x514b43);
      cow.add(tail);
      scene.add(cow);
      return {
        group: cow, legs, tail, homeX: x, homeZ: z, radiusX: 1.9 * scale, radiusZ: 1.5 * scale,
        speed: .42, phase: 0, scale, lastX: x, lastZ: z, walkPhase: 0
      };
    }

    makePen(71, -66, 16, 12);
    const chickens = [
      makeChicken(67, -64, .78), makeChicken(72, -63, .88),
      makeChicken(76, -67, .72), makeChicken(70, -69, .8)
    ];
    makePen(68, -27, 10, 10);
    const cows = [makeCow(65, -28, .82), makeCow(70, -27, .95), makeCow(67, -24, .72)];

    function makeBird(x, z, color, scale, baseY, radiusX, radiusZ, speed, phase) {
      const group = new THREE.Group();
      group.position.set(x, baseY, z);
      block(group, 0, 0, 0, .5 * scale, .32 * scale, .72 * scale, color);
      block(group, 0, .12 * scale, .39 * scale, .34 * scale, .3 * scale, .34 * scale, color);
      block(group, 0, .02 * scale, .7 * scale, .18 * scale, .13 * scale, .24 * scale, 0xe8a83e);
      block(group, 0, -.02 * scale, -.44 * scale, .3 * scale, .12 * scale, .28 * scale, color);
      for (const side of [-1, 1]) {
        block(group, side * .1 * scale, .18 * scale, .53 * scale, .045 * scale, .05 * scale, .035 * scale, 0x273b3a);
      }
      const leftWing = new THREE.Group();
      leftWing.position.set(-.22 * scale, .06 * scale, 0);
      block(leftWing, -.22 * scale, 0, 0, .5 * scale, .1 * scale, .52 * scale, color);
      group.add(leftWing);
      const rightWing = new THREE.Group();
      rightWing.position.set(.22 * scale, .06 * scale, 0);
      block(rightWing, .22 * scale, 0, 0, .5 * scale, .1 * scale, .52 * scale, color);
      group.add(rightWing);
      const startX = x + Math.sin(phase) * radiusX;
      const startZ = z + Math.sin(phase * .68) * radiusZ;
      group.position.set(startX, baseY, startZ);
      scene.add(group);
      return { group, leftWing, rightWing, homeX: x, homeZ: z, baseY, radiusX, radiusZ, speed, phase };
    }

    const villageBirds = [
      makeBird(-12, 4, 0x68b4d7, .9, 8, 12, 9, .34, .3),
      makeBird(24, 28, 0xe5bd59, .82, 10, 10, 8, .4, 2.2),
      makeBird(83, 18, 0xd98273, .88, 9, 11, 7, .32, 4.1)
    ];
    const groundAnimals = [...chickens, ...cows];

    for (let x = -150; x < 150; x += 10) {
      const centerX = x + 5;
      const centerZ = riverCenterAt(centerX);
      const angle = -Math.atan((Math.sin((centerX + 5) * .075) * 1.1 - Math.sin((centerX - 5) * .075) * 1.1) / 10);
      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(10.6, 9.2),
        new THREE.MeshStandardMaterial({ color: 0x3eadd0, roughness: .28, metalness: .08, transparent: true, opacity: .82, depthWrite: false })
      );
      water.rotation.order = 'YXZ';
      water.rotation.set(-Math.PI / 2, angle, 0);
      water.position.set(centerX, .018, centerZ);
      water.receiveShadow = true;
      scene.add(water);
      for (const side of [-1, 1]) {
        const bank = new THREE.Mesh(new THREE.BoxGeometry(10.6, .08, .3), material(0x3eadd0));
        bank.position.set(centerX, ground.position.y + .04, centerZ + side * 4.72);
        bank.rotation.y = angle;
        bank.receiveShadow = true;
        scene.add(bank);
      }
    }

    function makeBridge(x, z) {
      const bridge = new THREE.Group();
      bridge.position.set(x, .13, z);
      block(bridge, 0, .035, 0, 6.2, .15, 10.6, 0x8e5f39);
      for (let plank = -4; plank <= 4; plank++) {
        block(bridge, 0, 0, plank * 1.16, 6.2, .22, 1.12, plank % 2 ? 0x9b6940 : 0xad7848);
      }
      for (const side of [-1, 1]) {
        block(bridge, side * 2.95, .48, 0, .18, .6, 10.8, 0x79502f);
        for (let post of [-1, 1]) {
          block(bridge, side * 2.95, .72, post * 5, .3, 1.2, .3, 0x805431);
        }
      }
      scene.add(bridge);
      return { x, z };
    }
    const bridges = [makeBridge(0, -38), makeBridge(60, riverCenterAt(60))];
    const fishingSpot = new THREE.Vector3(14, 0, -44.5);
    const fishingSaung = new THREE.Group();
    fishingSaung.position.set(14, 0, -49);
    block(fishingSaung, 0, .38, 0, 4.8, .28, 4.2, 0x9a6b40);
    for (const x of [-2, 2]) {
      for (const z of [-1.6, 1.6]) {
        block(fishingSaung, x, 1.7, z, .2, 3.2, .2, 0x805431);
      }
    }
    block(fishingSaung, 0, 3.35, 0, 5.4, .45, 4.8, 0x9b5938);
    block(fishingSaung, 0, 3.62, 0, 4.7, .12, 4.2, 0xc98b4e);
    const fishingSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, .7),
      new THREE.MeshBasicMaterial({ map: makeSignTexture('SAUNG PANCING', '#ffe28c'), side: THREE.DoubleSide })
    );
    fishingSign.position.set(0, 2.7, 2.12);
    fishingSaung.add(fishingSign);
    const fishingRod = block(fishingSaung, 1.65, 2.65, 1.15, .08, .08, 2.8, 0x49392d);
    fishingRod.rotation.x = -.35;
    scene.add(fishingSaung);

    function makeRiverFish(x, zOffset, color, scale, phase) {
      const group = new THREE.Group();
      group.position.set(x, -.12, riverCenterAt(x) + zOffset);
      group.scale.setScalar(scale);
      block(group, 0, 0, 0, 1.05, .46, .32, color);
      block(group, .39, .03, 0, .38, .36, .34, color);
      const tail = new THREE.Group();
      tail.position.x = -.47;
      block(tail, -.25, 0, 0, .48, .62, .12, color);
      group.add(tail);
      block(group, -.02, .28, 0, .38, .18, .16, 0xf0cb68);
      for (const side of [-1, 1]) {
        block(group, .46, .09, side * .17, .08, .08, .05, 0x233d43);
      }
      const ripple = new THREE.Mesh(
        new THREE.RingGeometry(.52, .68, 18),
        new THREE.MeshBasicMaterial({ color: 0xc8f7ed, transparent: true, opacity: .48, side: THREE.DoubleSide, depthWrite: false })
      );
      ripple.rotation.x = -Math.PI / 2;
      ripple.position.y = .17;
      ripple.scale.set(1.25, .65, 1);
      group.add(ripple);
      scene.add(group);
      return { group, tail, ripple, homeX: x, zOffset, phase };
    }
    const riverFish = [
      makeRiverFish(-137, -.8, 0xf27c58, .85, .3),
      makeRiverFish(-110, 1.3, 0xf1c94c, .72, 1.4),
      makeRiverFish(-82, -.4, 0x69c4bc, .95, 2.2),
      makeRiverFish(-54, 1.2, 0xe884b5, .78, 3.1),
      makeRiverFish(-24, -.9, 0xf39a55, .82, 4.3),
      makeRiverFish(12, 1.1, 0x72c8dc, .88, 5.1),
      makeRiverFish(42, -.6, 0xf3cb58, .75, 6.2),
      makeRiverFish(72, 1.3, 0xe77962, .94, 7.3),
      makeRiverFish(101, -.7, 0x83c77a, .8, 8.5),
      makeRiverFish(132, 1, 0xb18ce3, .9, 9.2)
    ];

    function surfaceHeightAt(x, z) {
      if (bridges.some(bridge => Math.abs(x - bridge.x) <= 3.1 && Math.abs(z - bridge.z) <= 5.3)) return .24;
      for (const hill of hills) {
        const distance = Math.max(Math.abs(x - hill.x), Math.abs(z - hill.z));
        if (distance < hill.baseHalf) {
          const level = Math.min(hill.levels - 1, Math.floor((hill.baseHalf - distance) / hill.stepInset));
          return (level + 1) * hill.stepHeight;
        }
      }
      const riverCenter = riverCenterAt(x);
      const distanceFromCenter = Math.abs(z - riverCenter);
      if (Math.abs(x) <= 150 && distanceFromCenter < riverHalfWidth) {
        const depthRatio = 1 - distanceFromCenter / riverHalfWidth;
        return -.95 * depthRatio * depthRatio;
      }
      return 0;
    }

    // Bench and notice board make the item locations easy to recognize.
    block(scene, -19, .65, -12, 3.3, .35, .75, 0x8b5936);
    block(scene, -19, .35, -12, .2, .7, .2, 0x6c452d);
    block(scene, -17.8, .35, -12, .2, .7, .2, 0x6c452d);
    block(scene, -28, 2.4, 2, .25, 4.8, 3.6, 0x8c663d);
    block(scene, -27.82, 2.5, 2, .08, 3.8, 2.8, 0xffe6a1);
    block(scene, -21, .5, 19, 3.4, .25, .6, 0x9d7046);

    function makeNpc(npc, index) {
      const group = new THREE.Group();
      const [x, z] = npc.pos;
      group.position.set(x, 0, z);
      const skin = 0xe7b68d;
      const topColor = ({
        bima: 0x3287c8, ratna: 0xe3d3ad, sari: 0xf2f5ee, dina: 0xe87d36,
        hendra: 0x93603c, raka: 0xf0c935, arif: 0xf1eee2,
        maya: 0x557c9c, nisa: 0x5baf73, dedi: 0x638c7a, lala: 0xb66eaa,
        tini: 0x9d6943, fajar: 0x49878c, joko: 0x648d4c, intan: 0xd66e5e
      })[npc.kind];
      block(group, 0, .48, 0, .78, .96, .48, 0x374b51);
      block(group, 0, 1.65, 0, 1.15, 1.35, .65, topColor);
      block(group, 0, 2.72, 0, .78, .78, .72, skin);
      block(group, -.17, 2.77, .37, .1, .1, .06, 0x273b3a);
      block(group, .17, 2.77, .37, .1, .1, .06, 0x273b3a);
      block(group, -.78, 1.73, 0, .28, 1.05, .34, topColor);
      block(group, .78, 1.73, 0, .28, 1.05, .34, topColor);
      block(group, -.78, 1.17, .02, .3, .18, .35, skin);
      block(group, .78, 1.17, .02, .3, .18, .35, skin);

      if (npc.kind === 'bima') {
        block(group, 0, 3.2, 0, .95, .22, .9, 0xc94940);
        block(group, 0, 3.05, .04, .72, .12, .7, 0xc94940);
      } else if (npc.kind === 'ratna') {
        block(group, 0, 2.77, -.02, 1.12, 1.02, .92, 0x36b5a4);
        block(group, 0, 2.2, .04, 1.35, .32, .8, 0x36b5a4);
        block(group, 0, 1.65, .34, .6, 1.35, .12, 0xe3d3ad);
      } else if (npc.kind === 'sari') {
        block(group, 0, 1.7, .36, .12, 1.1, .1, 0x6ab7cb);
        block(group, 0, 1.74, .44, .75, .12, .08, 0xd64b4b);
        block(group, 0, 1.74, .44, .12, .62, .08, 0xd64b4b);
      } else if (npc.kind === 'dina') {
        block(group, -.2, 2.78, .42, .42, .25, .1, 0x6d5542);
        block(group, .2, 2.78, .42, .42, .25, .1, 0x6d5542);
        block(group, 0, 2.78, .42, .14, .09, .1, 0x6d5542);
      } else if (npc.kind === 'hendra') {
        for (let stripe = -2; stripe <= 2; stripe++) {
          block(group, stripe * .19, 1.68, .34, .055, .96, .06, stripe % 2 ? 0xf2d084 : 0x6c4833);
        }
      } else if (npc.kind === 'raka') {
        block(group, 0, 3.1, -.02, .92, .4, .9, 0xeac22d);
        block(group, 0, 2.91, .42, .86, .18, .2, 0xeac22d);
      } else if (npc.kind === 'arif') {
        block(group, 0, 1.05, .07, 1.22, .4, .72, 0x52924e);
        block(group, 0, 3.16, 0, .9, .18, .86, 0x252b28);
        block(group, 0, 3.03, .02, .68, .18, .66, 0x252b28);
      } else if (npc.kind === 'maya') {
        block(group, -.2, 2.78, .42, .34, .2, .08, 0x334a54);
        block(group, .2, 2.78, .42, .34, .2, .08, 0x334a54);
        block(group, 0, 1.8, .36, .34, .32, .08, 0xd9c38b);
      } else if (npc.kind === 'nisa') {
        block(group, 0, 3.12, .02, .9, .15, .78, 0xe7a84c);
        block(group, 0, 1.05, .36, .92, .48, .12, 0x364c58);
      } else if (npc.kind === 'dedi') {
        block(group, 0, 1.75, .37, .82, .72, .12, 0xe3bd70);
      } else if (npc.kind === 'lala') {
        block(group, -.42, 2.9, 0, .16, .45, .2, 0x483a59);
        block(group, .42, 2.9, 0, .16, .45, .2, 0x483a59);
      } else if (npc.kind === 'tini') {
        block(group, 0, 1.62, .39, .75, .85, .12, 0xf0d6a2);
      } else if (npc.kind === 'fajar') {
        block(group, .28, 1.92, .38, .25, .3, .1, 0xf2d46a);
      } else if (npc.kind === 'joko') {
        block(group, 0, 3.16, 0, .92, .2, .9, 0x875934);
        block(group, 0, 3.02, 0, .7, .18, .68, 0x875934);
      } else if (npc.kind === 'intan') {
        block(group, 0, 1.76, .42, .7, .12, .08, 0xf7eee2);
        block(group, 0, 1.76, .47, .12, .58, .08, 0xd64b4b);
        block(group, 0, 1.76, .47, .58, .12, .08, 0xd64b4b);
      }

      const concerned = npc.kind === 'dina' || npc.kind === 'dedi';
      const browColor = 0x594638;
      const leftBrow = block(group, -.17, 2.92, .4, .16, .045, .055, browColor);
      const rightBrow = block(group, .17, 2.92, .4, .16, .045, .055, browColor);
      if (concerned) {
        leftBrow.rotation.z = -.22;
        rightBrow.rotation.z = .22;
        block(group, 0, 2.51, .405, .2, .055, .05, 0x7b4437);
      } else {
        block(group, 0, 2.52, .405, .22, .06, .05, 0x7b4437);
        block(group, -.11, 2.54, .405, .055, .045, .05, 0x7b4437);
        block(group, .11, 2.54, .405, .055, .045, .05, 0x7b4437);
      }

      const marker = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 10), material(0xef655e, { emissive: 0x501311 }));
      marker.position.set(0, 4.15, 0);
      group.add(marker);
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeSignTexture(npc.name, '#fff0bd'), depthTest: false }));
      label.scale.set(2.9, .72, 1);
      label.position.set(0, 4.75, 0);
      group.add(label);
      scene.add(group);
      return { group, marker, item: null, introSeen: false, itemCollected: false, complete: false };
    }
    const npcs = npcData.map(makeNpc);

    function makeQuestItem(npc, index) {
      const group = new THREE.Group();
      group.position.set(npc.item[0], .8, npc.item[1]);
      const body = block(group, 0, 0, 0, .85, .85, .85, npc.itemColor, { emissive: index === 3 ? 0x8a6c12 : 0x000000, emissiveIntensity: index === 3 ? .55 : 0 });
      body.rotation.y = .3;
      if (index === 2) {
        block(group, 0, 0, .46, .22, .64, .1, 0xd94e4e);
        block(group, 0, 0, .47, .64, .2, .1, 0xd94e4e);
      }
      scene.add(group);
      group.visible = false;
      return group;
    }
    npcs.forEach((state, index) => { state.item = makeQuestItem(npcData[index], index); });

    const examMarker = new THREE.Group();
    const examOrb = new THREE.Mesh(new THREE.BoxGeometry(.8, .8, .8), material(0xffd966, { emissive: 0x9e6b14, emissiveIntensity: .35 }));
    examOrb.position.set(examLocation.x, 4.2, examLocation.z + 4.9);
    examMarker.add(examOrb);
    const examLabel = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeSignTexture('UJIAN AKHIR', '#fff0bd'), depthTest: false }));
    examLabel.scale.set(3.2, .75, 1);
    examLabel.position.set(examLocation.x, 4.9, examLocation.z + 4.9);
    examMarker.add(examLabel);
    scene.add(examMarker);

    const titleScreen = document.querySelector('#title-screen');
    const hud = document.querySelector('#hud');
    const mapPanel = document.querySelector('#map-panel');
    const mapPlayerMarker = document.querySelector('#map-player');
    const missionList = document.querySelector('#mission-list');
    const examStatus = document.querySelector('#exam-status');
    const hint = document.querySelector('#hint');
    const dialogScreen = document.querySelector('#dialog-screen');
    const quizScreen = document.querySelector('#quiz-screen');
    const fishingScreen = document.querySelector('#fishing-screen');
    const resultScreen = document.querySelector('#result-screen');
    const pauseScreen = document.querySelector('#pause-screen');
    const touchControls = document.querySelector('#touch-controls');
    const moveStick = document.querySelector('#move-stick');
    const moveKnob = document.querySelector('#move-knob');
    const touchInteractButton = document.querySelector('#touch-interact');
    const touchPauseButton = document.querySelector('#touch-pause');
    const musicToggle = document.querySelector('#music-toggle');
    const fishingBaitText = document.querySelector('#fishing-bait');
    const fishingCaughtText = document.querySelector('#fishing-caught');
    const fishStrengthText = document.querySelector('#fish-strength-text');
    const lineTensionText = document.querySelector('#line-tension-text');
    const fishStrengthBar = document.querySelector('#fish-strength-bar');
    const lineTensionBar = document.querySelector('#line-tension-bar');
    const fishingStatusText = document.querySelector('#fishing-status');
    const fishingActionButton = document.querySelector('#fishing-action');
    const fishingState = {
      active: false, bait: 5, caught: 0, phase: 'idle',
      waitTime: 0, biteTime: 0, strength: 100, tension: 0,
      lastTugTime: 0, message: 'Siap melempar kail? Setiap lemparan memakai 1 umpan.'
    };
    const playerNameInput = document.querySelector('#player-name');
    const profileError = document.querySelector('#profile-error');
    const keys = new Set();
    let jumpVelocity = 0;
    let touchForward = 0;
    let touchSideways = 0;
    let moveStickPointer = null;
    let musicEnabled = false;
    let musicContext = null;
    let musicGain = null;
    let musicScheduler = null;
    let musicStep = 0;
    let nextMusicTime = 0;
    const clock = new THREE.Clock();
    let walkPhase = 0;
    let walkAmount = 0;
    let activeNpcIndex = null;
    let pageIndex = 0;
    let gameStarted = false;
    let modalOpen = false;
    let gamePaused = false;
    let playerName = '';
    let toastTimer = 0;
    let quizIndex = 0;
    let quizScore = 0;
    let selectedAnswer = null;
    let answered = false;
    const playerFacing = new THREE.Vector3(0, 0, 1);
    let cursorInteraction = null;
    let targetCameraDistance = cameraDistance;
    let activeDragPointer = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastDragX = 0;
    let lastDragY = 0;
    let dragMoved = false;

    function makePanelSwipeable(panel, handle) {
      let pointerId = null;
      let grabOffsetX = 0;
      let grabOffsetY = 0;

      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0 || event.target.closest('button')) return;
        const bounds = panel.getBoundingClientRect();
        panel.style.left = `${bounds.left}px`;
        panel.style.top = `${bounds.top}px`;
        panel.style.right = 'auto';
        grabOffsetX = event.clientX - bounds.left;
        grabOffsetY = event.clientY - bounds.top;
        pointerId = event.pointerId;
        handle.setPointerCapture(pointerId);
        panel.classList.add('panel-dragging');
        event.preventDefault();
      });

      handle.addEventListener('pointermove', event => {
        if (event.pointerId !== pointerId) return;
        const left = THREE.MathUtils.clamp(event.clientX - grabOffsetX, 0, window.innerWidth - panel.offsetWidth);
        const top = THREE.MathUtils.clamp(event.clientY - grabOffsetY, 0, window.innerHeight - panel.offsetHeight);
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
      });

      const endSwipe = event => {
        if (event.pointerId !== pointerId) return;
        pointerId = null;
        panel.classList.remove('panel-dragging');
      };
      handle.addEventListener('pointerup', endSwipe);
      handle.addEventListener('pointercancel', endSwipe);
    }

    makePanelSwipeable(hud, hud.querySelector('h2'));
    makePanelSwipeable(mapPanel, mapPanel.querySelector('.map-heading'));

    function makePanelMinimizable(panel, content, button, panelName) {
      button.addEventListener('pointerdown', event => event.stopPropagation());
      button.addEventListener('click', () => {
        const minimized = panel.classList.toggle('panel-collapsed');
        content.classList.toggle('hidden', minimized);
        button.textContent = minimized ? '+' : '−';
        button.setAttribute('aria-expanded', String(!minimized));
        button.setAttribute('aria-label', `${minimized ? 'Perbesar' : 'Minimalkan'} ${panelName}`);
      });
    }

    makePanelMinimizable(hud, document.querySelector('#hud-content'), document.querySelector('#hud-toggle'), 'Jurnal Desa');
    makePanelMinimizable(mapPanel, document.querySelector('#map-content'), document.querySelector('#map-toggle'), 'Peta Desa');

    function resetMoveStick() {
      touchForward = 0;
      touchSideways = 0;
      moveStickPointer = null;
      moveKnob.style.left = '50%';
      moveKnob.style.top = '50%';
    }
    function updateMoveStick(event) {
      const bounds = moveStick.getBoundingClientRect();
      const maxOffset = (bounds.width - moveKnob.offsetWidth) / 2;
      let deltaX = event.clientX - (bounds.left + bounds.width / 2);
      let deltaY = event.clientY - (bounds.top + bounds.height / 2);
      const distance = Math.hypot(deltaX, deltaY);
      if (distance > maxOffset) {
        const ratio = maxOffset / distance;
        deltaX *= ratio;
        deltaY *= ratio;
      }
      touchSideways = deltaX / maxOffset;
      touchForward = -deltaY / maxOffset;
      moveKnob.style.left = `calc(50% + ${deltaX}px)`;
      moveKnob.style.top = `calc(50% + ${deltaY}px)`;
    }
    moveStick.addEventListener('pointerdown', event => {
      if (!canControlPlayer()) return;
      moveStickPointer = event.pointerId;
      moveStick.setPointerCapture(event.pointerId);
      updateMoveStick(event);
      event.preventDefault();
    });
    moveStick.addEventListener('pointermove', event => {
      if (event.pointerId === moveStickPointer) updateMoveStick(event);
    });
    moveStick.addEventListener('pointerup', event => {
      if (event.pointerId === moveStickPointer) resetMoveStick();
    });
    moveStick.addEventListener('pointercancel', event => {
      if (event.pointerId === moveStickPointer) resetMoveStick();
    });
    touchInteractButton.addEventListener('click', () => {
      if (!canControlPlayer()) return;
      if (!dialogScreen.classList.contains('hidden')) document.querySelector('#dialog-next').click();
      else interact();
    });
    touchPauseButton.addEventListener('click', () => {
      if (!canControlPlayer()) return;
      resetMoveStick();
      gamePaused = true;
      pauseScreen.classList.remove('hidden');
    });
    document.querySelector('#touch-zoom-in').addEventListener('click', () => {
      if (canControlPlayer()) targetCameraDistance = THREE.MathUtils.clamp(targetCameraDistance - 3, 9, 36);
    });
    document.querySelector('#touch-zoom-out').addEventListener('click', () => {
      if (canControlPlayer()) targetCameraDistance = THREE.MathUtils.clamp(targetCameraDistance + 3, 9, 36);
    });

    const quizQuestions = [
      { q: 'Sikap yang menunjukkan pergaulan sehat adalah…', a: ['Menghargai batasan teman dan mendukung prestasinya', 'Memaksa teman mengikuti semua ajakan kita', 'Menyebarkan rahasia teman agar dianggap akrab', 'Mengejek teman yang berbeda pendapat'], correct: 0 },
      { q: 'Teman mengajak tawuran. Apa langkah paling aman?', a: ['Ikut supaya tidak dikucilkan', 'Menjauh, menolak dengan tegas, lalu mencari bantuan orang dewasa', 'Membawa benda berbahaya untuk berjaga-jaga', 'Merekam dan menyebarkan kejadian itu'], correct: 1 },
      { q: 'Pernyataan yang benar tentang HIV adalah…', a: ['HIV menular lewat berbagi makanan', 'Pelukan dapat menularkan HIV', 'HIV tidak menular lewat berjabat tangan atau berbagi makanan', 'Orang dengan HIV harus dijauhi'], correct: 2 },
      { q: 'Saat mengalami stres berat, tindakan yang sehat adalah…', a: ['Memendamnya agar tidak merepotkan siapa pun', 'Menyalahkan diri sendiri', 'Mencari dukungan dari orang tepercaya atau tenaga profesional', 'Berhenti sekolah tanpa berbicara dengan siapa pun'], correct: 2 },
      { q: 'Contoh strategi pencegahan tekanan teman sebaya adalah…', a: ['Mengikuti ajakan berisiko agar diterima', 'Menyiapkan cara menolak dan aktif dalam hobi positif', 'Memutus semua hubungan pertemanan', 'Menyembunyikan masalah dari orang dewasa'], correct: 1 },
      { q: 'Kamu menerima tautan mencurigakan yang meminta data pribadi. Sebaiknya…', a: ['Mengisi semua data dengan cepat', 'Meneruskan tautan ke semua grup', 'Tidak membuka atau membagikannya dan meminta saran orang dewasa', 'Mengirim kata sandi untuk memeriksa keamanannya'], correct: 2 },
      { q: 'Jika melihat perundungan siber, tindakan yang tepat adalah…', a: ['Ikut memberi komentar agar ramai', 'Menyebarkan tangkapan layar tanpa pikir panjang', 'Tidak ikut menyebarkan, melapor, dan mencari dukungan', 'Membalas dengan ancaman yang lebih keras'], correct: 2 },
      { q: 'Keluarga yang tangguh dibangun melalui…', a: ['Komunikasi terbuka, tanggung jawab, dan saling menjaga', 'Larangan membicarakan masalah apa pun', 'Saling menyalahkan saat ada kesulitan', 'Menyebarkan masalah keluarga di internet'], correct: 0 },
      { q: 'Bagaimana menyikapi orang yang berbeda identitas atau keyakinan?', a: ['Merundungnya agar berubah', 'Memperlakukan dengan aman dan hormat tanpa menghilangkan nilai yang kita yakini', 'Menyebarkan informasi pribadinya', 'Mengucilkannya dari kegiatan bersama'], correct: 1 },
      { q: 'Sebelum membagikan informasi kesehatan di media sosial, kita sebaiknya…', a: ['Percaya jika banyak yang menyukai', 'Memeriksa sumber dan bukti dari kanal tepercaya', 'Meneruskan tanpa membaca', 'Mengubah judul agar lebih mengejutkan'], correct: 1 },
      { q: 'Cara menjaga privasi dan jejak digital adalah…', a: ['Membagikan kata sandi kepada teman', 'Mengunggah lokasi rumah secara langsung', 'Memikirkan dampak unggahan dan menjaga data pribadi', 'Mengunggah foto orang lain tanpa izin'], correct: 2 },
      { q: 'Jika teman berkata “tidak” atau terlihat tidak nyaman, kita harus…', a: ['Berhenti dan menghormati batasannya', 'Terus membujuk sampai setuju', 'Menganggap diam sebagai persetujuan', 'Menertawakan batasannya'], correct: 0 },
      { q: 'Kebiasaan yang mendukung kesehatan sehari-hari adalah…', a: ['Mengabaikan waktu tidur', 'Makan beragam, bergerak aktif, dan beristirahat cukup', 'Membandingkan tubuh dengan orang lain', 'Minum minuman energi sebagai pengganti istirahat'], correct: 1 },
      { q: 'Saat menyaksikan perundungan, apa yang sebaiknya dilakukan?', a: ['Ikut menertawakan agar diterima', 'Merekam lalu menyebarkannya', 'Temani yang terdampak dan laporkan kepada orang dewasa', 'Membalas dengan ancaman'], correct: 2 },
      { q: 'Contoh gotong royong yang baik adalah…', a: ['Membebankan semua tugas pada satu orang', 'Bekerja bersama dan membagi tugas dengan adil', 'Mengabaikan kebutuhan warga lain', 'Mengejek orang yang membutuhkan bantuan'], correct: 1 }
    ];

    function refreshHud() {
      missionList.replaceChildren();
      npcData.forEach((npc, index) => {
        const state = npcs[index];
        const li = document.createElement('li');
        const dot = document.createElement('span');
        dot.className = `dot${state.complete ? ' done' : state.introSeen ? ' active' : ''}`;
        const name = document.createElement('span');
        name.className = 'mission-name';
        name.textContent = `${index + 1}. ${npc.name}`;
        const status = document.createElement('span');
        status.className = 'mission-status';
        status.textContent = state.complete ? 'Selesai' : state.introSeen ? 'Cari Item' : 'Belum Diambil';
        li.append(dot, name, status);
        missionList.append(li);
        state.marker.material.color.setHex(state.complete ? 0x48d879 : state.introSeen ? 0xffcc48 : 0xef655e);
        state.marker.material.emissive.setHex(state.complete ? 0x15512a : state.introSeen ? 0x65470c : 0x501311);
      });
      const allDone = npcs.every(state => state.complete);
      examStatus.textContent = allDone ? 'Gedung Ujian: ✅ Terbuka! Temui penjaga di depan gedung.' : `Gedung Ujian: 🔒 Selesaikan ${npcData.length - npcs.filter(state => state.complete).length} misi lagi untuk membuka ujian.`;
      examOrb.material.color.setHex(allDone ? 0x5ae58d : 0x8d9990);
    }

    function showToast(message) {
      const toast = document.querySelector('#toast');
      toast.textContent = message;
      toast.classList.add('show');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
    }

    const musicMelody = [64, 67, 71, 74, 71, 67, 69, 72, 76, 72, 69, 67, 71, 74, 79, 74];
    const musicBass = [40, 45, 38, 43];
    function updateMusicButton() {
      musicToggle.textContent = musicEnabled ? '♫' : '♪';
      musicToggle.setAttribute('aria-pressed', String(musicEnabled));
      musicToggle.setAttribute('aria-label', musicEnabled ? 'Matikan musik' : 'Nyalakan musik');
      musicToggle.title = musicEnabled ? 'Matikan musik' : 'Nyalakan musik';
    }
    function playMusicNote(midiNote, startTime, duration, volume, waveform) {
      const oscillator = musicContext.createOscillator();
      const envelope = musicContext.createGain();
      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(440 * 2 ** ((midiNote - 69) / 12), startTime);
      envelope.gain.setValueAtTime(.0001, startTime);
      envelope.gain.exponentialRampToValueAtTime(volume, startTime + .07);
      envelope.gain.exponentialRampToValueAtTime(.0001, startTime + duration);
      oscillator.connect(envelope);
      envelope.connect(musicGain);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + .03);
    }
    function scheduleMusic() {
      if (!musicEnabled || !musicContext) return;
      const scheduleUntil = musicContext.currentTime + .24;
      while (nextMusicTime < scheduleUntil) {
        const step = musicStep % musicMelody.length;
        playMusicNote(musicMelody[step], nextMusicTime, .9, .075, 'triangle');
        if (step % 4 === 0) {
          playMusicNote(musicBass[Math.floor(step / 4)], nextMusicTime, 2.5, .065, 'sine');
        }
        if (step % 4 === 2) {
          playMusicNote(musicMelody[step] + 12, nextMusicTime, .65, .025, 'sine');
        }
        nextMusicTime += .72;
        musicStep++;
      }
    }
    function setMusicEnabled(enabled) {
      if (!enabled) {
        musicEnabled = false;
        updateMusicButton();
        if (musicScheduler !== null) {
          window.clearInterval(musicScheduler);
          musicScheduler = null;
        }
        if (musicContext && musicGain) {
          const now = musicContext.currentTime;
          musicGain.gain.cancelScheduledValues(now);
          musicGain.gain.setTargetAtTime(0, now, .12);
        }
        return;
      }

      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextConstructor) {
        showToast('Browser ini tidak mendukung pemutaran musik.');
        return;
      }
      if (!musicContext) {
        musicContext = new AudioContextConstructor();
        musicGain = musicContext.createGain();
        musicGain.gain.value = 0;
        musicGain.connect(musicContext.destination);
      }
      musicEnabled = true;
      updateMusicButton();
      musicContext.resume().then(() => {
        if (!musicEnabled) return;
        const now = musicContext.currentTime;
        musicGain.gain.cancelScheduledValues(now);
        musicGain.gain.setTargetAtTime(.3, now, .35);
        musicStep = 0;
        nextMusicTime = now + .08;
        scheduleMusic();
        musicScheduler = window.setInterval(scheduleMusic, 100);
      }).catch(() => {
        musicEnabled = false;
        updateMusicButton();
        showToast('Musik tidak dapat diputar. Periksa izin audio browser.');
      });
    }
    musicToggle.addEventListener('click', () => setMusicEnabled(!musicEnabled));

    function refreshFishingPanel() {
      fishingBaitText.textContent = String(fishingState.bait);
      fishingCaughtText.textContent = String(fishingState.caught);
      fishStrengthText.textContent = `${Math.round(fishingState.strength)}%`;
      lineTensionText.textContent = `${Math.round(fishingState.tension)}%`;
      fishStrengthBar.style.width = `${THREE.MathUtils.clamp(fishingState.strength, 0, 100)}%`;
      lineTensionBar.style.width = `${THREE.MathUtils.clamp(fishingState.tension, 0, 100)}%`;
      fishingStatusText.textContent = fishingState.message;
      fishingActionButton.disabled = fishingState.phase === 'waiting';
      fishingActionButton.textContent = fishingState.phase === 'bite' ? 'TARIK KAIL · SPASI' : 'LEMPAR KAIL · SPASI';
    }

    function castFishingLine() {
      if (fishingState.bait <= 0) {
        fishingState.message = 'Umpan habis. Terima kasih sudah memancing!';
        refreshFishingPanel();
        return;
      }
      fishingState.bait--;
      fishingState.phase = 'waiting';
      fishingState.waitTime = 2.5 + Math.random() * 2.5;
      fishingState.biteTime = 0;
      fishingState.strength = 100;
      fishingState.tension = 0;
      fishingState.lastTugTime = 0;
      fishingState.message = 'Kail sudah dilempar. Tunggu sampai ikan menyambar...';
      refreshFishingPanel();
    }

    function pullFishingLine() {
      if (fishingState.phase !== 'bite') return;
      const now = performance.now() / 1000;
      if (now - fishingState.lastTugTime < .24) return;
      fishingState.lastTugTime = now;
      fishingState.tension = Math.min(100, fishingState.tension + 23);
      fishingState.strength = Math.max(0, fishingState.strength - 20);
      fishingState.message = fishingState.tension >= 70
        ? 'Pancing mulai tegang. Beri jeda sejenak agar tali kendur.'
        : 'Tarikan bagus! Tekan lagi untuk menarik ikan.';
      refreshFishingPanel();
    }

    function openFishing() {
      fishingState.active = true;
      modalOpen = true;
      fishingScreen.classList.remove('hidden');
      refreshFishingPanel();
    }

    function closeFishing() {
      fishingState.active = false;
      modalOpen = false;
      fishingScreen.classList.add('hidden');
      keys.delete('Space');
    }

    function updateFishing(delta) {
      if (!fishingState.active) return;
      if (fishingState.phase === 'waiting') {
        fishingState.waitTime -= delta;
        if (fishingState.waitTime <= 0) {
          fishingState.phase = 'bite';
          fishingState.biteTime = 7;
          fishingState.message = 'Ikan menyambar! Tekan Spasi atau tombol Tarik. Beri jeda jika tali menegang.';
        }
      } else if (fishingState.phase === 'bite') {
        fishingState.biteTime -= delta;
        fishingState.tension = Math.max(0, fishingState.tension - delta * 14);
        if (fishingState.tension >= 95) {
          fishingState.phase = 'idle';
          fishingState.message = 'Tali pancing putus! Coba lagi dan jaga ketegangan pancing.';
        } else if (fishingState.strength <= 0) {
          fishingState.phase = 'idle';
          fishingState.caught++;
          fishingState.message = 'Ikan tertangkap! Hebat, lempar kail lagi untuk mendapat ikan lainnya.';
        } else if (fishingState.biteTime <= 0) {
          fishingState.phase = 'idle';
          fishingState.message = 'Ikan lolos. Coba lempar kail lagi saat siap.';
        }
      }
      refreshFishingPanel();
    }

    fishingActionButton.addEventListener('click', () => {
      if (!fishingState.active) return;
      if (fishingState.phase === 'idle') {
        castFishingLine();
      } else if (fishingState.phase === 'bite') {
        pullFishingLine();
      }
    });
    document.querySelector('#fishing-close').addEventListener('click', closeFishing);

    function targetWithinReach(target) {
      if (!target) return false;
      const position = target.type === 'npc' ? npcs[target.index].group.position
        : target.type === 'item' ? npcs[target.index].item.position
          : target.type === 'fishing' ? fishingSpot
            : new THREE.Vector3(examLocation.x, 0, examLocation.z + 4.9);
      const maxDistance = target.type === 'npc' ? 4.4 : target.type === 'item' ? 3.5 : target.type === 'fishing' ? 6 : 8;
      return Math.hypot(playerWorldPosition.x - position.x, playerWorldPosition.z - position.z) < maxDistance;
    }

    function updateCursorTarget(event) {
      if (!gameStarted || modalOpen || gamePaused) {
        cursorInteraction = null;
        canvas.style.cursor = 'grab';
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      cursorInteraction = null;
      let closestScreenDistance = 90;
      const pointerX = event.clientX - bounds.left;
      const pointerY = event.clientY - bounds.top;
      const projectedPoint = new THREE.Vector3();
      const candidates = [
        ...npcs.map((state, index) => ({
          target: { type: 'npc', index },
          position: new THREE.Vector3(state.group.position.x, state.group.position.y + 2.35, state.group.position.z)
        })),
        ...npcs.flatMap((state, index) => state.introSeen && !state.itemCollected && !state.complete
          ? [{ target: { type: 'item', index }, position: state.item.position }]
          : []),
        { target: { type: 'fishing' }, position: new THREE.Vector3(14, 2.7, -46.88) },
        { target: { type: 'exam' }, position: new THREE.Vector3(examLocation.x, 4.2, examLocation.z + 4.9) }
      ];
      for (const candidate of candidates) {
        if (!targetWithinReach(candidate.target)) continue;
        projectedPoint.copy(candidate.position).project(camera);
        if (projectedPoint.z < -1 || projectedPoint.z > 1) continue;
        const x = (projectedPoint.x + 1) * bounds.width / 2;
        const y = (1 - projectedPoint.y) * bounds.height / 2;
        const screenDistance = Math.hypot(pointerX - x, pointerY - y);
        if (screenDistance < closestScreenDistance) {
          closestScreenDistance = screenDistance;
          cursorInteraction = candidate.target;
        }
      }
      canvas.style.cursor = cursorInteraction ? 'pointer' : 'grab';
    }

    canvas.addEventListener('pointermove', event => {
      if (event.pointerId === activeDragPointer) {
        const deltaX = event.clientX - lastDragX;
        const deltaY = event.clientY - lastDragY;
        lastDragX = event.clientX;
        lastDragY = event.clientY;
        cameraYaw -= deltaX * .005;
        cameraPitch = THREE.MathUtils.clamp(cameraPitch + deltaY * .004, -.12, 1.12);
        if (Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY) > 3) dragMoved = true;
        return;
      }
      updateCursorTarget(event);
    });
    canvas.addEventListener('pointerleave', () => {
      if (activeDragPointer !== null) return;
      cursorInteraction = null;
      canvas.style.cursor = 'grab';
    });
    canvas.addEventListener('pointerdown', event => {
      if ((event.button !== 0 && event.pointerType !== 'touch') || !canControlPlayer()) return;
      activeDragPointer = event.pointerId;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      lastDragX = event.clientX;
      lastDragY = event.clientY;
      dragMoved = false;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
      canvas.classList.add('camera-dragging');
    });
    canvas.addEventListener('pointerup', event => {
      if (event.pointerId !== activeDragPointer) return;
      const wasDragged = dragMoved;
      activeDragPointer = null;
      canvas.classList.remove('camera-dragging');
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      if (!wasDragged && canControlPlayer()) {
        updateCursorTarget(event);
        interact(cursorInteraction || nearestInteraction());
      } else {
        updateCursorTarget(event);
      }
    });
    canvas.addEventListener('pointercancel', event => {
      if (event.pointerId !== activeDragPointer) return;
      activeDragPointer = null;
      canvas.classList.remove('camera-dragging');
      canvas.style.cursor = 'grab';
    });
    canvas.addEventListener('wheel', event => {
      if (!gameStarted || modalOpen || gamePaused) return;
      event.preventDefault();
      targetCameraDistance = THREE.MathUtils.clamp(targetCameraDistance + Math.sign(event.deltaY) * 2, 9, 36);
    }, { passive: false });

    function showDialog(index, pages, topic = null) {
      activeNpcIndex = index;
      pageIndex = 0;
      modalOpen = true;
      document.querySelector('#dialog-name').textContent = index === null ? 'Penjaga Ujian' : npcData[index].name;
      document.querySelector('#dialog-topic').textContent = topic || (index === null ? 'Gedung Ujian Tengah Desa' : npcData[index].topic);
      dialogScreen.dataset.pages = JSON.stringify(pages);
      renderDialogPage();
      dialogScreen.classList.remove('hidden');
      hint.classList.add('hidden');
    }
    function renderDialogPage() {
      const pages = JSON.parse(dialogScreen.dataset.pages || '[]');
      document.querySelector('#dialog-copy').textContent = pages[pageIndex];
      document.querySelector('#page-count').textContent = `Halaman ${pageIndex + 1} dari ${pages.length}`;
      document.querySelector('#dialog-next').textContent = pageIndex === pages.length - 1 ? 'SELESAI' : 'LANJUT';
    }
    function closeDialog() {
      dialogScreen.classList.add('hidden');
      modalOpen = false;
      if (activeNpcIndex !== null) {
        const state = npcs[activeNpcIndex];
        if (!state.introSeen) {
          state.introSeen = true;
          state.item.visible = true;
          showToast(`Misi dimulai: cari ${npcData[activeNpcIndex].itemName}!`);
          refreshHud();
        }
      }
      activeNpcIndex = null;
    }
    document.querySelector('#dialog-next').addEventListener('click', () => {
      const pages = JSON.parse(dialogScreen.dataset.pages || '[]');
      if (pageIndex < pages.length - 1) {
        pageIndex++;
        renderDialogPage();
      } else {
        closeDialog();
      }
    });

    function nearestInteraction() {
      const player = playerAvatar.position;
      let nearest = null;
      let nearestDistance = Infinity;
      npcs.forEach((state, index) => {
        const dist = Math.hypot(player.x - state.group.position.x, player.z - state.group.position.z);
        if (dist < 4.4 && dist < nearestDistance) {
          nearest = { type: 'npc', index, distance: dist };
          nearestDistance = dist;
        }
      });
      npcs.forEach((state, index) => {
        if (!state.introSeen || state.itemCollected || state.complete) return;
        const dist = Math.hypot(player.x - state.item.position.x, player.z - state.item.position.z);
        if (dist < 3.5 && dist < nearestDistance) {
          nearest = { type: 'item', index, distance: dist };
          nearestDistance = dist;
        }
      });
      const examDistance = Math.hypot(player.x - examLocation.x, player.z - examLocation.z - 4.9);
      if (examDistance < 8 && examDistance < nearestDistance) nearest = { type: 'exam', distance: examDistance };
      const fishingDistance = Math.hypot(player.x - fishingSpot.x, player.z - fishingSpot.z);
      if (fishingDistance < 6 && fishingDistance < nearestDistance) nearest = { type: 'fishing', distance: fishingDistance };
      return nearest;
    }
    function canControlPlayer() {
      return gameStarted && !modalOpen && !gamePaused;
    }
    function interact(cursorTarget = null) {
      if (!canControlPlayer()) return;
      const target = cursorTarget || nearestInteraction();
      if (!target) return;
      if (target.type === 'item') {
        const state = npcs[target.index];
        state.itemCollected = true;
        state.item.visible = false;
        showToast(`${npcData[target.index].itemName} ditemukan! Laporkan kembali kepada ${npcData[target.index].name}.`);
        return;
      }
      if (target.type === 'npc') {
        const npc = npcData[target.index];
        const state = npcs[target.index];
        if (!state.introSeen) {
          showDialog(target.index, npc.pages);
        } else if (state.itemCollected && !state.complete) {
          state.complete = true;
          refreshHud();
          showToast(`Misi ${npc.name} selesai!`);
        } else if (!state.complete) {
          showDialog(target.index, [`Sudah siap mencari ${npc.itemName}? Benda itu ada di sekitar ${npc.place}.`, 'Temukan bendanya, lalu kembali ke sini dan tekan E untuk melapor.'], 'Petunjuk Misi');
        } else {
          showDialog(target.index, [`Terima kasih sudah menyelesaikan misi. Teruskan sikap baikmu di ${npc.place}!`], 'Misi Selesai');
        }
        return;
      }
      if (target.type === 'fishing') {
        openFishing();
        return;
      }
      const allDone = npcs.every(state => state.complete);
      if (!allDone) {
        showDialog(null, ['Ujian akhir masih terkunci. Pastikan semua tujuh misi warga berstatus Selesai, lalu kembali ke gedung ini.'], 'Gedung Ujian Terkunci');
      } else {
        beginQuiz();
      }
    }
    document.addEventListener('keydown', event => {
      if (gameStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
      keys.add(event.code);
      if (fishingState.active) {
        if (event.code === 'Escape') {
          closeFishing();
        } else if (event.code === 'Space' && !event.repeat) {
          if (fishingState.phase === 'idle') castFishingLine();
          else if (fishingState.phase === 'bite') pullFishingLine();
        }
        return;
      }
      if (event.code === 'Space' && !event.repeat && canControlPlayer()) {
        const groundHeight = 1.7 + surfaceHeightAt(playerWorldPosition.x, playerWorldPosition.z);
        if (playerWorldPosition.y <= groundHeight + .05) jumpVelocity = 8.8;
      }
      if (event.code === 'Escape' && gameStarted && !modalOpen && !gamePaused) {
        gamePaused = true;
        resetMoveStick();
        if (activeDragPointer !== null && canvas.hasPointerCapture(activeDragPointer)) {
          canvas.releasePointerCapture(activeDragPointer);
        }
        activeDragPointer = null;
        canvas.classList.remove('camera-dragging');
        canvas.style.cursor = 'grab';
        pauseScreen.classList.remove('hidden');
      }
      if (event.code === 'KeyE' && !event.repeat) {
        if (!dialogScreen.classList.contains('hidden')) {
          document.querySelector('#dialog-next').click();
        } else {
          interact();
        }
      }
    });
    document.addEventListener('keyup', event => {
      keys.delete(event.code);
    });
    document.querySelectorAll('.avatar-option').forEach(option => {
      option.addEventListener('click', () => {
        selectedAvatar = option.dataset.avatar;
        document.querySelectorAll('.avatar-option').forEach(button => {
          const isSelected = button === option;
          button.classList.toggle('selected', isSelected);
          button.setAttribute('aria-pressed', String(isSelected));
        });
        applyPlayerAvatar(selectedAvatar);
      });
    });
    playerNameInput.addEventListener('input', () => profileError.classList.add('hidden'));
    document.querySelector('#start-button').addEventListener('click', () => {
      const enteredName = playerNameInput.value.trim();
      if (!enteredName) {
        profileError.classList.remove('hidden');
        playerNameInput.focus();
        return;
      }
      playerName = enteredName.slice(0, 20);
      document.querySelector('#player-greeting').textContent = `Petualang: ${playerName}`;
      gameStarted = true;
      playerAvatar.visible = true;
      titleScreen.classList.add('hidden');
      hud.classList.remove('hidden');
      mapPanel.classList.remove('hidden');
      touchControls.classList.remove('hidden');
      refreshHud();
      setMusicEnabled(true);
    });
    document.querySelector('#resume-button').addEventListener('click', () => {
      gamePaused = false;
      pauseScreen.classList.add('hidden');
      canvas.focus();
    });

    function beginQuiz() {
      modalOpen = true;
      quizIndex = 0;
      quizScore = 0;
      quizScreen.classList.remove('hidden');
      renderQuestion();
    }
    function renderQuestion() {
      const question = quizQuestions[quizIndex];
      selectedAnswer = null;
      answered = false;
      document.querySelector('#quiz-progress').textContent = `Soal ${quizIndex + 1} dari ${quizQuestions.length}`;
      document.querySelector('#question').textContent = question.q;
      document.querySelector('#quiz-feedback').textContent = '';
      const answers = document.querySelector('#answers');
      answers.replaceChildren();
      question.a.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer';
        button.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
        button.addEventListener('click', () => {
          if (answered) return;
          selectedAnswer = index;
          answers.querySelectorAll('.answer').forEach(item => item.classList.remove('selected'));
          button.classList.add('selected');
          document.querySelector('#quiz-next').disabled = false;
        });
        answers.append(button);
      });
      document.querySelector('#quiz-next').textContent = quizIndex === quizQuestions.length - 1 ? 'LIHAT HASIL' : 'JAWAB & LANJUT';
      document.querySelector('#quiz-next').disabled = true;
    }
    document.querySelector('#quiz-next').addEventListener('click', () => {
      if (!answered) {
        if (selectedAnswer === null) return;
        answered = true;
        const question = quizQuestions[quizIndex];
        const isCorrect = selectedAnswer === question.correct;
        if (isCorrect) quizScore += 1;
        document.querySelector('#quiz-feedback').textContent = isCorrect ? 'Benar! Jawabanmu tepat.' : `Belum tepat. Jawaban yang benar: ${String.fromCharCode(65 + question.correct)}.`;
        document.querySelectorAll('.answer').forEach(button => {
          button.disabled = true;
          if (button.textContent.startsWith(`${String.fromCharCode(65 + question.correct)}.`)) button.classList.add('selected');
        });
        document.querySelector('#quiz-next').textContent = quizIndex === quizQuestions.length - 1 ? 'LIHAT HASIL' : 'SOAL BERIKUTNYA';
        return;
      }
      if (quizIndex < quizQuestions.length - 1) {
        quizIndex++;
        renderQuestion();
      } else {
        finishQuiz();
      }
    });
    function finishQuiz() {
      quizScreen.classList.add('hidden');
      resultScreen.classList.remove('hidden');
      modalOpen = true;
      const finalScore = Math.round((quizScore / quizQuestions.length) * 100);
      document.querySelector('#result-score').textContent = `${finalScore} / 100`;
      if (quizScore >= Math.ceil(quizQuestions.length * .8)) {
        document.querySelector('#result-eyebrow').textContent = 'Kelulusan Resmi';
        document.querySelector('#result-title').textContent = 'Selamat, Duta Muda!';
        document.querySelector('#result-copy').innerHTML = 'Kamu resmi menyandang gelar<br><strong style="color:#ffe28c;font-size:1.35rem">Duta Muda Desa Remaja</strong><br>Terus sebarkan sikap saling menghargai dan pilihan yang sehat.';
      } else {
        document.querySelector('#result-eyebrow').textContent = 'Terus Belajar';
        document.querySelector('#result-title').textContent = 'Sedikit Lagi!';
        document.querySelector('#result-copy').textContent = 'Nilai kelulusan adalah 80. Ulangi permainan untuk meninjau materi dan mencoba ujian lagi.';
      }
    }
    document.querySelector('#restart-button').addEventListener('click', () => window.location.reload());

    function updatePrompt() {
      if (!canControlPlayer()) {
        hint.classList.add('hidden');
        return;
      }
      const pointedTarget = cursorInteraction && targetWithinReach(cursorInteraction);
      const target = pointedTarget ? cursorInteraction : nearestInteraction();
      if (!target) {
        hint.classList.add('hidden');
        return;
      }
      const touchMode = window.innerWidth <= 760;
      const action = touchMode ? 'Ketuk tombol INTERAKSI' : pointedTarget ? 'Klik atau tekan E' : 'Klik dunia atau tekan E';
      let text = `${action} untuk berinteraksi`;
      if (target.type === 'item') text = `${action} untuk mengambil ${npcData[target.index].itemName}`;
      if (target.type === 'npc') text = `${action} untuk berbicara dengan ${npcData[target.index].name}`;
      if (target.type === 'fishing') text = `${action} untuk memancing di Saung Pancing`;
      if (target.type === 'exam') text = `${action} untuk mengikuti Ujian Akhir`;
      hint.textContent = text;
      hint.classList.remove('hidden');
    }

    function animate() {
      requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), .05);
      const time = performance.now() * .001;
      let moving = false;
      if (canControlPlayer()) {
        let forward = touchForward;
        let sideways = touchSideways;
        if (keys.has('KeyW') || keys.has('ArrowUp')) forward += 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) forward -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) sideways += 1;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) sideways -= 1;
        const magnitude = Math.hypot(forward, sideways);
        const inputScale = magnitude ? Math.min(magnitude, 1) / magnitude : 0;
        const speed = 8 * delta;
        const position = playerWorldPosition;
        moving = magnitude > .08;
        const moveX = (sideways * Math.cos(cameraYaw) - forward * Math.sin(cameraYaw)) * inputScale;
        const moveZ = (-sideways * Math.sin(cameraYaw) - forward * Math.cos(cameraYaw)) * inputScale;
        const nextX = THREE.MathUtils.clamp(position.x + moveX * speed, -135, 135);
        const nextZ = THREE.MathUtils.clamp(position.z + moveZ * speed, -135, 135);
        if (!collidesWithBuilding(nextX, position.z)) position.x = nextX;
        if (!collidesWithBuilding(position.x, nextZ)) position.z = nextZ;
        if (moving) playerFacing.set(moveX, 0, moveZ).normalize();
        const playerSurface = surfaceHeightAt(position.x, position.z);
        const groundHeight = 1.7 + playerSurface;
        if (jumpVelocity > 0 || position.y > groundHeight + .01) {
          jumpVelocity -= 22 * delta;
          position.y += jumpVelocity * delta;
          if (position.y <= groundHeight) {
            position.y = groundHeight;
            jumpVelocity = 0;
          }
        } else {
          position.y = THREE.MathUtils.damp(position.y, groundHeight, 10, delta);
        }
      }
      if (gameStarted) {
        walkAmount = THREE.MathUtils.damp(walkAmount, moving ? 1 : 0, 10, delta);
        walkPhase += delta * 10 * walkAmount;
        const step = Math.sin(walkPhase) * .55 * walkAmount;
        playerLegs[0].rotation.x = step;
        playerLegs[1].rotation.x = -step;
        playerArms[0].rotation.x = -step * .75;
        playerArms[1].rotation.x = step * .75;
        const playerPosition = playerWorldPosition;
        mapPlayerMarker.setAttribute('cx', String(100 + playerPosition.x * .65));
        mapPlayerMarker.setAttribute('cy', String(100 + playerPosition.z * .65));
        const avatarSurface = surfaceHeightAt(playerPosition.x, playerPosition.z);
        const jumpHeight = playerPosition.y - (1.7 + avatarSurface);
        playerAvatar.position.set(playerPosition.x, THREE.MathUtils.damp(playerAvatar.position.y, avatarSurface + jumpHeight, 10, delta), playerPosition.z);
        playerAvatar.rotation.y = Math.atan2(playerFacing.x, playerFacing.z);
        cameraDistance = THREE.MathUtils.damp(cameraDistance, targetCameraDistance, 8, delta);
        camera.position.set(
          playerPosition.x + Math.sin(cameraYaw) * cameraDistance,
          playerPosition.y + .6 + Math.tan(cameraPitch) * cameraDistance,
          playerPosition.z + Math.cos(cameraYaw) * cameraDistance
        );
        camera.lookAt(playerPosition.x, playerPosition.y + .6, playerPosition.z);
        playerEyes.forEach((eye, index) => {
          eye.scale.y = Math.sin(time + index * .15) > .997 ? .01 : .08;
        });
      }
      clouds.forEach(cloud => {
        cloud.position.x += delta * .65;
        if (cloud.position.x > 135) cloud.position.x = -135;
      });
      npcs.forEach((state, index) => {
        state.group.position.y = Math.sin(time * 2 + index) * .035;
        if (state.item.visible) {
          state.item.rotation.y += delta * 1.25;
          state.item.position.y = .85 + Math.sin(time * 2.6 + index) * .18;
        }
      });
      groundAnimals.forEach(animal => {
        animal.phase += delta * animal.speed;
        const x = animal.homeX + Math.sin(animal.phase) * animal.radiusX;
        const z = animal.homeZ + Math.sin(animal.phase * .73) * animal.radiusZ;
        const velocityX = Math.cos(animal.phase) * animal.radiusX * animal.speed;
        const velocityZ = Math.cos(animal.phase * .73) * animal.radiusZ * .73 * animal.speed;
        animal.group.position.set(x, surfaceHeightAt(x, z), z);
        animal.group.rotation.y = Math.atan2(velocityX, velocityZ);
        const distanceMoved = Math.hypot(x - animal.lastX, z - animal.lastZ);
        animal.walkPhase += distanceMoved * 5.2;
        const gait = Math.sin(animal.walkPhase) * .38;
        animal.legs.forEach((leg, index) => {
          const swingDirection = animal.legs.length === 2
            ? (index % 2 === 0 ? 1 : -1)
            : (index === 0 || index === 3 ? 1 : -1);
          leg.rotation.x = gait * swingDirection;
        });
        animal.group.position.y += Math.abs(gait) * .025;
        animal.lastX = x;
        animal.lastZ = z;
        if (animal.tail) animal.tail.rotation.z = Math.sin(time * 2.4 + animal.phase) * .18;
      });
      villageBirds.forEach(bird => {
        bird.phase += delta * bird.speed;
        const x = bird.homeX + Math.sin(bird.phase) * bird.radiusX;
        const z = bird.homeZ + Math.sin(bird.phase * .68) * bird.radiusZ;
        const velocityX = Math.cos(bird.phase) * bird.radiusX * bird.speed;
        const velocityZ = Math.cos(bird.phase * .68) * bird.radiusZ * .68 * bird.speed;
        bird.group.position.set(x, bird.baseY + Math.sin(time * 2 + bird.phase) * .35, z);
        bird.group.rotation.y = Math.atan2(velocityX, velocityZ);
        const flap = Math.sin(time * 12 + bird.phase) * .62;
        bird.leftWing.rotation.z = flap;
        bird.rightWing.rotation.z = -flap;
      });
      riverFish.forEach(fish => {
        const swim = time * .7 + fish.phase;
        const x = fish.homeX + Math.sin(swim) * 1.1;
        fish.group.position.set(x, -.12 + Math.sin(swim * 1.8) * .035, riverCenterAt(x) + fish.zOffset + Math.cos(swim) * .32);
        fish.group.rotation.y = Math.cos(swim) * .14;
        fish.tail.rotation.y = Math.sin(swim * 3) * .48;
        const rippleScale = 1 + Math.sin(swim * 1.5) * .12;
        fish.ripple.scale.set(1.25 * rippleScale, .65 * rippleScale, 1);
      });
      examOrb.rotation.y += delta * .8;
      examOrb.rotation.x = Math.sin(time) * .12;
      updateFishing(delta);
      updatePrompt();
      renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
    refreshHud();

