// Programme : exercices, séances par phase, calendrier.
// img = dossier de free-exercise-db (domaine public), copié dans img/<id>/0.jpg et 1.jpg

export const EX = {
  // ---------- Puissance ----------
  box_jump: { n: 'Box jump', img: 'Front_Box_Jump', eq: 'bw', yt: 'box jump technique', cues: [
    'Pieds largeur de hanches, balance les bras vers l’arrière en pliant les hanches.',
    'Saute en lançant les bras vers le haut, atterris en douceur sur la boîte, genoux alignés avec les pieds.',
    'Redescends en marchant, pas en sautant.',
    'Chaque saut = effort maximal. 5–10 s de pause entre les reps.'] },
  pogo: { n: 'Pogo hops', eq: 'bw', yt: 'pogo hops plyometric', cues: [
    'Petits sauts rapides sur place, jambes presque tendues.',
    'Chevilles « raides » comme un ressort : le moins de temps possible au sol.',
    'Reste sur l’avant du pied, bras détendus.'] },
  hurdle_hops: { n: 'Sauts de haies enchaînés', img: 'Hurdle_Hops', eq: 'bw', yt: 'hurdle hops plyometric', cues: [
    'Aligne 4–5 petites haies ou cônes, espacés d’environ 1 m.',
    'Saute par-dessus chacun en enchaînant, contact au sol court.',
    'Monte les genoux, atterris sur l’avant du pied.'] },
  depth_jump: { n: 'Depth jump', img: 'Linear_Depth_Jump', eq: 'bw', yt: 'depth jump technique', cues: [
    'Debout sur une boîte d’environ 30 cm, fais un pas dans le vide (ne saute pas vers le bas).',
    'Dès que tes pieds touchent le sol, rebondis le plus haut possible.',
    'Contact au sol le plus court possible. La qualité compte plus que le nombre.'] },
  mb_chest: { n: 'Lancer médecine-ball poitrine', img: 'Medicine_Ball_Chest_Pass', eq: 'bw', yt: 'medicine ball chest pass wall', cues: [
    'Face au mur à environ 2 m, ballon de 4–6 kg à la poitrine.',
    'Pousse avec les jambes et lance le ballon le plus fort possible dans le mur.',
    'Rattrape, replace-toi, recommence. Vitesse maximale.'] },
  mb_rot: { n: 'Lancer médecine-ball rotation', eq: 'bw', yt: 'medicine ball rotational scoop toss', cues: [
    'De profil au mur, ballon à la hanche arrière.',
    'Pivote les hanches puis le tronc, et lance le ballon contre le mur.',
    'La puissance vient des hanches, pas des bras. Fais les deux côtés.'] },
  broad_jump: { n: 'Saut en longueur sans élan', img: 'Standing_Long_Jump', eq: 'bw', yt: 'standing broad jump technique', cues: [
    'Pieds largeur de hanches, balancier des bras.',
    'Saute le plus loin possible vers l’avant.',
    'Atterris genoux fléchis et tiens la réception 2 s sans bouger.'] },
  lateral_bound: { n: 'Bonds latéraux (patineur)', img: 'Lateral_Bound', eq: 'bw', yt: 'lateral bound skater jump', cues: [
    'Sur une jambe, pousse sur le côté le plus loin possible.',
    'Atterris sur l’autre jambe et tiens 1 s, stable.',
    'Alterne les côtés.'] },
  sprint_acc: { n: 'Accélérations 15 m', eq: 'bw', yt: 'sprint acceleration technique', cues: [
    'Départ debout, un pied devant, corps penché vers l’avant.',
    'Pousse fort dans le sol, bras puissants, 15 m à 90 %.',
    'Retour en marchant. Pas d’espace ? Poussée de traîneau 15 m.'] },
  sprint_20: { n: 'Sprints 20 m', eq: 'bw', yt: 'sprint acceleration technique', cues: [
    'Départ en position de 3 appuis ou debout.',
    '20 m à 95 %, en restant relâché (mâchoire et épaules détendues).',
    'Repos complet : 90 s à 2 min.'] },
  sprint_fly: { n: 'Sprint lancé (flying 20 m)', eq: 'bw', yt: 'flying sprint 20m', cues: [
    '20 m d’élan progressif, puis 20 m à vitesse maximale.',
    'Reste grand, relâché, bras rapides.',
    'Repos complet de 2–3 min.'] },
  cod: { n: 'Drill 5-10-5 (changement de direction)', eq: 'bw', yt: 'pro agility 5-10-5 drill', cues: [
    '3 cônes alignés à 5 m d’écart. Départ au cône du milieu.',
    'Sprint 5 m d’un côté, touche la ligne, 10 m de l’autre côté, touche, 5 m pour revenir au centre.',
    'Abaisse les hanches avant chaque changement de direction. Alterne le côté de départ.'] },
  trapbar_jump: { n: 'Saut trap bar léger', img: 'Weighted_Jump_Squat', eq: 'bb_low', yt: 'trap bar jump', cues: [
    'Trap bar chargée légèrement (20–30 % de ton soulevé de terre).',
    'Descends en quart de squat et saute le plus haut possible.',
    'Atterris en douceur, replace-toi entre chaque rep.'] },

  // ---------- Force / hypertrophie ----------
  goblet_squat: { n: 'Squat goblet', img: 'Goblet_Squat', eq: 'db', yt: 'goblet squat technique', cues: [
    'Tiens un haltère contre la poitrine, pieds un peu plus larges que les hanches.',
    'Descends entre tes jambes, poitrine haute, coudes à l’intérieur des genoux.',
    'Talons au sol, remonte en poussant le sol.'] },
  back_squat: { n: 'Squat barre', img: 'Barbell_Squat', eq: 'bb_low', yt: 'how to squat barbell beginner', start: 'Première fois : barre vide (20 kg / 45 lb), puis monte par paliers jusqu’à RPE 7.', cues: [
    'Barre sur le haut du dos, pieds largeur d’épaules, orteils légèrement ouverts.',
    'Inspire, gaine le ventre, descends en poussant les genoux vers l’extérieur.',
    'Descends au moins jusqu’à la cuisse parallèle, dos neutre.',
    'Remonte en poussant le sol. La barre reste au-dessus du milieu du pied.'] },
  rdl: { n: 'Soulevé de terre roumain (RDL)', img: 'Romanian_Deadlift', eq: 'bb_low', yt: 'romanian deadlift technique', cues: [
    'Barre en main, jambes légèrement fléchies.',
    'Pousse les fesses vers l’arrière, la barre glisse le long des cuisses.',
    'Descends jusqu’à sentir l’étirement des ischios (sous les genoux), dos plat.',
    'Remonte en serrant les fessiers.'] },
  bulgarian: { n: 'Fente bulgare haltères', img: 'Split_Squat_with_Dumbbells', eq: 'db', yt: 'bulgarian split squat dumbbell', note: 'Charge = un haltère par main.', cues: [
    'Pied arrière posé sur un banc, pied avant environ 1 m devant.',
    'Descends le genou arrière vers le sol, buste légèrement penché.',
    'Pousse dans le talon avant pour remonter. Toutes les reps d’une jambe, puis change.'] },
  db_row: { n: 'Rowing haltère un bras', img: 'One-Arm_Dumbbell_Row', eq: 'db', yt: 'one arm dumbbell row', cues: [
    'Main et genou sur un banc, dos plat.',
    'Tire l’haltère vers la hanche, coude près du corps.',
    'Redescends lentement, épaule étirée en bas.'] },
  calf: { n: 'Mollets debout', img: 'Standing_Calf_Raises', eq: 'machine', yt: 'standing calf raise full range', cues: [
    'Avant du pied sur une marche, talons dans le vide.',
    'Monte le plus haut possible, pause 1 s.',
    'Descends lentement, pause 2 s en bas, en étirement.'] },
  pallof: { n: 'Pallof press', img: 'Pallof_Press', eq: 'cable', yt: 'pallof press', cues: [
    'De profil à la poulie, poignée contre la poitrine.',
    'Pousse les bras devant toi sans laisser le tronc tourner.',
    'Tiens 2 s, ramène. Fais les deux côtés.'] },
  db_bench: { n: 'Développé couché haltères', img: 'Dumbbell_Bench_Press', eq: 'db', yt: 'dumbbell bench press technique', note: 'Charge = un haltère.', cues: [
    'Allongé sur le banc, omoplates serrées, pieds au sol.',
    'Descends les haltères au niveau de la poitrine, coudes à environ 45°.',
    'Pousse vers le haut en contrôlant.'] },
  bench: { n: 'Développé couché barre', img: 'Barbell_Bench_Press_-_Medium_Grip', eq: 'bb_up', yt: 'bench press technique beginner', start: 'Première fois : barre vide, puis monte par paliers.', cues: [
    'Yeux sous la barre, omoplates serrées et basses, pieds ancrés au sol.',
    'Prise un peu plus large que les épaules.',
    'Descends la barre au bas des pectoraux, coudes à environ 45°, puis pousse.',
    'Demande à quelqu’un de te parer sur les séries lourdes.'] },
  pullup: { n: 'Tractions', img: 'Pullups', eq: 'bwl', yt: 'pull up technique', note: 'Charge : + lest, − assistance, 0 = poids du corps.', cues: [
    'Prise en pronation, un peu plus large que les épaules.',
    'Tire la poitrine vers la barre en ramenant les coudes vers les hanches.',
    'Redescends bras tendus. Trop dur ? Machine d’assistance (charge négative) ou élastique.'] },
  lat_pulldown: { n: 'Tirage vertical', img: 'Wide-Grip_Lat_Pulldown', eq: 'cable', yt: 'lat pulldown technique', cues: [
    'Cuisses bloquées sous les coussins, buste légèrement incliné.',
    'Tire la barre vers le haut de la poitrine, coudes vers le bas.',
    'Remonte en contrôlant jusqu’aux bras tendus.'] },
  db_ohp: { n: 'Développé militaire haltères', img: 'Dumbbell_Shoulder_Press', eq: 'db', yt: 'dumbbell shoulder press', note: 'Charge = un haltère.', cues: [
    'Assis, dos contre le dossier, haltères à hauteur d’épaules.',
    'Pousse vers le haut sans cambrer le bas du dos.',
    'Redescends jusqu’aux oreilles.'] },
  cable_row: { n: 'Rowing câble assis', img: 'Seated_Cable_Rows', eq: 'cable', yt: 'seated cable row', cues: [
    'Assis, genoux légèrement fléchis, dos droit.',
    'Tire la poignée vers le nombril en serrant les omoplates.',
    'Laisse les bras s’allonger complètement sans arrondir le dos.'] },
  lat_raise: { n: 'Élévations latérales', img: 'Side_Lateral_Raise', eq: 'db', yt: 'lateral raise technique', cues: [
    'Haltères le long du corps, coudes légèrement fléchis.',
    'Monte les bras sur les côtés jusqu’à hauteur d’épaules.',
    'Pas d’élan. Redescends lentement.'] },
  face_pull: { n: 'Face pull', img: 'Face_Pull', eq: 'cable', yt: 'face pull technique', cues: [
    'Corde à hauteur des yeux.',
    'Tire vers le visage en écartant les mains, coudes hauts.',
    'Finis avec les mains à côté des oreilles, pause 1 s.'] },
  db_curl: { n: 'Curl haltères', img: 'Dumbbell_Bicep_Curl', eq: 'db', yt: 'dumbbell curl', cues: [
    'Coudes collés au corps.',
    'Monte en tournant la paume vers le haut, serre en haut.',
    'Descends lentement, bras complètement tendus.'] },
  tri: { n: 'Extension triceps à la corde', img: 'Triceps_Pushdown_-_Rope_Attachment', eq: 'cable', yt: 'rope triceps pushdown', cues: [
    'Coudes fixes contre le corps.',
    'Pousse la corde vers le bas en écartant les mains à la fin.',
    'Remonte en contrôlant jusqu’à 90°.'] },
  trapbar: { n: 'Soulevé de terre trap bar', img: 'Trap_Bar_Deadlift', eq: 'bb_low', yt: 'trap bar deadlift technique', start: 'Première fois : commence vers 60 kg / 135 lb et monte par paliers jusqu’à RPE 7.', cues: [
    'Debout au centre de la trap bar, pieds largeur de hanches.',
    'Descends en poussant les fesses en arrière, saisis les poignées, dos plat, poitrine haute.',
    'Pousse le sol avec les jambes, termine debout en serrant les fessiers.',
    'Redescends en contrôlant.'] },
  incline_db: { n: 'Développé incliné haltères', img: 'Incline_Dumbbell_Press', eq: 'db', yt: 'incline dumbbell press', note: 'Charge = un haltère.', cues: [
    'Banc incliné à 30°, omoplates serrées.',
    'Descends les haltères vers le haut de la poitrine.',
    'Pousse vers le haut et légèrement vers l’intérieur.'] },
  lunge: { n: 'Fentes marchées haltères', img: 'Dumbbell_Lunges', eq: 'db', yt: 'dumbbell walking lunge', note: 'Charge = un haltère par main.', cues: [
    'Un haltère dans chaque main, grand pas vers l’avant.',
    'Le genou arrière frôle le sol, le buste reste droit.',
    'Pousse dans le talon avant et enchaîne avec l’autre jambe.'] },
  chinup: { n: 'Chin-ups (supination)', img: 'Chin-Up', eq: 'bwl', yt: 'chin up technique', note: 'Charge : + lest, − assistance, 0 = poids du corps.', cues: [
    'Prise paumes vers toi, largeur d’épaules.',
    'Monte le menton au-dessus de la barre.',
    'Redescends jusqu’aux bras tendus. Arrête la série quand la technique se dégrade.'] },
  nordic: { n: 'Nordic curl', img: 'Natural_Glute_Ham_Raise', eq: 'bw', yt: 'nordic hamstring curl beginner', cues: [
    'À genoux, chevilles bloquées (partenaire, banc ou machine).',
    'Descends le buste vers l’avant le plus lentement possible, corps droit.',
    'Rattrape-toi avec les mains et repousse pour remonter. Ça brûle : c’est normal.'] },
  farmer: { n: 'Farmer carry', img: 'Farmers_Walk', eq: 'db', yt: 'farmers carry', note: 'Charge = un haltère par main.', cues: [
    'Un haltère lourd dans chaque main.',
    'Marche droit, épaules basses, ventre gainé, petits pas rapides.',
    'Ne laisse pas les haltères toucher les jambes.'] },
  copenhagen: { n: 'Copenhagen plank', eq: 'bw', yt: 'copenhagen plank beginner', cues: [
    'Planche latérale, genou du dessus posé sur un banc (version facile) ou cheville (version dure).',
    'Soulève les hanches, corps aligné.',
    'Tiens la position. Renforce les adducteurs (prévention des blessures au soccer).'] },
  pushup: { n: 'Pompes', img: 'Pushups', eq: 'bw', yt: 'push up technique', cues: [
    'Mains sous les épaules, corps gainé de la tête aux talons.',
    'Descends la poitrine près du sol, coudes à 45°.',
    'Pousse jusqu’aux bras tendus.'] },

  // ---------- Mobilité : échauffement ----------
  bike: { n: 'Vélo ou rameur facile', img: 'Bicycling_Stationary', eq: 'mob', yt: '', cues: ['Rythme facile : tu dois pouvoir parler. Le but est d’avoir chaud.'] },
  cat_cow: { n: 'Chat-vache', img: 'Cat_Stretch', eq: 'mob', yt: 'cat cow stretch', cues: [
    'À quatre pattes.', 'Arrondis le dos en expirant, puis creuse-le en inspirant.', 'Mouvement lent, vertèbre par vertèbre.'] },
  hip_9090: { n: '90/90 des hanches', eq: 'mob', yt: '90 90 hip switch', cues: [
    'Assis au sol, une jambe devant pliée à 90°, l’autre derrière à 90°.',
    'Bascule les deux genoux de l’autre côté, sans les mains si possible.',
    'Reste grand, mouvement lent.'] },
  wgs: { n: 'World’s greatest stretch', img: 'Worlds_Greatest_Stretch', eq: 'mob', yt: 'worlds greatest stretch', cues: [
    'Grande fente avant, main opposée au sol.',
    'Coude du côté de la jambe avant vers le sol, puis ouvre le bras vers le plafond.',
    'Change de côté.'] },
  cossack: { n: 'Squat cosaque', eq: 'mob', yt: 'cossack squat', cues: [
    'Pieds très écartés. Descends sur une jambe, l’autre reste tendue, orteils vers le haut.',
    'Talon au sol, poitrine haute.',
    'Passe de l’autre côté lentement.'] },
  ankle: { n: 'Mobilité chevilles (genou au mur)', eq: 'mob', yt: 'knee to wall ankle mobility', cues: [
    'Pied à environ 10 cm du mur.',
    'Amène le genou toucher le mur sans lever le talon.',
    'Recule le pied petit à petit.'] },
  open_book: { n: 'Rotation thoracique « open book »', eq: 'mob', yt: 'open book thoracic rotation', cues: [
    'Couché sur le côté, genoux pliés, bras tendus devant.',
    'Ouvre le bras du dessus vers l’arrière en suivant la main des yeux.',
    'Les genoux restent collés au sol.'] },
  band_pull: { n: 'Écartés avec élastique', img: 'Band_Pull_Apart', eq: 'mob', yt: 'band pull apart', cues: [
    'Élastique tenu bras tendus devant toi.', 'Écarte les mains jusqu’à la poitrine en serrant les omoplates.'] },
  leg_swings: { n: 'Balancés de jambes', eq: 'mob', yt: 'leg swings warm up', cues: [
    'Une main au mur, balance la jambe d’avant en arrière, amplitude croissante.',
    'Puis latéralement, devant toi.'] },

  // ---------- Étirements ----------
  fold: { n: 'Flexion avant debout', img: 'Standing_Hamstring_and_Calf_Stretch', eq: 'mob', yt: 'standing forward fold', cues: [
    'Jambes tendues (genoux pas verrouillés), laisse pendre le buste.', 'Relâche la nuque, respire lentement.'] },
  hip_flexor: { n: 'Fléchisseur de hanche à genou', img: 'Kneeling_Hip_Flexor', eq: 'mob', yt: 'kneeling hip flexor stretch', cues: [
    'Fente, genou arrière au sol.', 'Serre la fesse arrière et avance doucement le bassin.', 'Buste droit.'] },
  pigeon: { n: 'Pigeon', eq: 'mob', yt: 'pigeon stretch', cues: [
    'Jambe avant pliée devant toi au sol, jambe arrière tendue derrière.',
    'Hanches carrées, penche-toi vers l’avant sur les avant-bras.',
    'Respire lentement dans l’étirement de la fesse.'] },
  pec: { n: 'Pectoraux au cadre de porte', eq: 'mob', yt: 'doorway pec stretch', cues: [
    'Avant-bras contre le cadre de porte, coude à hauteur d’épaule.', 'Avance doucement le corps jusqu’à l’étirement.'] },
  lat_stretch: { n: 'Grand dorsal sur banc', eq: 'mob', yt: 'bench lat stretch', cues: [
    'À genoux, coudes sur un banc, mains jointes derrière la tête.', 'Laisse descendre la poitrine vers le sol, fesses vers les talons.'] },
  couch: { n: 'Couch stretch', eq: 'mob', yt: 'couch stretch', cues: [
    'Genou au sol contre le mur ou le canapé, tibia vertical contre le mur.',
    'L’autre pied devant, en fente.',
    'Serre la fesse de la jambe arrière et redresse le buste. Intense : progresse doucement.',
    'Le plus important si tu es souvent assis.'] },
  pike_pnf: { n: 'Pince assise (contracter-relâcher)', img: 'Seated_Floor_Hamstring_Stretch', eq: 'mob', yt: 'PNF hamstring stretch seated', cues: [
    'Assis jambes tendues, penche le buste vers l’avant, dos long.',
    'Contracte les ischios 5 s (pousse les talons dans le sol).',
    'Relâche, expire et descends plus loin pendant 15 s. Répète 4 fois.',
    'C’est l’exercice qui va t’amener à toucher tes orteils.'] },
  frog: { n: 'Grenouille', eq: 'mob', yt: 'frog stretch', cues: [
    'À quatre pattes, écarte les genoux au maximum, tibias parallèles.',
    'Recule doucement les hanches vers l’arrière.',
    'Reste relâché, respire.'] },
  deep_squat: { n: 'Squat profond tenu', img: 'Bodyweight_Squat', eq: 'mob', yt: 'deep squat hold mobility', cues: [
    'Descends au fond du squat, talons au sol (tiens un cadre de porte si besoin).',
    'Les coudes poussent les genoux vers l’extérieur, poitrine haute.',
    'Balance-toi doucement d’un côté à l’autre.'] },
  thread: { n: 'Enfilé d’aiguille', eq: 'mob', yt: 'thread the needle stretch', cues: [
    'À quatre pattes, glisse un bras sous l’autre en tournant le haut du dos.',
    'Puis ouvre ce bras vers le plafond. Lentement.'] },
  sphinx: { n: 'Sphinx / cobra', eq: 'mob', yt: 'sphinx pose', cues: [
    'Allongé sur le ventre, appuie-toi sur les avant-bras.',
    'Laisse le bas du dos se cambrer doucement, épaules basses.',
    'Si c’est facile, tends les bras (cobra).'] },
  calf_wall: { n: 'Mollets au mur', img: 'Calf_Stretch_Hands_Against_Wall', eq: 'mob', yt: 'calf stretch wall', cues: [
    'Mains au mur, une jambe derrière, talon au sol.',
    '30 s jambe tendue, puis 30 s genou plié.'] },
};

