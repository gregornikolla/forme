// Bibliothèque d'exercices.
// img = dossier de free-exercise-db (domaine public), copié dans img/<id>/0.jpg et 1.jpg
// eq = équipement · mu / mu2 = muscles principaux / secondaires · cat = force | power | cardio | mob
// lt = type de saisie : wr charge×reps · r reps · bw lest×reps · time secondes · dist mètres · wd charge×mètres

export const MUSCLES = {
  chest: 'Pectoraux', back: 'Dos', lower_back: 'Lombaires', traps: 'Trapèzes', shoulders: 'Épaules',
  biceps: 'Biceps', triceps: 'Triceps', forearms: 'Avant-bras', abs: 'Abdos', quads: 'Quadriceps',
  hams: 'Ischios', glutes: 'Fessiers', calves: 'Mollets', adductors: 'Adducteurs', abductors: 'Abducteurs',
  hips: 'Hanches', cardio: 'Cardio', full: 'Corps entier',
};
export const GROUPS = [
  { k: 'chest', n: 'Pectoraux', mu: ['chest'] },
  { k: 'back', n: 'Dos', mu: ['back', 'lower_back', 'traps'] },
  { k: 'shoulders', n: 'Épaules', mu: ['shoulders'] },
  { k: 'arms', n: 'Bras', mu: ['biceps', 'triceps', 'forearms'] },
  { k: 'legs', n: 'Jambes', mu: ['quads', 'hams', 'glutes', 'calves', 'adductors', 'abductors'] },
  { k: 'abs', n: 'Abdos', mu: ['abs'] },
  { k: 'power', n: 'Puissance', cat: ['power'] },
  { k: 'cardio', n: 'Cardio', cat: ['cardio'] },
  { k: 'mob', n: 'Mobilité', cat: ['mob'] },
];
export const EQUIP = {
  barbell: 'Barre', dumbbell: 'Haltères', cable: 'Poulie', machine: 'Machine', kettlebell: 'Kettlebell',
  bodyweight: 'Poids du corps', band: 'Élastique', ball: 'Médecine-ball', other: 'Autre', mob: 'Aucun',
};

const e = (n, img, eq, mu, mu2, lt, cues, yt, x = {}) =>
  ({ n, img, eq, mu: mu.split(' '), mu2: mu2 ? mu2.split(' ') : [], lt, cues, yt, cat: 'force', ...x });
const P = { cat: 'power' }, C = { cat: 'cardio' }, M = { cat: 'mob' };

