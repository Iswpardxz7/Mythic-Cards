/**
 * Stats balanceados para MythicCards.
 * Generado automaticamente por scripts/auto_rebalance_assets.js.
 */
(function () {
  'use strict';

  const STAT_KEYS = ['power', 'speed', 'magic', 'defense', 'intelligence'];
  const RARITY_ORDER = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
  const LEGACY_RARITY_MAP = { Common: 'F', Rare: 'C', Epic: 'A', Legendary: 'S', SSS: 'SSS' };
  const MAX_CARD_LEVEL = RARITY_ORDER.length;
  const ANIME_TIER = {
  "Hibana": 82,
  "Inca Kasugatani": 92,
  "Maki Oze": 80,
  "Tamaki Kotatsu": 68,
  "iris": 71,
  "Charlotte Roselei": 85,
  "Mimosa Vermillion": 80,
  "Noelle Silva": 91,
  "Secre Swallowtail": 92,
  "Sol Marron": 72,
  "Vanessa Enoteca": 84,
  "Daki": 91,
  "Hinatsuru": 70,
  "Kanae": 84,
  "Mitsuri Kanroji": 82,
  "Shinobu Kocho": 85,
  "Beta": 83,
  "Delta": 92,
  "Gamma": 85,
  "artkoikoi": 70,
  "Higashiyama": 68,
  "Himeno": 79,
  "Power": 81,
  "Nobara Kugisaki": 79,
  "Takako Uro": 73,
  "Himiko Toga": 79,
  "Kaina Tsutsumi": 70,
  "Mei Hatsume": 65,
  "Nejire Hado": 90,
  "Nemuri Kayama": 81,
  "Ochaco Uraraka": 77,
  "Rumi Usagiyama (Mirko)": 93,
  "Toru Hagakure": 68,
  "Derieri": 85,
  "Diane": 84,
  "Melascula": 90,
  "Merlin": 95,
  "CZ2128 Delta": 83,
  "Narberal Gamma": 82,
  "Shalltear Bloodfallen": 92,
  "Akeno Himejima": 92,
  "Irina Shidou": 81,
  "Koneko Toujou": 83,
  "Rossweisse": 82,
  "Xenovia Quarta": 84,
  "Aoba Wakura": 75,
  "Fubuki Azuma": 85,
  "Himari Azuma": 82,
  "Jouryuu": 83,
  "Kuusetsu": 94,
  "Kyouka Uzen": 80,
  "Mira Kamiunten": 81,
  "Naon Yuno": 73,
  "Shushu Suruga": 84,
  "Tenka Izumo": 92,
  "Yakumo Ezo": 86,
  "Aisha Belka": 72,
  "Alfia": 95,
  "Hephaestus": 93,
  "Hestia": 94,
  "Ryuu Lion": 84,
  "haruhime": 78,
  "Alice Synthesis": 93,
  "Sinon": 82,
  "Leafa": 81,
  "Capella Emerada Lugunica": 92,
  "Crusch Karsten": 83,
  "Echidna": 94,
  "Elsa Granhiert": 85,
  "Priscilla Barielle": 95,
  "Rem": 92,
  "Shaula": 93,
  "Arue": 71,
  "Darkness": 81,
  "Megumin": 80,
  "Wiz": 86,
  "Yunyun": 69,
  "Nami": 85,
  "Nefertari Vivi": 72,
  "Nico Robin": 82,
  "Uta": 72,
  "Milim Nava": 97,
  "Shion": 86,
  "Shizue Izawa": 84,
  "Shuna": 85,
  "Luminous Valentine": 96,
  "Treyni": 91,
  "Velzard": 98,
  "Elinalise Dragonroad": 90,
  "Ghislaine Dedoldia": 92,
  "Roxy Migurdia": 84,
  "Sylphiette": 82,
  "Machi Komachine": 81,
  "Shizuku Murasaki": 80,
  "Akame": 96,
  "Chelsea": 70,
  "Leone": 82,
  "Mine": 78,
  "Najenda": 80,
  "Sheele": 75,
  "Mina Ashido": 72,
  "Chisato Hasegawa": 77,
  "Kurumi Nonaka": 79,
  "Liala": 86,
  "Maria Naruse": 95,
  "Yuki Nonaka": 88,
  "Zest": 84,
  "Kureha Krilet": 92,
  "Setsuna": 85,
  "Lynn May": 91,
  "Nana Bassler": 83,
  "Aura": 89,
  "Fern": 92,
  "Ubel": 91,
  "Mio": 75,
  "Sofia BULGA": 86,
  "Ekaterina KURAE": 84,
  "Miyuri TSUJIDOU": 76,
  "Teresa BERIA": 79,
  "Tomo YAMANOBE": 91,
  "Hayuru Himekawa": 85,
  "Reiri Hida": 88,
  "Yurishia Farandole": 90,
  "Rei Miyamoto": 84,
  "Saya Takagi": 87,
  "Shizuka Marikawa": 90,
  "Amber Idanokan": 89,
  "Hime": 79,
  "Nefritis Romca": 75,
  "Saphir Maasa": 95,
  "Asane TACHIBANA": 91,
  "Ikuko ONABUTA": 83,
  "Misaki HOTORI": 76,
  "Nanase KATAGIRI": 89,
  "Rei TADASUGAWA": 84,
  "Aine Chidorigafuchi": 500,
  "Ais Wallenstein": 500,
  "Albedo": 500,
  "Alpha": 500,
  "Aqua": 500,
  "Asuna Yuuki": 500,
  "Cha Hae-In": 500,
  "Elfaria": 500,
  "Elizabeth Liones": 500,
  "Emilia": 500,
  "Eris Boreas Greyrat": 500,
  "Esdeath": 500,
  "Freya": 95,
  "Frieren": 500,
  "Granart Needakitta": 500,
  "Hina Farrow": 500,
  "Hinata Sakaguchi": 82,
  "Mafuyu ORIBE": 500,
  "Maki Zenin": 500,
  "Makima": 500,
  "Mereoleona Vermillion": 500,
  "Mio Naruse": 500,
  "netero pitou": 500,
  "Nezuko": 500,
  "Ren Yamashiro": 500,
  "Rias Gremory": 500,
  "Saeko Busujima": 500,
  "Tomoe": 500,
  "Touka REIZEIIN": 500,
  "Yamato": 500,
  "Yu Takeyama (Mt. Lady)": 500,
  "zero two": 500
};
  const BASE_CARD_STATS = {
  "Hibana": {
    "power": 204,
    "speed": 192,
    "magic": 207,
    "defense": 185,
    "intelligence": 212
  },
  "Inca Kasugatani": {
    "power": 547,
    "speed": 506,
    "magic": 535,
    "defense": 471,
    "intelligence": 441
  },
  "Maki Oze": {
    "power": 215,
    "speed": 196,
    "magic": 157,
    "defense": 236,
    "intelligence": 196
  },
  "Tamaki Kotatsu": {
    "power": 63,
    "speed": 64,
    "magic": 63,
    "defense": 56,
    "intelligence": 65
  },
  "iris": {
    "power": 40,
    "speed": 54,
    "magic": 76,
    "defense": 63,
    "intelligence": 78
  },
  "Charlotte Roselei": {
    "power": 210,
    "speed": 181,
    "magic": 213,
    "defense": 193,
    "intelligence": 203
  },
  "Mimosa Vermillion": {
    "power": 157,
    "speed": 183,
    "magic": 242,
    "defense": 188,
    "intelligence": 230
  },
  "Noelle Silva": {
    "power": 500,
    "speed": 455,
    "magic": 523,
    "defense": 539,
    "intelligence": 483
  },
  "Secre Swallowtail": {
    "power": 507,
    "speed": 479,
    "magic": 535,
    "defense": 439,
    "intelligence": 540
  },
  "Sol Marron": {
    "power": 126,
    "speed": 114,
    "magic": 133,
    "defense": 105,
    "intelligence": 122
  },
  "Vanessa Enoteca": {
    "power": 167,
    "speed": 192,
    "magic": 231,
    "defense": 174,
    "intelligence": 236
  },
  "Daki": {
    "power": 523,
    "speed": 506,
    "magic": 517,
    "defense": 483,
    "intelligence": 471
  },
  "Hinatsuru": {
    "power": 70,
    "speed": 73,
    "magic": 29,
    "defense": 66,
    "intelligence": 73
  },
  "Kanae": {
    "power": 217,
    "speed": 222,
    "magic": 153,
    "defense": 191,
    "intelligence": 217
  },
  "Mitsuri Kanroji": {
    "power": 206,
    "speed": 215,
    "magic": 180,
    "defense": 193,
    "intelligence": 206
  },
  "Shinobu Kocho": {
    "power": 160,
    "speed": 227,
    "magic": 209,
    "defense": 172,
    "intelligence": 232
  },
  "Beta": {
    "power": 213,
    "speed": 208,
    "magic": 178,
    "defense": 198,
    "intelligence": 203
  },
  "Delta": {
    "power": 544,
    "speed": 492,
    "magic": 509,
    "defense": 492,
    "intelligence": 463
  },
  "Gamma": {
    "power": 188,
    "speed": 220,
    "magic": 175,
    "defense": 180,
    "intelligence": 237
  },
  "artkoikoi": {
    "power": 58,
    "speed": 64,
    "magic": 60,
    "defense": 58,
    "intelligence": 71
  },
  "Higashiyama": {
    "power": 55,
    "speed": 64,
    "magic": 59,
    "defense": 55,
    "intelligence": 78
  },
  "Himeno": {
    "power": 206,
    "speed": 210,
    "magic": 198,
    "defense": 185,
    "intelligence": 201
  },
  "Power": {
    "power": 219,
    "speed": 199,
    "magic": 212,
    "defense": 194,
    "intelligence": 176
  },
  "Nobara Kugisaki": {
    "power": 216,
    "speed": 206,
    "magic": 198,
    "defense": 179,
    "intelligence": 201
  },
  "Takako Uro": {
    "power": 126,
    "speed": 120,
    "magic": 130,
    "defense": 108,
    "intelligence": 116
  },
  "Himiko Toga": {
    "power": 219,
    "speed": 233,
    "magic": 151,
    "defense": 192,
    "intelligence": 205
  },
  "Kaina Tsutsumi": {
    "power": 74,
    "speed": 67,
    "magic": 18,
    "defense": 88,
    "intelligence": 64
  },
  "Mei Hatsume": {
    "power": 50,
    "speed": 72,
    "magic": 22,
    "defense": 61,
    "intelligence": 105
  },
  "Nejire Hado": {
    "power": 213,
    "speed": 196,
    "magic": 221,
    "defense": 179,
    "intelligence": 191
  },
  "Nemuri Kayama": {
    "power": 195,
    "speed": 188,
    "magic": 208,
    "defense": 195,
    "intelligence": 214
  },
  "Ochaco Uraraka": {
    "power": 130,
    "speed": 139,
    "magic": 56,
    "defense": 126,
    "intelligence": 149
  },
  "Rumi Usagiyama (Mirko)": {
    "power": 620,
    "speed": 647,
    "magic": 168,
    "defense": 539,
    "intelligence": 526
  },
  "Toru Hagakure": {
    "power": 59,
    "speed": 84,
    "magic": 27,
    "defense": 64,
    "intelligence": 77
  },
  "Derieri": {
    "power": 220,
    "speed": 201,
    "magic": 188,
    "defense": 201,
    "intelligence": 190
  },
  "Diane": {
    "power": 217,
    "speed": 179,
    "magic": 199,
    "defense": 211,
    "intelligence": 194
  },
  "Melascula": {
    "power": 202,
    "speed": 183,
    "magic": 216,
    "defense": 192,
    "intelligence": 207
  },
  "Merlin": {
    "power": 441,
    "speed": 424,
    "magic": 582,
    "defense": 471,
    "intelligence": 582
  },
  "CZ2128 Delta": {
    "power": 207,
    "speed": 190,
    "magic": 183,
    "defense": 225,
    "intelligence": 195
  },
  "Narberal Gamma": {
    "power": 194,
    "speed": 182,
    "magic": 218,
    "defense": 182,
    "intelligence": 224
  },
  "Shalltear Bloodfallen": {
    "power": 521,
    "speed": 488,
    "magic": 504,
    "defense": 488,
    "intelligence": 499
  },
  "Akeno Himejima": {
    "power": 515,
    "speed": 481,
    "magic": 531,
    "defense": 464,
    "intelligence": 509
  },
  "Irina Shidou": {
    "power": 205,
    "speed": 200,
    "magic": 200,
    "defense": 195,
    "intelligence": 200
  },
  "Koneko Toujou": {
    "power": 222,
    "speed": 234,
    "magic": 144,
    "defense": 196,
    "intelligence": 204
  },
  "Rossweisse": {
    "power": 203,
    "speed": 186,
    "magic": 209,
    "defense": 196,
    "intelligence": 206
  },
  "Xenovia Quarta": {
    "power": 216,
    "speed": 197,
    "magic": 185,
    "defense": 202,
    "intelligence": 200
  },
  "Aoba Wakura": {
    "power": 100,
    "speed": 113,
    "magic": 137,
    "defense": 103,
    "intelligence": 147
  },
  "Fubuki Azuma": {
    "power": 206,
    "speed": 201,
    "magic": 207,
    "defense": 187,
    "intelligence": 199
  },
  "Himari Azuma": {
    "power": 213,
    "speed": 196,
    "magic": 214,
    "defense": 181,
    "intelligence": 196
  },
  "Jouryuu": {
    "power": 247,
    "speed": 197,
    "magic": 84,
    "defense": 270,
    "intelligence": 202
  },
  "Kuusetsu": {
    "power": 527,
    "speed": 488,
    "magic": 531,
    "defense": 455,
    "intelligence": 499
  },
  "Kyouka Uzen": {
    "power": 210,
    "speed": 201,
    "magic": 201,
    "defense": 185,
    "intelligence": 203
  },
  "Mira Kamiunten": {
    "power": 204,
    "speed": 190,
    "magic": 219,
    "defense": 187,
    "intelligence": 200
  },
  "Naon Yuno": {
    "power": 94,
    "speed": 128,
    "magic": 136,
    "defense": 102,
    "intelligence": 140
  },
  "Shushu Suruga": {
    "power": 213,
    "speed": 203,
    "magic": 199,
    "defense": 199,
    "intelligence": 186
  },
  "Tenka Izumo": {
    "power": 516,
    "speed": 488,
    "magic": 526,
    "defense": 454,
    "intelligence": 516
  },
  "Yakumo Ezo": {
    "power": 222,
    "speed": 215,
    "magic": 165,
    "defense": 190,
    "intelligence": 208
  },
  "Aisha Belka": {
    "power": 130,
    "speed": 153,
    "magic": 48,
    "defense": 125,
    "intelligence": 144
  },
  "Alfia": {
    "power": 511,
    "speed": 478,
    "magic": 527,
    "defense": 462,
    "intelligence": 522
  },
  "Hephaestus": {
    "power": 487,
    "speed": 401,
    "magic": 545,
    "defense": 505,
    "intelligence": 562
  },
  "Hestia": {
    "power": 437,
    "speed": 466,
    "magic": 560,
    "defense": 478,
    "intelligence": 559
  },
  "Ryuu Lion": {
    "power": 238,
    "speed": 232,
    "magic": 109,
    "defense": 213,
    "intelligence": 208
  },
  "haruhime": {
    "power": 152,
    "speed": 179,
    "magic": 248,
    "defense": 187,
    "intelligence": 234
  },
  "Alice Synthesis": {
    "power": 514,
    "speed": 470,
    "magic": 521,
    "defense": 481,
    "intelligence": 514
  },
  "Sinon": {
    "power": 196,
    "speed": 219,
    "magic": 157,
    "defense": 188,
    "intelligence": 240
  },
  "Leafa": {
    "power": 195,
    "speed": 215,
    "magic": 205,
    "defense": 185,
    "intelligence": 200
  },
  "Capella Emerada Lugunica": {
    "power": 522,
    "speed": 489,
    "magic": 506,
    "defense": 489,
    "intelligence": 494
  },
  "Crusch Karsten": {
    "power": 208,
    "speed": 201,
    "magic": 184,
    "defense": 196,
    "intelligence": 211
  },
  "Echidna": {
    "power": 479,
    "speed": 450,
    "magic": 552,
    "defense": 462,
    "intelligence": 557
  },
  "Elsa Granhiert": {
    "power": 211,
    "speed": 215,
    "magic": 172,
    "defense": 196,
    "intelligence": 206
  },
  "Priscilla Barielle": {
    "power": 528,
    "speed": 485,
    "magic": 517,
    "defense": 474,
    "intelligence": 496
  },
  "Rem": {
    "power": 393,
    "speed": 458,
    "magic": 602,
    "defense": 471,
    "intelligence": 576
  },
  "Shaula": {
    "power": 517,
    "speed": 474,
    "magic": 517,
    "defense": 485,
    "intelligence": 507
  },
  "Arue": {
    "power": 63,
    "speed": 75,
    "magic": 51,
    "defense": 57,
    "intelligence": 65
  },
  "Darkness": {
    "power": 216,
    "speed": 187,
    "magic": 144,
    "defense": 281,
    "intelligence": 172
  },
  "Megumin": {
    "power": 238,
    "speed": 189,
    "magic": 243,
    "defense": 135,
    "intelligence": 195
  },
  "Wiz": {
    "power": 198,
    "speed": 174,
    "magic": 214,
    "defense": 205,
    "intelligence": 209
  },
  "Yunyun": {
    "power": 62,
    "speed": 59,
    "magic": 68,
    "defense": 54,
    "intelligence": 68
  },
  "Nami": {
    "power": 202,
    "speed": 183,
    "magic": 216,
    "defense": 192,
    "intelligence": 207
  },
  "Nefertari Vivi": {
    "power": 110,
    "speed": 122,
    "magic": 102,
    "defense": 116,
    "intelligence": 150
  },
  "Nico Robin": {
    "power": 199,
    "speed": 204,
    "magic": 174,
    "defense": 187,
    "intelligence": 236
  },
  "Uta": {
    "power": 149,
    "speed": 156,
    "magic": 40,
    "defense": 129,
    "intelligence": 126
  },
  "Milim Nava": {
    "power": 531,
    "speed": 494,
    "magic": 520,
    "defense": 483,
    "intelligence": 472
  },
  "Shion": {
    "power": 205,
    "speed": 196,
    "magic": 199,
    "defense": 199,
    "intelligence": 201
  },
  "Shizue Izawa": {
    "power": 208,
    "speed": 191,
    "magic": 215,
    "defense": 186,
    "intelligence": 200
  },
  "Shuna": {
    "power": 195,
    "speed": 188,
    "magic": 217,
    "defense": 188,
    "intelligence": 212
  },
  "Luminous Valentine": {
    "power": 511,
    "speed": 468,
    "magic": 521,
    "defense": 489,
    "intelligence": 511
  },
  "Treyni": {
    "power": 493,
    "speed": 460,
    "magic": 527,
    "defense": 493,
    "intelligence": 527
  },
  "Velzard": {
    "power": 517,
    "speed": 471,
    "magic": 518,
    "defense": 502,
    "intelligence": 492
  },
  "Elinalise Dragonroad": {
    "power": 211,
    "speed": 202,
    "magic": 195,
    "defense": 190,
    "intelligence": 202
  },
  "Ghislaine Dedoldia": {
    "power": 596,
    "speed": 553,
    "magic": 314,
    "defense": 534,
    "intelligence": 503
  },
  "Roxy Migurdia": {
    "power": 169,
    "speed": 206,
    "magic": 223,
    "defense": 174,
    "intelligence": 228
  },
  "Sylphiette": {
    "power": 184,
    "speed": 206,
    "magic": 215,
    "defense": 184,
    "intelligence": 211
  },
  "Machi Komachine": {
    "power": 203,
    "speed": 216,
    "magic": 178,
    "defense": 190,
    "intelligence": 213
  },
  "Shizuku Murasaki": {
    "power": 204,
    "speed": 191,
    "magic": 191,
    "defense": 191,
    "intelligence": 223
  },
  "Akame": {
    "power": 625,
    "speed": 645,
    "magic": 99,
    "defense": 526,
    "intelligence": 605
  },
  "Chelsea": {
    "power": 58,
    "speed": 78,
    "magic": 49,
    "defense": 51,
    "intelligence": 75
  },
  "Leone": {
    "power": 241,
    "speed": 219,
    "magic": 110,
    "defense": 233,
    "intelligence": 197
  },
  "Mine": {
    "power": 236,
    "speed": 216,
    "magic": 130,
    "defense": 187,
    "intelligence": 231
  },
  "Najenda": {
    "power": 215,
    "speed": 182,
    "magic": 152,
    "defense": 223,
    "intelligence": 228
  },
  "Sheele": {
    "power": 134,
    "speed": 142,
    "magic": 86,
    "defense": 107,
    "intelligence": 131
  },
  "Mina Ashido": {
    "power": 130,
    "speed": 153,
    "magic": 58,
    "defense": 125,
    "intelligence": 134
  },
  "Chisato Hasegawa": {
    "power": 97,
    "speed": 97,
    "magic": 212,
    "defense": 97,
    "intelligence": 97
  },
  "Kurumi Nonaka": {
    "power": 161,
    "speed": 161,
    "magic": 161,
    "defense": 356,
    "intelligence": 161
  },
  "Liala": {
    "power": 161,
    "speed": 161,
    "magic": 356,
    "defense": 161,
    "intelligence": 161
  },
  "Maria Naruse": {
    "power": 403,
    "speed": 403,
    "magic": 888,
    "defense": 403,
    "intelligence": 403
  },
  "Yuki Nonaka": {
    "power": 356,
    "speed": 161,
    "magic": 161,
    "defense": 161,
    "intelligence": 161
  },
  "Zest": {
    "power": 161,
    "speed": 161,
    "magic": 356,
    "defense": 161,
    "intelligence": 161
  },
  "Kureha Krilet": {
    "power": 888,
    "speed": 403,
    "magic": 403,
    "defense": 403,
    "intelligence": 403
  },
  "Setsuna": {
    "power": 356,
    "speed": 161,
    "magic": 161,
    "defense": 161,
    "intelligence": 161
  },
  "Lynn May": {
    "power": 888,
    "speed": 403,
    "magic": 403,
    "defense": 403,
    "intelligence": 403
  },
  "Nana Bassler": {
    "power": 356,
    "speed": 161,
    "magic": 161,
    "defense": 161,
    "intelligence": 161
  },
  "Aura": {
    "power": 161,
    "speed": 161,
    "magic": 356,
    "defense": 161,
    "intelligence": 161
  },
  "Fern": {
    "power": 516,
    "speed": 460,
    "magic": 532,
    "defense": 476,
    "intelligence": 516
  },
  "Ubel": {
    "power": 403,
    "speed": 403,
    "magic": 888,
    "defense": 403,
    "intelligence": 403
  },
  "Mio": {
    "power": 97,
    "speed": 97,
    "magic": 212,
    "defense": 97,
    "intelligence": 97
  },
  "Sofia BULGA": {
    "power": 356,
    "speed": 161,
    "magic": 161,
    "defense": 161,
    "intelligence": 161
  },
  "Ekaterina KURAE": {
    "power": 161,
    "speed": 161,
    "magic": 356,
    "defense": 161,
    "intelligence": 161
  },
  "Miyuri TSUJIDOU": {
    "power": 97,
    "speed": 97,
    "magic": 97,
    "defense": 212,
    "intelligence": 97
  },
  "Teresa BERIA": {
    "power": 161,
    "speed": 161,
    "magic": 161,
    "defense": 356,
    "intelligence": 161
  },
  "Tomo YAMANOBE": {
    "power": 403,
    "speed": 403,
    "magic": 403,
    "defense": 888,
    "intelligence": 403
  },
  "Hayuru Himekawa": {
    "power": 161,
    "speed": 161,
    "magic": 356,
    "defense": 161,
    "intelligence": 161
  },
  "Reiri Hida": {
    "power": 356,
    "speed": 161,
    "magic": 161,
    "defense": 161,
    "intelligence": 161
  },
  "Yurishia Farandole": {
    "power": 356,
    "speed": 161,
    "magic": 161,
    "defense": 161,
    "intelligence": 161
  },
  "Rei Miyamoto": {
    "power": 356,
    "speed": 161,
    "magic": 161,
    "defense": 161,
    "intelligence": 161
  },
  "Saya Takagi": {
    "power": 161,
    "speed": 161,
    "magic": 161,
    "defense": 356,
    "intelligence": 161
  },
  "Shizuka Marikawa": {
    "power": 161,
    "speed": 161,
    "magic": 161,
    "defense": 356,
    "intelligence": 161
  },
  "Amber Idanokan": {
    "power": 161,
    "speed": 161,
    "magic": 356,
    "defense": 161,
    "intelligence": 161
  },
  "Hime": {
    "power": 206,
    "speed": 210,
    "magic": 198,
    "defense": 185,
    "intelligence": 201
  },
  "Nefritis Romca": {
    "power": 97,
    "speed": 97,
    "magic": 212,
    "defense": 97,
    "intelligence": 97
  },
  "Saphir Maasa": {
    "power": 403,
    "speed": 403,
    "magic": 888,
    "defense": 403,
    "intelligence": 403
  },
  "Asane TACHIBANA": {
    "power": 403,
    "speed": 403,
    "magic": 888,
    "defense": 403,
    "intelligence": 403
  },
  "Ikuko ONABUTA": {
    "power": 161,
    "speed": 161,
    "magic": 356,
    "defense": 161,
    "intelligence": 161
  },
  "Misaki HOTORI": {
    "power": 212,
    "speed": 97,
    "magic": 97,
    "defense": 97,
    "intelligence": 97
  },
  "Nanase KATAGIRI": {
    "power": 356,
    "speed": 161,
    "magic": 161,
    "defense": 161,
    "intelligence": 161
  },
  "Rei TADASUGAWA": {
    "power": 356,
    "speed": 161,
    "magic": 161,
    "defense": 161,
    "intelligence": 161
  },
  "Aine Chidorigafuchi": {
    "power": 2000,
    "speed": 2000,
    "magic": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Ais Wallenstein": {
    "power": 2000,
    "speed": 2000,
    "intelligence": 2000,
    "defense": 2000,
    "magic": 2000
  },
  "Albedo": {
    "power": 2000,
    "magic": 2000,
    "defense": 2000,
    "intelligence": 2000,
    "speed": 2000
  },
  "Alpha": {
    "magic": 2000,
    "defense": 2000,
    "intelligence": 2000,
    "power": 2000,
    "speed": 2000
  },
  "Aqua": {
    "magic": 2000,
    "defense": 2000,
    "intelligence": 2000,
    "power": 2000,
    "speed": 2000
  },
  "Asuna Yuuki": {
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000,
    "magic": 2000
  },
  "Cha Hae-In": {
    "magic": 2000,
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Elfaria": {
    "magic": 2000,
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Elizabeth Liones": {
    "magic": 2000,
    "defense": 2000,
    "intelligence": 2000,
    "speed": 2000,
    "power": 2000
  },
  "Emilia": {
    "magic": 2000,
    "intelligence": 2000,
    "power": 2000,
    "speed": 2000,
    "defense": 2000
  },
  "Eris Boreas Greyrat": {
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000,
    "magic": 2000
  },
  "Esdeath": {
    "power": 2000,
    "magic": 2000,
    "defense": 2000,
    "intelligence": 2000,
    "speed": 2000
  },
  "Freya": {
    "power": 575,
    "speed": 538,
    "magic": 389,
    "defense": 508,
    "intelligence": 490
  },
  "Frieren": {
    "magic": 2000,
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Granart Needakitta": {
    "magic": 2000,
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Hina Farrow": {
    "magic": 2000,
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Hinata Sakaguchi": {
    "power": 208,
    "speed": 212,
    "magic": 186,
    "defense": 186,
    "intelligence": 208
  },
  "Mafuyu ORIBE": {
    "magic": 2000,
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Maki Zenin": {
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000,
    "magic": 2000
  },
  "Makima": {
    "power": 2000,
    "magic": 2000,
    "intelligence": 2000,
    "speed": 2000,
    "defense": 2000
  },
  "Mereoleona Vermillion": {
    "power": 2000,
    "speed": 2000,
    "magic": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Mio Naruse": {
    "magic": 2000,
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "netero pitou": {
    "power": 2000,
    "speed": 2000,
    "intelligence": 2000,
    "defense": 2000,
    "magic": 2000
  },
  "Nezuko": {
    "power": 2000,
    "speed": 2000,
    "magic": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Ren Yamashiro": {
    "speed": 2000,
    "intelligence": 2000,
    "power": 2000,
    "defense": 2000,
    "magic": 2000
  },
  "Rias Gremory": {
    "power": 2000,
    "magic": 2000,
    "intelligence": 2000,
    "defense": 2000,
    "speed": 2000
  },
  "Saeko Busujima": {
    "power": 2000,
    "speed": 2000,
    "magic": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Tomoe": {
    "magic": 2000,
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Touka REIZEIIN": {
    "power": 2000,
    "speed": 2000,
    "magic": 2000,
    "defense": 2000,
    "intelligence": 2000
  },
  "Yamato": {
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000,
    "magic": 2000
  },
  "Yu Takeyama (Mt. Lady)": {
    "power": 2000,
    "defense": 2000,
    "intelligence": 2000,
    "speed": 2000,
    "magic": 2000
  },
  "zero two": {
    "magic": 2000,
    "power": 2000,
    "speed": 2000,
    "defense": 2000,
    "intelligence": 2000
  }
};
  const CARD_ABILITIES = {
  "Hibana": "Fuego Refinado Dominio tÃ©cnico del",
  "Inca Kasugatani": "Cuerpo de Llama TransformaciÃ³n en fuego",
  "Maki Oze": "Cuerpo de Diamante Endurecimiento",
  "Tamaki Kotatsu": "IgniciÃ³n Aumentada Fuego amplificado",
  "iris": "SanaciÃ³n por OraciÃ³n Magia de sanaciÃ³n",
  "Charlotte Roselei": "Magia de Espinas CreaciÃ³n de espinas de plantas",
  "Mimosa Vermillion": "Magia de RecuperaciÃ³n SanaciÃ³n rapida y",
  "Noelle Silva": "Magia del Agua Sagrada Agua con poder sagrado,",
  "Secre Swallowtail": "Magia Forbidden Forma humana con control",
  "Sol Marron": "Magia de Fuego Solar Control de fuego con poder",
  "Vanessa Enoteca": "Magia de Hilos del Destino ManipulaciÃ³n de",
  "Daki": "Sangre de Luna Creciente Poder de demonio",
  "Hinatsuru": "TÃ©cnica de RespiraciÃ³n RespiraciÃ³n",
  "Kanae": "Flor de Crisantemo TÃ©cnica de respiraciÃ³n",
  "Mitsuri Kanroji": "Amor Combativo TÃ©cnica de respiraciÃ³n con",
  "Shinobu Kocho": "Toxina DemonÃ­aca Veneno que mata demonios",
  "Beta": "Cuerpo Mejorado FÃ­sico aumentado",
  "Delta": "Forma DemonÃ­aca TransformaciÃ³n",
  "Gamma": "EspÃ­a Perfecto InfiltraciÃ³n",
  "artkoikoi": "ManipulaciÃ³n de Sombras Control de sombras",
  "Higashiyama": "VisiÃ³n de Cambio VisiÃ³n que detecta",
  "Himeno": "Fantasma del Caballo Demonio con forma",
  "Power": "Demonio de la Sangre ManipulaciÃ³n de sangre",
  "Nobara Kugisaki": "EnergÃ­a de MaldiciÃ³n Resonante Martillo mÃ¡gico de",
  "Takako Uro": "Fuego de MaldiciÃ³n Control",
  "Himiko Toga": "TransformaciÃ³n SanguÃ­nea Cambio de apariencia",
  "Kaina Tsutsumi": "Endurecimiento Corporal Piel indestructible",
  "Mei Hatsume": "Ingenio MecÃ¡nico Artefactos y dispositivos de",
  "Nejire Hado": "Onda de EnergÃ­a Espiral Proyectiles de energÃ­a",
  "Nemuri Kayama": "SueÃ±o UltrasÃ³nico Onda sÃ³nica que",
  "Ochaco Uraraka": "Antigravedad TÃ¡ctil AnulaciÃ³n de gravedad",
  "Rumi Usagiyama (Mirko)": "Fuerza de Conejo Velocidad superhuman y fuerza",
  "Toru Hagakure": "Invisibilidad Cuerpo completamente invisible,",
  "Derieri": "Fuerza Colosal Poder fÃ­sico",
  "Diane": "Control de Tierra Gigantismo y manipulaciÃ³n",
  "Melascula": "Garganta Infinita AbsorciÃ³n y almacenamiento",
  "Merlin": "Magia Infinita Control mÃ¡gico",
  "CZ2128 Delta": "Armadura de Batalla Armadura",
  "Narberal Gamma": "Magia Suprema Hechizos de",
  "Shalltear Bloodfallen": "Vampiro Supremo Reina vampiro",
  "Akeno Himejima": "Divina Tempestad Rayo sagrado",
  "Irina Shidou": "Espada Sagrada Espada de luz",
  "Koneko Toujou": "Poder de Gato Demonio Velocidad",
  "Rossweisse": "Magia de Valquiria Magia nÃ³rdica",
  "Xenovia Quarta": "Excalibur Fragmentado MÃºltiples fragmentos de",
  "Aoba Wakura": "ManipulaciÃ³n de Mentes Control psÃ­quico sobre",
  "Fubuki Azuma": "Viento del Abismo ManipulaciÃ³n de vientos deformadores",
  "Himari Azuma": "Fuego Demoniaco Fuego negro",
  "Jouryuu": "Acero Indestructible Cuerpo de acero eterno",
  "Kuusetsu": "Poder del Abismo ManipulaciÃ³n",
  "Kyouka Uzen": "Sonido Devastador Ondas sÃ³nicas amplificadas",
  "Mira Kamiunten": "Luz Sagrada Invertida Luz que maldice",
  "Naon Yuno": "ProyecciÃ³n Astral SeparaciÃ³n",
  "Shushu Suruga": "TransformaciÃ³n DemonÃ­aca Cambio a forma de demonio",
  "Tenka Izumo": "Cadenas Infinitas Cadenas mÃ¡gicas",
  "Yakumo Ezo": "Corte Dimensional Espada que corta",
  "Aisha Belka": "Sentidos Animales Olfato y",
  "Alfia": "Magia Antigua Magia olvidada",
  "Hephaestus": "HerrerÃ­a Divina CreaciÃ³n de armas",
  "Hestia": "BendiciÃ³n Divina Otorgamiento de",
  "Ryuu Lion": "Sangre de Amazona Fuerza y velocidad",
  "haruhime": "Magia de Renacimiento ResurrecciÃ³n",
  "Alice Synthesis": "Comandataria Divina Control",
  "Sinon": "Francotirador Perfecto PrecisiÃ³n",
  "Leafa": "Magia de Viento Control",
  "Capella Emerada Lugunica": "TransformaciÃ³n CaÃ³tica Cambio",
  "Crusch Karsten": "Espada de Noble Espada ancestral",
  "Echidna": "Hechicera Suprema Magia",
  "Elsa Granhiert": "Sangre de Vampiro Sangre vampÃ­rica",
  "Priscilla Barielle": "BendiciÃ³n Suprema BendiciÃ³n",
  "Rem": "Magia Forbidden Forma humana con control",
  "Shaula": "Guardiana del Purgatorio Poder",
  "Arue": "Vuela de Demonio Vuelo y ataques",
  "Darkness": "Cuerpo de Defensa Absorbedor de",
  "Megumin": "ExplosiÃ³n Suprema Magia de explosiÃ³n que",
  "Wiz": "Magia Ancestral Magia",
  "Yunyun": "Magia Demoniaca Magia",
  "Nami": "Fuerza Colosal Poder fÃ­sico",
  "Nefertari Vivi": "Control Animal ComunicaciÃ³n",
  "Nico Robin": "Flor Flor GeneraciÃ³n de mÃºltiples",
  "Uta": "SecreciÃ³n Ãcida Ãcido corrosivo",
  "Milim Nava": "Princesa Demonio CaÃ³tica Poder descontrolado",
  "Shion": "Cuerpo Semidivino Cuerpo mejorado",
  "Shizue Izawa": "Fuego de Demonio Dominio",
  "Shuna": "Magia de Demonio Mayor Magia",
  "Luminous Valentine": "Reina Demonio Inmortal Poder de",
  "Treyni": "Matriarca del Bosque Control total de",
  "Velzard": "Dragona Hielo Primordial Poder",
  "Elinalise Dragonroad": "Sangre de Guerrera Herencia mÃ¡gica de",
  "Ghislaine Dedoldia": "Fuerza de Guerrera Poder de",
  "Roxy Migurdia": "Magia de TeleportaciÃ³n TeletransportaciÃ³n",
  "Sylphiette": "Magia de Aire Divino Control",
  "Machi Komachine": "Hilos de Arana ManipulaciÃ³n de hilos",
  "Shizuku Murasaki": "Poder Absorbente SucciÃ³n de objetos",
  "Akame": "Murasame  Corte Mortal Golpe crÃ­tico + muerte",
  "Chelsea": "Morsitura de CamaleÃ³n Cambio de apariencia",
  "Leone": "Piel de Bestia TransformaciÃ³n en bestia",
  "Mine": "Pumpkin Rifle de poder explosivo con regeneraciÃ³n",
  "Najenda": "Susanoo Armadura mÃ¡gica que aumenta todas",
  "Sheele": "Extase Tijeras mÃ¡gicas con",
  "Mina Ashido": "SecreciÃ³n Ãcida Ãcido corrosivo",
  "Chisato Hasegawa": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Kurumi Nonaka": "Guardia firme que absorbe dano y protege ventajas pequenas.",
  "Liala": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Maria Naruse": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Yuki Nonaka": "Tecnica de espada que prioriza dano preciso y control del ritmo.",
  "Zest": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Kureha Krilet": "Tecnica de espada que prioriza dano preciso y control del ritmo.",
  "Setsuna": "Tecnica de espada que prioriza dano preciso y control del ritmo.",
  "Lynn May": "Ataque tactico que aprovecha aperturas sin decidir la ronda solo.",
  "Nana Bassler": "Ataque tactico que aprovecha aperturas sin decidir la ronda solo.",
  "Aura": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Fern": "Divina Tempestad Rayo sagrado",
  "Ubel": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Mio": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Sofia BULGA": "Tecnica de espada que prioriza dano preciso y control del ritmo.",
  "Ekaterina KURAE": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Miyuri TSUJIDOU": "Guardia firme que absorbe dano y protege ventajas pequenas.",
  "Teresa BERIA": "Guardia firme que absorbe dano y protege ventajas pequenas.",
  "Tomo YAMANOBE": "Guardia firme que absorbe dano y protege ventajas pequenas.",
  "Hayuru Himekawa": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Reiri Hida": "Ataque tactico que aprovecha aperturas sin decidir la ronda solo.",
  "Yurishia Farandole": "Ataque tactico que aprovecha aperturas sin decidir la ronda solo.",
  "Rei Miyamoto": "Ataque tactico que aprovecha aperturas sin decidir la ronda solo.",
  "Saya Takagi": "Guardia firme que absorbe dano y protege ventajas pequenas.",
  "Shizuka Marikawa": "Guardia firme que absorbe dano y protege ventajas pequenas.",
  "Amber Idanokan": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Hime": "Fantasma del Caballo Demonio con forma",
  "Nefritis Romca": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Saphir Maasa": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Asane TACHIBANA": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Ikuko ONABUTA": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Misaki HOTORI": "Ataque tactico que aprovecha aperturas sin decidir la ronda solo.",
  "Nanase KATAGIRI": "Ataque tactico que aprovecha aperturas sin decidir la ronda solo.",
  "Rei TADASUGAWA": "Ataque tactico que aprovecha aperturas sin decidir la ronda solo.",
  "Aine Chidorigafuchi": "Tecnica de espada que prioriza dano preciso y control del ritmo.",
  "Ais Wallenstein": "Espada de Luz Espada mÃ¡gica que",
  "Albedo": "Guardiana Suprema Poder preciso",
  "Alpha": "EscudarÃ­a MÃ¡gica Defensa",
  "Aqua": "Poder Divino Agua sagrada y resurrecciÃ³n",
  "Asuna Yuuki": "Espada RÃ¡pida Velocidad",
  "Cha Hae-In": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Elfaria": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Elizabeth Liones": "Luz Curativa Divina SanaciÃ³n",
  "Emilia": "Plata de Medio-Elfo Plata ancestral",
  "Eris Boreas Greyrat": "Espada Sagrada Espada con",
  "Esdeath": "Demonio del Hielo Control preciso del hielo, congelaciÃ³n",
  "Freya": "BendiciÃ³n de Freya Aumento extremo de",
  "Frieren": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Granart Needakitta": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Hina Farrow": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Hinata Sakaguchi": "Mirada de Muerte Ataque mortal",
  "Mafuyu ORIBE": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Maki Zenin": "Cuerpo Perfecto FÃ­sico sin maldiciÃ³n",
  "Makima": "Control preciso Dominio sobre todos",
  "Mereoleona Vermillion": "Tecnica de espada que prioriza dano preciso y control del ritmo.",
  "Mio Naruse": "Tecnica magica equilibrada que potencia su atributo principal.",
  "netero pitou": "Bestia Quimerica Forma hÃ­brida",
  "Nezuko": "Sangre DemonÃ­aca Humana Poder demonÃ­aco",
  "Ren Yamashiro": "Ritmo de Batalla SincronizaciÃ³n",
  "Rias Gremory": "Poder Infernal de Gremory DestrucciÃ³n y resurrecciÃ³n",
  "Saeko Busujima": "Tecnica de espada que prioriza dano preciso y control del ritmo.",
  "Tomoe": "Tecnica magica equilibrada que potencia su atributo principal.",
  "Touka REIZEIIN": "Ataque tactico que aprovecha aperturas sin decidir la ronda solo.",
  "Yamato": "Bestia DragÃ³n Divino TransformaciÃ³n",
  "Yu Takeyama (Mt. Lady)": "Gigantismo Aumento de tamaÃ±o colosal",
  "zero two": "Tecnica magica equilibrada que potencia su atributo principal."
};

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, Math.round(Number(n) || 0)));
  }

  function normalizeRarity(rarity) {
    const raw = String(rarity || 'F').trim();
    if (RARITY_ORDER.includes(raw)) return raw;
    return LEGACY_RARITY_MAP[raw] || 'F';
  }

  function totalForTierAndRarity(tier, rarity) {
    const ranges = {
      SSS: [10000, 10000, 500, 500],
      SS: [5000, 6750, 300, 500],
      S: [2500, 3375, 200, 500],
      A: [1000, 1680, 150, 500],
      B: [800, 950, 100, 500],
      C: [600, 750, 80, 500],
      D: [500, 580, 50, 500],
      E: [400, 480, 20, 500],
      F: [300, 380, 1, 500]
    };
    const range = ranges[normalizeRarity(rarity)] || ranges.F;
    const pct = Math.max(0, Math.min(1, (tier - range[2]) / Math.max(1, range[3] - range[2])));
    return Math.round(range[0] + (range[1] - range[0]) * pct);
  }

  function typeWeights(type) {
    const t = (type || '').toLowerCase();
    const w = { power:1, speed:1, magic:1, defense:1, intelligence:1 };
    if (/speed|lightning|shinobi|sound|wind|invisible|acid|precision|light/.test(t)) w.speed += 1.2;
    if (/magic|demon|infinity|holy|divine|goddess|flower|love|sleep|gravity|sealing|thread|charm|fortune|ghost|undead|explosion|scorpion|forest|ice|nen|oni|water|electric|fire|devil|god/.test(t)) w.magic += 1.2;
    if (/combat|melee|blade|sword|assassin|weapon|beast|dragon|arm|straw|blood|destruction|norse|holy sword|forge|combo|giant|rook/.test(t)) w.power += 1.2;
    if (/defense|guardian|rook|earth|path|armor|barrier/.test(t)) w.defense += 1.2;
    if (/intelligence|command|control|tech|wave|transform|sky|snake|pleiades|vampire|precision/.test(t)) w.intelligence += 0.8;
    return w;
  }

  function distributeStats(total, shape) {
    const weights = STAT_KEYS.map(k => Math.max(0.1, Number(shape[k]) || 1));
    const stats = {};
    let remainingTotal = total;
    let remainingWeight = weights.reduce((a, b) => a + b, 0);
    const capped = new Set();
    const MAX_STAT_CAP = 2000;
    
    for (let pass = 0; pass < 5; pass++) {
      let changed = false;
      STAT_KEYS.forEach((key, i) => {
        if (capped.has(key)) return;
        const value = Math.round((remainingTotal * weights[i]) / remainingWeight);
        if (value > MAX_STAT_CAP) {
          stats[key] = MAX_STAT_CAP;
          remainingTotal -= MAX_STAT_CAP;
          remainingWeight -= weights[i];
          capped.add(key);
          changed = true;
        }
      });
      if (!changed) break;
    }
    STAT_KEYS.forEach((key, i) => {
      if (!capped.has(key)) stats[key] = Math.max(18, Math.round((remainingTotal * weights[i]) / remainingWeight));
    });
    let diff = total - STAT_KEYS.reduce((sum, key) => sum + stats[key], 0);
    const order = STAT_KEYS.slice().sort((a, b) => (shape[b] || 1) - (shape[a] || 1));
    while (diff !== 0) {
      let moved = false;
      for (const key of order) {
        if (diff > 0 && stats[key] < MAX_STAT_CAP) {
          stats[key] += 1;
          diff -= 1;
          moved = true;
        } else if (diff < 0 && stats[key] > 18) {
          stats[key] -= 1;
          diff += 1;
          moved = true;
        }
        if (diff === 0) break;
      }
      if (!moved) break;
    }
    return stats;
  }

  function applyAnimeStats(card) {
    const c = Object.assign({}, card);
    c.rarity = normalizeRarity(c.rarity);
    if (c.rarity === 'SSS') {
      STAT_KEYS.forEach(key => { c[key] = 2000; });
      c.totalPower = 10000;
      c.animeTier = 500;
      c.level = MAX_CARD_LEVEL;
      return c;
    }
    const baseTier = ANIME_TIER[c.name] != null ? ANIME_TIER[c.name] : (c.animeTier || 50);
    const rarity = c.rarity || 'F';
    const level = Math.max(1, Math.min(MAX_CARD_LEVEL, Number(c.level) || 1));
    
    // Incremento de Tier: as the card evolves, its tier scales up to 500
    const tier = Math.round(baseTier + (500 - baseTier) * ((level - 1) / (MAX_CARD_LEVEL - 1)));
    
    const baseTotal = totalForTierAndRarity(tier, rarity);
    const levelMultiplier = 1 + (level - 1) * 0.06;
    let total = Math.round(baseTotal * levelMultiplier);
    
    const rarityCaps = { SSS: 10000, SS: 9999, S: 4999, A: 2499, B: 999, C: 799, D: 599, E: 499, F: 399 };
    if (rarityCaps[c.rarity]) {
      total = Math.min(total, rarityCaps[c.rarity]);
    }
    
    const shape = BASE_CARD_STATS[c.name] || typeWeights(c.type);
    const stats = distributeStats(total, shape);
    STAT_KEYS.forEach(key => { c[key] = clamp(stats[key], 18, 2000); });
    c.totalPower = STAT_KEYS.reduce((sum, key) => sum + c[key], 0);
    c.animeTier = tier;
    c.level = level;
    return c;
  }

  function getCardAbilityText(card) {
    const base = card.ability || CARD_ABILITIES[card.name] || 'Tecnica equilibrada que potencia su atributo principal.';
    const level = Math.max(1, Math.min(MAX_CARD_LEVEL, Number(card.level) || 1));
    if (level <= 1) return base;
    return base + ' Mejora de nivel: +' + Math.round((level - 1) * 6) + '% de eficacia.';
  }

  window.applyAnimeStats = applyAnimeStats;
  window.ANIME_TIER = ANIME_TIER;
  window.getCardAbilityText = getCardAbilityText;
})();