// ---------- Routines de mobilité ----------
// reps : '8', '5/côté', '3min' ; hold : secondes par côté (étirements)
export const WARMUP = [
  { id: 'bike', reps: '3min' }, { id: 'cat_cow', reps: '8' }, { id: 'hip_9090', reps: '8/côté' },
  { id: 'wgs', reps: '5/côté' }, { id: 'cossack', reps: '5/côté' }, { id: 'ankle', reps: '10/côté' },
  { id: 'open_book', reps: '6/côté' }, { id: 'band_pull', reps: '15' }, { id: 'leg_swings', reps: '10/côté' },
];
export const WARMUP_SHORT = [
  { id: 'bike', reps: '2min' }, { id: 'cat_cow', reps: '8' }, { id: 'wgs', reps: '5/côté' },
  { id: 'cossack', reps: '5/côté' }, { id: 'leg_swings', reps: '10/côté' },
];
const COOL = {
  A: ['fold', 'hip_flexor', 'pigeon'],
  B: ['pec', 'lat_stretch', 'thread'],
  C: ['fold', 'hip_flexor', 'pigeon', 'calf_wall'],
  L: ['fold', 'hip_flexor', 'pec'],
  R: ['pec', 'lat_stretch'],
};
export const HOME = [
  { id: 'couch', hold: 45, sides: true },
  { id: 'pigeon', hold: 45, sides: true },
  { id: 'pike_pnf', hold: 80 },
  { id: 'frog', hold: 60 },
  { id: 'deep_squat', hold: 60 },
  { id: 'thread', hold: 30, sides: true },
  { id: 'sphinx', hold: 45 },
  { id: 'pec', hold: 45, sides: true },
  { id: 'calf_wall', hold: 60, sides: true },
];