export const EX = {
  // ---------- Puissance ----------
  box_jump: e('Box jump', 'Front_Box_Jump', 'bodyweight', 'quads glutes', 'calves hams', 'r', [
    'Pieds largeur de hanches, balance les bras vers l’arrière en pliant les hanches.',
    'Saute en lançant les bras vers le haut, atterris en douceur sur la boîte, genoux alignés avec les pieds.',
    'Redescends en marchant, pas en sautant.',
    'Chaque saut = effort maximal. 5–10 s de pause entre les reps.'], 'box jump technique', P),
  pogo: e('Pogo hops', null, 'bodyweight', 'calves', 'quads', 'time', [
    'Petits sauts rapides sur place, jambes presque tendues.',
    'Chevilles « raides » comme un ressort : le moins de temps possible au sol.',
    'Reste sur l’avant du pied, bras détendus.'], 'pogo hops plyometric', P),
  cmj: e('Saut vertical (CMJ)', 'Freehand_Jump_Squat', 'bodyweight', 'quads glutes', 'calves hams', 'r', [
    'Debout, pieds largeur de hanches. Descends vite en quart de squat en lançant les bras vers l’arrière.',
    'Enchaîne sans pause et saute le plus haut possible, bras vers le plafond.',
    'Atterris en douceur, genoux alignés avec les pieds, et replace-toi. Chaque saut = effort maximal.'], 'countermovement jump technique', P),
  drop_jump: e('Drop jump', 'Linear_Depth_Jump', 'bodyweight', 'quads calves', 'glutes', 'r', [
    'Debout sur une boîte basse (20–30 cm), fais un pas dans le vide.',
    'Rebondis aussitôt le plus haut possible : contact au sol très court, comme sur des ressorts.',
    'Si tes talons s’écrasent au sol ou si le contact est long, la boîte est trop haute.'], 'drop jump reactive strength', P),
  hurdle_hops: e('Sauts de haies enchaînés', 'Hurdle_Hops', 'bodyweight', 'quads calves', 'glutes', 'r', [
    'Aligne 4–5 petites haies ou cônes, espacés d’environ 1 m.',
    'Saute par-dessus chacun en enchaînant, contact au sol court.',
    'Monte les genoux, atterris sur l’avant du pied.'], 'hurdle hops plyometric', P),
  depth_jump: e('Depth jump', 'Linear_Depth_Jump', 'bodyweight', 'quads glutes', 'calves', 'r', [
    'Debout sur une boîte d’environ 30 cm, fais un pas dans le vide (ne saute pas vers le bas).',
    'Dès que tes pieds touchent le sol, rebondis le plus haut possible.',
    'Contact au sol le plus court possible. La qualité compte plus que le nombre.'], 'depth jump technique', P),
  mb_chest: e('Lancer médecine-ball poitrine', 'Medicine_Ball_Chest_Pass', 'ball', 'chest triceps', 'shoulders', 'r', [
    'Face au mur à environ 2 m, ballon de 4–6 kg à la poitrine.',
    'Pousse avec les jambes et lance le ballon le plus fort possible dans le mur.',
    'Rattrape, replace-toi, recommence. Vitesse maximale.'], 'medicine ball chest pass wall', P),
  mb_rot: e('Lancer médecine-ball rotation', null, 'ball', 'abs', 'shoulders glutes', 'r', [
    'De profil au mur, ballon à la hanche arrière.',
    'Pivote les hanches puis le tronc, et lance le ballon contre le mur.',
    'La puissance vient des hanches, pas des bras. Fais les deux côtés.'], 'medicine ball rotational scoop toss', P),
  broad_jump: e('Saut en longueur sans élan', 'Standing_Long_Jump', 'bodyweight', 'glutes quads', 'hams calves', 'r', [
    'Pieds largeur de hanches, balancier des bras.',
    'Saute le plus loin possible vers l’avant.',
    'Atterris genoux fléchis et tiens la réception 2 s sans bouger.'], 'standing broad jump technique', P),
  lateral_bound: e('Bonds latéraux', 'Lateral_Bound', 'bodyweight', 'glutes', 'adductors quads', 'r', [
    'Sur une jambe, pousse sur le côté le plus loin possible.',
    'Atterris sur l’autre jambe et tiens 1 s, stable.',
    'Alterne les côtés.'], 'lateral bound skater jump', P),
  sprint_acc: e('Accélérations', null, 'bodyweight', 'quads glutes', 'hams calves', 'dist', [
    'Départ debout, un pied devant, corps penché vers l’avant.',
    'Pousse fort dans le sol, bras puissants, à 90 %.',
    'Retour en marchant. Pas d’espace ? Poussée de traîneau.'], 'sprint acceleration technique', P),
  sprint_20: e('Sprint', null, 'bodyweight', 'hams glutes', 'quads calves', 'dist', [
    'Départ en position de 3 appuis ou debout.',
    'À 95 %, en restant relâché (mâchoire et épaules détendues).',
    'Repos complet : 90 s à 2 min.'], 'sprint acceleration technique', P),
  sprint_fly: e('Sprint lancé', null, 'bodyweight', 'hams glutes', 'quads calves', 'dist', [
    '20 m d’élan progressif, puis la distance à vitesse maximale.',
    'Reste grand, relâché, bras rapides.',
    'Repos complet de 2–3 min.'], 'flying sprint 20m', P),
  cod: e('Drill 5-10-5', null, 'bodyweight', 'quads glutes', 'adductors calves', 'r', [
    '3 cônes alignés à 5 m d’écart. Départ au cône du milieu.',
    'Sprint 5 m d’un côté, touche la ligne, 10 m de l’autre côté, touche, 5 m pour revenir au centre.',
    'Abaisse les hanches avant chaque changement de direction. Alterne le côté de départ.'], 'pro agility 5-10-5 drill', P),
  trapbar_jump: e('Saut trap bar', 'Weighted_Jump_Squat', 'barbell', 'quads glutes', 'calves', 'wr', [
    'Trap bar chargée légèrement (20–30 % de ton soulevé de terre).',
    'Descends en quart de squat et saute le plus haut possible.',
    'Atterris en douceur, replace-toi entre chaque rep.'], 'trap bar jump', P),
  jump_squat: e('Squat sauté', 'Freehand_Jump_Squat', 'bodyweight', 'quads glutes', 'calves', 'r', [
    'Descends en demi-squat, bras vers l’arrière.',
    'Saute le plus haut possible en lançant les bras.',
    'Atterris en douceur et enchaîne.'], 'jump squat technique', P),
  tuck_jump: e('Saut genoux-poitrine', 'Knee_Tuck_Jump', 'bodyweight', 'quads', 'abs calves', 'r', [
    'Saute en ramenant les genoux vers la poitrine.',
    'Atterris sur l’avant du pied, genoux souples, et rebondis aussitôt.'], 'tuck jump', P),
  split_jump: e('Fentes sautées', 'Split_Jump', 'bodyweight', 'quads glutes', 'calves', 'r', [
    'Position de fente, buste droit.',
    'Saute et inverse les jambes en l’air.',
    'Atterris en douceur directement en fente.'], 'split jump lunge', P),
  bench_jump: e('Sauts latéraux sur banc', 'Bench_Jump', 'bodyweight', 'quads', 'calves glutes', 'r', [
    'Debout à côté d’un banc bas, pieds joints.',
    'Saute par-dessus d’un côté puis de l’autre, rapidement.'], 'lateral bench jump', P),
  slam: e('Slam médecine-ball', 'Overhead_Slam', 'ball', 'abs shoulders', 'back', 'r', [
    'Ballon au-dessus de la tête, sur la pointe des pieds.',
    'Frappe le ballon au sol de toutes tes forces en fléchissant les hanches.',
    'Rattrape au rebond et recommence.'], 'medicine ball slam', P),
  mb_scoop: e('Lancer médecine-ball vers l’avant', 'Medicine_Ball_Scoop_Throw', 'ball', 'glutes shoulders', 'hams', 'r', [
    'Ballon entre les jambes, hanches fléchies.',
    'Pousse avec les hanches et lance le ballon vers l’avant et le haut.'], 'medicine ball scoop throw', P),
  power_clean: e('Épaulé (power clean)', 'Power_Clean', 'barbell', 'hams glutes', 'traps quads shoulders', 'wr', [
    'Barre au sol, prise un peu plus large que les jambes, dos plat.',
    'Pousse le sol, puis extension explosive des hanches.',
    'Tire la barre près du corps et reçois-la sur les épaules, coudes hauts.',
    'Technique d’abord : apprends avec une barre légère.'], 'power clean technique beginner', P),
  hang_clean: e('Épaulé suspendu', 'Hang_Clean', 'barbell', 'hams glutes', 'traps quads', 'wr', [
    'Barre au-dessus des genoux, buste penché.',
    'Extension explosive des hanches, haussement d’épaules.',
    'Passe sous la barre et reçois-la sur les épaules.'], 'hang clean technique', P),
  push_press: e('Push press', 'Push_Press', 'barbell', 'shoulders', 'triceps quads', 'wr', [
    'Barre sur l’avant des épaules.',
    'Petite flexion des genoux, puis pousse avec les jambes et les bras.',
    'Verrouille la barre au-dessus de la tête.'], 'push press technique', P),
  kb_swing: e('Kettlebell swing', 'One-Arm_Kettlebell_Swings', 'kettlebell', 'glutes hams', 'lower_back shoulders', 'wr', [
    'Kettlebell entre les jambes, dos plat.',
    'Pousse les hanches vers l’avant de façon explosive : la cloche monte à hauteur d’épaules.',
    'Ce sont les hanches qui travaillent, pas les bras.'], 'kettlebell swing technique', P),
  sled_push: e('Poussée de traîneau', 'Sled_Push', 'other', 'quads glutes', 'calves', 'wd', [
    'Mains sur les poignées, corps penché à 45°.',
    'Pousse avec des pas courts et puissants.'], 'sled push technique', P),

  // ---------- Jambes ----------
  goblet_squat: e('Squat goblet', 'Goblet_Squat', 'dumbbell', 'quads glutes', 'abs', 'wr', [
    'Tiens un haltère contre la poitrine, pieds un peu plus larges que les hanches.',
    'Descends entre tes jambes, poitrine haute, coudes à l’intérieur des genoux.',
    'Talons au sol, remonte en poussant le sol.'], 'goblet squat technique'),
  back_squat: e('Squat barre', 'Barbell_Squat', 'barbell', 'quads glutes', 'hams lower_back', 'wr', [
    'Barre sur le haut du dos, pieds largeur d’épaules, orteils légèrement ouverts.',
    'Inspire, gaine le ventre, descends en poussant les genoux vers l’extérieur.',
    'Descends au moins jusqu’à la cuisse parallèle, dos neutre.',
    'Remonte en poussant le sol. La barre reste au-dessus du milieu du pied.'], 'how to squat barbell beginner',
    { start: 'Première fois : barre vide (20 kg / 45 lb), puis monte par paliers jusqu’à RPE 7.' }),
  front_squat: e('Squat avant', 'Front_Barbell_Squat', 'barbell', 'quads', 'glutes abs', 'wr', [
    'Barre sur l’avant des épaules, coudes hauts.',
    'Descends droit, buste vertical.',
    'Remonte en gardant les coudes hauts.'], 'front squat technique'),
  rdl: e('Soulevé de terre roumain', 'Romanian_Deadlift', 'barbell', 'hams glutes', 'lower_back', 'wr', [
    'Barre en main, jambes légèrement fléchies.',
    'Pousse les fesses vers l’arrière, la barre glisse le long des cuisses.',
    'Descends jusqu’à sentir l’étirement des ischios (sous les genoux), dos plat.',
    'Remonte en serrant les fessiers.'], 'romanian deadlift technique'),
  deadlift: e('Soulevé de terre', 'Barbell_Deadlift', 'barbell', 'hams glutes', 'lower_back back traps', 'wr', [
    'Barre au-dessus du milieu du pied, prise juste à l’extérieur des jambes.',
    'Dos plat, poitrine haute, tibias contre la barre.',
    'Pousse le sol, la barre remonte collée aux jambes. Termine debout, fessiers serrés.'], 'deadlift technique beginner'),
  sumo_deadlift: e('Soulevé de terre sumo', 'Sumo_Deadlift', 'barbell', 'glutes hams', 'adductors quads', 'wr', [
    'Pieds très écartés, orteils vers l’extérieur, prise entre les jambes.',
    'Pousse les genoux vers l’extérieur et le sol vers le bas.'], 'sumo deadlift technique'),
  sldl: e('Soulevé de terre jambes tendues', 'Stiff-Legged_Barbell_Deadlift', 'barbell', 'hams', 'glutes lower_back', 'wr', [
    'Jambes presque tendues, dos plat.',
    'Descends la barre le long des jambes jusqu’à l’étirement des ischios.'], 'stiff leg deadlift'),
  trapbar: e('Soulevé de terre trap bar', 'Trap_Bar_Deadlift', 'barbell', 'quads glutes', 'hams traps', 'wr', [
    'Debout au centre de la trap bar, pieds largeur de hanches.',
    'Descends en poussant les fesses en arrière, saisis les poignées, dos plat, poitrine haute.',
    'Pousse le sol avec les jambes, termine debout en serrant les fessiers.',
    'Redescends en contrôlant.'], 'trap bar deadlift technique',
    { start: 'Première fois : commence vers 60 kg / 135 lb et monte par paliers jusqu’à RPE 7.' }),
  bulgarian: e('Fente bulgare', 'Split_Squat_with_Dumbbells', 'dumbbell', 'quads glutes', 'hams', 'wr', [
    'Pied arrière posé sur un banc, pied avant environ 1 m devant.',
    'Descends le genou arrière vers le sol, buste légèrement penché.',
    'Pousse dans le talon avant pour remonter. Toutes les reps d’une jambe, puis change.'], 'bulgarian split squat dumbbell',
    { note: 'Charge = un haltère par main.' }),
  lunge: e('Fentes marchées haltères', 'Dumbbell_Lunges', 'dumbbell', 'quads glutes', 'hams', 'wr', [
    'Un haltère dans chaque main, grand pas vers l’avant.',
    'Le genou arrière frôle le sol, le buste reste droit.',
    'Pousse dans le talon avant et enchaîne avec l’autre jambe.'], 'dumbbell walking lunge', { note: 'Charge = un haltère par main.' }),
  bb_lunge: e('Fentes barre', 'Barbell_Lunge', 'barbell', 'quads glutes', 'hams', 'wr', [
    'Barre sur le haut du dos, grand pas vers l’avant.',
    'Descends le genou arrière près du sol, puis reviens.'], 'barbell lunge'),
  bw_lunge: e('Fentes marchées', 'Bodyweight_Walking_Lunge', 'bodyweight', 'quads glutes', 'hams', 'r', [
    'Grand pas vers l’avant, genou arrière près du sol.',
    'Enchaîne avec l’autre jambe en avançant.'], 'walking lunge'),
  step_up: e('Step-up haltères', 'Dumbbell_Step_Ups', 'dumbbell', 'quads glutes', 'hams', 'wr', [
    'Pied entier sur un banc ou une boîte.',
    'Monte en poussant dans le talon, sans t’aider de la jambe du bas.'], 'dumbbell step up'),
  leg_press: e('Presse à cuisses', 'Leg_Press', 'machine', 'quads glutes', 'hams', 'wr', [
    'Dos et fesses collés au dossier, pieds largeur de hanches.',
    'Descends jusqu’à environ 90° aux genoux sans décoller le bassin.',
    'Pousse sans verrouiller les genoux.'], 'leg press technique'),
  hack_squat: e('Hack squat', 'Hack_Squat', 'machine', 'quads', 'glutes', 'wr', [
    'Dos contre le dossier, pieds au milieu de la plateforme.',
    'Descends profondément, remonte sans verrouiller.'], 'hack squat machine'),
  smith_squat: e('Squat à la Smith', 'Smith_Machine_Squat', 'machine', 'quads glutes', 'hams', 'wr', [
    'Barre sur le haut du dos, pieds légèrement devant.',
    'Descends à la parallèle, remonte en poussant le sol.'], 'smith machine squat'),
  leg_ext: e('Leg extension', 'Leg_Extensions', 'machine', 'quads', '', 'wr', [
    'Dos contre le dossier, rouleau sur le bas des tibias.',
    'Tends les jambes, serre 1 s en haut, redescends lentement.'], 'leg extension machine'),
  leg_curl: e('Leg curl couché', 'Lying_Leg_Curls', 'machine', 'hams', 'calves', 'wr', [
    'Allongé sur le ventre, rouleau au-dessus des talons.',
    'Ramène les talons vers les fesses, hanches collées au banc.'], 'lying leg curl'),
  seated_leg_curl: e('Leg curl assis', 'Seated_Leg_Curl', 'machine', 'hams', '', 'wr', [
    'Cuisses bloquées, rouleau sous les mollets.',
    'Plie les genoux au maximum, remonte lentement.'], 'seated leg curl'),
  hip_thrust: e('Hip thrust barre', 'Barbell_Hip_Thrust', 'barbell', 'glutes', 'hams', 'wr', [
    'Haut du dos contre un banc, barre (avec coussin) sur les hanches.',
    'Pousse les hanches vers le haut jusqu’à l’alignement épaules-genoux.',
    'Serre les fessiers 1 s en haut, menton rentré.'], 'barbell hip thrust'),
  glute_bridge: e('Pont fessier barre', 'Barbell_Glute_Bridge', 'barbell', 'glutes', 'hams', 'wr', [
    'Allongé au sol, barre sur les hanches, pieds proches des fesses.',
    'Monte les hanches en serrant les fessiers.'], 'barbell glute bridge'),
  sl_bridge: e('Pont fessier une jambe', 'Single_Leg_Glute_Bridge', 'bodyweight', 'glutes', 'hams', 'r', [
    'Allongé, un pied au sol, l’autre jambe tendue.',
    'Monte les hanches avec la jambe au sol, bassin à l’horizontale.'], 'single leg glute bridge'),
  glute_kick: e('Kickback fessier', 'Glute_Kickback', 'bodyweight', 'glutes', 'hams', 'r', [
    'À quatre pattes, pousse un talon vers le plafond.',
    'Serre la fesse en haut sans cambrer le dos.'], 'glute kickback'),
  pull_through: e('Pull-through à la poulie', 'Pull_Through', 'cable', 'glutes', 'hams', 'wr', [
    'Dos à la poulie basse, corde entre les jambes.',
    'Pousse les fesses vers l’arrière, puis les hanches vers l’avant en serrant les fessiers.'], 'cable pull through'),
  good_morning: e('Good morning', 'Good_Morning', 'barbell', 'hams', 'lower_back glutes', 'wr', [
    'Barre sur le haut du dos, genoux légèrement fléchis.',
    'Penche le buste en poussant les fesses en arrière, dos plat.',
    'Commence léger.'], 'good morning exercise'),
  calf: e('Mollets debout', 'Standing_Calf_Raises', 'machine', 'calves', '', 'wr', [
    'Avant du pied sur une marche, talons dans le vide.',
    'Monte le plus haut possible, pause 1 s.',
    'Descends lentement, pause 2 s en bas, en étirement.'], 'standing calf raise full range'),
  seated_calf: e('Mollets assis', 'Seated_Calf_Raise', 'machine', 'calves', '', 'wr', [
    'Genoux sous le coussin, avant du pied sur la plateforme.',
    'Monte au maximum, descends en étirement complet.'], 'seated calf raise'),
  adductor: e('Machine adducteurs', 'Thigh_Adductor', 'machine', 'adductors', '', 'wr', [
    'Ramène les jambes l’une vers l’autre en contrôlant.', 'Reviens lentement en ouverture.'], 'adductor machine'),
  abductor: e('Machine abducteurs', 'Thigh_Abductor', 'machine', 'abductors', 'glutes', 'wr', [
    'Écarte les jambes contre la résistance.', 'Reviens lentement.'], 'abductor machine'),
  nordic: e('Nordic curl', 'Natural_Glute_Ham_Raise', 'bodyweight', 'hams', 'glutes', 'r', [
    'À genoux, chevilles bloquées (partenaire, banc ou machine).',
    'Descends le buste vers l’avant le plus lentement possible, corps droit.',
    'Rattrape-toi avec les mains et repousse pour remonter.'], 'nordic hamstring curl beginner'),
  copenhagen: e('Copenhagen adducteurs', null, 'bodyweight', 'adductors', 'abs', 'r', [
    'Planche latérale sur l’avant-bras, jambe du dessus posée sur un banc : genou (facile) ou cheville (difficile).',
    'Monte les hanches en serrant la jambe du dessus contre le banc, corps aligné.',
    'Redescends lentement en 2–3 s sans toucher le sol. Toutes les reps d’un côté, puis change.'], 'copenhagen adduction exercise'),
  back_ext: e('Extensions lombaires', 'Hyperextensions_Back_Extensions', 'bodyweight', 'lower_back', 'glutes hams', 'r', [
    'Hanches sur le coussin, chevilles bloquées.',
    'Descends le buste, remonte jusqu’à l’alignement, sans hyper-cambrer.'], 'back extension technique'),

  // ---------- Pectoraux ----------
  bench: e('Développé couché barre', 'Barbell_Bench_Press_-_Medium_Grip', 'barbell', 'chest', 'triceps shoulders', 'wr', [
    'Yeux sous la barre, omoplates serrées et basses, pieds ancrés au sol.',
    'Prise un peu plus large que les épaules.',
    'Descends la barre au bas des pectoraux, coudes à environ 45°, puis pousse.',
    'Demande à quelqu’un de te parer sur les séries lourdes.'], 'bench press technique beginner',
    { start: 'Première fois : barre vide, puis monte par paliers.' }),
  incline_bench: e('Développé incliné barre', 'Barbell_Incline_Bench_Press_-_Medium_Grip', 'barbell', 'chest', 'shoulders triceps', 'wr', [
    'Banc incliné à 30–45°, omoplates serrées.',
    'Descends la barre vers le haut de la poitrine, puis pousse.'], 'incline bench press'),
  decline_bench: e('Développé décliné barre', 'Decline_Barbell_Bench_Press', 'barbell', 'chest', 'triceps', 'wr', [
    'Jambes bloquées, banc décliné.', 'Descends la barre au bas des pectoraux et pousse.'], 'decline bench press'),
  db_bench: e('Développé couché haltères', 'Dumbbell_Bench_Press', 'dumbbell', 'chest', 'triceps shoulders', 'wr', [
    'Allongé sur le banc, omoplates serrées, pieds au sol.',
    'Descends les haltères au niveau de la poitrine, coudes à environ 45°.',
    'Pousse vers le haut en contrôlant.'], 'dumbbell bench press technique', { note: 'Charge = un haltère.' }),
  incline_db: e('Développé incliné haltères', 'Incline_Dumbbell_Press', 'dumbbell', 'chest', 'shoulders triceps', 'wr', [
    'Banc incliné à 30°, omoplates serrées.',
    'Descends les haltères vers le haut de la poitrine.',
    'Pousse vers le haut et légèrement vers l’intérieur.'], 'incline dumbbell press', { note: 'Charge = un haltère.' }),
  db_fly: e('Écartés haltères', 'Dumbbell_Flyes', 'dumbbell', 'chest', 'shoulders', 'wr', [
    'Bras presque tendus au-dessus de la poitrine, coudes légèrement fléchis.',
    'Ouvre les bras en arc jusqu’à l’étirement, puis referme.'], 'dumbbell fly'),
  incline_fly: e('Écartés inclinés', 'Incline_Dumbbell_Flyes', 'dumbbell', 'chest', 'shoulders', 'wr', [
    'Banc à 30°, même mouvement que les écartés.', 'Contrôle la descente.'], 'incline dumbbell fly'),
  cable_cross: e('Écartés à la poulie', 'Cable_Crossover', 'cable', 'chest', 'shoulders', 'wr', [
    'Poulies hautes, un pas en avant, buste légèrement penché.',
    'Ramène les mains l’une vers l’autre devant toi, coudes fixes.'], 'cable crossover'),
  pec_deck: e('Pec deck', 'Butterfly', 'machine', 'chest', '', 'wr', [
    'Dos contre le dossier, avant-bras ou mains sur les poignées.',
    'Ramène les bras devant toi, serre 1 s.'], 'pec deck machine'),
  machine_press: e('Développé à la machine', 'Leverage_Chest_Press', 'machine', 'chest', 'triceps shoulders', 'wr', [
    'Poignées à hauteur de poitrine.', 'Pousse sans verrouiller, reviens lentement.'], 'machine chest press'),
  dips_chest: e('Dips pectoraux', 'Dips_-_Chest_Version', 'bodyweight', 'chest', 'triceps shoulders', 'bw', [
    'Aux barres parallèles, buste penché vers l’avant.',
    'Descends jusqu’à ce que les épaules soient sous les coudes, puis pousse.'], 'chest dips technique',
    { note: 'Charge : + lest, − assistance, 0 = poids du corps.' }),
  pushup: e('Pompes', 'Pushups', 'bodyweight', 'chest', 'triceps shoulders', 'r', [
    'Mains sous les épaules, corps gainé de la tête aux talons.',
    'Descends la poitrine près du sol, coudes à 45°.',
    'Pousse jusqu’aux bras tendus.'], 'push up technique'),

  // ---------- Dos ----------
  pullup: e('Tractions', 'Pullups', 'bodyweight', 'back', 'biceps', 'bw', [
    'Prise en pronation, un peu plus large que les épaules.',
    'Tire la poitrine vers la barre en ramenant les coudes vers les hanches.',
    'Redescends bras tendus. Trop dur ? Machine d’assistance (charge négative) ou élastique.'], 'pull up technique',
    { note: 'Charge : + lest, − assistance, 0 = poids du corps.' }),
  chinup: e('Chin-ups', 'Chin-Up', 'bodyweight', 'back', 'biceps', 'bw', [
    'Prise paumes vers toi, largeur d’épaules.',
    'Monte le menton au-dessus de la barre.',
    'Redescends jusqu’aux bras tendus. Arrête la série quand la technique se dégrade.'], 'chin up technique',
    { note: 'Charge : + lest, − assistance, 0 = poids du corps.' }),
  lat_pulldown: e('Tirage vertical', 'Wide-Grip_Lat_Pulldown', 'cable', 'back', 'biceps', 'wr', [
    'Cuisses bloquées sous les coussins, buste légèrement incliné.',
    'Tire la barre vers le haut de la poitrine, coudes vers le bas.',
    'Remonte en contrôlant jusqu’aux bras tendus.'], 'lat pulldown technique'),
  close_pulldown: e('Tirage vertical prise serrée', 'Close-Grip_Front_Lat_Pulldown', 'cable', 'back', 'biceps', 'wr', [
    'Prise serrée, buste légèrement incliné.', 'Tire vers le haut de la poitrine, coudes près du corps.'], 'close grip lat pulldown'),
  straight_pulldown: e('Pull-over à la poulie', 'Straight-Arm_Pulldown', 'cable', 'back', '', 'wr', [
    'Face à la poulie haute, bras tendus.', 'Ramène la barre vers les cuisses en gardant les bras tendus.'], 'straight arm pulldown'),
  db_row: e('Rowing haltère un bras', 'One-Arm_Dumbbell_Row', 'dumbbell', 'back', 'biceps', 'wr', [
    'Main et genou sur un banc, dos plat.',
    'Tire l’haltère vers la hanche, coude près du corps.',
    'Redescends lentement, épaule étirée en bas.'], 'one arm dumbbell row'),
  bb_row: e('Rowing barre', 'Bent_Over_Barbell_Row', 'barbell', 'back', 'biceps lower_back', 'wr', [
    'Buste penché à 45°, dos plat, genoux légèrement fléchis.',
    'Tire la barre vers le nombril en serrant les omoplates.'], 'barbell row technique'),
  db_row2: e('Rowing deux haltères', 'Bent_Over_Two-Dumbbell_Row', 'dumbbell', 'back', 'biceps', 'wr', [
    'Buste penché, dos plat.', 'Tire les deux haltères vers les hanches.'], 'bent over dumbbell row'),
  tbar_row: e('Rowing T-bar', 'T-Bar_Row_with_Handle', 'barbell', 'back', 'biceps', 'wr', [
    'Buste penché, dos plat.', 'Tire la poignée vers la poitrine, serre les omoplates.'], 't bar row'),
  cable_row: e('Rowing câble assis', 'Seated_Cable_Rows', 'cable', 'back', 'biceps', 'wr', [
    'Assis, genoux légèrement fléchis, dos droit.',
    'Tire la poignée vers le nombril en serrant les omoplates.',
    'Laisse les bras s’allonger complètement sans arrondir le dos.'], 'seated cable row'),
  inverted_row: e('Rowing inversé', 'Inverted_Row', 'bodyweight', 'back', 'biceps', 'r', [
    'Sous une barre basse, corps droit, talons au sol.', 'Tire la poitrine vers la barre.'], 'inverted row'),
  rack_pull: e('Rack pull', 'Rack_Pulls', 'barbell', 'back lower_back', 'traps glutes', 'wr', [
    'Barre posée sur les supports à hauteur des genoux.', 'Termine debout, épaules en arrière.'], 'rack pull'),
  shrug: e('Shrugs barre', 'Barbell_Shrug', 'barbell', 'traps', '', 'wr', [
    'Bras tendus, monte les épaules vers les oreilles.', 'Pause 1 s en haut.'], 'barbell shrug'),
  db_shrug: e('Shrugs haltères', 'Dumbbell_Shrug', 'dumbbell', 'traps', '', 'wr', [
    'Haltères le long du corps, monte les épaules.', 'Redescends lentement.'], 'dumbbell shrug'),
  face_pull: e('Face pull', 'Face_Pull', 'cable', 'shoulders', 'traps back', 'wr', [
    'Corde à hauteur des yeux.',
    'Tire vers le visage en écartant les mains, coudes hauts.',
    'Finis avec les mains à côté des oreilles, pause 1 s.'], 'face pull technique'),

  // ---------- Épaules ----------
  ohp: e('Développé militaire barre', 'Standing_Military_Press', 'barbell', 'shoulders', 'triceps', 'wr', [
    'Debout, barre sur l’avant des épaules, fessiers serrés.',
    'Pousse la barre au-dessus de la tête en passant la tête « à travers ».'], 'overhead press technique'),
  seated_ohp: e('Développé militaire assis', 'Seated_Barbell_Military_Press', 'barbell', 'shoulders', 'triceps', 'wr', [
    'Assis, dos contre le dossier.', 'Pousse la barre au-dessus de la tête.'], 'seated barbell overhead press'),
  db_ohp: e('Développé militaire haltères', 'Dumbbell_Shoulder_Press', 'dumbbell', 'shoulders', 'triceps', 'wr', [
    'Assis, dos contre le dossier, haltères à hauteur d’épaules.',
    'Pousse vers le haut sans cambrer le bas du dos.',
    'Redescends jusqu’aux oreilles.'], 'dumbbell shoulder press', { note: 'Charge = un haltère.' }),
  arnold: e('Arnold press', 'Arnold_Dumbbell_Press', 'dumbbell', 'shoulders', 'triceps', 'wr', [
    'Haltères devant le visage, paumes vers toi.', 'Pousse en tournant les paumes vers l’avant.'], 'arnold press'),
  machine_ohp: e('Développé épaules machine', 'Machine_Shoulder_Military_Press', 'machine', 'shoulders', 'triceps', 'wr', [
    'Dos contre le dossier.', 'Pousse vers le haut sans verrouiller.'], 'machine shoulder press'),
  lat_raise: e('Élévations latérales', 'Side_Lateral_Raise', 'dumbbell', 'shoulders', '', 'wr', [
    'Haltères le long du corps, coudes légèrement fléchis.',
    'Monte les bras sur les côtés jusqu’à hauteur d’épaules.',
    'Pas d’élan. Redescends lentement.'], 'lateral raise technique'),
  cable_lat_raise: e('Élévations latérales poulie', 'Cable_Seated_Lateral_Raise', 'cable', 'shoulders', '', 'wr', [
    'Poulie basse, poignée dans la main opposée.', 'Monte le bras sur le côté jusqu’à hauteur d’épaule.'], 'cable lateral raise'),
  front_raise: e('Élévations frontales', 'Front_Dumbbell_Raise', 'dumbbell', 'shoulders', '', 'wr', [
    'Monte les haltères devant toi jusqu’à hauteur d’épaules.', 'Redescends lentement.'], 'front raise'),
  rear_fly: e('Oiseau haltères', 'Reverse_Flyes', 'dumbbell', 'shoulders', 'back traps', 'wr', [
    'Buste penché, dos plat.', 'Ouvre les bras sur les côtés, coudes légèrement fléchis.'], 'reverse dumbbell fly'),
  rear_delt_machine: e('Oiseau machine', 'Reverse_Machine_Flyes', 'machine', 'shoulders', 'back', 'wr', [
    'Face au dossier, bras tendus devant.', 'Ouvre les bras vers l’arrière.'], 'reverse pec deck'),
  upright_row: e('Tirage menton', 'Upright_Barbell_Row', 'barbell', 'shoulders', 'traps', 'wr', [
    'Prise largeur d’épaules.', 'Monte la barre jusqu’au bas de la poitrine, coudes hauts.'], 'upright row'),

  // ---------- Bras ----------
  db_curl: e('Curl haltères', 'Dumbbell_Bicep_Curl', 'dumbbell', 'biceps', 'forearms', 'wr', [
    'Coudes collés au corps.',
    'Monte en tournant la paume vers le haut, serre en haut.',
    'Descends lentement, bras complètement tendus.'], 'dumbbell curl'),
  bb_curl: e('Curl barre', 'Barbell_Curl', 'barbell', 'biceps', 'forearms', 'wr', [
    'Coudes fixes, prise largeur d’épaules.', 'Monte sans balancer le buste.'], 'barbell curl'),
  ez_curl: e('Curl barre EZ', 'EZ-Bar_Curl', 'barbell', 'biceps', 'forearms', 'wr', [
    'Prise sur les parties inclinées de la barre.', 'Coudes fixes, monte et descends lentement.'], 'ez bar curl'),
  hammer: e('Curl marteau', 'Hammer_Curls', 'dumbbell', 'biceps', 'forearms', 'wr', [
    'Paumes face à face.', 'Monte les haltères sans bouger les coudes.'], 'hammer curl'),
  incline_curl: e('Curl incliné', 'Incline_Dumbbell_Curl', 'dumbbell', 'biceps', '', 'wr', [
    'Assis sur un banc incliné, bras pendants.', 'Monte en gardant les coudes en arrière.'], 'incline dumbbell curl'),
  preacher: e('Curl pupitre', 'Preacher_Curl', 'barbell', 'biceps', '', 'wr', [
    'Bras posés sur le pupitre.', 'Monte, puis redescends jusqu’à bras presque tendus.'], 'preacher curl'),
  conc_curl: e('Curl concentré', 'Concentration_Curls', 'dumbbell', 'biceps', '', 'wr', [
    'Assis, coude contre l’intérieur de la cuisse.', 'Monte en serrant le biceps.'], 'concentration curl'),
  rope_hammer: e('Curl marteau à la corde', 'Cable_Hammer_Curls_-_Rope_Attachment', 'cable', 'biceps', 'forearms', 'wr', [
    'Poulie basse, corde en main.', 'Monte en gardant les coudes fixes.'], 'cable rope hammer curl'),
  tri: e('Extension triceps à la corde', 'Triceps_Pushdown_-_Rope_Attachment', 'cable', 'triceps', '', 'wr', [
    'Coudes fixes contre le corps.',
    'Pousse la corde vers le bas en écartant les mains à la fin.',
    'Remonte en contrôlant jusqu’à 90°.'], 'rope triceps pushdown'),
  tri_bar: e('Extension triceps à la barre', 'Triceps_Pushdown', 'cable', 'triceps', '', 'wr', [
    'Coudes collés au corps.', 'Pousse la barre jusqu’aux bras tendus.'], 'triceps pushdown bar'),
  tri_overhead: e('Extension triceps au-dessus de la tête', 'Cable_Rope_Overhead_Triceps_Extension', 'cable', 'triceps', '', 'wr', [
    'Dos à la poulie, corde derrière la tête.', 'Tends les bras vers l’avant et le haut.'], 'overhead cable triceps extension'),
  db_tri_ext: e('Extension triceps haltère', 'Standing_Dumbbell_Triceps_Extension', 'dumbbell', 'triceps', '', 'wr', [
    'Haltère tenu à deux mains au-dessus de la tête.', 'Descends derrière la tête, coudes fixes, et remonte.'], 'dumbbell overhead triceps extension'),
  skull: e('Barre au front', 'EZ-Bar_Skullcrusher', 'barbell', 'triceps', '', 'wr', [
    'Allongé, barre EZ bras tendus.', 'Plie les coudes pour amener la barre vers le front, coudes fixes.'], 'skull crusher'),
  close_bench: e('Développé couché prise serrée', 'Close-Grip_Barbell_Bench_Press', 'barbell', 'triceps', 'chest', 'wr', [
    'Prise largeur d’épaules.', 'Coudes près du corps à la descente.'], 'close grip bench press'),
  kickback: e('Kickback triceps', 'Tricep_Dumbbell_Kickback', 'dumbbell', 'triceps', '', 'wr', [
    'Buste penché, coude collé au corps.', 'Tends le bras vers l’arrière.'], 'dumbbell kickback'),
  dips: e('Dips triceps', 'Dips_-_Triceps_Version', 'bodyweight', 'triceps', 'chest shoulders', 'bw', [
    'Aux barres parallèles, buste droit.', 'Descends jusqu’à 90° aux coudes, puis pousse.'], 'triceps dips',
    { note: 'Charge : + lest, − assistance, 0 = poids du corps.' }),
  bench_dips: e('Dips sur banc', 'Bench_Dips', 'bodyweight', 'triceps', 'chest', 'r', [
    'Mains sur un banc derrière toi, jambes devant.', 'Descends en pliant les coudes, puis pousse.'], 'bench dips'),
  farmer: e('Farmer carry', 'Farmers_Walk', 'dumbbell', 'forearms traps', 'abs', 'wd', [
    'Un haltère lourd dans chaque main.',
    'Marche droit, épaules basses, ventre gainé, petits pas rapides.',
    'Ne laisse pas les haltères toucher les jambes.'], 'farmers carry', { note: 'Charge = un haltère par main.' }),

  // ---------- Abdos ----------
  pallof: e('Pallof press', 'Pallof_Press', 'cable', 'abs', '', 'wr', [
    'De profil à la poulie, poignée contre la poitrine.',
    'Pousse les bras devant toi sans laisser le tronc tourner.',
    'Tiens 2 s, ramène. Fais les deux côtés.'], 'pallof press'),
  plank: e('Planche', 'Plank', 'bodyweight', 'abs', '', 'time', [
    'Sur les avant-bras, corps aligné de la tête aux talons.', 'Serre fessiers et abdos, respire.'], 'plank technique'),
  side_plank: e('Planche latérale', 'Side_Bridge', 'bodyweight', 'abs', '', 'time', [
    'Sur un avant-bras, corps aligné, hanches hautes.', 'Fais les deux côtés.'], 'side plank'),
  crunch: e('Crunch', 'Crunches', 'bodyweight', 'abs', '', 'r', [
    'Allongé, genoux pliés.', 'Enroule le haut du dos vers le bassin, sans tirer sur la nuque.'], 'crunch technique'),
  cable_crunch: e('Crunch à la poulie', 'Cable_Crunch', 'cable', 'abs', '', 'wr', [
    'À genoux, corde derrière la tête.', 'Enroule le buste vers le sol en contractant les abdos.'], 'cable crunch'),
  hanging_raise: e('Relevés de jambes suspendu', 'Hanging_Leg_Raise', 'bodyweight', 'abs', '', 'r', [
    'Suspendu à la barre, sans balancer.', 'Monte les jambes jusqu’à l’horizontale ou plus, redescends lentement.'], 'hanging leg raise'),
  captain: e('Relevés de genoux (chaise romaine)', 'Knee_Hip_Raise_On_Parallel_Bars', 'bodyweight', 'abs', '', 'r', [
    'Avant-bras sur les appuis, dos contre le dossier.', 'Monte les genoux vers la poitrine.'], 'captains chair knee raise'),
  ab_wheel: e('Roue abdominale', 'Ab_Roller', 'other', 'abs', 'shoulders', 'r', [
    'À genoux, mains sur la roue.', 'Roule vers l’avant en gardant le dos plat, puis reviens.'], 'ab wheel rollout'),
  russian: e('Russian twist', 'Russian_Twist', 'bodyweight', 'abs', '', 'r', [
    'Assis, buste incliné, pieds décollés.', 'Tourne le tronc d’un côté à l’autre.'], 'russian twist'),
  dead_bug: e('Dead bug', 'Dead_Bug', 'bodyweight', 'abs', '', 'r', [
    'Sur le dos, bras et genoux vers le plafond.', 'Allonge un bras et la jambe opposée, bas du dos collé au sol.'], 'dead bug exercise'),
  rev_crunch: e('Crunch inversé', 'Reverse_Crunch', 'bodyweight', 'abs', '', 'r', [
    'Allongé, genoux pliés en l’air.', 'Enroule le bassin pour monter les genoux vers la poitrine.'], 'reverse crunch'),
  bicycle: e('Crunch vélo', 'Air_Bike', 'bodyweight', 'abs', '', 'r', [
    'Allongé, mains derrière la tête.', 'Coude vers le genou opposé, en alternant.'], 'bicycle crunch'),
  climbers: e('Mountain climbers', 'Mountain_Climbers', 'bodyweight', 'abs', 'quads shoulders', 'time', [
    'En planche bras tendus.', 'Ramène les genoux vers la poitrine en alternant, rapidement.'], 'mountain climbers', C),

  // ---------- Cardio ----------
  rower: e('Rameur', 'Rowing_Stationary', 'machine', 'cardio', 'back quads', 'time', [
    'Pousse avec les jambes, puis tire avec les bras.', 'Ordre au retour : bras, buste, jambes.'], 'rowing machine technique', C),
  treadmill: e('Tapis de course', 'Jogging_Treadmill', 'machine', 'cardio', 'quads calves', 'time', [
    'Allure de conversation pour l’endurance.', 'Garde une posture grande et relâchée.'], 'treadmill running form', C),
  elliptical: e('Elliptique', 'Elliptical_Trainer', 'machine', 'cardio', 'quads glutes', 'time', [
    'Mouvement fluide, poussée des jambes et des bras.'], 'elliptical trainer', C),
  bike_c: e('Vélo stationnaire', 'Bicycling_Stationary', 'machine', 'cardio', 'quads', 'time', [
    'Selle à hauteur de hanche, jambe presque tendue en bas.'], 'stationary bike', C),
  stairs: e('Escalier (StairMaster)', 'Stairmaster', 'machine', 'cardio', 'glutes quads', 'time', [
    'Sans t’appuyer sur les rampes, buste droit.'], 'stairmaster', C),
  rope: e('Corde à sauter', 'Rope_Jumping', 'other', 'cardio', 'calves', 'time', [
    'Petits sauts sur l’avant du pied.', 'La rotation vient des poignets.'], 'jump rope basics', C),

  // ---------- Mobilité : échauffement ----------
  bike: e('Vélo ou rameur facile', 'Bicycling_Stationary', 'mob', 'cardio', '', 'time', [
    'Rythme facile : tu dois pouvoir parler. Le but est d’avoir chaud.'], '', M),
  cat_cow: e('Chat-vache', 'Cat_Stretch', 'mob', 'lower_back', '', 'time', [
    'À quatre pattes.', 'Arrondis le dos en expirant, puis creuse-le en inspirant.', 'Mouvement lent, vertèbre par vertèbre.'], 'cat cow stretch', M),
  hip_9090: e('90/90 des hanches', null, 'mob', 'hips', 'glutes', 'time', [
    'Assis au sol, une jambe devant pliée à 90°, l’autre derrière à 90°.',
    'Bascule les deux genoux de l’autre côté, sans les mains si possible.',
    'Reste grand, mouvement lent.'], '90 90 hip switch', M),
  wgs: e('World’s greatest stretch', 'Worlds_Greatest_Stretch', 'mob', 'hips', 'hams back', 'time', [
    'Grande fente avant, main opposée au sol.',
    'Coude du côté de la jambe avant vers le sol, puis ouvre le bras vers le plafond.',
    'Change de côté.'], 'worlds greatest stretch', M),
  cossack: e('Squat cosaque', null, 'mob', 'adductors', 'quads', 'time', [
    'Pieds très écartés. Descends sur une jambe, l’autre reste tendue, orteils vers le haut.',
    'Talon au sol, poitrine haute.',
    'Passe de l’autre côté lentement.'], 'cossack squat', M),
  ankle: e('Mobilité chevilles', null, 'mob', 'calves', '', 'time', [
    'Pied à environ 10 cm du mur.',
    'Amène le genou toucher le mur sans lever le talon.',
    'Recule le pied petit à petit.'], 'knee to wall ankle mobility', M),
  open_book: e('Rotation thoracique', null, 'mob', 'back', '', 'time', [
    'Couché sur le côté, genoux pliés, bras tendus devant.',
    'Ouvre le bras du dessus vers l’arrière en suivant la main des yeux.',
    'Les genoux restent collés au sol.'], 'open book thoracic rotation', M),
  band_pull: e('Écartés avec élastique', 'Band_Pull_Apart', 'mob', 'shoulders', 'back', 'time', [
    'Élastique tenu bras tendus devant toi.', 'Écarte les mains jusqu’à la poitrine en serrant les omoplates.'], 'band pull apart', M),
  a_skip: e('A-skips', null, 'mob', 'hips', 'calves', 'time', [
    'Sautille en montant un genou à hauteur de hanche, pied relevé.',
    'Frappe le sol sous la hanche avec l’avant du pied, bras opposé actif.',
    'Rythme d’abord, vitesse ensuite.'], 'A skip sprint drill', M),
  strides: e('Lignes droites progressives', null, 'mob', 'hams', 'quads calves', 'time', [
    'Sur 40–60 m, accélère progressivement jusqu’à environ 80–90 % de ta vitesse.',
    'Reste grand et relâché, retour en marchant.',
    'Chaque ligne droite un peu plus vite que la précédente.'], 'running strides warm up', M),
  leg_swings: e('Balancés de jambes', null, 'mob', 'hips', 'hams', 'time', [
    'Une main au mur, balance la jambe d’avant en arrière, amplitude croissante.',
    'Puis latéralement, devant toi.'], 'leg swings warm up', M),

  // ---------- Étirements ----------
  fold: e('Flexion avant debout', 'Standing_Hamstring_and_Calf_Stretch', 'mob', 'hams', 'calves', 'time', [
    'Jambes tendues (genoux pas verrouillés), laisse pendre le buste.', 'Relâche la nuque, respire lentement.'], 'standing forward fold', M),
  hip_flexor: e('Fléchisseur de hanche', 'Kneeling_Hip_Flexor', 'mob', 'hips', 'quads', 'time', [
    'Fente, genou arrière au sol.', 'Serre la fesse arrière et avance doucement le bassin.', 'Buste droit.'], 'kneeling hip flexor stretch', M),
  pigeon: e('Pigeon', null, 'mob', 'glutes', 'hips', 'time', [
    'Jambe avant pliée devant toi au sol, jambe arrière tendue derrière.',
    'Hanches carrées, penche-toi vers l’avant sur les avant-bras.',
    'Respire lentement dans l’étirement de la fesse.'], 'pigeon stretch', M),
  pec: e('Pectoraux au cadre de porte', null, 'mob', 'chest', 'shoulders', 'time', [
    'Avant-bras contre le cadre de porte, coude à hauteur d’épaule.', 'Avance doucement le corps jusqu’à l’étirement.'], 'doorway pec stretch', M),
  lat_stretch: e('Grand dorsal sur banc', null, 'mob', 'back', 'shoulders', 'time', [
    'À genoux, coudes sur un banc, mains jointes derrière la tête.', 'Laisse descendre la poitrine vers le sol, fesses vers les talons.'], 'bench lat stretch', M),
  couch: e('Couch stretch', null, 'mob', 'quads', 'hips', 'time', [
    'Genou au sol contre le mur ou le canapé, tibia vertical contre le mur.',
    'L’autre pied devant, en fente.',
    'Serre la fesse de la jambe arrière et redresse le buste. Intense : progresse doucement.'], 'couch stretch', M),
  pike_pnf: e('Pince assise contracter-relâcher', 'Seated_Floor_Hamstring_Stretch', 'mob', 'hams', 'lower_back', 'time', [
    'Assis jambes tendues, penche le buste vers l’avant, dos long.',
    'Contracte les ischios 5 s (pousse les talons dans le sol).',
    'Relâche, expire et descends plus loin pendant 15 s. Répète 4 fois.'], 'PNF hamstring stretch seated', M),
  frog: e('Grenouille', null, 'mob', 'adductors', 'hips', 'time', [
    'À quatre pattes, écarte les genoux au maximum, tibias parallèles.',
    'Recule doucement les hanches vers l’arrière.',
    'Reste relâché, respire.'], 'frog stretch', M),
  deep_squat: e('Squat profond tenu', 'Bodyweight_Squat', 'mob', 'hips', 'calves adductors', 'time', [
    'Descends au fond du squat, talons au sol (tiens un cadre de porte si besoin).',
    'Les coudes poussent les genoux vers l’extérieur, poitrine haute.',
    'Balance-toi doucement d’un côté à l’autre.'], 'deep squat hold mobility', M),
  thread: e('Enfilé d’aiguille', null, 'mob', 'back', 'shoulders', 'time', [
    'À quatre pattes, glisse un bras sous l’autre en tournant le haut du dos.',
    'Puis ouvre ce bras vers le plafond. Lentement.'], 'thread the needle stretch', M),
  sphinx: e('Sphinx / cobra', null, 'mob', 'lower_back', 'abs', 'time', [
    'Allongé sur le ventre, appuie-toi sur les avant-bras.',
    'Laisse le bas du dos se cambrer doucement, épaules basses.',
    'Si c’est facile, tends les bras (cobra).'], 'sphinx pose', M),
  calf_wall: e('Mollets au mur', 'Calf_Stretch_Hands_Against_Wall', 'mob', 'calves', '', 'time', [
    'Mains au mur, une jambe derrière, talon au sol.',
    '30 s jambe tendue, puis 30 s genou plié.'], 'calf stretch wall', M),
};

