/* Exercise library. id|group|equipment(b barbell, d dumbbell, c cable, m machine/Smith, w bodyweight, k kettlebell)|reps|compound|figure pattern|pattern params|uk|ru|en|es */
(function () {
  const E = `
bench|chest|b|6-10|1|bench|g=bb|Жим штанги лежачи|Жим штанги лёжа|Barbell bench press|Press de banca con barra
incline_bench|chest|b|6-10|1|bench|a=30,g=bb|Жим штанги на похилій лаві|Жим штанги на наклонной скамье|Incline barbell bench press|Press inclinado con barra
decline_bench|chest|b|6-10|1|bench|a=-15,g=bb|Жим штанги з негативним нахилом|Жим штанги головой вниз|Decline barbell bench press|Press declinado con barra
db_bench|chest|d|8-12|1|bench|g=db|Жим гантелей лежачи|Жим гантелей лёжа|Dumbbell bench press|Press de banca con mancuernas
incline_db|chest|d|8-12|1|bench|a=30,g=db|Жим гантелей на похилій лаві|Жим гантелей на наклонной скамье|Incline dumbbell press|Press inclinado con mancuernas
decline_db|chest|d|8-12|1|bench|a=-15,g=db|Жим гантелей з негативним нахилом|Жим гантелей головой вниз|Decline dumbbell press|Press declinado con mancuernas
db_neutral|chest|d|8-12|1|bench|g=db,close=1|Жим гантелей нейтральним хватом|Жим гантелей нейтральным хватом|Neutral-grip dumbbell press|Press con mancuernas agarre neutro
floor_press|chest|d|8-12|1|floorpress|g=db|Жим гантелей лежачи на підлозі|Жим гантелей лёжа на полу|Dumbbell floor press|Press en el suelo con mancuernas
smith_bench|chest|m|8-10|1|bench|g=smith|Жим у тренажері Сміта лежачи|Жим в тренажёре Смита лёжа|Smith machine bench press|Press de banca en máquina Smith
smith_incline|chest|m|8-10|1|bench|a=30,g=smith|Жим у Сміті на похилій лаві|Жим в Смите на наклонной скамье|Smith machine incline press|Press inclinado en Smith
chest_press|chest|m|8-12|1|chestpress||Жим від грудей у тренажері|Жим от груди в тренажёре|Machine chest press|Press de pecho en máquina
db_fly|chest|d|10-15|0|fly|g=db|Розведення гантелей лежачи|Разводка гантелей лёжа|Dumbbell flyes|Aperturas con mancuernas
incline_fly|chest|d|10-15|0|fly|a=30,g=db|Розведення гантелей на похилій лаві|Разводка гантелей на наклонной|Incline dumbbell flyes|Aperturas inclinadas
pec_deck|chest|m|10-15|0|pecdeck||Зведення рук у тренажері «метелик»|Сведение рук в тренажёре «бабочка»|Pec deck|Contractora de pecho
cross_high|chest|c|12-15|0|crossover|v=high|Зведення рук у кросовері зверху вниз|Сведение рук в кроссовере сверху вниз|High cable crossover|Cruce de poleas alto
cross_mid|chest|c|12-15|0|crossover|v=mid|Зведення рук у кросовері на рівні грудей|Сведение рук в кроссовере на уровне груди|Mid cable fly|Cruce de poleas medio
cross_low|chest|c|12-15|0|crossover|v=low|Зведення рук у кросовері знизу вгору|Сведение рук в кроссовере снизу вверх|Low-to-high cable fly|Cruce de poleas bajo
pullover|chest|d|10-12|0|pullover|g=db|Пуловер з гантеллю лежачи|Пуловер с гантелей лёжа|Dumbbell pullover|Pullover con mancuerna
svend|chest|d|12-15|0|svend||Жим диска перед собою (Свенд)|Жим блина перед собой (Свенд)|Svend press|Press Svend con disco
pushup|chest|w|8-20|1|pushup||Віджимання від підлоги|Отжимания от пола|Push-ups|Flexiones
pushup_incline|chest|w|10-20|1|pushup|v=incline|Віджимання від лави|Отжимания от скамьи|Incline push-ups|Flexiones inclinadas
pushup_decline|chest|w|8-15|1|pushup|v=decline|Віджимання з ногами на лаві|Отжимания с ногами на скамье|Decline push-ups|Flexiones declinadas
dips_chest|chest|w|6-12|1|dips|chest=1|Віджимання на брусах (на груди)|Отжимания на брусьях (на грудь)|Chest dips|Fondos para pecho
pullup|back|w|5-12|1|pullup||Підтягування широким хватом|Подтягивания широким хватом|Pull-ups|Dominadas
chinup|back|w|5-12|1|pullup||Підтягування зворотним хватом|Подтягивания обратным хватом|Chin-ups|Dominadas supinas
pullup_assist|back|m|8-12|1|pullup|assist=1|Підтягування в гравітроні|Подтягивания в гравитроне|Assisted pull-up machine|Dominadas asistidas en máquina
lat_wide|back|c|8-12|1|pulldown||Тяга верхнього блока широким хватом|Тяга верхнего блока широким хватом|Wide-grip lat pulldown|Jalón al pecho agarre ancho
lat_close|back|c|10-12|1|pulldown|v=close|Тяга верхнього блока вузьким хватом (V-рукоять)|Тяга верхнего блока узким хватом (V-рукоять)|Close-grip V-bar pulldown|Jalón con agarre estrecho en V
lat_under|back|c|10-12|1|pulldown|v=close|Тяга верхнього блока зворотним хватом|Тяга верхнего блока обратным хватом|Underhand lat pulldown|Jalón agarre supino
lat_one|back|c|10-12|0|pulldown|one=1|Тяга верхнього блока однією рукою|Тяга верхнего блока одной рукой|One-arm lat pulldown|Jalón a una mano
straight_pd|back|c|12-15|0|straightarm||Пуловер на блоці прямими руками|Пуловер на блоке прямыми руками|Straight-arm pulldown|Pullover en polea alta
row_bb|back|b|8-10|1|row|g=bb|Тяга штанги в нахилі|Тяга штанги в наклоне|Bent-over barbell row|Remo con barra
row_bb_rev|back|b|8-10|1|row|g=bb|Тяга штанги зворотним хватом|Тяга штанги обратным хватом|Reverse-grip barbell row|Remo con barra agarre supino
pendlay|back|b|6-8|1|row|g=bb,v=pendlay|Тяга Пендлі|Тяга Пендли|Pendlay row|Remo Pendlay
tbar|back|b|8-10|1|row|g=bb|Тяга Т-грифа|Тяга Т-грифа|T-bar row|Remo en barra T
row_smith|back|m|8-10|1|row|g=smith|Тяга в тренажері Сміта в нахилі|Тяга в тренажёре Смита в наклоне|Smith machine row|Remo en máquina Smith
row_db1|back|d|8-12|1|row1||Тяга гантелі однією рукою з опорою|Тяга гантели одной рукой с упором|One-arm dumbbell row|Remo con mancuerna a una mano
row_db2|back|d|10-12|1|row|g=db|Тяга двох гантелей у нахилі|Тяга двух гантелей в наклоне|Bent-over dumbbell row|Remo con dos mancuernas
row_chest|back|d|10-12|1|rowchest|g=db|Тяга гантелей лежачи на похилій лаві|Тяга гантелей лёжа на наклонной скамье|Chest-supported dumbbell row|Remo con pecho apoyado
row_cable|back|c|10-12|1|cablerow||Тяга нижнього блока сидячи|Тяга нижнего блока сидя|Seated cable row|Remo en polea baja
row_cable1|back|c|10-12|0|cablerow||Тяга нижнього блока однією рукою|Тяга нижнего блока одной рукой|One-arm seated cable row|Remo en polea a una mano
row_machine|back|m|10-12|1|machinerow||Тяга в тренажері сидячи з упором у груди|Тяга в тренажёре сидя с упором в грудь|Seated machine row|Remo en máquina
inv_row|back|w|8-15|1|invrow||Горизонтальні підтягування|Горизонтальные подтягивания|Inverted row|Remo invertido
deadlift|back|b|4-8|1|deadlift|g=bb|Станова тяга|Становая тяга|Deadlift|Peso muerto
rack_pull|back|b|5-8|1|deadlift|g=bb,v=rack|Тяга з плинтів (часткова станова)|Тяга с плинтов (частичная становая)|Rack pull|Peso muerto parcial (rack pull)
hyper|back|w|12-15|0|hyper||Гіперекстензія|Гиперэкстензия|Back extension|Hiperextensiones
hyper_w|back|w|10-15|0|hyper|g=plate|Гіперекстензія з вагою|Гиперэкстензия с весом|Weighted back extension|Hiperextensiones con peso
shrug_bb|back|b|10-15|0|shrug|g=bb|Шраги зі штангою|Шраги со штангой|Barbell shrug|Encogimientos con barra
shrug_db|back|d|10-15|0|shrug|g=db|Шраги з гантелями|Шраги с гантелями|Dumbbell shrug|Encogimientos con mancuernas
shrug_smith|back|m|10-15|0|shrug|g=smith|Шраги в тренажері Сміта|Шраги в тренажёре Смита|Smith machine shrug|Encogimientos en Smith
ohp|shoulders|b|5-8|1|press|g=bb|Жим штанги стоячи (армійський)|Жим штанги стоя (армейский)|Overhead barbell press|Press militar
ohp_seat|shoulders|b|6-10|1|press|g=bb,seat=1|Жим штанги сидячи|Жим штанги сидя|Seated barbell press|Press militar sentado
sh_smith|shoulders|m|8-10|1|press|g=smith,seat=1|Жим сидячи в тренажері Сміта|Жим сидя в тренажёре Смита|Smith machine shoulder press|Press de hombros en Smith
sh_machine|shoulders|m|8-12|1|press|g=m,seat=1|Жим вгору в тренажері|Жим вверх в тренажёре|Machine shoulder press|Press de hombros en máquina
sh_db_seat|shoulders|d|8-12|1|press|g=db,seat=1|Жим гантелей сидячи|Жим гантелей сидя|Seated dumbbell press|Press de hombros sentado con mancuernas
sh_db_stand|shoulders|d|8-12|1|press|g=db|Жим гантелей стоячи|Жим гантелей стоя|Standing dumbbell press|Press de hombros de pie
arnold|shoulders|d|8-12|1|press|g=db,seat=1|Жим Арнольда|Жим Арнольда|Arnold press|Press Arnold
kb_press|shoulders|k|8-12|1|press|g=kb|Жим гирі вгору|Жим гири вверх|Kettlebell press|Press con kettlebell
lateral|shoulders|d|12-20|0|raise|v=lat,g=db|Махи гантелями в сторони|Махи гантелями в стороны|Dumbbell lateral raise|Elevaciones laterales
lateral_cable|shoulders|c|12-15|0|raise|v=lat,g=cable|Махи в сторону на нижньому блоці|Махи в сторону на нижнем блоке|Cable lateral raise|Elevación lateral en polea
lateral_machine|shoulders|m|12-15|0|raise|v=lat,g=m|Махи в сторони в тренажері|Махи в стороны в тренажёре|Machine lateral raise|Elevaciones laterales en máquina
front_db|shoulders|d|10-12|0|raise|g=db|Підйом гантелей перед собою|Подъём гантелей перед собой|Front dumbbell raise|Elevaciones frontales
front_plate|shoulders|d|10-12|0|raise|g=plate|Підйом диска перед собою|Подъём блина перед собой|Front plate raise|Elevación frontal con disco
front_cable|shoulders|c|10-12|0|raise|g=cable|Підйом руки перед собою на блоці|Подъём руки перед собой на блоке|Front cable raise|Elevación frontal en polea
rear_db|shoulders|d|12-15|0|reardelt|g=db|Махи гантелями в нахилі (задня дельта)|Махи гантелями в наклоне (задняя дельта)|Bent-over rear delt raise|Pájaros con mancuernas
rear_machine|shoulders|m|12-15|0|reardelt|m=1|Зворотні розведення в тренажері|Обратная разводка в тренажёре|Reverse pec deck|Contractora inversa
rear_cable|shoulders|c|12-15|0|reardelt|g=cable|Зворотні розведення в кросовері|Обратная разводка в кроссовере|Cable rear delt fly|Pájaros en polea
facepull|shoulders|c|12-20|0|facepull||Тяга каната до обличчя|Тяга каната к лицу|Face pull|Face pull
upright_bb|shoulders|b|10-12|0|upright|g=bb|Тяга штанги до підборіддя|Тяга штанги к подбородку|Upright barbell row|Remo al mentón con barra
upright_db|shoulders|d|10-12|0|upright|g=db|Тяга гантелей до підборіддя|Тяга гантелей к подбородку|Dumbbell upright row|Remo al mentón con mancuernas
upright_cable|shoulders|c|10-15|0|upright|g=cable|Тяга нижнього блока до підборіддя|Тяга нижнего блока к подбородку|Cable upright row|Remo al mentón en polea
pike_pushup|shoulders|w|6-12|1|pushup|v=pike|Віджимання «пайк» на плечі|Отжимания «пайк» на плечи|Pike push-ups|Flexiones pike
curl_bb|biceps|b|8-12|0|curl|g=bb|Підйом штанги на біцепс|Подъём штанги на бицепс|Barbell curl|Curl con barra
curl_ez|biceps|b|8-12|0|curl|g=bb|Підйом EZ-штанги на біцепс|Подъём EZ-штанги на бицепс|EZ-bar curl|Curl con barra Z
curl_close|biceps|b|10-12|0|curl|g=bb|Підйом штанги вузьким хватом|Подъём штанги узким хватом|Close-grip barbell curl|Curl con barra agarre cerrado
curl_wide|biceps|b|10-12|0|curl|g=bb|Підйом штанги широким хватом|Подъём штанги широким хватом|Wide-grip barbell curl|Curl con barra agarre ancho
curl_rev|biceps|b|10-15|0|curl|g=bb|Згинання зі штангою зворотним хватом|Сгибания со штангой обратным хватом|Reverse barbell curl|Curl inverso con barra
preacher|biceps|b|10-12|0|preacher|g=bb|Згинання на лаві Скотта зі штангою|Сгибания на скамье Скотта со штангой|Preacher curl|Curl en banco Scott
preacher_db|biceps|d|10-12|0|preacher|g=db|Згинання гантелі на лаві Скотта|Сгибание гантели на скамье Скотта|Dumbbell preacher curl|Curl Scott con mancuerna
preacher_m|biceps|m|10-15|0|preacher|g=m|Згинання рук у тренажері|Сгибания рук в тренажёре|Machine biceps curl|Curl de bíceps en máquina
curl_alt|biceps|d|10-12|0|curl|g=db|Згинання гантелей з поворотом кисті|Сгибания гантелей с супинацией|Alternate dumbbell curl|Curl alterno con mancuernas
curl_seat|biceps|d|10-12|0|preacher|g=db|Згинання гантелей сидячи|Сгибания гантелей сидя|Seated dumbbell curl|Curl sentado con mancuernas
curl_incl|biceps|d|10-12|0|inclinecurl|g=db|Згинання гантелей на похилій лаві|Сгибания гантелей на наклонной скамье|Incline dumbbell curl|Curl inclinado con mancuernas
hammer|biceps|d|10-12|0|curl|g=db|Молоткові згинання|Молотковые сгибания|Hammer curl|Curl martillo
hammer_cross|biceps|d|10-12|0|curl|g=db|Молоткові згинання навхрест|Молотковые сгибания накрест|Cross-body hammer curl|Curl martillo cruzado
hammer_rope|biceps|c|12-15|0|curl|g=cable|Молоткові згинання на блоці з канатом|Молотковые сгибания на блоке с канатом|Rope hammer curl|Curl martillo con cuerda
concentr|biceps|d|10-12|0|concentration||Концентровані згинання|Концентрированные сгибания|Concentration curl|Curl concentrado
cable_curl|biceps|c|12-15|0|curl|g=cable|Згинання рук на нижньому блоці|Сгибания рук на нижнем блоке|Cable curl|Curl en polea baja
high_cable|biceps|c|12-15|0|curl|v=high|Згинання на верхніх блоках кросовера|Сгибания на верхних блоках кроссовера|High cable curl|Curl en polea alta
zottman|biceps|d|10-12|0|curl|g=db|Згинання Зоттмана|Сгибания Зоттмана|Zottman curl|Curl Zottman
spider|biceps|d|10-12|0|rowchest|g=db|«Павук»: згинання лежачи на похилій лаві|«Паук»: сгибания лёжа на наклонной скамье|Spider curl|Curl araña
kb_curl|biceps|k|10-15|0|curl|g=kb|Згинання з гирею|Сгибания с гирей|Kettlebell curl|Curl con kettlebell
close_bench|triceps|b|6-10|1|bench|g=bb,close=1|Жим штанги вузьким хватом|Жим штанги узким хватом|Close-grip bench press|Press de banca agarre cerrado
smith_close|triceps|m|8-10|1|bench|g=smith,close=1|Жим у Сміті вузьким хватом|Жим в Смите узким хватом|Smith close-grip press|Press cerrado en Smith
jm|triceps|b|8-10|1|skull|g=bb|JM-жим|JM-жим|JM press|Press JM
db_close|triceps|d|10-12|1|bench|g=db,close=1|Жим гантелей вузьким хватом|Жим гантелей узким хватом|Close-grip dumbbell press|Press cerrado con mancuernas
skull|triceps|b|8-12|0|skull|g=bb|Французький жим лежачи (EZ-гриф)|Французский жим лёжа (EZ-гриф)|EZ-bar skull crusher|Press francés con barra Z
skull_db|triceps|d|10-12|0|skull|g=db|Французький жим з гантелями лежачи|Французский жим с гантелями лёжа|Lying dumbbell extension|Press francés con mancuernas
pushdown|triceps|c|10-15|0|pushdown||Розгинання рук на верхньому блоці|Разгибания рук на верхнем блоке|Triceps pushdown|Extensión de tríceps en polea
pushdown_rope|triceps|c|12-15|0|pushdown||Розгинання на блоці з канатом|Разгибания на блоке с канатом|Rope pushdown|Extensión en polea con cuerda
pushdown_v|triceps|c|10-15|0|pushdown||Розгинання на блоці з V-рукояттю|Разгибания на блоке с V-рукоятью|V-bar pushdown|Extensión en polea con barra V
pushdown_rev|triceps|c|12-15|0|pushdown||Розгинання на блоці зворотним хватом|Разгибания на блоке обратным хватом|Reverse-grip pushdown|Extensión en polea agarre inverso
pushdown_one|triceps|c|12-15|0|pushdown|one=1|Розгинання однією рукою на блоці|Разгибание одной рукой на блоке|One-arm cable pushdown|Extensión a una mano en polea
oh_rope|triceps|c|10-15|0|overhead|g=cable|Розгинання з канатом з-за голови|Разгибания с канатом из-за головы|Overhead rope extension|Extensión sobre la cabeza con cuerda
oh_bb|triceps|b|10-12|0|overhead|g=bb|Французький жим стоячи зі штангою|Французский жим стоя со штангой|Standing overhead barbell extension|Extensión de tríceps de pie con barra
oh_db|triceps|d|10-12|0|overhead|g=db,seat=1|Розгинання гантелі з-за голови сидячи|Разгибание гантели из-за головы сидя|Seated dumbbell overhead extension|Extensión sentado con mancuerna
kickback|triceps|d|12-15|0|kickback|g=db|Розгинання гантелі в нахилі|Разгибание гантели в наклоне|Dumbbell kickback|Patada de tríceps
kickback_cable|triceps|c|12-15|0|kickback|g=cable|Розгинання на блоці в нахилі|Разгибание на блоке в наклоне|Cable kickback|Patada de tríceps en polea
dips|triceps|w|6-12|1|dips||Віджимання на брусах (на трицепс)|Отжимания на брусьях (на трицепс)|Triceps dips|Fondos para tríceps
dips_machine|triceps|m|10-12|1|dips||Віджимання в тренажері|Отжимания в тренажёре|Machine dips|Fondos en máquina
bench_dips|triceps|w|10-15|0|benchdips||Зворотні віджимання від лави|Обратные отжимания от скамьи|Bench dips|Fondos en banco
diamond|triceps|w|8-15|1|pushup|close=1|Віджимання вузькі («діамант»)|Отжимания узкие («алмаз»)|Diamond push-ups|Flexiones diamante
squat|legs|b|5-8|1|squat|v=back|Присідання зі штангою|Приседания со штангой|Barbell back squat|Sentadilla con barra
front_squat|legs|b|6-8|1|squat|v=front|Фронтальні присідання|Фронтальные приседания|Front squat|Sentadilla frontal
box_squat|legs|b|6-10|1|squat|v=box|Присідання до лави зі штангою|Приседания до скамьи со штангой|Box squat|Sentadilla al banco
wide_squat|legs|b|6-10|1|squat|v=wide|Присідання широкою постановкою|Приседания широкой постановкой|Wide-stance squat|Sentadilla amplia
smith_squat|legs|m|8-12|1|squat|v=smith|Присідання в тренажері Сміта|Приседания в тренажёре Смита|Smith machine squat|Sentadilla en Smith
hack|legs|m|8-12|1|squat|v=hack|Гак-присідання в тренажері|Гакк-приседания в тренажёре|Hack squat|Sentadilla hack
legpress|legs|m|10-15|1|legpress||Жим ногами|Жим ногами|Leg press|Prensa de piernas
legpress_narrow|legs|m|10-15|1|legpress|v=narrow|Жим ногами вузькою постановкою|Жим ногами узкой постановкой|Narrow-stance leg press|Prensa con pies juntos
goblet|legs|d|10-15|1|squat|v=goblet|Гоблет-присідання з гантеллю|Гоблет-приседания с гантелей|Goblet squat|Sentadilla goblet
goblet_kb|legs|k|10-15|1|squat|v=goblet,g=kb|Гоблет-присідання з гирею|Гоблет-приседания с гирей|Kettlebell goblet squat|Sentadilla goblet con kettlebell
db_squat|legs|d|10-15|1|squat|v=db|Присідання з гантелями|Приседания с гантелями|Dumbbell squat|Sentadilla con mancuernas
bulgarian|legs|d|8-12|1|splitsquat|g=db|Болгарські випади|Болгарские выпады|Bulgarian split squat|Sentadilla búlgara
lunge_db|legs|d|10-12|1|lunge|g=db|Випади з гантелями|Выпады с гантелями|Dumbbell lunges|Zancadas con mancuernas
lunge_bb|legs|b|8-12|1|lunge|g=bb|Випади зі штангою|Выпады со штангой|Barbell lunges|Zancadas con barra
lunge_walk|legs|d|10-14|1|lunge|g=db|Випади в ходьбі|Выпады в ходьбе|Walking lunges|Zancadas caminando
lunge_rev|legs|d|10-12|1|lunge|g=db|Зворотні випади|Обратные выпады|Reverse lunges|Zancadas inversas
smith_lunge|legs|m|8-12|1|lunge|g=smith|Випади в тренажері Сміта|Выпады в тренажёре Смита|Smith machine lunge|Zancadas en Smith
stepup|legs|d|10-12|1|stepup|g=db|Зашагування на лаву з гантелями|Зашагивания на скамью с гантелями|Dumbbell step-ups|Subidas al banco con mancuernas
legext|legs|m|12-15|0|legext||Розгинання ніг сидячи|Разгибания ног сидя|Leg extension|Extensión de cuádriceps
legext_one|legs|m|12-15|0|legext||Розгинання однієї ноги сидячи|Разгибание одной ноги сидя|Single-leg extension|Extensión a una pierna
bw_squat|legs|w|15-25|1|squat|v=none|Присідання без ваги|Приседания без веса|Bodyweight squat|Sentadilla sin peso
jump_squat|legs|w|10-15|1|squat|v=jump|Присідання з вистрибуванням|Приседания с выпрыгиванием|Jump squat|Sentadilla con salto
bw_lunge|legs|w|10-15|1|lunge||Випади без ваги|Выпады без веса|Bodyweight lunges|Zancadas sin peso
bw_split|legs|w|10-15|1|splitsquat||Болгарські випади без ваги|Болгарские выпады без веса|Bodyweight split squat|Sentadilla búlgara sin peso
wall_sit|legs|w|30-60|0|squat|v=wall|Стільчик біля стіни (секунди)|Стульчик у стены (секунды)|Wall sit (seconds)|Sentadilla isométrica en pared (segundos)
rdl|glutes|b|6-10|1|rdl|g=bb|Румунська тяга зі штангою|Румынская тяга со штангой|Romanian deadlift|Peso muerto rumano
rdl_db|glutes|d|8-12|1|rdl|g=db|Румунська тяга з гантелями|Румынская тяга с гантелями|Dumbbell Romanian deadlift|Peso muerto rumano con mancuernas
rdl_smith|glutes|m|8-12|1|rdl|g=smith|Румунська тяга в тренажері Сміта|Румынская тяга в тренажёре Смита|Smith Romanian deadlift|Peso muerto rumano en Smith
rdl_kb|glutes|k|10-15|1|rdl|g=kb|Румунська тяга з гирею|Румынская тяга с гирей|Kettlebell Romanian deadlift|Peso muerto rumano con kettlebell
stiff|glutes|b|6-10|1|rdl|g=bb|Станова тяга на прямих ногах|Становая тяга на прямых ногах|Stiff-legged deadlift|Peso muerto piernas rígidas
sumo|glutes|b|5-8|1|deadlift|g=bb|Станова тяга сумо|Становая тяга сумо|Sumo deadlift|Peso muerto sumo
goodmorning|glutes|b|8-12|1|rdl|v=gm|Нахили зі штангою на плечах («доброго ранку»)|Наклоны со штангой на плечах («доброе утро»)|Good morning|Buenos días con barra
hipthrust|glutes|b|8-12|1|hipthrust|g=bb|Ягодичний міст зі штангою від лави (хіп-траст)|Ягодичный мост со штангой от скамьи (хип-траст)|Barbell hip thrust|Hip thrust con barra
hipthrust_smith|glutes|m|8-12|1|hipthrust|g=smith|Хіп-траст у тренажері Сміта|Хип-траст в тренажёре Смита|Smith machine hip thrust|Hip thrust en Smith
hipthrust_m|glutes|m|10-12|1|hipthrust|g=m|Хіп-траст у тренажері|Хип-траст в тренажёре|Machine hip thrust|Hip thrust en máquina
bridge_bb|glutes|b|10-15|1|hipthrust|floor=1,g=bb|Сідничний місток зі штангою на підлозі|Ягодичный мост со штангой на полу|Barbell glute bridge|Puente de glúteos con barra
bridge|glutes|w|15-20|0|hipthrust|floor=1|Сідничний місток без ваги|Ягодичный мост без веса|Glute bridge|Puente de glúteos
bridge_one|glutes|w|10-15|0|hipthrust|floor=1,one=1|Сідничний місток на одній нозі|Ягодичный мост на одной ноге|Single-leg glute bridge|Puente de glúteos a una pierna
pullthrough|glutes|c|12-15|0|pullthrough||Тяга каната між ногами|Тяга каната между ног|Cable pull-through|Pull-through en polea
kick_cable|glutes|c|12-15|0|kickglute|g=cable|Відведення ноги назад на блоці|Отведение ноги назад на блоке|Cable glute kickback|Patada de glúteo en polea
kick_bw|glutes|w|15-20|0|kickglute||Махи ногою назад|Махи ногой назад|Standing glute kickback|Patada de glúteo de pie
legcurl|glutes|m|10-15|0|legcurl||Згинання ніг лежачи|Сгибания ног лёжа|Lying leg curl|Curl femoral tumbado
legcurl_seat|glutes|m|10-15|0|legcurl|seat=1|Згинання ніг сидячи|Сгибания ног сидя|Seated leg curl|Curl femoral sentado
legcurl_one|glutes|m|10-15|0|legcurl||Згинання однієї ноги лежачи|Сгибание одной ноги лёжа|Single-leg lying curl|Curl femoral a una pierna
abductor|glutes|m|15-20|0|abduct|v=out|Розведення ніг у тренажері (сідниці)|Разведение ног в тренажёре (ягодицы)|Hip abduction machine|Abductores en máquina
adductor|glutes|m|15-20|0|abduct|v=in|Зведення ніг у тренажері (внутрішня поверхня)|Сведение ног в тренажёре (внутренняя поверхность)|Hip adduction machine|Aductores en máquina
plie|glutes|d|10-15|1|squat|v=plie|Присідання сумо з гантеллю (пліє)|Приседания сумо с гантелей (плие)|Sumo dumbbell squat|Sentadilla sumo con mancuerna
kb_swing|glutes|k|15-20|1|rdl|g=kb|Махи гирею|Махи гирей|Kettlebell swing|Swing con kettlebell
calf_stand|calves|m|12-20|0|calf|g=m|Підйом на носки стоячи в тренажері|Подъём на носки стоя в тренажёре|Standing calf raise machine|Elevación de talones de pie en máquina
calf_smith|calves|m|12-20|0|calf|g=smith|Підйом на носки в тренажері Сміта|Подъём на носки в тренажёре Смита|Smith machine calf raise|Elevación de talones en Smith
calf_seat|calves|m|15-20|0|calf|v=seat|Підйом на носки сидячи|Подъём на носки сидя|Seated calf raise|Elevación de talones sentado
calf_press|calves|m|15-20|0|calf|v=press|Підйом на носки в тренажері для жиму ногами|Подъём на носки в тренажёре для жима ногами|Leg press calf raise|Gemelos en prensa
calf_bb|calves|b|12-20|0|calf|g=bb|Підйом на носки зі штангою|Подъём на носки со штангой|Standing barbell calf raise|Gemelos de pie con barra
calf_db|calves|d|12-20|0|calf|g=db|Підйом на носки з гантелями|Подъём на носки с гантелями|Dumbbell calf raise|Gemelos con mancuernas
calf_db_one|calves|d|12-15|0|calf|g=db|Підйом на носок однієї ноги з гантеллю|Подъём на носок одной ноги с гантелей|Single-leg dumbbell calf raise|Gemelos a una pierna con mancuerna
calf_seat_db|calves|d|15-20|0|calf|v=seat,g=db|Підйом на носки сидячи з гантеллю|Подъём на носки сидя с гантелей|Seated dumbbell calf raise|Gemelos sentado con mancuerna
calf_bw|calves|w|15-25|0|calf||Підйом на носки без ваги|Подъём на носки без веса|Bodyweight calf raise|Elevación de talones sin peso
crunch|abs|w|15-20|0|crunch||Скручування|Скручивания|Crunches|Abdominales
situp|abs|w|10-15|0|crunch|v=situp|Підйом тулуба|Подъём туловища|Sit-ups|Abdominales completos
cable_crunch|abs|c|12-15|0|cablecrunch||Скручування на блоці на колінах|Скручивания на блоке на коленях|Cable crunch|Crunch en polea
machine_crunch|abs|m|12-15|0|machinecrunch||Скручування в тренажері|Скручивания в тренажёре|Machine crunch|Crunch en máquina
hang_raise|abs|w|8-15|0|hangraise||Підйом ніг у висі|Подъём ног в висе|Hanging leg raise|Elevación de piernas colgado
leg_raise|abs|w|10-15|0|legraise||Підйом ніг лежачи|Подъём ног лёжа|Lying leg raise|Elevación de piernas tumbado
rev_crunch|abs|w|12-15|0|legraise|v=rev|Зворотні скручування|Обратные скручивания|Reverse crunch|Crunch inverso
bicycle|abs|w|20-30|0|legraise|v=bike|Велосипед лежачи|Велосипед лёжа|Bicycle crunch|Bicicleta abdominal
deadbug|abs|w|10-16|0|legraise|v=deadbug|«Мертвий жук»|«Мёртвый жук»|Dead bug|Bicho muerto
plank|abs|w|30-60|0|plank||Планка (секунди)|Планка (секунды)|Plank (seconds)|Plancha (segundos)
side_plank|abs|w|20-45|0|plank||Бічна планка (секунди)|Боковая планка (секунды)|Side plank (seconds)|Plancha lateral (segundos)
climbers|abs|w|20-40|0|plank|v=climb|«Скелелаз»|«Скалолаз»|Mountain climbers|Escaladores
twist|abs|w|20-30|0|twist||Російські скручування|Русские скручивания|Russian twist|Giros rusos
ab_wheel|abs|w|8-12|0|wheel||Ролик для преса|Ролик для пресса|Ab wheel rollout|Rueda abdominal
`.trim().split("\n").map(l => {
    const a = l.split("|"), r = a[3].split("-");
    return {id: a[0], g: a[1], eq: a[2], lo: +r[0], hi: +r[1], cmp: a[4] === "1", fig: a[5], fp: a[6], n: {uk: a[7], ru: a[8], en: a[9], es: a[10]}};
  });
  window.EXLIB = E;
})();