// ---------- Séances ----------
// x(id, séries, reps, effort, repos (s), étiquette superset)
const x = (id, sets, reps, rpe = '', rest = 90, ss = '') => ({ id, sets, reps, rpe, rest, ss });

const TITLES = {
  A: 'Séance A · Bas du corps + puissance',
  B: 'Séance B · Haut du corps',
  C: 'Séance C · Athlétique',
  L: 'Séance allégée',
  R: 'Haut du corps léger (récupération)',
};
export const titleOf = t => TITLES[t];

function main(type, phase, week) {
  if (type === 'R') return [
    { name: 'Haut du corps léger · RPE 6', items: [
      x('db_bench', 3, '10', 'RPE 6', 90), x('lat_pulldown', 3, '10', 'RPE 6', 90),
      x('cable_row', 3, '12', 'RPE 6', 60, 'A1'), x('lat_raise', 2, '15', 'RPE 6', 60, 'A2'),
      x('face_pull', 2, '15', 'RPE 6', 60)] }];

  if (type === 'L') {
    const early = phase === 'recup' || phase === 'reprise' || (phase === 'fond' && week <= 2);
    const rpe = phase === 'reprise' ? 'RPE 6' : 'RPE 7';
    return [
      { name: 'Force', items: [
        x(early ? 'goblet_squat' : 'back_squat', 3, '5', rpe, 150),
        x(early ? 'db_bench' : 'bench', 3, '5', rpe, 150)] },
      { name: 'Supersets', items: [
        x('rdl', 3, '8', rpe, 20, 'A1'), x('pullup', 3, '6-8', rpe, 90, 'A2'),
        x('lunge', 2, '10/jambe', rpe, 20, 'B1'), x('db_row', 2, '10', rpe, 75, 'B2')] }];
  }

  if (phase === 'fond') {
    if (type === 'A') return [
      { name: 'Puissance', items: [x('box_jump', 3, '5', 'explosif', 75), x('pogo', 3, '15s', 'rapide', 60)] },
      { name: 'Force', items: [
        x(week <= 2 ? 'goblet_squat' : 'back_squat', 3, '6-8', 'RPE 7', 150), x('rdl', 3, '8-10', 'RPE 7', 120)] },
      { name: 'Hypertrophie', items: [
        x('bulgarian', 3, '8-10/jambe', 'RPE 8', 20, 'A1'), x('db_row', 3, '10-12', 'RPE 8', 75, 'A2'),
        x('calf', 3, '12-15', 'RPE 8', 20, 'B1'), x('pallof', 3, '10/côté', 'contrôlé', 60, 'B2')] }];
    if (type === 'B') return [
      { name: 'Puissance', items: [x('mb_chest', 3, '5', 'explosif', 60), x('mb_rot', 3, '5/côté', 'explosif', 60)] },
      { name: 'Force', items: [x('db_bench', 3, '6-8', 'RPE 7', 120), x('pullup', 3, '6-8', 'RPE 7', 120)] },
      { name: 'Hypertrophie', items: [
        x('db_ohp', 3, '10-12', 'RPE 8', 20, 'A1'), x('cable_row', 3, '10-12', 'RPE 8', 75, 'A2'),
        x('lat_raise', 3, '12-15', 'RPE 8', 20, 'B1'), x('face_pull', 3, '12-15', 'RPE 8', 60, 'B2'),
        x('db_curl', 2, '12-15', 'RPE 8', 20, 'C1'), x('tri', 2, '12-15', 'RPE 8', 60, 'C2')] }];
    if (type === 'C') return [
      { name: 'Puissance', items: [
        x('broad_jump', 3, '4', 'explosif', 75), x('lateral_bound', 3, '4/côté', 'explosif', 60),
        x('sprint_acc', 5, '15m', '90 %', 75)] },
      { name: 'Force', items: [x('trapbar', 3, '5-6', 'RPE 7', 150), x('incline_db', 3, '8-10', 'RPE 7', 120)] },
      { name: 'Hypertrophie', items: [
        x('lunge', 3, '10/jambe', 'RPE 8', 20, 'A1'), x('chinup', 3, 'max', 'propre', 75, 'A2'),
        x('nordic', 3, '4-6', 'contrôlé', 20, 'B1'), x('farmer', 3, '30m', 'lourd', 75, 'B2')] }];
  }

  if (phase === 'force') {
    if (type === 'A') return [
      { name: 'Puissance', items: [x('hurdle_hops', 4, '4', 'explosif', 75), x('pogo', 3, '15s', 'rapide', 60)] },
      { name: 'Force', items: [x('back_squat', 4, '5', 'RPE 7-8', 180), x('rdl', 3, '6-8', 'RPE 7-8', 150)] },
      { name: 'Hypertrophie', items: [
        x('bulgarian', 3, '8/jambe', 'RPE 8', 20, 'A1'), x('db_row', 3, '8-10', 'RPE 8', 75, 'A2'),
        x('calf', 3, '10-12', 'RPE 8', 20, 'B1'), x('pallof', 3, '10/côté', 'contrôlé', 60, 'B2')] }];
    if (type === 'B') return [
      { name: 'Puissance', items: [x('mb_chest', 3, '5', 'explosif', 60), x('mb_rot', 3, '5/côté', 'explosif', 60)] },
      { name: 'Force', items: [x('bench', 4, '5', 'RPE 7-8', 180), x('pullup', 4, '5', 'RPE 8', 150)] },
      { name: 'Hypertrophie', items: [
        x('db_ohp', 3, '8-10', 'RPE 8', 20, 'A1'), x('cable_row', 3, '10-12', 'RPE 8', 75, 'A2'),
        x('lat_raise', 3, '12-15', 'RPE 8', 20, 'B1'), x('face_pull', 3, '12-15', 'RPE 8', 60, 'B2'),
        x('db_curl', 2, '10-12', 'RPE 8', 20, 'C1'), x('tri', 2, '10-12', 'RPE 8', 60, 'C2')] }];
    if (type === 'C') return [
      { name: 'Puissance', items: [
        x('sprint_20', 6, '20m', '95 %', 90), x('cod', 4, '1', 'vif', 90), x('broad_jump', 3, '3', 'explosif', 75)] },
      { name: 'Force', items: [x('trapbar', 4, '4-5', 'RPE 8', 180), x('incline_db', 3, '8', 'RPE 8', 120)] },
      { name: 'Hypertrophie', items: [
        x('lunge', 3, '8/jambe', 'RPE 8', 20, 'A1'), x('chinup', 3, 'max', 'propre', 75, 'A2'),
        x('nordic', 3, '5-6', 'contrôlé', 20, 'B1'), x('copenhagen', 3, '20s/côté', 'tenir', 60, 'B2')] }];
  }

  if (phase === 'puiss') {
    if (type === 'A') return [
      { name: 'Puissance', items: [x('depth_jump', 3, '4', 'explosif', 90)] },
      { name: 'Contraste : squat lourd puis sauts', items: [
        x('back_squat', 4, '3', 'RPE 8', 15, 'A1'), x('box_jump', 4, '3', 'explosif', 180, 'A2')] },
      { name: 'Hypertrophie', items: [
        x('bulgarian', 3, '8/jambe', 'RPE 8', 90),
        x('rdl', 3, '6-8', 'RPE 8', 20, 'B1'), x('calf', 3, '10-12', 'RPE 8', 75, 'B2'),
        x('pallof', 3, '10/côté', 'contrôlé', 45)] }];
    if (type === 'B') return [
      { name: 'Contraste : développé lourd puis lancers', items: [
        x('bench', 4, '4', 'RPE 8', 15, 'A1'), x('mb_chest', 4, '3', 'explosif', 150, 'A2')] },
      { name: 'Force', items: [x('pullup', 4, '5', 'RPE 8', 150)] },
      { name: 'Hypertrophie', items: [
        x('db_ohp', 3, '8-10', 'RPE 8', 20, 'B1'), x('cable_row', 3, '10-12', 'RPE 8', 75, 'B2'),
        x('lat_raise', 3, '12-15', 'RPE 8', 20, 'C1'), x('face_pull', 3, '12-15', 'RPE 8', 60, 'C2'),
        x('db_curl', 2, '10-12', 'RPE 8', 20, 'D1'), x('tri', 2, '10-12', 'RPE 8', 60, 'D2')] }];
    if (type === 'C') return [
      { name: 'Vitesse et agilité', items: [
        x('sprint_fly', 4, '20m', 'max', 150), x('cod', 4, '1', 'vif', 90), x('lateral_bound', 3, '4/côté', 'explosif', 60)] },
      { name: 'Force-vitesse', items: [x('trapbar_jump', 4, '4', 'explosif', 90), x('trapbar', 3, '3', 'RPE 8', 180)] },
      { name: 'Hypertrophie', items: [
        x('chinup', 3, 'max', 'propre', 20, 'A1'), x('nordic', 3, '5-6', 'contrôlé', 75, 'A2'),
        x('farmer', 3, '30m', 'lourd', 60)] }];
  }
  return [];
}