// Pourquoi cet exercice : raison et source principale (affiché dans la fiche)
const WHY = {
  back_squat: 'Le mouvement de base pour la force et le volume des cuisses. Descendre bas développe davantage les fessiers et les adducteurs qu’un demi-squat (Kubo 2019).',
  goblet_squat: 'Version d’apprentissage du squat : la charge devant garde le buste droit. Sert à reprendre les jambes en douceur après le marathon.',
  rdl: 'Charge les ischios en position étirée, là où la croissance musculaire est la plus forte. Base de la chaîne postérieure pour sprinter et sauter.',
  trapbar: 'Moins de contrainte pour le bas du dos qu’à la barre droite, et on y produit plus de force, de vitesse et de puissance (Swinton 2011).',
  bulgarian: 'Une jambe à la fois : corrige les déséquilibres et charge fortement quadriceps et fessiers avec peu de stress pour le dos.',
  seated_leg_curl: 'Assis, hanche fléchie, les ischios travaillent étirés : nettement plus de croissance qu’en leg curl couché (Maeo 2021).',
  nordic: 'Réduit d’environ moitié les blessures aux ischios dans les sports de course (van Dyk 2019, méta-analyse). Quelques séries par semaine suffisent.',
  copenhagen: 'Réduit d’environ 40 % les blessures à l’aine chez les joueurs de soccer (Harøy 2019, essai randomisé).',
  calf: 'Les mollets répondent mieux quand on insiste sur la position étirée : marque la pause en bas (Kassiano 2023). Renforce aussi le tendon d’Achille.',
  hanging_raise: 'Abdos en amplitude complète, en contrôlant le bassin. Renforce aussi la prise et les épaules.',
  ab_wheel: 'Gainage anti-extension parmi les plus exigeants pour les abdos.',
  bench: 'Le mouvement de poussée le plus étudié : force et masse des pectoraux, épaules et triceps.',
  db_bench: 'Plus d’amplitude qu’à la barre et chaque bras travaille seul.',
  incline_db: 'Cible le haut des pectoraux, avec une amplitude complète.',
  dips_chest: 'Pectoraux bas et triceps au poids du corps, progressif avec du lest. Étirement marqué des pectoraux en bas.',
  pullup: 'Le tirage vertical de référence pour la largeur du dos. Ta force par kilo de corps monte aussi en perdant du gras.',
  chinup: 'Paumes vers toi : même tirage vertical, avec plus de travail des biceps.',
  cable_row: 'Tirage horizontal : épaisseur du dos et équilibre avec les mouvements de poussée.',
  db_row: 'Tirage un bras avec grande amplitude, sans stress pour le bas du dos.',
  ohp: 'Debout, barre au-dessus de la tête : force des épaules et gainage de tout le corps. Un classique depuis plus d’un siècle.',
  db_ohp: 'Développé au-dessus de la tête plus facile pour les épaules qu’à la barre.',
  push_press: 'Transmet la poussée des jambes aux bras : puissance de tout le corps, comme en haltérophilie.',
  lat_raise: 'Le deltoïde latéral (largeur des épaules) est peu sollicité par les développés : il a besoin de son propre exercice.',
  face_pull: 'Arrière des épaules et rotateurs externes, souvent négligés : équilibre tous les mouvements de poussée.',
  incline_curl: 'Bras derrière le corps, le biceps travaille étiré, une position favorable à la croissance musculaire.',
  tri_overhead: 'Bras au-dessus de la tête, le long chef du triceps est étiré : nettement plus de croissance qu’à la poulie classique (Maeo 2023).',
  farmer: 'Prise, trapèzes et gainage sous charge lourde. Simple et très efficace.',
  pogo: 'Rend chevilles et tendons plus « élastiques » : la base de la détente et du sprint.',
  cmj: 'Le saut vertical sans élan est le geste de base de la pliométrie, qui améliore la détente de façon fiable (Markovic 2007, méta-analyse).',
  drop_jump: 'Pliométrie réactive : apprend à rebondir vite après une réception, l’une des méthodes les plus efficaces pour la détente (Markovic 2007).',
  depth_jump: 'Version plus haute du drop jump : stimulus réactif maximal. Réservé à la phase Puissance, après des semaines de préparation.',
  hurdle_hops: 'Sauts enchaînés à contact court : force réactive, utile au basket.',
  trapbar_jump: 'Sauter avec une charge légère développe la puissance. Combiné à l’entraînement de force, c’est l’approche la plus efficace (Cormie 2011).',
  broad_jump: 'Puissance horizontale des hanches, liée à l’accélération en sprint.',
  lateral_bound: 'Puissance latérale sur un pied : changements de direction au basket et au soccer.',
  sprint_acc: 'Sprinter est le meilleur entraînement pour la vitesse. Des accélérations courtes d’abord pour préparer les ischios.',
  sprint_20: 'S’exposer régulièrement à la vitesse maximale améliore la vitesse et prépare les ischios à l’effort des matchs.',
  sprint_fly: 'Vitesse maximale pure, sans la phase d’accélération : le travail de vitesse le plus spécifique.',
  cod: 'Freiner et relancer : technique et force des changements de direction, un test standard des sports d’équipe.',
  mb_rot: 'Puissance de rotation des hanches vers le tronc : frappe au soccer, passes et tirs au basket.',
  mb_chest: 'Puissance de poussée du haut du corps, sans phase de freinage en fin de mouvement.',
  a_skip: 'Exercice d’échauffement classique des sprinteurs : posture et pose de pied active.',
  strides: 'Montée progressive vers la vitesse : prépare les ischios avant les sprints.',
  pike_pnf: 'Contracter-relâcher (PNF) : gain d’amplitude au moins égal à l’étirement statique classique.',
  couch: 'Étire le droit fémoral et le psoas, raccourcis par la course et la position assise.',
  deep_squat: 'Hanches, chevilles et adducteurs ensemble : améliore directement ta profondeur de squat.',
  calf_wall: 'Jambe tendue pour le gastrocnémien, genou plié pour le soléaire : la cheville limite souvent la profondeur du squat.',
  frog: 'Adducteurs : souvent la vraie limite de l’écart et du squat profond.',
  pigeon: 'Fessiers et rotateurs de hanche, très sollicités par la course.',
  lat_stretch: 'Un grand dorsal souple permet de lever les bras au-dessus de la tête sans cambrer le dos.',
};
for (const [k, v] of Object.entries(WHY)) EX[k].why = v;

// Peu utiles ou plus risqués que leurs équivalents : gardés pour l'historique, masqués de la bibliothèque
for (const k of ['bench_dips', 'upright_row', 'russian', 'bicycle', 'glute_kick', 'kickback', 'tuck_jump', 'bench_jump'])
  EX[k].hide = true;

// Incrément de charge pour la double progression
const LOWER = ['quads', 'hams', 'glutes'];
export function increment(ex, unit) {
  const kg = unit === 'kg';
  switch (ex.eq) {
    case 'barbell': return ex.mu.some(m => LOWER.includes(m)) ? (kg ? 5 : 10) : (kg ? 2.5 : 5);
    case 'dumbbell': return kg ? 2 : 5;
    case 'machine': return kg ? 5 : 10;
    case 'kettlebell': return kg ? 4 : 5;
    default: return kg ? 2.5 : 5;
  }
}
