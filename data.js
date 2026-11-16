/* Built-in data. Basic foods (optional list): values per 100 g (or 100 ml). Workout templates and cardio types. */
(function () {
  // id|category|kcal|protein|fat|carbs|piece grams (0 = none)|unit (g/ml)|uk|ru|en|es
  const F = `
chicken_raw|meat|120|22.5|2.6|0|0|g|Куряче філе, сире|Куриное филе, сырое|Chicken breast, raw|Pechuga de pollo, cruda
chicken_ckd|meat|165|31|3.6|0|0|g|Куряче філе, готове|Куриное филе, готовое|Chicken breast, cooked|Pechuga de pollo, cocinada
chicken_thigh|meat|209|26|10.9|0|0|g|Куряче стегно без шкіри, готове|Куриное бедро без кожи, готовое|Chicken thigh, skinless, cooked|Muslo de pollo sin piel, cocinado
turkey|meat|135|30|1|0|0|g|Індичка, філе, готове|Индейка, филе, готовое|Turkey breast, cooked|Pechuga de pavo, cocinada
beef_raw|meat|137|21|5|0|0|g|Яловичина пісна, сира|Говядина постная, сырая|Lean beef, raw|Ternera magra, cruda
beef_ckd|meat|217|26|12|0|0|g|Яловичина, готова|Говядина, готовая|Beef, cooked|Ternera, cocinada
pork_raw|meat|143|21|6|0|0|g|Свиняча корейка, сира|Свиная корейка, сырая|Pork loin, raw|Lomo de cerdo, crudo
pork_ckd|meat|196|27|9|0|0|g|Свиняча корейка, готова|Свиная корейка, готовая|Pork loin, cooked|Lomo de cerdo, cocinado
mince|meat|250|17|20|0|0|g|Фарш свино-яловичий|Фарш свино-говяжий|Mixed minced meat|Carne picada mixta
ham|meat|145|18|7|1.5|20|g|Шинка|Ветчина|Ham|Jamón cocido
bacon|meat|541|37|42|1.4|10|g|Бекон, смажений|Бекон, жареный|Bacon, fried|Bacon frito
sausage|meat|290|12|26|2|50|g|Сосиска|Сосиска|Sausage (frankfurter)|Salchicha
salo|meat|770|2.4|85|0|0|g|Сало|Сало|Pork fat (salo)|Tocino (salo)
salmon|fish|206|22|12|0|0|g|Лосось, готовий|Лосось, готовый|Salmon, cooked|Salmón, cocinado
tuna|fish|116|26|1|0|0|g|Тунець консервований у власному соку|Тунец консервированный в собственном соку|Canned tuna in water|Atún al natural
whitefish|fish|105|23|0.9|0|0|g|Біла риба (тріска, хек), готова|Белая рыба (треска, хек), готовая|White fish (cod, hake), cooked|Pescado blanco (bacalao, merluza)
shrimp|fish|99|24|0.3|0.2|0|g|Креветки, варені|Креветки, вареные|Shrimp, cooked|Gambas cocidas
egg|eggs|143|12.6|9.5|0.7|60|g|Яйце|Яйцо|Egg|Huevo
eggwhite|eggs|52|11|0.2|0.7|33|g|Яєчний білок|Яичный белок|Egg white|Clara de huevo
omelet|eggs|154|10.6|11.7|0.6|0|g|Омлет|Омлет|Omelette|Tortilla francesa
milk25|dairy|52|3.2|2.5|4.7|0|ml|Молоко 2,5%|Молоко 2,5%|Milk 2.5%|Leche semidesnatada
milk1|dairy|42|3.4|1|5|0|ml|Молоко 1%|Молоко 1%|Milk 1%|Leche desnatada
kefir|dairy|40|3|1|4|0|ml|Кефір 1%|Кефир 1%|Kefir 1%|Kéfir 1%
greek0|dairy|59|10|0.4|3.6|0|g|Грецький йогурт 0%|Греческий йогурт 0%|Greek yogurt 0%|Yogur griego 0%
greek2|dairy|73|10|2|3.9|0|g|Грецький йогурт 2%|Греческий йогурт 2%|Greek yogurt 2%|Yogur griego 2%
yogurt|dairy|61|3.5|3.3|4.7|125|g|Йогурт натуральний|Йогурт натуральный|Plain yogurt|Yogur natural
skyr|dairy|63|11|0.2|4|0|g|Скір|Скир|Skyr|Skyr
cottage5|dairy|121|17|5|1.8|0|g|Кисломолочний сир 5%|Творог 5%|Cottage cheese 5%|Requesón 5%
cottage0|dairy|71|16.5|0|1.3|0|g|Кисломолочний сир 0%|Творог 0%|Cottage cheese 0%|Requesón 0%
ricotta|dairy|174|11|13|3|0|g|Рікотта|Рикотта|Ricotta|Ricotta
mozza|dairy|280|22|21|2.2|0|g|Моцарела|Моцарелла|Mozzarella|Mozzarella
cheese|dairy|360|25|28|1.5|20|g|Твердий сир|Твёрдый сыр|Hard cheese|Queso curado
feta|dairy|264|14|21|4|0|g|Фета, бринза|Фета, брынза|Feta|Queso feta
sourcream|dairy|158|2.6|15|3|0|g|Сметана 15%|Сметана 15%|Sour cream 15%|Nata agria 15%
syrnyky|dairy|220|15|9|18|50|g|Сирники|Сырники|Cottage cheese pancakes|Tortitas de requesón
rice_dry|grains|360|7|0.7|79|0|g|Рис, сухий|Рис, сухой|Rice, dry|Arroz, crudo
rice_ckd|grains|130|2.7|0.3|28|0|g|Рис, варений|Рис, варёный|Rice, cooked|Arroz cocido
buck_dry|grains|343|13|3.4|68|0|g|Гречка, суха|Гречка, сухая|Buckwheat, dry|Trigo sarraceno, crudo
buck_ckd|grains|92|3.4|0.6|20|0|g|Гречка, варена|Гречка, варёная|Buckwheat, cooked|Trigo sarraceno cocido
oats|grains|379|13|6.5|67|0|g|Вівсянка, суха|Овсянка, сухая|Oats, dry|Copos de avena
oats_ckd|grains|71|2.5|1.5|12|0|g|Вівсяна каша на воді|Овсяная каша на воде|Oatmeal with water|Gachas de avena con agua
pasta_dry|grains|371|13|1.5|75|0|g|Макарони, сухі|Макароны, сухие|Pasta, dry|Pasta, cruda
pasta_ckd|grains|158|5.8|0.9|31|0|g|Макарони, варені|Макароны, варёные|Pasta, cooked|Pasta cocida
bulgur|grains|342|12|1.3|76|0|g|Булгур, сухий|Булгур, сухой|Bulgur, dry|Bulgur, crudo
couscous|grains|376|13|0.6|77|0|g|Кус-кус, сухий|Кускус, сухой|Couscous, dry|Cuscús, crudo
potato|grains|87|1.9|0.1|20|0|g|Картопля варена|Картофель варёный|Potato, boiled|Patata cocida
mashed|grains|106|2|4|16|0|g|Картопляне пюре|Картофельное пюре|Mashed potatoes|Puré de patatas
sweetpot|grains|90|2|0.2|21|0|g|Батат, запечений|Батат, запечённый|Sweet potato, baked|Boniato asado
fries|grains|312|3.4|15|41|0|g|Картопля фрі|Картофель фри|French fries|Patatas fritas
bread|bread|265|9|3.2|49|30|g|Хліб білий|Хлеб белый|White bread|Pan blanco
bread_wg|bread|247|13|3.4|41|35|g|Хліб цільнозерновий|Хлеб цельнозерновой|Whole grain bread|Pan integral
bread_rye|bread|259|8.5|3.3|48|30|g|Хліб житній|Хлеб ржаной|Rye bread|Pan de centeno
tortilla|bread|310|8|8|50|60|g|Тортилья пшенична|Тортилья пшеничная|Wheat tortilla|Tortilla de trigo
ricecake|bread|387|8|2.8|81|9|g|Рисові хлібці|Рисовые хлебцы|Rice cakes|Tortitas de arroz
croissant|bread|406|8|21|46|60|g|Круасан|Круассан|Croissant|Cruasán
lentils|legumes|116|9|0.4|20|0|g|Сочевиця, варена|Чечевица, варёная|Lentils, cooked|Lentejas cocidas
beans|legumes|110|7|0.5|20|0|g|Квасоля консервована|Фасоль консервированная|Canned beans|Alubias cocidas
chickpea|legumes|164|8.9|2.6|27|0|g|Нут, варений|Нут, варёный|Chickpeas, cooked|Garbanzos cocidos
banana|fruit|89|1.1|0.3|23|120|g|Банан|Банан|Banana|Plátano
apple|fruit|52|0.3|0.2|14|180|g|Яблуко|Яблоко|Apple|Manzana
orange|fruit|47|0.9|0.1|12|150|g|Апельсин|Апельсин|Orange|Naranja
mandarin|fruit|53|0.8|0.3|13|80|g|Мандарин|Мандарин|Mandarin|Mandarina
kiwi|fruit|61|1.1|0.5|15|75|g|Ківі|Киви|Kiwi|Kiwi
pear|fruit|57|0.4|0.1|15|170|g|Груша|Груша|Pear|Pera
grapes|fruit|69|0.7|0.2|18|0|g|Виноград|Виноград|Grapes|Uvas
strawb|fruit|32|0.7|0.3|7.7|0|g|Полуниця|Клубника|Strawberries|Fresas
blueb|fruit|57|0.7|0.3|14|0|g|Лохина|Голубика|Blueberries|Arándanos
melon|fruit|30|0.6|0.2|7.6|0|g|Кавун|Арбуз|Watermelon|Sandía
dates|fruit|282|2.5|0.4|75|8|g|Фініки|Финики|Dates|Dátiles
raisins|fruit|299|3|0.5|79|0|g|Родзинки|Изюм|Raisins|Pasas
tomato|veg|18|0.9|0.2|3.9|120|g|Помідор|Помидор|Tomato|Tomate
cucumber|veg|15|0.7|0.1|3.6|150|g|Огірок|Огурец|Cucumber|Pepino
pepper|veg|31|1|0.3|6|150|g|Перець солодкий|Перец сладкий|Bell pepper|Pimiento
carrot|veg|41|0.9|0.2|10|70|g|Морква|Морковь|Carrot|Zanahoria
broccoli|veg|34|2.8|0.4|7|0|g|Броколі|Брокколи|Broccoli|Brócoli
cabbage|veg|25|1.3|0.1|6|0|g|Капуста|Капуста|Cabbage|Repollo
lettuce|veg|15|1.4|0.2|2.9|0|g|Салат листовий|Салат листовой|Lettuce|Lechuga
spinach|veg|23|2.9|0.4|3.6|0|g|Шпинат|Шпинат|Spinach|Espinacas
zucchini|veg|17|1.2|0.3|3.1|0|g|Кабачок|Кабачок|Zucchini|Calabacín
mushroom|veg|22|3.1|0.3|3.3|0|g|Печериці|Шампиньоны|Mushrooms|Champiñones
onion|veg|40|1.1|0.1|9|0|g|Цибуля|Лук|Onion|Cebolla
peas|veg|81|5.4|0.4|14|0|g|Зелений горошок|Зелёный горошек|Green peas|Guisantes
corn|veg|81|2.3|1.2|16|0|g|Кукурудза консервована|Кукуруза консервированная|Canned corn|Maíz dulce
avocado|veg|160|2|15|9|150|g|Авокадо|Авокадо|Avocado|Aguacate
pickles|veg|11|0.3|0.2|2|0|g|Мариновані огірки|Маринованные огурцы|Pickles|Pepinillos
salad|veg|20|1|0.2|4|0|g|Овочевий салат без заправки|Овощной салат без заправки|Vegetable salad, no dressing|Ensalada sin aliñar
borscht|dishes|49|2.4|2|5.5|0|g|Борщ|Борщ|Borscht|Borsch
soup|dishes|40|2.5|1.5|4.5|0|g|Курячий суп|Куриный суп|Chicken soup|Sopa de pollo
varenyky|dishes|148|4|3|26|0|g|Вареники з картоплею|Вареники с картошкой|Potato dumplings (varenyky)|Empanadillas de patata
pelmeni|dishes|275|12|14|26|0|g|Пельмені|Пельмени|Meat dumplings (pelmeni)|Empanadillas de carne
pizza|dishes|266|11|10|33|0|g|Піца|Пицца|Pizza|Pizza
burger|dishes|254|13|11|26|220|g|Бургер|Бургер|Burger|Hamburguesa
shawarma|dishes|210|10|9|22|350|g|Шаурма|Шаурма|Shawarma|Shawarma
sushi|dishes|150|6|3|25|30|g|Суші, роли|Суши, роллы|Sushi rolls|Sushi
oliveoil|fats|884|0|100|0|10|ml|Олія оливкова|Масло оливковое|Olive oil|Aceite de oliva
sunoil|fats|884|0|100|0|10|ml|Олія соняшникова|Масло подсолнечное|Sunflower oil|Aceite de girasol
butter|fats|717|0.9|81|0.1|10|g|Масло вершкове|Масло сливочное|Butter|Mantequilla
peanutb|fats|588|25|50|20|16|g|Арахісова паста|Арахисовая паста|Peanut butter|Crema de cacahuete
almonds|fats|579|21|50|22|0|g|Мигдаль|Миндаль|Almonds|Almendras
walnuts|fats|654|15|65|14|0|g|Волоські горіхи|Грецкие орехи|Walnuts|Nueces
seeds|fats|584|21|51|20|0|g|Насіння соняшнику|Семечки подсолнечника|Sunflower seeds|Pipas de girasol
mayo|fats|680|1|75|0.6|15|g|Майонез|Майонез|Mayonnaise|Mayonesa
ketchup|fats|112|1.3|0.1|26|15|g|Кетчуп|Кетчуп|Ketchup|Kétchup
choc_dark|sweets|546|5|31|61|0|g|Чорний шоколад|Тёмный шоколад|Dark chocolate|Chocolate negro
choc_milk|sweets|535|7.7|30|59|0|g|Молочний шоколад|Молочный шоколад|Milk chocolate|Chocolate con leche
cookies|sweets|480|6|20|68|12|g|Печиво|Печенье|Cookies|Galletas
icecream|sweets|207|3.5|11|24|0|g|Морозиво|Мороженое|Ice cream|Helado
honey|sweets|304|0.3|0|82|7|g|Мед|Мёд|Honey|Miel
sugar|sweets|387|0|0|100|5|g|Цукор|Сахар|Sugar|Azúcar
jam|sweets|250|0.4|0.1|63|15|g|Варення, джем|Варенье, джем|Jam|Mermelada
chips|sweets|536|7|35|53|0|g|Чіпси|Чипсы|Potato chips|Patatas chips
protbar|sweets|350|30|10|35|60|g|Протеїновий батончик|Протеиновый батончик|Protein bar|Barrita de proteína
whey|drinks|380|75|6|8|30|g|Протеїн (порошок)|Протеин (порошок)|Whey protein powder|Proteína whey en polvo
coffee|drinks|2|0.1|0|0|0|ml|Кава чорна|Кофе чёрный|Black coffee|Café solo
latte|drinks|54|3|2.5|4.5|0|ml|Лате, капучино|Латте, капучино|Latte, cappuccino|Café con leche
tea|drinks|1|0|0|0.2|0|ml|Чай без цукру|Чай без сахара|Tea, unsweetened|Té sin azúcar
juice|drinks|45|0.7|0.2|10.4|0|ml|Апельсиновий сік|Апельсиновый сок|Orange juice|Zumo de naranja
cola|drinks|42|0|0|10.6|0|ml|Кола|Кола|Cola|Cola
colazero|drinks|0|0|0|0|0|ml|Кола без цукру|Кола без сахара|Cola zero|Cola zero
beer|drinks|43|0.5|0|3.6|0|ml|Пиво|Пиво|Beer|Cerveza
wine|drinks|83|0.1|0|2.7|0|ml|Вино|Вино|Wine|Vino
`.trim().split("\n").map(l => {
    const a = l.split("|");
    return {id: a[0], cat: a[1], k: +a[2], p: +a[3], f: +a[4], c: +a[5], pc: +a[6] || 0, u: a[7], n: {uk: a[8], ru: a[9], en: a[10], es: a[11]}};
  });

  // Ready-made workouts: muscle groups in order, number of exercises per group
  const TPL = [
    {id: "chest_tri", g: ["chest", "chest", "chest", "triceps", "triceps", "triceps"]},
    {id: "back_bi", g: ["back", "back", "back", "biceps", "biceps", "biceps"]},
    {id: "legs", g: ["legs", "legs", "glutes", "glutes", "calves"]},
    {id: "shoulders", g: ["shoulders", "shoulders", "shoulders", "shoulders", "abs"]},
    {id: "upper", g: ["chest", "back", "shoulders", "chest", "back", "biceps", "triceps"]},
    {id: "lower", g: ["legs", "glutes", "legs", "glutes", "calves", "abs"]},
    {id: "full", g: ["legs", "chest", "back", "shoulders", "glutes", "biceps", "triceps"]},
    {id: "empty", g: []}
  ];

  // Cardio types with MET values
  const CARDIO = [
    {id: "walk", met: 3.5}, {id: "incline", met: 6.5}, {id: "bike", met: 6.8}, {id: "ellip", met: 5}, {id: "run", met: 9.8}, {id: "swim", met: 7}, {id: "rowing", met: 7}, {id: "stairs", met: 8.8}
  ];

  window.FDATA = {FOODS: F, EX: window.EXLIB, TPL, CARDIO};
})();