export function buildSession(type, ctx) {
  const blocks = [];
  const short = type === 'L' || type === 'R';
  blocks.push({ name: 'Échauffement et mobilité', kind: 'mob',
    items: (short ? WARMUP_SHORT : WARMUP).map(w => ({ ...w, sets: 1 })) });
  // A/B/C choisies à la main pendant la récupération → version Fondation semaine 1
  const early = ['recup', 'reprise'].includes(ctx.phase) && 'ABC'.includes(type);
  for (const b of main(type, early ? 'fond' : ctx.phase, early ? 1 : ctx.week)) {
    const items = b.items.map(it => ({ ...it, sets: ctx.deload ? Math.max(2, it.sets - 1) : it.sets }));
    blocks.push({ ...b, items });
  }
  blocks.push({ name: 'Retour au calme · 2 × 30–45 s par étirement', kind: 'mob',
    items: (COOL[type] || COOL.L).map(id => ({ id, reps: '2 × 40s', sets: 1 })) });
  return { type, title: TITLES[type], blocks };
}

// ---------- Calendrier ----------
export const PHASES = [
  { key: 'recup',   name: 'Récupération',     start: '2026-10-12', end: '2026-10-18' },
  { key: 'reprise', name: 'Reprise (intras)', start: '2026-10-19', end: '2026-10-25' },
  { key: 'fond',    name: 'Fondation',        start: '2026-10-26', end: '2026-11-22' },
  { key: 'force',   name: 'Force',            start: '2026-11-23', end: '2026-12-20' },
  { key: 'fetes',   name: 'Pause des fêtes',  start: '2026-12-21', end: '2027-01-03' },
  { key: 'puiss',   name: 'Puissance',        start: '2027-01-04', end: '2027-01-31' },
];
// Après le 1er février 2027 : alternance Force (4 sem.) / Puissance (4 sem.)
export const CYCLE_START = '2027-02-01';
// Semaines d'examens (lundi) → version allégée
export const EXAM_WEEKS = ['2026-12-07', '2026-12-14'];

export const DESC = {
  recup: 'Le corps récupère du marathon. Marche, mobilité douce, rien de lourd pour les jambes.',
  reprise: 'Semaine d’intras : 2 séances légères pour reprendre l’habitude, sans sauts.',
  fond: 'Apprendre les mouvements, construire la base. Le déficit commence.',
  force: 'Charges plus lourdes, sprints courts, changements de direction.',
  fetes: 'Séances libres, alimentation à maintien. Profite.',
  puiss: 'Lourd + explosif enchaînés, vitesse et agilité.',
};
