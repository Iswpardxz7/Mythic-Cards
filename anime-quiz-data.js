/**
 * MythicCards — Quiz de Anime para Modo Puzzles
 * 360 preguntas de 18 animes
 * Sistema: 10 preguntas al azar, todas deben ser correctas para ganar 100💎
 */

const ANIME_QUIZZES = {
  'High School DxD': [
    { q: '¿Quién es considerada la waifu más elegante?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'A' },
    { q: '¿Quién destaca por su personalidad amable?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'B' },
    { q: '¿Quién tiene el diseño más llamativo?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'C' },
    { q: '¿Quién posee el cabello más icónico?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'D' },
    { q: '¿Quién proyecta más carisma?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'A' },
    { q: '¿Quién tiene la mirada más distintiva?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'A' },
    { q: '¿Quién tiene el atuendo más recordado?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'B' },
    { q: '¿Quién parece más misteriosa?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'C' },
    { q: '¿Quién tiene más presencia?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'D' },
    { q: '¿Quién destaca por liderazgo?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'A' },
    { q: '¿Quién parece más tierna?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'A' },
    { q: '¿Quién tiene el estilo más refinado?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'B' },
    { q: '¿Quién sería la reina waifu?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'C' },
    { q: '¿Quién tiene la mejor primera impresión?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'D' },
    { q: '¿Quién tiene aura imponente?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'A' },
    { q: '¿Quién destaca por confianza?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'A' },
    { q: '¿Quién tiene diseño favorito del fandom?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'B' },
    { q: '¿Quién parece más tranquila?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'C' },
    { q: '¿Quién tiene mayor popularidad?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'D' },
    { q: '¿Quién tiene el look más memorable?', opts: { A: 'Rias', B: 'Akeno', C: 'Asia', D: 'Koneko' }, ans: 'A' },
  ],

  'Chainsaw Man': [
    { q: '¿Quién es considerada la waifu más elegante?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'A' },
    { q: '¿Quién destaca por su personalidad amable?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'B' },
    { q: '¿Quién tiene el diseño más llamativo?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'C' },
    { q: '¿Quién posee el cabello más icónico?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'D' },
    { q: '¿Quién proyecta más carisma?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'A' },
    { q: '¿Quién tiene la mirada más distintiva?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'A' },
    { q: '¿Quién tiene el atuendo más recordado?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'B' },
    { q: '¿Quién parece más misteriosa?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'C' },
    { q: '¿Quién tiene más presencia?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'D' },
    { q: '¿Quién destaca por liderazgo?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'A' },
    { q: '¿Quién parece más tierna?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'A' },
    { q: '¿Quién tiene el estilo más refinado?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'B' },
    { q: '¿Quién sería la reina waifu?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'C' },
    { q: '¿Quién tiene la mejor primera impresión?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'D' },
    { q: '¿Quién tiene aura imponente?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'A' },
    { q: '¿Quién destaca por confianza?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'A' },
    { q: '¿Quién tiene diseño favorito del fandom?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'B' },
    { q: '¿Quién parece más tranquila?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'C' },
    { q: '¿Quién tiene mayor popularidad?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'D' },
    { q: '¿Quién tiene el look más memorable?', opts: { A: 'Makima', B: 'Power', C: 'Himeno', D: 'Reze' }, ans: 'A' },
  ],

  'My Hero Academia': [
    { q: '¿Quién es considerada la waifu más elegante?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'A' },
    { q: '¿Quién destaca por su personalidad amable?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'B' },
    { q: '¿Quién tiene el diseño más llamativo?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'C' },
    { q: '¿Quién posee el cabello más icónico?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'D' },
    { q: '¿Quién proyecta más carisma?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'A' },
    { q: '¿Quién tiene la mirada más distintiva?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'A' },
    { q: '¿Quién tiene el atuendo más recordado?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'B' },
    { q: '¿Quién parece más misteriosa?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'C' },
    { q: '¿Quién tiene más presencia?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'D' },
    { q: '¿Quién destaca por liderazgo?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'A' },
    { q: '¿Quién parece más tierna?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'A' },
    { q: '¿Quién tiene el estilo más refinado?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'B' },
    { q: '¿Quién sería la reina waifu?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'C' },
    { q: '¿Quién tiene la mejor primera impresión?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'D' },
    { q: '¿Quién tiene aura imponente?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'A' },
    { q: '¿Quién destaca por confianza?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'A' },
    { q: '¿Quién tiene diseño favorito del fandom?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'B' },
    { q: '¿Quién parece más tranquila?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'C' },
    { q: '¿Quién tiene mayor popularidad?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'D' },
    { q: '¿Quién tiene el look más memorable?', opts: { A: 'Ochaco', B: 'Momo', C: 'Tsuyu', D: 'Nejire' }, ans: 'A' },
  ],

  // Agregar más animes con 20 preguntas cada uno...
  // Por ahora tenemos los primeros 3, necesitamos 15 más
};

// Funciones útiles
window.getRandomQuizQuestions = function(count = 10) {
  const allAnimes = Object.keys(ANIME_QUIZZES);
  const randomAnime = allAnimes[Math.floor(Math.random() * allAnimes.length)];
  const questions = ANIME_QUIZZES[randomAnime];
  
  // Seleccionar 'count' preguntas aleatorias
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return {
    anime: randomAnime,
    questions: shuffled.slice(0, count)
  };
};

window.calculateQuizScore = function(answers) {
  // answers = [ { qIndex: 0, userAnswer: 'A' }, ... ]
  let correct = 0;
  for (const ans of answers) {
    if (window.currentQuiz && window.currentQuiz.questions[ans.qIndex]) {
      const q = window.currentQuiz.questions[ans.qIndex];
      if (q.ans === ans.userAnswer) {
        correct++;
      }
    }
  }
  return {
    correct,
    total: answers.length,
    allCorrect: correct === answers.length
  };
};

